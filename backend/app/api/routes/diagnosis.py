from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.diagnosis_service import diagnosis_service
from app.schemas.schemas import (
    DiagnosisRequest, DiagnosisResponse, RecommendationFeedbackRequest
)
from app.seed.seed_data import DEFAULT_ORG_ID

router = APIRouter(prefix="/diagnose", tags=["diagnose"])

@router.post("", response_model=DiagnosisResponse)
async def analyze_with_remembr(
    payload: DiagnosisRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Main AI Diagnostic Workflow:
    Accepts machine, problem category, symptoms, observations, and telemetry measurements.
    Combines Supabase operational records + Hindsight organizational memory + AI synthesis.
    Returns structured recommendations with 'Why this recommendation' and 'Memory Impact'.
    """
    try:
        diagnosis = await diagnosis_service.diagnose_incident(
            session=db,
            organization_id=DEFAULT_ORG_ID,
            machine_id=payload.machine_id,
            problem_category=payload.problem_category,
            symptoms=payload.symptoms,
            observed_behavior=payload.observed_behavior,
            measurements=payload.measurements,
            technician_notes=payload.technician_notes,
            severity=payload.severity
        )
        return diagnosis
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostic reasoning engine error: {str(e)}")

@router.post("/feedback")
async def submit_feedback(
    payload: RecommendationFeedbackRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Submits technician feedback on AI recommendations to continuously improve accuracy.
    """
    result = await diagnosis_service.collect_feedback(
        session=db,
        organization_id=DEFAULT_ORG_ID,
        recommendation_id=payload.recommendation_id,
        rating=payload.rating,
        worked_status=payload.worked_status,
        actual_action_taken=payload.actual_action_taken,
        actual_result=payload.actual_result,
        technician_correction=payload.technician_correction
    )
    return result
