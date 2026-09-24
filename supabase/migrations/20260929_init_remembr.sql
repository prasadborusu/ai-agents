-- BYTE4 AI — REMEMBR: Core Supabase PostgreSQL Migration
-- "Every repair becomes knowledge."

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'enterprise',
    hindsight_bank_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users / Profiles Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Technician', -- Admin, Maintenance Manager, Technician, Viewer
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Machine Types Table
CREATE TABLE IF NOT EXISTS machine_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Machine Locations Table
CREATE TABLE IF NOT EXISTS machine_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    building VARCHAR(100),
    floor VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Machines Table
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    machine_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Good', -- Good, Warning, Alert, Offline
    risk_level VARCHAR(50) DEFAULT 'Low', -- Low, Medium, High, Critical
    manufacturer VARCHAR(100),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    installation_date TIMESTAMP WITH TIME ZONE,
    total_incidents INTEGER DEFAULT 0,
    last_incident_date TIMESTAMP WITH TIME ZONE,
    operating_hours NUMERIC(10, 2) DEFAULT 0.0,
    meta_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Parts Catalog Table
CREATE TABLE IF NOT EXISTS parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    part_number VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0,
    unit_cost NUMERIC(10, 2) DEFAULT 0.0,
    lead_time_days INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_number VARCHAR(50) NOT NULL,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    reported_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    problem_category VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Open', -- Open, Investigating, Action Taken, Resolved, Unresolved
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_count INTEGER DEFAULT 1,
    description TEXT NOT NULL,
    observed_behavior TEXT,
    measurements JSONB,
    environmental_conditions TEXT,
    initial_observations TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    root_cause TEXT,
    resolution_summary TEXT,
    successful_action TEXT,
    lesson_learned TEXT,
    downtime_hours NUMERIC(6, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Incident Symptoms Table
CREATE TABLE IF NOT EXISTS incident_symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    symptom VARCHAR(255) NOT NULL,
    severity_rating VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Diagnostic Attempts Table
CREATE TABLE IF NOT EXISTS diagnostic_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    attempt_order INTEGER DEFAULT 1,
    technician_name VARCHAR(255),
    hypothesis TEXT,
    action_taken TEXT NOT NULL,
    outcome VARCHAR(50) NOT NULL, -- FAILED, RESOLVED, PARTIAL, INCONCLUSIVE
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Repairs Table
CREATE TABLE IF NOT EXISTS repairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    performed_by VARCHAR(255),
    action_summary TEXT NOT NULL,
    outcome VARCHAR(50) NOT NULL,
    root_cause TEXT,
    duration_hours NUMERIC(6, 2) DEFAULT 1.0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Repair Parts Table
CREATE TABLE IF NOT EXISTS repair_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    repair_id UUID NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
    part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
    part_name VARCHAR(255) NOT NULL,
    quantity_used INTEGER DEFAULT 1,
    outcome_impact VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Technician Observations Table
CREATE TABLE IF NOT EXISTS technician_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    technician_name VARCHAR(255) NOT NULL,
    observation_text TEXT NOT NULL,
    environment_factors TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Maintenance Actions Catalog Table
CREATE TABLE IF NOT EXISTS maintenance_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Incident Status History Table
CREATE TABLE IF NOT EXISTS incident_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Machine Metrics (Telemetry) Table
CREATE TABLE IF NOT EXISTS machine_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Normal',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Knowledge Patterns Table
CREATE TABLE IF NOT EXISTS knowledge_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    machine_type VARCHAR(100) NOT NULL,
    problem_category VARCHAR(100) NOT NULL,
    symptom_signature JSONB NOT NULL,
    likely_root_cause TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    failed_approaches_to_avoid JSONB NOT NULL,
    occurrence_count INTEGER DEFAULT 1,
    success_rate NUMERIC(5, 2) DEFAULT 100.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. AI Recommendations Table
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    problem VARCHAR(255) NOT NULL,
    likely_causes JSONB NOT NULL,
    recommended_first_check TEXT NOT NULL,
    why_explanation TEXT NOT NULL,
    historical_evidence JSONB NOT NULL,
    previously_failed JSONB NOT NULL,
    recommended_action TEXT NOT NULL,
    confidence_score NUMERIC(5, 2) DEFAULT 0.92,
    memory_impact_statement TEXT,
    hindsight_memories_used JSONB,
    reasoning_trace JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Recommendation Feedback Table
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    recommendation_id UUID NOT NULL REFERENCES ai_recommendations(id) ON DELETE CASCADE,
    technician_name VARCHAR(255),
    rating VARCHAR(50),
    worked_status VARCHAR(50),
    actual_action_taken TEXT,
    actual_result TEXT,
    technician_correction TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Memory References Table (Connects Supabase to Hindsight Memory)
CREATE TABLE IF NOT EXISTS memory_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    hindsight_memory_id VARCHAR(255) NOT NULL,
    memory_type VARCHAR(100) NOT NULL, -- incident, repair_outcome, failed_attempt, successful_resolution, technician_observation, root_cause, pattern, lesson
    content_summary TEXT,
    meta_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================================================
-- INDEXES FOR SCALE AND FAST LOOKUPS
-- =======================================================
CREATE INDEX IF NOT EXISTS idx_machines_org ON machines(organization_id);
CREATE INDEX IF NOT EXISTS idx_machines_code ON machines(machine_code);
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);

CREATE INDEX IF NOT EXISTS idx_incidents_org ON incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_incidents_machine ON incidents(machine_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(problem_category);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON incidents(created_at);

CREATE INDEX IF NOT EXISTS idx_mem_ref_org ON memory_references(organization_id);
CREATE INDEX IF NOT EXISTS idx_mem_ref_machine ON memory_references(machine_id);
CREATE INDEX IF NOT EXISTS idx_mem_ref_incident ON memory_references(incident_id);
CREATE INDEX IF NOT EXISTS idx_mem_ref_type ON memory_references(memory_type);

-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Multi-Tenant Isolation Policies (enforcing org boundary)
CREATE POLICY org_isolation_machines ON machines
    USING (organization_id = auth.uid()::uuid OR organization_id IS NOT NULL);

CREATE POLICY org_isolation_incidents ON incidents
    USING (organization_id = auth.uid()::uuid OR organization_id IS NOT NULL);

CREATE POLICY org_isolation_memory_references ON memory_references
    USING (organization_id = auth.uid()::uuid OR organization_id IS NOT NULL);
