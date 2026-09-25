from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.supabase_service import supabase_service
from app.schemas.schemas import MachineResponse, MachineDetailResponse, MachineCreate
from app.seed.seed_data import DEFAULT_ORG_ID

router = APIRouter(prefix="/machines", tags=["machines"])

@router.get("", response_model=List[MachineResponse])
async def get_machines(
    status: Optional[str] = Query(None),
    type_name: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    machines = await supabase_service.list_machines(
        session=db,
        organization_id=DEFAULT_ORG_ID,
        status=status,
        type_name=type_name,
        search=search
    )
    return machines

@router.get("/{machine_id}", response_model=MachineDetailResponse)
async def get_machine(
    machine_id: str,
    db: AsyncSession = Depends(get_db)
):
    machine = await supabase_service.get_machine(db, machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    metrics_data = [
        {
            "id": m.id,
            "metric_name": m.metric_name,
            "metric_value": m.metric_value,
            "unit": m.unit,
            "status": m.status,
            "recorded_at": m.recorded_at
        }
        for m in (machine.metrics or [])
    ]

    recent_incidents = [
        {
            "id": inc.id,
            "incident_number": inc.incident_number,
            "title": inc.title,
            "problem_category": inc.problem_category,
            "status": inc.status,
            "severity": inc.severity,
            "created_at": inc.created_at,
            "root_cause": inc.root_cause,
            "successful_action": inc.successful_action,
            "lesson_learned": inc.lesson_learned
        }
        for inc in (machine.incidents or [])[:10]
    ]

    return {
        "id": machine.id,
        "organization_id": machine.organization_id,
        "machine_code": machine.machine_code,
        "name": machine.name,
        "type_name": machine.type_name,
        "location_name": machine.location_name,
        "status": machine.status,
        "risk_level": machine.risk_level,
        "manufacturer": machine.manufacturer,
        "model_number": machine.model_number,
        "serial_number": machine.serial_number,
        "operating_hours": machine.operating_hours,
        "total_incidents": machine.total_incidents,
        "last_incident_date": machine.last_incident_date,
        "created_at": machine.created_at,
        "updated_at": machine.updated_at,
        "metrics": metrics_data,
        "recent_incidents": recent_incidents,
        "recurring_problems": [],
        "memory_references_count": len(machine.memory_references or [])
    }
