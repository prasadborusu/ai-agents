import React, { useState } from 'react';
import { X, AlertTriangle, Send, Zap } from 'lucide-react';
import type { Machine } from '../types';
import { api } from '../services/api';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
  onIncidentCreated: () => void;
  onRunDiagnosisWithIncident?: (machineId: string) => void;
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  machines,
  onIncidentCreated,
  onRunDiagnosisWithIncident,
}) => {
  const [machineId, setMachineId] = useState(machines[0]?.id || '');
  const [title, setTitle] = useState('');
  const [problemCategory, setProblemCategory] = useState('Vibration');
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [observedBehavior, setObservedBehavior] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [autoDiagnose, setAutoDiagnose] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please fill in title and incident description.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const symptomsList = symptoms
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const targetMachine = machines.find((m) => m.id === machineId);
      const measurements: Record<string, any> = {};
      targetMachine?.metrics?.forEach((m) => {
        measurements[m.metric_name] = m.metric_value;
      });

      await api.createIncident({
        machine_id: machineId,
        title,
        problem_category: problemCategory,
        severity,
        description,
        symptoms: symptomsList,
        observed_behavior: observedBehavior,
        measurements,
        technician_notes: technicianNotes,
      });

      onIncidentCreated();
      onClose();

      if (autoDiagnose && onRunDiagnosisWithIncident) {
        onRunDiagnosisWithIncident(machineId);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl p-6 border border-[#e4dcce] bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#f1ebdF]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f6e4de] text-[#d36d4e] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#182026]">Log New Equipment Incident</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8a96a3] hover:text-[#182026] hover:bg-[#faf7f2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-[#faeae4] border border-[#d36d4e]/40 text-[#d36d4e] text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-[#4e5b67] font-medium mb-1">Target Asset</label>
            <select
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#d36d4e]"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.machine_code} - {m.name} ({m.type_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#4e5b67] font-medium mb-1">Incident Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spindle bearing overheating during roughing cycle"
              className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#d36d4e]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#4e5b67] font-medium mb-1">Problem Category</label>
              <select
                value={problemCategory}
                onChange={(e) => setProblemCategory(e.target.value)}
                className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#d36d4e]"
              >
                <option value="Vibration">Vibration</option>
                <option value="Overheating">Overheating</option>
                <option value="Cavitation">Cavitation</option>
                <option value="Pressure drop">Pressure drop</option>
                <option value="Motor Current Overload">Motor Current Overload</option>
                <option value="Hydraulic Fluid Leak">Hydraulic Fluid Leak</option>
              </select>
            </div>

            <div>
              <label className="block text-[#4e5b67] font-medium mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#d36d4e]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#4e5b67] font-medium mb-1">Incident Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What occurred, when did it start, operating conditions..."
              className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#d36d4e] resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-[#4e5b67] font-medium mb-1">
              Symptoms (comma separated)
            </label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. High harmonic hum, temperature spike to 82C, belt shudder"
              className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#d36d4e]"
            />
          </div>

          <div>
            <label className="block text-[#4e5b67] font-medium mb-1">Observed Behavior</label>
            <input
              type="text"
              value={observedBehavior}
              onChange={(e) => setObservedBehavior(e.target.value)}
              placeholder="e.g. Grinding noise at 3500 RPM, coolant return cloudy"
              className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#d36d4e]"
            />
          </div>

          <div>
            <label className="block text-[#4e5b67] font-medium mb-1">Field Technician Notes</label>
            <input
              type="text"
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
              placeholder="Initial physical checks or actions taken..."
              className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#d36d4e]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="autoDiagnose"
              checked={autoDiagnose}
              onChange={(e) => setAutoDiagnose(e.target.checked)}
              className="rounded bg-[#faf7f2] border-[#e4dbcd] text-[#d36d4e] focus:ring-0"
            />
            <label htmlFor="autoDiagnose" className="text-xs text-[#4e5b67] cursor-pointer flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-[#d36d4e]" />
              <span>Immediately trigger Grounded AI Diagnosis in Studio</span>
            </label>
          </div>

          <div className="pt-3 border-t border-[#f1ebdF] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#faf7f2] hover:bg-[#ede5d8] text-[#717b85]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#d36d4e] hover:bg-[#c25838] text-white font-semibold flex items-center gap-1.5 active:scale-95 disabled:opacity-50 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Logging Incident...' : 'Log Incident'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
