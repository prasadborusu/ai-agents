from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.memory_service import memory_service
from app.services.hindsight_service import hindsight_service
from app.seed.seed_data import DEFAULT_ORG_ID

router = APIRouter(prefix="/memory", tags=["memory"])

@router.get("/tree")
async def get_memory_tree(
    machine_code: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns hierarchical organizational memory tree:
    Machine -> Incident -> Symptoms -> Diagnostic Attempts -> Failed Actions -> Successful Actions -> Root Cause -> Lesson Learned
    """
    tree = await memory_service.get_memory_tree(
        session=db,
        organization_id=DEFAULT_ORG_ID,
        machine_code_filter=machine_code
    )
    return tree

@router.get("/search")
async def search_memories(
    q: str = Query(..., description="Natural language search term"),
    machine_code: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    results = await memory_service.search_memories(
        session=db,
        organization_id=DEFAULT_ORG_ID,
        query=q,
        machine_code=machine_code
    )
    return results

@router.get("/machine/{machine_code}")
async def get_machine_memories(
    machine_code: str,
    db: AsyncSession = Depends(get_db)
):
    memories = await hindsight_service.getMachineMemory(
        organization_id=DEFAULT_ORG_ID,
        machine_code=machine_code
    )
    return {
        "machine_code": machine_code,
        "memories": memories,
        "count": len(memories)
    }

@router.get("/reflection")
async def get_organizational_reflection(
    topic: Optional[str] = Query("recurring failures and permanent fixes")
):
    reflection = await hindsight_service.getOrganizationalLearning(
        organization_id=DEFAULT_ORG_ID,
        topic=topic
    )
    return reflection

@router.get("/graph")
async def get_hindsight_graph(
    limit: int = Query(1000, description="Max graph elements")
):
    """Returns memory graph visualization data from Hindsight"""
    graph = await hindsight_service.getMemoryGraph(
        organization_id=DEFAULT_ORG_ID,
        limit=limit
    )
    return graph or {"nodes": [], "edges": [], "table_rows": [], "total_units": 0}

@router.get("/stats")
async def get_hindsight_stats():
    """Returns memory bank statistics from Hindsight"""
    stats = await hindsight_service.getBankStats(
        organization_id=DEFAULT_ORG_ID
    )
    return stats or {"status": "offline", "bank_id": hindsight_service.get_bank_id(DEFAULT_ORG_ID)}

