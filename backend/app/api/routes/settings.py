from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.seed.seed_data import DEFAULT_ORG_ID
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("")
async def get_settings(db: AsyncSession = Depends(get_db)):
    return {
        "organization": {
            "id": DEFAULT_ORG_ID,
            "name": "Apex Precision Industries",
            "slug": "apex-precision",
            "plan": "Enterprise Tier",
            "hindsight_bank": f"org_{DEFAULT_ORG_ID.replace('-', '_').lower()}",
            "created_date": "Jan 12, 2025"
        },
        "ai": {
            "provider": settings.LLM_PROVIDER,
            "model": settings.LLM_MODEL,
            "temperature": 0.2,
            "memory_grounding_enforced": True,
            "min_confidence_threshold": 0.85
        },
        "memory": {
            "hindsight_base_url": settings.HINDSIGHT_BASE_URL,
            "memory_retention_days": "Indefinite (Persistent)",
            "cross_asset_synthesis": True,
            "include_failed_troubleshooting": True,
            "auto_commit_on_resolve": True
        },
        "users": [
            {"name": "Prasad", "email": "prasad@apexprecision.com", "role": "Maintenance Manager", "status": "Active"},
            {"name": "Marcus Vance", "email": "marcus.v@apexprecision.com", "role": "Senior Diagnostic Technician", "status": "Active"},
            {"name": "Elena Rostova", "email": "elena.r@apexprecision.com", "role": "Vibration Specialist", "status": "Active"},
            {"name": "Tariq Mansour", "email": "tariq.m@apexprecision.com", "role": "Hydraulics Engineer", "status": "Active"},
            {"name": "Sarah Chen", "email": "sarah.c@apexprecision.com", "role": "Automation Specialist", "status": "Active"}
        ]
    }
