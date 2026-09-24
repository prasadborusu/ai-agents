-- BYTE4 AI — REMEMBR: Supabase Seed Data
-- 24 Machines across 5 Industrial Categories, 149 Incidents, Hindsight Memory References

INSERT INTO organizations (id, name, slug, plan, hindsight_bank_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'Apex Precision Industries', 'apex-precision', 'enterprise', 'org_byte4_default')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, organization_id, email, full_name, role)
VALUES 
('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'prasad@apexprecision.com', 'Prasad', 'Maintenance Manager'),
('11111111-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'marcus.v@apexprecision.com', 'Marcus Vance', 'Senior Diagnostic Technician')
ON CONFLICT (id) DO NOTHING;

-- Seed key machines matching the reference dashboard
INSERT INTO machines (id, organization_id, machine_code, name, type_name, location_name, status, risk_level, total_incidents, operating_hours)
VALUES
('22222222-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'CNC-101', 'Okuma 5-Axis Machining Center', 'CNC Machine', 'Production Line A', 'Good', 'Low', 4, 4200.0),
('22222222-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 'CNC-104', 'DMG MORI High-Precision Lathe', 'CNC Machine', 'Production Line A', 'Alert', 'High', 8, 6400.0),
('22222222-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'PMP-201', 'Goulds Multi-Stage Coolant Pump', 'Industrial Pump', 'Production Line A', 'Warning', 'Medium', 5, 9400.0),
('22222222-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000001', 'CONV-03', 'FlexLink Overhead Monorail Conveyor', 'Conveyor', 'Assembly Cell 3', 'Good', 'Low', 3, 6100.0),
('22222222-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Press-12', 'Schuler 500-Ton Hydraulic Stamping Press', 'Hydraulic Press', 'Heavy Stamping Bay', 'Good', 'Low', 7, 8200.0)
ON CONFLICT (id) DO NOTHING;

-- Seed key historical incidents matching CNC-104 vibration learning
INSERT INTO incidents (id, organization_id, incident_number, machine_id, title, problem_category, severity, status, is_recurring, recurring_count, description, root_cause, successful_action, lesson_learned, downtime_hours)
VALUES
('33333333-0000-0000-0000-000000001021', '00000000-0000-0000-0000-000000000001', 'INC-1021', '22222222-0000-0000-0000-000000000104', 'High vibration on CNC-104', 'High vibration', 'High', 'Resolved', TRUE, 3, 'Spindle vibration at 2400 RPM.', 'Shaft misalignment', 'Shaft alignment', 'Check shaft alignment before replacing bearings on CNC-104.', 3.2),
('33333333-0000-0000-0000-000000001048', '00000000-0000-0000-0000-000000000001', 'INC-1048', '22222222-0000-0000-0000-000000000104', 'High vibration on CNC-104', 'High vibration', 'High', 'Open', TRUE, 4, 'Recurring spindle vibration detected during shift change.', NULL, NULL, NULL, 0.0)
ON CONFLICT (id) DO NOTHING;

-- Seed memory references connecting incident to Hindsight
INSERT INTO memory_references (id, organization_id, incident_id, machine_id, hindsight_memory_id, memory_type, content_summary)
VALUES
('44444444-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000001021', '22222222-0000-0000-0000-000000000104', 'mem_hs_inc1021_cnc104', 'successful_resolution', 'CNC-104 High vibration: Bearing replacement FAILED, Shaft alignment RESOLVED. Check alignment first.')
ON CONFLICT (id) DO NOTHING;
