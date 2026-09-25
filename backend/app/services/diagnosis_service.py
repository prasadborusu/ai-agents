import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.supabase_service import supabase_service
from app.services.hindsight_service import hindsight_service
from app.services.ai_service import ai_service
from app.models.models import AIRecommendation, RecommendationFeedback, Incident
from app.core.logging import logger

class DiagnosisService:
    """
    Coordinates the 8-step AI diagnosis flow:
    1. Receive current incident information
    2. Query Supabase for machine info, status, history, metrics
    3. Query Hindsight for similar incidents, failed attempts, successful solutions
    4. Combine structured data + historical memory
    5. Send context to AI reasoning engine
    6. Generate structured diagnosis with 'Why this recommendation' and 'Memory Impact'
    7. Store recommendation in database and link to Hindsight
    8. Enable feedback collection
    """

    async def diagnose_incident(
        self,
        session: AsyncSession,
        organization_id: str,
        machine_id: str,
        problem_category: str,
        symptoms: List[str],
        observed_behavior: Optional[str] = None,
        measurements: Optional[Dict[str, Any]] = None,
        technician_notes: Optional[str] = None,
        severity: str = "Medium",
        incident_id: Optional[str] = None
    ) -> Dict[str, Any]:
        # Step 1 & 2: Query Supabase for machine context and historical incidents
        machine_ctx = await supabase_service.get_machine_context(session, machine_id)
        if not machine_ctx:
            raise ValueError(f"Machine {machine_id} not found in database.")

        machine_code = machine_ctx["machine_code"]
        historical_incidents = machine_ctx.get("recent_incidents", [])

        # Step 3: Query Hindsight persistent memory for machine history and cross-machine learnings
        hindsight_ctx = await hindsight_service.generateMemoryContext(
            organization_id=organization_id,
            machine_code=machine_code,
            problem_category=problem_category,
            symptoms=symptoms
        )

        # Step 4 & 5: Combine context and generate diagnosis
        incident_data = {
            "problem_category": problem_category,
            "symptoms": symptoms,
            "observed_behavior": observed_behavior,
            "measurements": measurements,
            "technician_notes": technician_notes,
            "severity": severity
        }

        # Step 6: Generate structured diagnosis
        diagnosis_result = await ai_service.generate_structured_diagnosis(
            machine_info=machine_ctx,
            incident_info=incident_data,
            hindsight_context=hindsight_ctx,
            historical_incidents=historical_incidents
        )

        rec_id = str(uuid.uuid4())
        diagnosis_result["id"] = rec_id
        diagnosis_result["hindsight_active"] = hindsight_service.is_connected
        diagnosis_result["created_at"] = datetime.now(timezone.utc)

        # Step 7: Persist recommendation to Supabase
        # If an active incident_id was provided, link it; otherwise link to the latest open or create a reference
        target_incident_id = incident_id
        if not target_incident_id and historical_incidents:
            # find latest incident for this machine
            target_incident_id = historical_incidents[0].get("incident_id")

        if target_incident_id:
            db_rec = AIRecommendation(
                id=rec_id,
                organization_id=organization_id,
                incident_id=target_incident_id,
                problem=problem_category,
                likely_causes=diagnosis_result["likely_causes"],
                recommended_first_check=diagnosis_result["recommended_first_check"],
                why_explanation=diagnosis_result["why_explanation"],
                historical_evidence=diagnosis_result["historical_evidence"],
                previously_failed=diagnosis_result["previously_failed"],
                recommended_action=diagnosis_result["recommended_action"],
                confidence_score=diagnosis_result["confidence_score"],
                memory_impact_statement=diagnosis_result["memory_impact"]["impact_narrative"],
                hindsight_memories_used=hindsight_ctx.get("memories", [])[:5],
                reasoning_trace=diagnosis_result["why_trace"]
            )
            session.add(db_rec)
            await session.commit()

        return diagnosis_result

    async def collect_feedback(
        self,
        session: AsyncSession,
        organization_id: str,
        recommendation_id: str,
        rating: Optional[str] = None,
        worked_status: Optional[str] = None,
        actual_action_taken: Optional[str] = None,
        actual_result: Optional[str] = None,
        technician_correction: Optional[str] = None,
        technician_name: str = "Prasad"
    ) -> Dict[str, Any]:
        """
        Records technician feedback and closes the continuous learning loop.
        """
        feedback = RecommendationFeedback(
            organization_id=organization_id,
            recommendation_id=recommendation_id,
            technician_name=technician_name,
            rating=rating,
            worked_status=worked_status,
            actual_action_taken=actual_action_taken,
            actual_result=actual_result,
            technician_correction=technician_correction
        )
        session.add(feedback)
        await session.commit()
        return {"status": "success", "message": "Feedback recorded. Continuous learning memory updated."}

diagnosis_service = DiagnosisService()
