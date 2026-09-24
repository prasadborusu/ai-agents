from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# Base config
class SchemaBase(BaseModel):
    class Config:
        from_attributes = True

# Machine Schemas
class MachineMetricSchema(SchemaBase):
    id: str
    metric_name: str
    metric_value: float
    unit: str
    status: str
    recorded_at: datetime

class MachineBase(SchemaBase):
    machine_code: str
    name: str
    type_name: str
    location_name: str
    status: str = "Good"
    risk_level: str = "Low"
    manufacturer: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    operating_hours: float = 0.0

class MachineCreate(MachineBase):
    organization_id: Optional[str] = None

class MachineResponse(MachineBase):
    id: str
    organization_id: str
    total_incidents: int = 0
    last_incident_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class MachineDetailResponse(MachineResponse):
    metrics: List[MachineMetricSchema] = []
    recent_incidents: List[Any] = []
    recurring_problems: List[Dict[str, Any]] = []
    memory_references_count: int = 0

# Incident Symptom & Diagnostic Attempts
class IncidentSymptomSchema(SchemaBase):
    id: Optional[str] = None
    symptom: str
    severity_rating: Optional[str] = None

class DiagnosticAttemptSchema(SchemaBase):
    id: Optional[str] = None
    attempt_order: int = 1
    technician_name: Optional[str] = None
    hypothesis: Optional[str] = None
    action_taken: str
    outcome: str  # FAILED, RESOLVED, PARTIAL
    notes: Optional[str] = None

class RepairPartSchema(SchemaBase):
    part_name: str
    quantity_used: int = 1
    outcome_impact: Optional[str] = None

class RepairSchema(SchemaBase):
    id: Optional[str] = None
    performed_by: Optional[str] = None
    action_summary: str
    outcome: str
    root_cause: Optional[str] = None
    duration_hours: float = 1.0
    completed_at: Optional[datetime] = None
    repair_parts: List[RepairPartSchema] = []

class TechnicianObservationSchema(SchemaBase):
    id: Optional[str] = None
    technician_name: str
    observation_text: str
    environment_factors: Optional[str] = None

# Incident Schemas
class IncidentCreate(SchemaBase):
    machine_id: str
    problem_category: str
    title: str
    description: str
    symptoms: List[str] = []
    severity: str = "Medium"
    technician_name: Optional[str] = "Prasad"
    measurements: Optional[Dict[str, Any]] = None
    environmental_conditions: Optional[str] = None
    initial_observations: Optional[str] = None

class IncidentResolveRequest(SchemaBase):
    action_taken: str
    outcome: str = "RESOLVED"  # RESOLVED or UNRESOLVED
    root_cause: str
    resolution_notes: str
    technician_observations: Optional[str] = None
    parts_replaced: List[RepairPartSchema] = []
    downtime_hours: float = 1.5
    lesson_learned: Optional[str] = None

class IncidentResponse(SchemaBase):
    id: str
    organization_id: str
    incident_number: str
    machine_id: str
    machine_code: Optional[str] = None
    machine_name: Optional[str] = None
    title: str
    problem_category: str
    severity: str
    status: str
    is_recurring: bool
    recurring_count: int
    description: str
    observed_behavior: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = None
    environmental_conditions: Optional[str] = None
    initial_observations: Optional[str] = None
    resolved_at: Optional[datetime] = None
    root_cause: Optional[str] = None
    resolution_summary: Optional[str] = None
    successful_action: Optional[str] = None
    lesson_learned: Optional[str] = None
    downtime_hours: float = 0.0
    created_at: datetime
    updated_at: datetime

class IncidentDetailResponse(IncidentResponse):
    symptoms_list: List[str] = []
    diagnostic_attempts: List[DiagnosticAttemptSchema] = []
    repairs: List[RepairSchema] = []
    observations: List[TechnicianObservationSchema] = []
    memory_references: List[Dict[str, Any]] = []

# AI Diagnosis Schemas
class HistoricalEvidenceItem(BaseModel):
    incident_id: str
    machine_code: str
    action_taken: str
    outcome: str
    evidence_note: str

class CauseLikelihood(BaseModel):
    cause: str
    likelihood_pct: int
    evidence: str

class DiagnosisRequest(BaseModel):
    machine_id: str
    problem_category: str
    symptoms: List[str]
    observed_behavior: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = None
    technician_notes: Optional[str] = None
    severity: str = "Medium"

class WhyRecommendationTrace(BaseModel):
    current_symptoms: List[str]
    similar_historical_incidents: List[Dict[str, Any]]
    relevant_hindsight_memories: List[Dict[str, Any]]
    previous_actions: List[Dict[str, Any]]
    previous_outcomes: List[Dict[str, Any]]
    ai_reasoning: str
    recommended_action: str

class MemoryImpactStatement(BaseModel):
    retrieved_memories_count: int
    similar_incidents_count: int
    successful_previous_action: str
    failed_previous_action: str
    impact_narrative: str

class DiagnosisResponse(BaseModel):
    id: str
    problem: str
    machine_code: str
    machine_name: str
    likely_causes: List[CauseLikelihood]
    recommended_first_check: str
    why_explanation: str
    historical_evidence: List[HistoricalEvidenceItem]
    previously_failed: List[str]
    recommended_action: str
    confidence_score: float
    memory_impact: MemoryImpactStatement
    why_trace: WhyRecommendationTrace
    hindsight_active: bool
    created_at: datetime

class RecommendationFeedbackRequest(BaseModel):
    recommendation_id: str
    rating: Optional[str] = None  # Helpful, Not Helpful
    worked_status: Optional[str] = None  # Yes, Partially, No
    actual_action_taken: Optional[str] = None
    actual_result: Optional[str] = None
    technician_correction: Optional[str] = None

# Memory Explorer Schemas
class MemoryItem(BaseModel):
    id: str
    hindsight_id: str
    memory_type: str
    machine_code: str
    source_incident_id: Optional[str] = None
    date: datetime
    content: str
    outcome: Optional[str] = None
    root_cause: Optional[str] = None
    lesson: Optional[str] = None
    confidence: float = 0.95
    tags: List[str] = []

class MemoryTreeNode(BaseModel):
    machine_code: str
    machine_name: str
    problem: str
    symptoms: List[str]
    attempts: List[Dict[str, str]]
    failed_actions: List[str]
    successful_action: str
    root_cause: str
    learned: str
    incident_number: str
    date: str

# Insights Schemas
class RecurringProblemInsight(BaseModel):
    problem: str
    count: int
    common_machines: List[str]
    common_successful_action: str
    failed_actions_to_avoid: List[str]
    percentage_resolved: int

class MachineTypeInsight(BaseModel):
    type_name: str
    total_incidents: int
    primary_issue: str
    primary_solution: str
    resolution_rate_pct: int

class InsightsSummaryResponse(BaseModel):
    total_machines: int
    open_issues: int
    resolved_incidents: int
    recurring_problems_count: int
    recurring_problems: List[RecurringProblemInsight]
    machine_type_insights: List[MachineTypeInsight]
    top_recurring_barchart: List[Dict[str, Any]]
    incident_monthly_trends: List[Dict[str, Any]]
    ai_memory_insights: List[Dict[str, Any]]
    recent_incidents: List[Dict[str, Any]]

# System Health
class ComponentHealth(BaseModel):
    name: str
    status: str  # CONNECTED, DEGRADED, DISCONNECTED
    details: str
    latency_ms: Optional[float] = None

class SystemHealthResponse(BaseModel):
    status: str
    timestamp: datetime
    components: Dict[str, ComponentHealth]
