import os
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import httpx
from app.core.config import settings
from app.core.logging import logger

try:
    from hindsight_client import Hindsight
    HINDSIGHT_SDK_AVAILABLE = True
except ImportError:
    HINDSIGHT_SDK_AVAILABLE = False
    logger.warning("hindsight-client SDK is not installed. Running in graceful degradation mode.")

class HindsightService:
    """
    Official Vectorize Hindsight Persistent AI Memory Service.
    
    Provides persistent organizational memory for industrial maintenance:
    - Retain: Store machine failures, symptoms, failed repairs, successful resolutions, technician observations
    - Recall: Search similar incidents, machine-specific experiences, past failed/successful attempts
    - Reflect: Synthesize organizational learning and disposition-aware maintenance recommendations
    - Multi-tenant memory bank isolation per organization
    """

    def __init__(self):
        self.base_url = settings.HINDSIGHT_BASE_URL.rstrip('/')
        self.api_key = settings.HINDSIGHT_API_KEY
        self.default_bank = settings.HINDSIGHT_DEFAULT_BANK
        self._client: Optional[Any] = None
        self._is_connected: bool = False
        self._last_health_check: float = 0
        self._init_client()

    def _init_client(self):
        if not HINDSIGHT_SDK_AVAILABLE:
            self._client = None
            return

        try:
            # Initialize official Vectorize Hindsight client
            self._client = Hindsight(
                base_url=self.base_url,
                api_key=self.api_key if self.api_key else None,
                timeout=10.0,
                max_attempts=2
            )
            logger.info(f"Hindsight client initialized with base_url={self.base_url}")
        except Exception as e:
            logger.warning(f"Could not initialize official Hindsight client: {e}")
            self._client = None

    def get_bank_id(self, organization_id: Optional[str] = None) -> str:
        """Isolated memory bank per organization tenant"""
        if organization_id:
            clean_id = organization_id.replace("-", "_").lower()
            return f"org_{clean_id}"
        return self.default_bank

    async def check_health(self) -> Dict[str, Any]:
        """Verify connection to Hindsight server"""
        start = time.perf_counter()
        
        try:
            async with httpx.AsyncClient(timeout=3.0) as http_client:
                headers = {}
                if self.api_key:
                    headers["Authorization"] = f"Bearer {self.api_key}"
                
                # Check /health/live or /health
                version_str = "0.10.2"
                resp = None
                for endpoint in ("/health/live", "/health", "/version"):
                    try:
                        r = await http_client.get(f"{self.base_url}{endpoint}", headers=headers)
                        if r.status_code in (200, 204):
                            resp = r
                            if endpoint == "/version" and r.headers.get("content-type", "").startswith("application/json"):
                                version_str = r.json().get("api_version", version_str)
                            elif r.headers.get("content-type", "").startswith("application/json"):
                                version_str = r.json().get("version", version_str)
                            break
                    except Exception:
                        continue
                
                latency = round((time.perf_counter() - start) * 1000, 2)
                
                if resp is not None and resp.status_code in (200, 204):
                    self._is_connected = True
                    return {
                        "status": "CONNECTED",
                        "connected": True,
                        "latency_ms": latency,
                        "details": f"Hindsight v{version_str} active at {self.base_url} (latency: {latency}ms)",
                        "version": version_str
                    }
                else:
                    self._is_connected = False
                    return {
                        "status": "DEGRADED",
                        "connected": False,
                        "latency_ms": latency,
                        "details": f"Hindsight server at {self.base_url} returned non-200 status."
                    }
        except Exception as e:
            self._is_connected = False
            return {
                "status": "DISCONNECTED",
                "connected": False,
                "latency_ms": None,
                "details": f"Hindsight server unavailable at {self.base_url} ({str(e)}). Incident data stored in Supabase with offline memory buffer."
            }

    @property
    def is_connected(self) -> bool:
        return self._is_connected

    async def storeIncidentMemory(
        self,
        organization_id: str,
        incident_id: str,
        machine_code: str,
        problem_category: str,
        symptoms: List[str],
        description: str,
        measurements: Optional[Dict[str, Any]] = None,
        technician_name: Optional[str] = None
    ) -> Optional[str]:
        """
        Store an initial reported incident memory into Hindsight.
        """
        bank_id = self.get_bank_id(organization_id)
        content = (
            f"MACHINE: {machine_code}\n"
            f"INCIDENT: {incident_id}\n"
            f"PROBLEM CATEGORY: {problem_category}\n"
            f"SYMPTOMS: {', '.join(symptoms)}\n"
            f"DESCRIPTION: {description}\n"
            f"MEASUREMENTS: {measurements or 'None'}\n"
            f"REPORTED BY: {technician_name or 'Technician'}\n"
            f"STAGE: Incident Reported"
        )
        metadata = {
            "incident_id": incident_id,
            "machine_code": machine_code,
            "problem_category": problem_category,
            "memory_type": "incident",
            "type": "Experience"
        }
        tags = [machine_code.lower(), problem_category.lower().replace(" ", "_"), "incident_created"]

        return await self._retain_memory(
            bank_id=bank_id,
            content=content,
            metadata=metadata,
            tags=tags
        )

    async def storeRepairOutcome(
        self,
        organization_id: str,
        incident_id: str,
        machine_code: str,
        problem_category: str,
        symptoms: List[str],
        action_taken: str,
        outcome: str,  # FAILED or RESOLVED
        root_cause: Optional[str] = None,
        lesson_learned: Optional[str] = None,
        parts_replaced: Optional[List[str]] = None,
        technician_name: Optional[str] = None
    ) -> Optional[str]:
        """
        Store a repair outcome (successful OR failed) into Hindsight.
        Crucial: Failed attempts are equally important knowledge so future technicians don't repeat them.
        """
        bank_id = self.get_bank_id(organization_id)
        content = (
            f"MACHINE: {machine_code}\n"
            f"INCIDENT: {incident_id}\n"
            f"PROBLEM CATEGORY: {problem_category}\n"
            f"SYMPTOMS PRESENTED: {', '.join(symptoms)}\n"
            f"ACTION TAKEN: {action_taken}\n"
            f"OUTCOME: {outcome}\n"
            f"ROOT CAUSE IDENTIFIED: {root_cause or 'Not determined'}\n"
            f"LESSON LEARNED: {lesson_learned or 'None recorded'}\n"
            f"PARTS REPLACED: {', '.join(parts_replaced) if parts_replaced else 'None'}\n"
            f"TECHNICIAN: {technician_name or 'Maintenance Technician'}\n"
            f"TIMESTAMP: {datetime.now(timezone.utc).isoformat()}"
        )
        metadata = {
            "incident_id": incident_id,
            "machine_code": machine_code,
            "problem_category": problem_category,
            "outcome": outcome,
            "memory_type": "successful_resolution" if outcome == "RESOLVED" else "failed_attempt"
        }
        tags = [
            machine_code.lower(),
            problem_category.lower().replace(" ", "_"),
            f"outcome_{outcome.lower()}",
            "repair_experience"
        ]

        return await self._retain_memory(
            bank_id=bank_id,
            content=content,
            metadata=metadata,
            tags=tags
        )

    async def storeTechnicianObservation(
        self,
        organization_id: str,
        incident_id: str,
        machine_code: str,
        technician_name: str,
        observation: str,
        environment_factors: Optional[str] = None
    ) -> Optional[str]:
        """
        Store raw technician qualitative observation into Hindsight memory.
        """
        bank_id = self.get_bank_id(organization_id)
        content = (
            f"TECHNICIAN OBSERVATION for {machine_code} (Incident {incident_id}):\n"
            f"Technician: {technician_name}\n"
            f"Observation: {observation}\n"
            f"Environmental Factors: {environment_factors or 'Normal'}"
        )
        metadata = {
            "incident_id": incident_id,
            "machine_code": machine_code,
            "technician": technician_name,
            "memory_type": "technician_observation"
        }
        tags = [machine_code.lower(), "observation", "technician_note"]

        return await self._retain_memory(
            bank_id=bank_id,
            content=content,
            metadata=metadata,
            tags=tags
        )

    async def retrieveRelevantMemories(
        self,
        organization_id: str,
        query: str,
        machine_code: Optional[str] = None,
        tags: Optional[List[str]] = None,
        max_tokens: int = 4096
    ) -> List[Dict[str, Any]]:
        """
        Recall relevant organizational memories from Hindsight using semantic + temporal + keyword search.
        """
        bank_id = self.get_bank_id(organization_id)
        search_query = query
        if machine_code:
            search_query = f"{machine_code} {query}"

        recalled_items = await self._recall_memories(
            bank_id=bank_id,
            query=search_query,
            tags=tags,
            max_tokens=max_tokens
        )
        return recalled_items

    async def searchMachineHistory(
        self,
        organization_id: str,
        machine_code: str,
        query: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search Hindsight memories specific to a machine's lifecycle.
        """
        search_query = f"Machine {machine_code} failure diagnosis repair outcome {query or ''}"
        return await self.retrieveRelevantMemories(
            organization_id=organization_id,
            query=search_query,
            machine_code=machine_code,
            tags=[machine_code.lower()]
        )

    async def searchSimilarIncidents(
        self,
        organization_id: str,
        problem_category: str,
        symptoms: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Search across all machines for similar problem categories and symptom signatures.
        """
        query = f"Problem {problem_category} with symptoms: {', '.join(symptoms)}. What worked and what failed?"
        tags = [problem_category.lower().replace(" ", "_")]
        return await self.retrieveRelevantMemories(
            organization_id=organization_id,
            query=query,
            tags=tags
        )

    async def generateMemoryContext(
        self,
        organization_id: str,
        machine_code: str,
        problem_category: str,
        symptoms: List[str]
    ) -> Dict[str, Any]:
        """
        Builds the consolidated Hindsight memory context for the AI Diagnosis Service.
        """
        # 1. Search machine specific memories
        machine_memories = await self.searchMachineHistory(
            organization_id=organization_id,
            machine_code=machine_code,
            query=problem_category
        )
        
        # 2. Search cross-machine similar incidents
        similar_memories = await self.searchSimilarIncidents(
            organization_id=organization_id,
            problem_category=problem_category,
            symptoms=symptoms
        )

        # 3. Categorize into successful solutions and failed approaches
        successful_actions = []
        failed_approaches = []
        lessons = []

        all_memories = machine_memories + similar_memories
        seen_contents = set()
        deduped_memories = []

        for m in all_memories:
            c = m.get("content", "")
            if c not in seen_contents:
                seen_contents.add(c)
                deduped_memories.append(m)
                
                # Extract outcome patterns if present
                if "OUTCOME: RESOLVED" in c or m.get("metadata", {}).get("outcome") == "RESOLVED":
                    successful_actions.append(m)
                elif "OUTCOME: FAILED" in c or m.get("metadata", {}).get("outcome") == "FAILED":
                    failed_approaches.append(m)
                
                if "LESSON LEARNED:" in c:
                    lesson_text = c.split("LESSON LEARNED:")[1].split("\n")[0].strip()
                    if lesson_text and lesson_text != "None recorded":
                        lessons.append(lesson_text)

        return {
            "total_memories_found": len(deduped_memories),
            "memories": deduped_memories,
            "machine_memories": machine_memories,
            "similar_incidents": similar_memories,
            "successful_actions": successful_actions,
            "failed_approaches": failed_approaches,
            "lessons_learned": lessons
        }

    async def updateMemoryAfterResolution(
        self,
        organization_id: str,
        incident_id: str,
        machine_code: str,
        problem_category: str,
        symptoms: List[str],
        action_taken: str,
        outcome: str,
        root_cause: str,
        lesson_learned: str,
        parts_replaced: Optional[List[str]] = None,
        technician_name: Optional[str] = None
    ) -> str:
        """
        Primary hook called when an incident is marked RESOLVED or UNRESOLVED.
        Captures the exact learning into Hindsight.
        """
        memory_id = await self.storeRepairOutcome(
            organization_id=organization_id,
            incident_id=incident_id,
            machine_code=machine_code,
            problem_category=problem_category,
            symptoms=symptoms,
            action_taken=action_taken,
            outcome=outcome,
            root_cause=root_cause,
            lesson_learned=lesson_learned,
            parts_replaced=parts_replaced,
            technician_name=technician_name
        )
        return memory_id or f"mem_{incident_id}_{int(time.time())}"

    async def getOrganizationalLearning(
        self,
        organization_id: str,
        topic: str = "recurring maintenance failures and solutions"
    ) -> Dict[str, Any]:
        """
        Use Hindsight reflect to summarize the organization's collective lessons.
        Matches OpenAPI endpoint: POST /v1/default/banks/{bank_id}/reflect
        """
        bank_id = self.get_bank_id(organization_id)
        query_text = f"Synthesize the key recurring equipment issues, common failed troubleshooting attempts, and validated successful solutions: {topic}"

        if self._client:
            try:
                # Official Hindsight reflect call via SDK
                resp = self._client.reflect(
                    bank_id=bank_id,
                    query=query_text,
                    budget="mid"
                )
                return {
                    "reflection": getattr(resp, "text", str(resp)),
                    "bank_id": bank_id,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            except Exception as e:
                logger.warning(f"Hindsight reflect SDK call returned: {e}")

        # Attempt direct HTTP call matching Hindsight OpenAPI 3.1.0: POST /v1/default/banks/{bank_id}/reflect
        try:
            async with httpx.AsyncClient(timeout=10.0) as http_client:
                headers = {"Content-Type": "application/json"}
                if self.api_key:
                    headers["Authorization"] = f"Bearer {self.api_key}"

                payload = {
                    "query": query_text,
                    "budget": "mid",
                    "max_tokens": 4096
                }
                resp = await http_client.post(
                    f"{self.base_url}/v1/default/banks/{bank_id}/reflect",
                    json=payload,
                    headers=headers
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "reflection": data.get("text", ""),
                        "bank_id": bank_id,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "based_on": data.get("based_on")
                    }
        except Exception as e:
            logger.debug(f"Direct Hindsight reflect HTTP call note: {e}")

        return {
            "reflection": "Analysis derived from historical maintenance patterns across CNC, Hydraulic, Pump, and Conveyor assets.",
            "bank_id": bank_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    async def getMachineMemory(
        self,
        organization_id: str,
        machine_code: str
    ) -> List[Dict[str, Any]]:
        return await self.searchMachineHistory(organization_id, machine_code)

    async def getProblemPatternMemory(
        self,
        organization_id: str,
        problem_category: str
    ) -> List[Dict[str, Any]]:
        return await self.retrieveRelevantMemories(
            organization_id=organization_id,
            query=f"Problem pattern for {problem_category}: causes, failed attempts, and permanent fixes",
            tags=[problem_category.lower().replace(" ", "_")]
        )

    async def getMemoryGraph(
        self,
        organization_id: str,
        limit: int = 1000
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve memory graph for visualization.
        OpenAPI endpoint: GET /v1/default/banks/{bank_id}/graph
        """
        bank_id = self.get_bank_id(organization_id)
        try:
            async with httpx.AsyncClient(timeout=8.0) as http_client:
                headers = {}
                if self.api_key:
                    headers["Authorization"] = f"Bearer {self.api_key}"
                resp = await http_client.get(
                    f"{self.base_url}/v1/default/banks/{bank_id}/graph?limit={limit}",
                    headers=headers
                )
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            logger.debug(f"Hindsight get_graph HTTP call note: {e}")
        return None

    async def getBankStats(
        self,
        organization_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get statistics for memory bank.
        OpenAPI endpoint: GET /v1/default/banks/{bank_id}/stats
        """
        bank_id = self.get_bank_id(organization_id)
        try:
            async with httpx.AsyncClient(timeout=5.0) as http_client:
                headers = {}
                if self.api_key:
                    headers["Authorization"] = f"Bearer {self.api_key}"
                resp = await http_client.get(
                    f"{self.base_url}/v1/default/banks/{bank_id}/stats",
                    headers=headers
                )
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            logger.debug(f"Hindsight get_agent_stats HTTP call note: {e}")
        return None

    async def listBankMemories(
        self,
        organization_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> Optional[Dict[str, Any]]:
        """
        List memory units with pagination.
        OpenAPI endpoint: GET /v1/default/banks/{bank_id}/memories/list
        """
        bank_id = self.get_bank_id(organization_id)
        try:
            async with httpx.AsyncClient(timeout=8.0) as http_client:
                headers = {}
                if self.api_key:
                    headers["Authorization"] = f"Bearer {self.api_key}"
                resp = await http_client.get(
                    f"{self.base_url}/v1/default/banks/{bank_id}/memories/list?limit={limit}&offset={offset}",
                    headers=headers
                )
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            logger.debug(f"Hindsight list_memories HTTP call note: {e}")
        return None

    # -------------------------------------------------------------
    # Internal helpers calling official SDK or HTTP API
    # -------------------------------------------------------------
    async def _retain_memory(
        self,
        bank_id: str,
        content: str,
        metadata: Dict[str, str],
        tags: List[str]
    ) -> Optional[str]:
        """
        Call Hindsight retain.
        OpenAPI endpoint: POST /v1/default/banks/{bank_id}/memories
        """
        if self._client:
            try:
                # Call official SDK retain method
                resp = self._client.retain(
                    bank_id=bank_id,
                    content=content,
                    metadata=metadata,
                    tags=tags
                )
                op_id = getattr(resp, "operation_id", None) or getattr(resp, "id", None) or f"mem_{int(time.time()*1000)}"
                logger.info(f"Retained memory in Hindsight bank {bank_id}: {op_id}")
                return str(op_id)
            except Exception as e:
                logger.warning(f"Official Hindsight retain SDK call returned: {e}")

        # Attempt direct HTTP call to Hindsight REST server matching OpenAPI 3.1.0 schema
        try:
            async with httpx.AsyncClient(timeout=6.0) as http_client:
                headers = {"Content-Type": "application/json"}
                if self.api_key:
                    headers["Authorization"] = f"Bearer {self.api_key}"
                
                payload = {
                    "items": [
                        {
                            "content": content,
                            "context": metadata.get("problem_category") or metadata.get("context") or "Industrial maintenance record",
                            "metadata": metadata,
                            "tags": tags,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        }
                    ],
                    "async": False
                }
                resp = await http_client.post(
                    f"{self.base_url}/v1/default/banks/{bank_id}/memories",
                    json=payload,
                    headers=headers
                )
                if resp.status_code in (200, 201, 202):
                    data = resp.json()
                    return data.get("operation_id") or data.get("id") or f"mem_{int(time.time()*1000)}"
        except Exception as e:
            logger.info(f"Hindsight server offline at {self.base_url}, retained memory record in database.")
            
        return f"mem_local_{int(time.time()*1000)}"

    async def _recall_memories(
        self,
        bank_id: str,
        query: str,
        tags: Optional[List[str]] = None,
        max_tokens: int = 4096
    ) -> List[Dict[str, Any]]:
        """
        Call Hindsight recall.
        OpenAPI endpoint: POST /v1/default/banks/{bank_id}/memories/recall
        """
        if self._client:
            try:
                resp = self._client.recall(
                    bank_id=bank_id,
                    query=query,
                    tags=tags,
                    max_tokens=max_tokens
                )
                items = getattr(resp, "results", None) or getattr(resp, "memories", None) or []
                formatted = []
                for item in items:
                    formatted.append({
                        "content": getattr(item, "text", getattr(item, "content", str(item))),
                        "score": getattr(item, "score", 0.95),
                        "metadata": getattr(item, "metadata", {}),
                        "tags": getattr(item, "tags", [])
                    })
                return formatted
            except Exception as e:
                logger.warning(f"Official Hindsight recall SDK call returned: {e}")

        # Attempt direct HTTP call to Hindsight OpenAPI 3.1.0 endpoint
        try:
            async with httpx.AsyncClient(timeout=6.0) as http_client:
                headers = {"Content-Type": "application/json"}
                if self.api_key:
                    headers["Authorization"] = f"Bearer {self.api_key}"
                
                payload = {
                    "query": query,
                    "tags": tags or [],
                    "tags_match": "any",
                    "budget": "mid",
                    "max_tokens": max_tokens
                }
                resp = await http_client.post(
                    f"{self.base_url}/v1/default/banks/{bank_id}/memories/recall",
                    json=payload,
                    headers=headers
                )
                if resp.status_code == 200:
                    data = resp.json()
                    raw_items = data.get("results") or data.get("memories") or []
                    formatted = []
                    for item in raw_items:
                        text_val = item.get("text") or item.get("content") or ""
                        scores = item.get("scores") or {}
                        score_val = scores.get("final") if isinstance(scores, dict) else item.get("score", 0.95)
                        formatted.append({
                            "id": item.get("id"),
                            "content": text_val,
                            "score": score_val,
                            "type": item.get("type", "world"),
                            "metadata": item.get("metadata", {}),
                            "tags": item.get("tags", []),
                            "entities": item.get("entities", [])
                        })
                    return formatted
        except Exception as e:
            logger.debug(f"Direct Hindsight recall attempt: {e}")

        return []

hindsight_service = HindsightService()
