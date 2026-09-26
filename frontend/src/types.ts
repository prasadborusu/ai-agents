export interface MachineMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  unit: string;
  status: 'Normal' | 'Warning' | 'Critical';
  recorded_at: string;
}

export interface Machine {
  id: string;
  organization_id: string;
  machine_code: string;
  name: string;
  type_name: string;
  location_name: string;
  status: 'Good' | 'Warning' | 'Alert' | 'Offline';
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  manufacturer?: string;
  model_number?: string;
  serial_number?: string;
  installation_date?: string;
  total_incidents: number;
  last_incident_date?: string;
  operating_hours: number;
  metrics?: MachineMetric[];
  recent_incidents?: IncidentSummary[];
  created_at?: string;
}

export interface IncidentSummary {
  id: string;
  incident_number: string;
  title: string;
  problem_category: string;
  status: string;
  severity: string;
  created_at: string;
  root_cause?: string;
  successful_action?: string;
  lesson_learned?: string;
}

export interface DiagnosticAttempt {
  id: string;
  attempt_order: number;
  technician_name?: string;
  hypothesis?: string;
  action_taken: string;
  outcome: 'FAILED' | 'RESOLVED' | 'PARTIAL' | 'INCONCLUSIVE';
  notes?: string;
  created_at: string;
}

export interface RepairPart {
  id: string;
  part_name: string;
  quantity_used: number;
  outcome_impact?: string;
}

export interface Repair {
  id: string;
  performed_by?: string;
  action_summary: string;
  outcome: string;
  root_cause?: string;
  duration_hours: number;
  completed_at: string;
  repair_parts?: RepairPart[];
}

export interface TechnicianObservation {
  id: string;
  technician_name: string;
  observation_text: string;
  environment_factors?: string;
  created_at: string;
}

export interface Incident {
  id: string;
  organization_id: string;
  incident_number: string;
  machine_id: string;
  machine_code: string;
  machine_name: string;
  title: string;
  problem_category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Investigating' | 'Action Taken' | 'Resolved' | 'Unresolved';
  is_recurring: boolean;
  recurring_count: number;
  description: string;
  observed_behavior?: string;
  measurements?: Record<string, any>;
  environmental_conditions?: string;
  initial_observations?: string;
  resolved_at?: string;
  root_cause?: string;
  resolution_summary?: string;
  successful_action?: string;
  lesson_learned?: string;
  downtime_hours: number;
  created_at: string;
  updated_at?: string;
  diagnostic_attempts?: DiagnosticAttempt[];
  repairs?: Repair[];
  technician_observations?: TechnicianObservation[];
}

export interface HistoricalEvidenceItem {
  incident_id: string;
  machine_code: string;
  evidence: string;
  verified: boolean;
}

export interface LikelyCauseItem {
  cause: string;
  likelihood: string;
  explanation: string;
}

export interface FailedApproachItem {
  action: string;
  incident: string;
  why_avoid: string;
}

export interface DiagnosisResult {
  id: string;
  machine_code: string;
  problem_category: string;
  recommended_first_check: string;
  likely_causes: LikelyCauseItem[];
  why_explanation: string;
  historical_evidence: HistoricalEvidenceItem[];
  previously_failed: FailedApproachItem[];
  recommended_action: string;
  confidence_score: number;
  memory_impact: {
    impact_narrative: string;
    historical_connection: string;
    prevention_rule: string;
  };
  why_trace?: Array<{ step: string; evidence: string }>;
  hindsight_active?: boolean;
  created_at: string;
}

export interface MemoryNode {
  type: string;
  id: string;
  code?: string;
  name?: string;
  count?: number;
  children?: MemoryNode[];
  data?: any;
}

export interface InsightsSummary {
  total_machines: number;
  open_issues: number;
  resolved_incidents: number;
  recurring_problems_count: number;
  recurring_problems: Array<{
    machine_code: string;
    machine_name: string;
    problem_category: string;
    incident_number: string;
    recurring_count: number;
    severity: string;
    lesson_learned?: string;
  }>;
  machine_type_insights: Record<string, {
    total_machines: number;
    total_incidents: number;
    avg_downtime_hours: number;
  }>;
  top_recurring_barchart: Array<{
    category: string;
    count: number;
  }>;
  incident_monthly_trends: Array<{
    month: string;
    count: number;
  }>;
  ai_memory_insights: {
    total_memories: number;
    cross_machine_patterns_count: number;
    persistent_bank_active: boolean;
    sample_patterns: Array<{
      category: string;
      root_cause: string;
      action: string;
      success_rate: number;
    }>;
  };
  recent_incidents: IncidentSummary[];
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: string;
  components: {
    supabase: {
      name: string;
      status: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
      details: string;
      latency_ms?: number;
    };
    hindsight: {
      name: string;
      status: 'CONNECTED' | 'DISCONNECTED' | 'DEGRADED';
      details: string;
      latency_ms?: number;
    };
    ai_provider: {
      name: string;
      status: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
      details: string;
      latency_ms?: number;
    };
  };
}

export interface SettingsData {
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    hindsight_bank: string;
    created_date: string;
  };
  ai: {
    provider: string;
    model: string;
    temperature: number;
    memory_grounding_enforced: boolean;
    min_confidence_threshold: number;
  };
  memory: {
    hindsight_base_url: string;
    memory_retention_days: string;
    cross_asset_synthesis: boolean;
    include_failed_troubleshooting: boolean;
    auto_commit_on_resolve: boolean;
  };
  users: Array<{
    name: string;
    email: string;
    role: string;
    status: string;
  }>;
}
