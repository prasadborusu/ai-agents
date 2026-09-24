from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, update, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.models import (
    Machine, Incident, IncidentSymptom, DiagnosticAttempt, Repair, RepairPart,
    TechnicianObservation, IncidentStatusHistory, MachineMetric, Part,
    KnowledgePattern, AIRecommendation, RecommendationFeedback, MemoryReference,
    Organization, User
)
from app.core.config import settings
from app.core.logging import logger

try:
    from supabase import create_client, Client
    SUPABASE_SDK_AVAILABLE = True
except ImportError:
    SUPABASE_SDK_AVAILABLE = False

class SupabaseService:
    """
    Operational database service abstraction.
    Manages structured assets, telemetry metrics, incidents, lifecycle transitions,
    and the memory_references bridge linking to Hindsight.
    """

    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        self.client: Optional[Any] = None
        if SUPABASE_SDK_AVAILABLE and self.url and self.key:
            try:
                self.client = create_client(self.url, self.key)
                logger.info(f"Supabase client connected to {self.url}")
            except Exception as e:
                logger.warning(f"Could not initialize Supabase client: {e}")

    async def get_machine(self, session: AsyncSession, machine_id: str) -> Optional[Machine]:
        stmt = (
            select(Machine)
            .where((Machine.id == machine_id) | (Machine.machine_code == machine_id))
            .options(
                selectinload(Machine.metrics),
                selectinload(Machine.incidents),
                selectinload(Machine.memory_references)
            )
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_machines(
        self,
        session: AsyncSession,
        organization_id: str,
        status: Optional[str] = None,
        type_name: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Machine]:
        query = select(Machine).where(Machine.organization_id == organization_id)
        if status and status != "All":
            query = query.where(Machine.status == status)
        if type_name and type_name != "All":
            query = query.where(Machine.type_name == type_name)
        if search:
            search_fmt = f"%{search}%"
            query = query.where(
                (Machine.machine_code.ilike(search_fmt)) |
                (Machine.name.ilike(search_fmt)) |
                (Machine.location_name.ilike(search_fmt))
            )
        query = query.order_by(Machine.machine_code)
        result = await session.execute(query)
        return list(result.scalars().all())

    async def get_machine_context(self, session: AsyncSession, machine_id: str) -> Dict[str, Any]:
        """Fetch full contextual state for AI diagnosis"""
        machine = await self.get_machine(session, machine_id)
        if not machine:
            return {}

        # Fetch recent 10 incidents
        inc_stmt = (
            select(Incident)
            .where(Incident.machine_id == machine.id)
            .options(
                selectinload(Incident.symptoms),
                selectinload(Incident.diagnostic_attempts),
                selectinload(Incident.repairs),
                selectinload(Incident.technician_observations)
            )
            .order_by(desc(Incident.created_at))
            .limit(10)
        )
        inc_res = await session.execute(inc_stmt)
        recent_incidents = inc_res.scalars().all()

        # Format historical attempts and resolutions
        history_summary = []
        for inc in recent_incidents:
            attempts_data = [
                {"action": a.action_taken, "outcome": a.outcome, "hypothesis": a.hypothesis}
                for a in inc.diagnostic_attempts
            ]
            history_summary.append({
                "incident_number": inc.incident_number,
                "problem_category": inc.problem_category,
                "status": inc.status,
                "created_at": inc.created_at.isoformat() if inc.created_at else None,
                "resolved_at": inc.resolved_at.isoformat() if inc.resolved_at else None,
                "root_cause": inc.root_cause,
                "successful_action": inc.successful_action,
                "lesson_learned": inc.lesson_learned,
                "diagnostic_attempts": attempts_data
            })

        return {
            "machine_id": machine.id,
            "machine_code": machine.machine_code,
            "name": machine.name,
            "type_name": machine.type_name,
            "location_name": machine.location_name,
            "status": machine.status,
            "risk_level": machine.risk_level,
            "operating_hours": machine.operating_hours,
            "total_incidents": machine.total_incidents,
            "recent_incidents": history_summary
        }

    async def list_incidents(
        self,
        session: AsyncSession,
        organization_id: str,
        status: Optional[str] = None,
        machine_id: Optional[str] = None,
        problem_category: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Incident]:
        query = (
            select(Incident)
            .where(Incident.organization_id == organization_id)
            .options(
                selectinload(Incident.machine),
                selectinload(Incident.symptoms)
            )
        )
        if status and status != "All":
            query = query.where(Incident.status == status)
        if machine_id:
            query = query.where(Incident.machine_id == machine_id)
        if problem_category and problem_category != "All":
            query = query.where(Incident.problem_category == problem_category)
        if search:
            search_fmt = f"%{search}%"
            query = query.where(
                (Incident.incident_number.ilike(search_fmt)) |
                (Incident.title.ilike(search_fmt)) |
                (Incident.description.ilike(search_fmt))
            )
        query = query.order_by(desc(Incident.created_at)).offset(offset).limit(limit)
        result = await session.execute(query)
        return list(result.scalars().all())

    async def get_incident_detail(self, session: AsyncSession, incident_id: str) -> Optional[Incident]:
        stmt = (
            select(Incident)
            .where((Incident.id == incident_id) | (Incident.incident_number == incident_id))
            .options(
                selectinload(Incident.machine),
                selectinload(Incident.symptoms),
                selectinload(Incident.diagnostic_attempts),
                selectinload(Incident.repairs).selectinload(Repair.repair_parts),
                selectinload(Incident.technician_observations),
                selectinload(Incident.recommendations),
                selectinload(Incident.memory_references)
            )
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_incident(
        self,
        session: AsyncSession,
        organization_id: str,
        machine_id: str,
        problem_category: str,
        title: str,
        description: str,
        symptoms: List[str],
        severity: str = "Medium",
        technician_name: str = "Prasad",
        measurements: Optional[Dict[str, Any]] = None,
        environmental_conditions: Optional[str] = None,
        initial_observations: Optional[str] = None
    ) -> Incident:
        # Determine incident number
        count_stmt = select(func.count(Incident.id)).where(Incident.organization_id == organization_id)
        count_res = await session.execute(count_stmt)
        next_num = (count_res.scalar() or 0) + 1049
        inc_number = f"INC-{next_num}"

        # Check recurring count
        recur_stmt = select(func.count(Incident.id)).where(
            Incident.organization_id == organization_id,
            Incident.machine_id == machine_id,
            Incident.problem_category == problem_category
        )
        recur_res = await session.execute(recur_stmt)
        past_similar_count = recur_res.scalar() or 0
        is_recurring = past_similar_count > 0

        incident = Incident(
            organization_id=organization_id,
            incident_number=inc_number,
            machine_id=machine_id,
            title=title,
            problem_category=problem_category,
            severity=severity,
            status="Open",
            is_recurring=is_recurring,
            recurring_count=past_similar_count + 1,
            description=description,
            observed_behavior=initial_observations,
            measurements=measurements,
            environmental_conditions=environmental_conditions,
            initial_observations=initial_observations
        )
        session.add(incident)
        await session.flush()

        # Add symptoms
        for sym in symptoms:
            session.add(IncidentSymptom(
                organization_id=organization_id,
                incident_id=incident.id,
                symptom=sym
            ))

        # Add initial observation if provided
        if initial_observations:
            session.add(TechnicianObservation(
                organization_id=organization_id,
                incident_id=incident.id,
                technician_name=technician_name,
                observation_text=initial_observations,
                environment_factors=environmental_conditions
            ))

        # Update machine status
        mach_stmt = select(Machine).where(Machine.id == machine_id)
        mach_res = await session.execute(mach_stmt)
        machine = mach_res.scalar_one_or_none()
        if machine:
            machine.total_incidents += 1
            machine.last_incident_date = datetime.now(timezone.utc)
            if severity in ("Critical", "High") and machine.status != "Offline":
                machine.status = "Alert"
            elif severity == "Medium" and machine.status == "Good":
                machine.status = "Warning"

        await session.commit()
        await session.refresh(incident)
        return incident

    async def link_memory_reference(
        self,
        session: AsyncSession,
        organization_id: str,
        incident_id: Optional[str],
        machine_id: str,
        hindsight_memory_id: str,
        memory_type: str,
        content_summary: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> MemoryReference:
        ref = MemoryReference(
            organization_id=organization_id,
            incident_id=incident_id,
            machine_id=machine_id,
            hindsight_memory_id=hindsight_memory_id,
            memory_type=memory_type,
            content_summary=content_summary,
            meta_data=metadata
        )
        session.add(ref)
        await session.commit()
        await session.refresh(ref)
        return ref

    async def resolve_incident(
        self,
        session: AsyncSession,
        incident_id: str,
        action_taken: str,
        outcome: str,
        root_cause: str,
        resolution_notes: str,
        lesson_learned: Optional[str] = None,
        technician_observations: Optional[str] = None,
        parts_replaced: Optional[List[Dict[str, Any]]] = None,
        downtime_hours: float = 1.0,
        technician_name: str = "Prasad"
    ) -> Incident:
        stmt = (
            select(Incident)
            .where(Incident.id == incident_id)
            .options(
                selectinload(Incident.machine),
                selectinload(Incident.symptoms)
            )
        )
        res = await session.execute(stmt)
        incident = res.scalar_one_or_none()
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")

        # Update incident record
        incident.status = "Resolved" if outcome == "RESOLVED" else "Unresolved"
        incident.resolved_at = datetime.now(timezone.utc)
        incident.root_cause = root_cause
        incident.resolution_summary = resolution_notes
        incident.successful_action = action_taken if outcome == "RESOLVED" else None
        incident.lesson_learned = lesson_learned
        incident.downtime_hours = downtime_hours

        # Log diagnostic attempt / repair record
        attempt = DiagnosticAttempt(
            organization_id=incident.organization_id,
            incident_id=incident.id,
            attempt_order=len(incident.diagnostic_attempts) + 1 if hasattr(incident, "diagnostic_attempts") else 1,
            technician_name=technician_name,
            hypothesis=root_cause,
            action_taken=action_taken,
            outcome=outcome,
            notes=resolution_notes
        )
        session.add(attempt)

        repair = Repair(
            organization_id=incident.organization_id,
            incident_id=incident.id,
            machine_id=incident.machine_id,
            performed_by=technician_name,
            action_summary=action_taken,
            outcome=outcome,
            root_cause=root_cause,
            duration_hours=downtime_hours
        )
        session.add(repair)
        await session.flush()

        if parts_replaced:
            for p in parts_replaced:
                session.add(RepairPart(
                    organization_id=incident.organization_id,
                    repair_id=repair.id,
                    part_name=p.get("part_name", "Replaced Component"),
                    quantity_used=p.get("quantity_used", 1),
                    outcome_impact=p.get("outcome_impact", "Installed")
                ))

        if technician_observations:
            session.add(TechnicianObservation(
                organization_id=incident.organization_id,
                incident_id=incident.id,
                technician_name=technician_name,
                observation_text=technician_observations
            ))

        # Machine status returns to Good if resolved
        if outcome == "RESOLVED" and incident.machine:
            incident.machine.status = "Good"

        await session.commit()
        await session.refresh(incident)
        return incident

supabase_service = SupabaseService()
