import type {
  Machine,
  Incident,
  DiagnosisResult,
  MemoryNode,
  InsightsSummary,
  SystemHealth,
  SettingsData
} from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async getInsights(): Promise<InsightsSummary> {
    const res = await fetch(`${API_BASE}/insights`);
    if (!res.ok) throw new Error('Failed to fetch insights');
    return res.json();
  },

  async getMachines(status?: string, typeName?: string, search?: string): Promise<Machine[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (typeName && typeName !== 'all') params.append('type_name', typeName);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/machines?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch machines');
    return res.json();
  },

  async getMachine(machineId: string): Promise<Machine> {
    const res = await fetch(`${API_BASE}/machines/${machineId}`);
    if (!res.ok) throw new Error(`Failed to fetch machine ${machineId}`);
    return res.json();
  },

  async getIncidents(
    status?: string,
    machineId?: string,
    problemCategory?: string,
    search?: string,
    limit = 50,
    offset = 0
  ): Promise<Incident[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (machineId && machineId !== 'all') params.append('machine_id', machineId);
    if (problemCategory && problemCategory !== 'all') params.append('problem_category', problemCategory);
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async getIncident(incidentId: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}`);
    if (!res.ok) throw new Error(`Failed to fetch incident ${incidentId}`);
    return res.json();
  },

  async createIncident(payload: {
    machine_id: string;
    title: string;
    problem_category: string;
    severity?: string;
    description: string;
    symptoms: string[];
    observed_behavior?: string;
    measurements?: Record<string, any>;
    technician_notes?: string;
  }): Promise<{ incident_id: string; incident_number: string; recommendation?: DiagnosisResult }> {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create incident');
    }
    return res.json();
  },

  async runDiagnosis(payload: {
    machine_id: string;
    problem_category: string;
    symptoms: string[];
    observed_behavior?: string;
    measurements?: Record<string, any>;
    technician_notes?: string;
    severity?: string;
  }): Promise<DiagnosisResult> {
    const res = await fetch(`${API_BASE}/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Diagnostic reasoning engine failed');
    }
    return res.json();
  },

  async submitDiagnosisFeedback(payload: {
    recommendation_id: string;
    rating?: string;
    worked_status?: string;
    actual_action_taken?: string;
    actual_result?: string;
    technician_correction?: string;
  }): Promise<{ status: string; feedback_id: string; message: string }> {
    const res = await fetch(`${API_BASE}/diagnose/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return res.json();
  },

  async resolveIncident(
    incidentId: string,
    payload: {
      root_cause: string;
      resolution_summary: string;
      successful_action: string;
      lesson_learned?: string;
      downtime_hours?: number;
      actual_parts_used?: string[];
    }
  ): Promise<{ status: string; incident_id: string; message: string; memory_committed: boolean }> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to resolve incident');
    return res.json();
  },

  async getMemoryTree(machineCode?: string): Promise<MemoryNode> {
    const params = new URLSearchParams();
    if (machineCode) params.append('machine_code', machineCode);
    const res = await fetch(`${API_BASE}/memory/tree?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch memory tree');
    return res.json();
  },

  async searchMemories(query: string, machineCode?: string): Promise<{ query: string; total_found: number; results: any[] }> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (machineCode) params.append('machine_code', machineCode);
    const res = await fetch(`${API_BASE}/memory/search?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to search memory');
    return res.json();
  },

  async getSettings(): Promise<SettingsData> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },
};
