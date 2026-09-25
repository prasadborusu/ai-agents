from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.supabase_service import supabase_service
from app.services.hindsight_service import hindsight_service
from app.services.diagnosis_service import diagnosis_service
from app.schemas.schemas import (
    IncidentResponse, IncidentDetailResponse, IncidentCreate,
    IncidentResolveRequest, DiagnosisResponse
)
from app.seed.seed_data import DEFAULT_ORG_ID
from app.core.logging import logger

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.get("", response_model=List[IncidentResponse])
async def list_incidents(
    status: Optional[str] = Query(None),
    machine_id: Optional[str] = Query(None),
    problem_category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db)
):
    incidents = await supabase_service.list_incidents(
        session=db,
        organization_id=DEFAULT_ORG_ID,
        status=status,
        machine_id=machine_id,
        problem_category=problem_category,
        search=search,
        limit=limit,
        offset=offset
    )

    formatted = []
    for inc in incidents:
        formatted.append({
            "id": inc.id,
            "organization_id": inc.organization_id,
            "incident_number": inc.incident_number,
            "machine_id": inc.machine_id,
            "machine_code": inc.machine.machine_code if inc.machine else "Asset",
            "machine_name": inc.machine.name if inc.machine else "Equipment",
            "title": inc.title,
            "problem_category": inc.problem_category,
            "severity": inc.severity,
            "status": inc.status,
            "is_recurring": inc.is_recurring,
            "recurring_count": inc.recurring_count,
            "description": inc.description,
            "observed_behavior": inc.observed_behavior,
            "measurements": inc.measurements,
            "environmental_conditions": inc.environmental_conditions,
            "initial_observations": inc.initial_observations,
            "resolved_at": inc.resolved_at,
            "root_cause": inc.root_cause,
            "resolution_summary": inc.resolution_summary,
            "successful_action": inc.successful_action,
            "lesson_learned": inc.lesson_learned,
            "downtime_hours": inc.downtime_hours,
            "created_at": inc.created_at,
            "updated_at": inc.updated_at
        })
    return formatted

@router.post("", response_model=IncidentResponse)
async def create_incident(
    payload: IncidentCreate,
    db: AsyncSession = Depends(get_db)
):
    incident = await supabase_service.create_incident(
        session=db,
        organization_id=DEFAULT_ORG_ID,
        machine_id=payload.machine_id,
        problem_category=payload.problem_category,
        title=payload.title,
        description=payload.description,
        symptoms=payload.symptoms,
        severity=payload.severity,
        technician_name=payload.technician_name or "Prasad",
        measurements=payload.measurements,
        environmental_conditions=payload.environmental_conditions,
        initial_observations=payload.initial_observations
    )

    # Automatically store initial memory in Hindsight
    try:
        mach = await supabase_service.get_machine(db, payload.machine_id)
        mach_code = mach.machine_code if mach else "ASSET"
        mem_id = await hindsight_service.storeIncidentMemory(
            organization_id=DEFAULT_ORG_ID,
            incident_id=incident.incident_number,
            machine_code=mach_code,
            problem_category=payload.problem_category,
            symptoms=payload.symptoms,
            description=payload.description,
            measurements=payload.measurements,
            technician_name=payload.technician_name
        )
        if mem_id:
            await supabase_service.link_memory_reference(
                session=db,
                organization_id=DEFAULT_ORG_ID,
                incident_id=incident.id,
                machine_id=incident.machine_id,
                hindsight_memory_id=mem_id,
                memory_type="incident",
                content_summary=f"Incident {incident.incident_number} opened: {payload.problem_category}"
            )
    except Exception as e:
        logger.warning(f"Failed to record initial incident to Hindsight: {e}")

    return {
        "id": incident.id,
        "organization_id": incident.organization_id,
        "incident_number": incident.incident_number,
        "machine_id": incident.machine_id,
        "machine_code": getattr(incident.machine, "machine_code", "ASSET") if incident.machine else "ASSET",
        "machine_name": getattr(incident.machine, "name", "Equipment") if incident.machine else "Equipment",
        "title": incident.title,
        "problem_category": incident.problem_category,
        "severity": incident.severity,
        "status": incident.status,
        "is_recurring": incident.is_recurring,
        "recurring_count": incident.recurring_count,
        "description": incident.description,
        "observed_behavior": incident.observed_behavior,
        "measurements": incident.measurements,
        "environmental_conditions": incident.environmental_conditions,
        "initial_observations": incident.initial_observations,
        "resolved_at": incident.resolved_at,
        "root_cause": incident.root_cause,
        "resolution_summary": incident.resolution_summary,
        "successful_action": incident.successful_action,
        "lesson_learned": incident.lesson_learned,
        "downtime_hours": incident.downtime_hours,
        "created_at": incident.created_at,
        "updated_at": incident.updated_at
    }

@router.get("/{incident_id}", response_model=IncidentDetailResponse)
async def get_incident(
    incident_id: str,
    db: AsyncSession = Depends(get_db)
):
    inc = await supabase_service.get_incident_detail(db, incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    symptoms_list = [s.symptom for s in (inc.symptoms or [])]
    attempts = [
        {
            "id": a.id,
            "attempt_order": a.attempt_order,
            "technician_name": a.technician_name,
            "hypothesis": a.hypothesis,
            "action_taken": a.action_taken,
            "outcome": a.outcome,
            "notes": a.notes
        }
        for a in (inc.diagnostic_attempts or [])
    ]
    repairs = [
        {
            "id": r.id,
            "performed_by": r.performed_by,
            "action_summary": r.action_summary,
            "outcome": r.outcome,
            "root_cause": r.root_cause,
            "duration_hours": r.duration_hours,
            "completed_at": r.completed_at,
            "repair_parts": [
                {"part_name": rp.part_name, "quantity_used": rp.quantity_used, "outcome_impact": rp.outcome_impact}
                for rp in (r.repair_parts or [])
            ]
        }
        for r in (inc.repairs or [])
    ]
    obs = [
        {
            "id": o.id,
            "technician_name": o.technician_name,
            "observation_text": o.observation_text,
            "environment_factors": o.environment_factors
        }
        for o in (inc.technician_observations or [])
    ]
    mem_refs = [
        {
            "id": m.id,
            "hindsight_memory_id": m.hindsight_memory_id,
            "memory_type": m.memory_type,
            "summary": m.content_summary,
            "created_at": m.created_at
        }
        for m in (inc.memory_references or [])
    ]

    return {
        "id": inc.id,
        "organization_id": inc.organization_id,
        "incident_number": inc.incident_number,
        "machine_id": inc.machine_id,
        "machine_code": inc.machine.machine_code if inc.machine else "Asset",
        "machine_name": inc.machine.name if inc.machine else "Equipment",
        "title": inc.title,
        "problem_category": inc.problem_category,
        "severity": inc.severity,
        "status": inc.status,
        "is_recurring": inc.is_recurring,
        "recurring_count": inc.recurring_count,
        "description": inc.description,
        "observed_behavior": inc.observed_behavior,
        "measurements": inc.measurements,
        "environmental_conditions": inc.environmental_conditions,
        "initial_observations": inc.initial_observations,
        "resolved_at": inc.resolved_at,
        "root_cause": inc.root_cause,
        "resolution_summary": inc.resolution_summary,
        "successful_action": inc.successful_action,
        "lesson_learned": inc.lesson_learned,
        "downtime_hours": inc.downtime_hours,
        "created_at": inc.created_at,
        "updated_at": inc.updated_at,
        "symptoms_list": symptoms_list,
        "diagnostic_attempts": attempts,
        "repairs": repairs,
        "observations": obs,
        "memory_references": mem_refs
    }

@router.post("/{incident_id}/diagnose", response_model=DiagnosisResponse)
async def diagnose_existing_incident(
    incident_id: str,
    db: AsyncSession = Depends(get_db)
):
    inc = await supabase_service.get_incident_detail(db, incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    symptoms = [s.symptom for s in (inc.symptoms or [])]
    return await diagnosis_service.diagnose_incident(
        session=db,
        organization_id=inc.organization_id,
        machine_id=inc.machine_id,
        problem_category=inc.problem_category,
        symptoms=symptoms,
        observed_behavior=inc.observed_behavior,
        measurements=inc.measurements,
        technician_notes=inc.initial_observations,
        severity=inc.severity,
        incident_id=inc.id
    )

@router.post("/{incident_id}/resolve")
async def resolve_incident(
    incident_id: str,
    payload: IncidentResolveRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    CRITICAL WORKFLOW (Sections 16, 21, 42):
    1. Save structured resolution to Supabase
    2. Generate a meaningful memory record
    3. Store the memory in Hindsight
    4. Link the Hindsight memory to the Supabase incident via memory_references
    5. Make the memory searchable for future incidents
    """
    # 1. Save structured resolution to Supabase
    incident = await supabase_service.resolve_incident(
        session=db,
        incident_id=incident_id,
        action_taken=payload.action_taken,
        outcome=payload.outcome,
        root_cause=payload.root_cause,
        resolution_notes=payload.resolution_notes,
        lesson_learned=payload.lesson_learned,
        technician_observations=payload.technician_observations,
        parts_replaced=[p.model_dump() for p in payload.parts_replaced],
        downtime_hours=payload.downtime_hours
    )

    mach = await supabase_service.get_machine(db, incident.machine_id)
    mach_code = mach.machine_code if mach else "ASSET"
    symptoms = [s.symptom for s in (incident.symptoms or [])]

    # 2 & 3. Store the memory in Hindsight
    mem_id = await hindsight_service.updateMemoryAfterResolution(
        organization_id=DEFAULT_ORG_ID,
        incident_id=incident.incident_number,
        machine_code=mach_code,
        problem_category=incident.problem_category,
        symptoms=symptoms,
        action_taken=payload.action_taken,
        outcome=payload.outcome,
        root_cause=payload.root_cause,
        lesson_learned=payload.lesson_learned or f"Checked {payload.action_taken} for {incident.problem_category}.",
        parts_replaced=[p.part_name for p in payload.parts_replaced],
        technician_name="Prasad"
    )

    # 4 & 5. Link Hindsight memory to memory_references table
    mem_ref = await supabase_service.link_memory_reference(
        session=db,
        organization_id=DEFAULT_ORG_ID,
        incident_id=incident.id,
        machine_id=incident.machine_id,
        hindsight_memory_id=mem_id,
        memory_type="successful_resolution" if payload.outcome == "RESOLVED" else "failed_attempt",
        content_summary=f"Resolved with {payload.action_taken}. Lesson: {payload.lesson_learned or payload.root_cause}",
        metadata={"root_cause": payload.root_cause, "action": payload.action_taken, "outcome": payload.outcome}
    )

    return {
        "status": "success",
        "message": f"Incident {incident.incident_number} successfully resolved. Organizational experience committed to Hindsight.",
        "incident_number": incident.incident_number,
        "hindsight_memory_id": mem_id,
        "memory_reference_id": mem_ref.id
    }
