import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, Integer, Float, Boolean, JSON, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    plan = Column(String(50), default="enterprise")
    hindsight_bank_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    machines = relationship("Machine", back_populates="organization", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="organization", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="Technician")  # Admin, Maintenance Manager, Technician, Viewer
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    organization = relationship("Organization", back_populates="users")
    incidents_reported = relationship("Incident", foreign_keys="Incident.reported_by_id", back_populates="reporter")
    incidents_assigned = relationship("Incident", foreign_keys="Incident.assigned_to_id", back_populates="assignee")


class MachineType(Base):
    __tablename__ = "machine_types"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)  # CNC Machine, Hydraulic Press, Industrial Pump, Conveyor, Compressor
    code = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class MachineLocation(Base):
    __tablename__ = "machine_locations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)  # Production Line A, Assembly Cell 3, Heavy Stamping Bay
    building = Column(String(100), nullable=True)
    floor = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class Machine(Base):
    __tablename__ = "machines"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    machine_code = Column(String(50), nullable=False, index=True)  # CNC-104, PMP-201, PRESS-12, CONV-03
    name = Column(String(255), nullable=False)
    type_name = Column(String(100), nullable=False)  # CNC Machine, Industrial Pump, etc.
    location_name = Column(String(100), nullable=False)  # Production Line A
    status = Column(String(50), default="Good", index=True)  # Good, Warning, Alert, Offline
    risk_level = Column(String(50), default="Low")  # Low, Medium, High, Critical
    manufacturer = Column(String(100), nullable=True)
    model_number = Column(String(100), nullable=True)
    serial_number = Column(String(100), nullable=True)
    installation_date = Column(DateTime(timezone=True), nullable=True)
    total_incidents = Column(Integer, default=0)
    last_incident_date = Column(DateTime(timezone=True), nullable=True)
    operating_hours = Column(Float, default=0.0)
    meta_info = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    organization = relationship("Organization", back_populates="machines")
    incidents = relationship("Incident", back_populates="machine", cascade="all, delete-orphan")
    metrics = relationship("MachineMetric", back_populates="machine", cascade="all, delete-orphan")
    memory_references = relationship("MemoryReference", back_populates="machine", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_machine_org_code", "organization_id", "machine_code"),
    )


class Part(Base):
    __tablename__ = "parts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    part_number = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    stock_quantity = Column(Integer, default=0)
    unit_cost = Column(Float, default=0.0)
    lead_time_days = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    incident_number = Column(String(50), nullable=False, index=True)  # INC-1048, etc.
    machine_id = Column(String(36), ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    reported_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_to_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(255), nullable=False)
    problem_category = Column(String(100), nullable=False, index=True)  # Vibration, Overheating, Pressure drop, etc.
    severity = Column(String(50), default="Medium", index=True)  # Low, Medium, High, Critical
    status = Column(String(50), default="Open", index=True)  # Open, Investigating, Action Taken, Resolved, Unresolved
    is_recurring = Column(Boolean, default=False, index=True)
    recurring_count = Column(Integer, default=1)

    description = Column(Text, nullable=False)
    observed_behavior = Column(Text, nullable=True)
    measurements = Column(JSON, nullable=True)  # e.g. {"vibration_mm_s": 8.4, "temp_c": 78}
    environmental_conditions = Column(Text, nullable=True)
    initial_observations = Column(Text, nullable=True)

    # Resolution fields
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    root_cause = Column(Text, nullable=True)
    resolution_summary = Column(Text, nullable=True)
    successful_action = Column(Text, nullable=True)
    lesson_learned = Column(Text, nullable=True)
    downtime_hours = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    machine = relationship("Machine", back_populates="incidents")
    organization = relationship("Organization", back_populates="incidents")
    reporter = relationship("User", foreign_keys=[reported_by_id], back_populates="incidents_reported")
    assignee = relationship("User", foreign_keys=[assigned_to_id], back_populates="incidents_assigned")

    symptoms = relationship("IncidentSymptom", back_populates="incident", cascade="all, delete-orphan")
    diagnostic_attempts = relationship("DiagnosticAttempt", back_populates="incident", cascade="all, delete-orphan")
    repairs = relationship("Repair", back_populates="incident", cascade="all, delete-orphan")
    technician_observations = relationship("TechnicianObservation", back_populates="incident", cascade="all, delete-orphan")
    status_history = relationship("IncidentStatusHistory", back_populates="incident", cascade="all, delete-orphan")
    recommendations = relationship("AIRecommendation", back_populates="incident", cascade="all, delete-orphan")
    memory_references = relationship("MemoryReference", back_populates="incident", cascade="all, delete-orphan")


class IncidentSymptom(Base):
    __tablename__ = "incident_symptoms"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    symptom = Column(String(255), nullable=False)
    severity_rating = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    incident = relationship("Incident", back_populates="symptoms")


class DiagnosticAttempt(Base):
    __tablename__ = "diagnostic_attempts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    attempt_order = Column(Integer, default=1)
    technician_name = Column(String(255), nullable=True)
    hypothesis = Column(Text, nullable=True)
    action_taken = Column(Text, nullable=False)
    outcome = Column(String(50), nullable=False)  # FAILED, RESOLVED, PARTIAL, INCONCLUSIVE
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    incident = relationship("Incident", back_populates="diagnostic_attempts")


class Repair(Base):
    __tablename__ = "repairs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    machine_id = Column(String(36), ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    performed_by = Column(String(255), nullable=True)
    action_summary = Column(Text, nullable=False)
    outcome = Column(String(50), nullable=False)  # RESOLVED, FAILED, TEMPORARY_FIX
    root_cause = Column(Text, nullable=True)
    duration_hours = Column(Float, default=1.0)
    completed_at = Column(DateTime(timezone=True), default=utc_now)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    incident = relationship("Incident", back_populates="repairs")
    repair_parts = relationship("RepairPart", back_populates="repair", cascade="all, delete-orphan")


class RepairPart(Base):
    __tablename__ = "repair_parts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    repair_id = Column(String(36), ForeignKey("repairs.id", ondelete="CASCADE"), nullable=False, index=True)
    part_id = Column(String(36), ForeignKey("parts.id", ondelete="SET NULL"), nullable=True)
    part_name = Column(String(255), nullable=False)
    quantity_used = Column(Integer, default=1)
    outcome_impact = Column(String(100), nullable=True)  # Resolved issue, Did not solve, Wear found
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    repair = relationship("Repair", back_populates="repair_parts")


class TechnicianObservation(Base):
    __tablename__ = "technician_observations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    technician_name = Column(String(255), nullable=False)
    observation_text = Column(Text, nullable=False)
    environment_factors = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    incident = relationship("Incident", back_populates="technician_observations")


class MaintenanceAction(Base):
    __tablename__ = "maintenance_actions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class IncidentStatusHistory(Base):
    __tablename__ = "incident_status_history"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    changed_by_name = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    incident = relationship("Incident", back_populates="status_history")


class MachineMetric(Base):
    __tablename__ = "machine_metrics"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    machine_id = Column(String(36), ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False)  # vibration_rms, oil_pressure, coolant_temp, motor_current
    metric_value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)  # mm/s, bar, C, A
    status = Column(String(50), default="Normal")  # Normal, Warning, Critical
    recorded_at = Column(DateTime(timezone=True), default=utc_now)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    machine = relationship("Machine", back_populates="metrics")


class KnowledgePattern(Base):
    __tablename__ = "knowledge_patterns"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    machine_type = Column(String(100), nullable=False)
    problem_category = Column(String(100), nullable=False)
    symptom_signature = Column(JSON, nullable=False)  # list of symptoms
    likely_root_cause = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    failed_approaches_to_avoid = Column(JSON, nullable=False)  # list of failed approaches
    occurrence_count = Column(Integer, default=1)
    success_rate = Column(Float, default=100.0)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    problem = Column(String(255), nullable=False)
    likely_causes = Column(JSON, nullable=False)  # list of causes with likelihood
    recommended_first_check = Column(Text, nullable=False)
    why_explanation = Column(Text, nullable=False)
    historical_evidence = Column(JSON, nullable=False)  # list of incident ids & evidence notes
    previously_failed = Column(JSON, nullable=False)  # list of failed actions
    recommended_action = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.92)
    memory_impact_statement = Column(Text, nullable=True)
    hindsight_memories_used = Column(JSON, nullable=True)  # list of memory IDs or snippets
    reasoning_trace = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    incident = relationship("Incident", back_populates="recommendations")
    feedback = relationship("RecommendationFeedback", back_populates="recommendation", cascade="all, delete-orphan")


class RecommendationFeedback(Base):
    __tablename__ = "recommendation_feedback"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_id = Column(String(36), ForeignKey("ai_recommendations.id", ondelete="CASCADE"), nullable=False, index=True)
    technician_name = Column(String(255), nullable=True)
    rating = Column(String(50), nullable=True)  # Helpful, Not Helpful
    worked_status = Column(String(50), nullable=True)  # Yes, Partially, No
    actual_action_taken = Column(Text, nullable=True)
    actual_result = Column(Text, nullable=True)
    technician_correction = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    recommendation = relationship("AIRecommendation", back_populates="feedback")


class MemoryReference(Base):
    """
    Connects structured operational records in Supabase to persistent AI memory in Hindsight.
    Section 21: memory_references table:
    id, organization_id, incident_id, machine_id, hindsight_memory_id, memory_type, created_at, updated_at
    """
    __tablename__ = "memory_references"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=True, index=True)
    machine_id = Column(String(36), ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    hindsight_memory_id = Column(String(255), nullable=False, index=True)
    memory_type = Column(String(100), nullable=False, index=True)  # incident, repair_outcome, failed_attempt, successful_resolution, technician_observation, root_cause, pattern, lesson
    content_summary = Column(Text, nullable=True)
    meta_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    machine = relationship("Machine", back_populates="memory_references")
    incident = relationship("Incident", back_populates="memory_references")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(255), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
