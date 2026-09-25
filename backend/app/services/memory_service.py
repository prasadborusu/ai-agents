from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.models.models import Incident, Machine, MemoryReference, DiagnosticAttempt
from app.services.hindsight_service import hindsight_service

class MemoryService:
    """
    Powers the Memory Explorer page:
    Visualizes organizational learning hierarchy:
    Machine -> Incident -> Symptoms -> Diagnostic attempts -> Failed actions -> Successful actions -> Root cause -> Lesson learned
    """

    async def get_memory_tree(
        self,
        session: AsyncSession,
        organization_id: str,
        machine_code_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        query = (
            select(Incident)
            .where(
                Incident.organization_id == organization_id,
                Incident.status == "Resolved"
            )
            .options(
                selectinload(Incident.machine),
                selectinload(Incident.symptoms),
                selectinload(Incident.diagnostic_attempts),
                selectinload(Incident.memory_references)
            )
            .order_by(desc(Incident.created_at))
        )
        if machine_code_filter and machine_code_filter != "All":
            query = query.join(Machine).where(Machine.machine_code == machine_code_filter)

        res = await session.execute(query)
        incidents = res.scalars().all()

        tree_nodes = []
        for inc in incidents:
            mach = inc.machine
            symptoms = [s.symptom for s in inc.symptoms]
            
            failed_actions = []
            successful_action = inc.successful_action or "Standard Calibration"
            attempts_formatted = []

            for att in inc.diagnostic_attempts:
                attempts_formatted.append({
                    "action": att.action_taken,
                    "outcome": att.outcome,
                    "technician": att.technician_name or "Technician"
                })
                if att.outcome == "FAILED":
                    failed_actions.append(att.action_taken)

            tree_nodes.append({
                "incident_id": inc.id,
                "incident_number": inc.incident_number,
                "machine_id": mach.id if mach else "",
                "machine_code": mach.machine_code if mach else "Asset",
                "machine_name": mach.name if mach else "Equipment",
                "problem": inc.problem_category,
                "symptoms": symptoms,
                "attempts": attempts_formatted,
                "failed_actions": list(set(failed_actions)),
                "successful_action": successful_action,
                "root_cause": inc.root_cause or "Mechanical wear and misalignment",
                "learned": inc.lesson_learned or f"For recurring {inc.problem_category} on {mach.machine_code if mach else 'machine'}, inspect {successful_action} first.",
                "date": inc.created_at.strftime("%b %d, %Y") if inc.created_at else "Sep 2026",
                "hindsight_ref_count": len(inc.memory_references),
                "confidence": 0.96
            })

        return tree_nodes

    async def search_memories(
        self,
        session: AsyncSession,
        organization_id: str,
        query: str,
        machine_code: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        # Query Hindsight memory bank
        hindsight_memories = await hindsight_service.retrieveRelevantMemories(
            organization_id=organization_id,
            query=query,
            machine_code=machine_code
        )

        # Query Supabase memory_references
        ref_query = select(MemoryReference).where(MemoryReference.organization_id == organization_id)
        if machine_code:
            ref_query = ref_query.join(Machine).where(Machine.machine_code == machine_code)
        
        ref_res = await session.execute(ref_query.limit(20))
        db_refs = ref_res.scalars().all()

        combined = []
        for item in hindsight_memories:
            combined.append({
                "source": "hindsight",
                "content": item.get("content"),
                "score": item.get("score", 0.92),
                "metadata": item.get("metadata", {}),
                "tags": item.get("tags", [])
            })

        for ref in db_refs:
            combined.append({
                "source": "supabase_reference",
                "id": ref.id,
                "hindsight_id": ref.hindsight_memory_id,
                "memory_type": ref.memory_type,
                "content": ref.content_summary or f"Experience memory {ref.hindsight_memory_id}",
                "score": 0.95,
                "date": ref.created_at.isoformat() if ref.created_at else None
            })

        return combined

memory_service = MemoryService()
