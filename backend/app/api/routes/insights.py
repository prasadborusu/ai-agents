from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.insight_service import insight_service
from app.seed.seed_data import DEFAULT_ORG_ID

router = APIRouter(prefix="/insights", tags=["insights"])

@router.get("")
async def get_insights_summary(db: AsyncSession = Depends(get_db)):
    """
    Returns organizational insights, failure distributions, top recurring problems,
    and machine health analytics.
    """
    summary = await insight_service.get_dashboard_summary(
        session=db,
        organization_id=DEFAULT_ORG_ID
    )
    return summary
