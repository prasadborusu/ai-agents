import React, { useState } from 'react';
import { X, CheckCircle2, Brain } from 'lucide-react';
import type { Incident } from '../types';
import { api } from '../services/api';

interface ResolveIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  onIncidentResolved: () => void;
}

export const ResolveIncidentModal: React.FC<ResolveIncidentModalProps> = ({
  isOpen,
  onClose,
  incident,
  onIncidentResolved,
}) => {
  const [rootCause, setRootCause] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [successfulAction, setSuccessfulAction] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');
  const [downtimeHours, setDowntimeHours] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootCause.trim() || !resolutionSummary.trim() || !successfulAction.trim()) {
      setErrorMsg('Please specify root cause, resolution summary, and the successful action taken.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await api.resolveIncident(incident.id, {
        root_cause: rootCause,
        resolution_summary: resolutionSummary,
        successful_action: successfulAction,
        lesson_learned: lessonLearned || undefined,
        downtime_hours: downtimeHours,
      });

      onIncidentResolved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resolve incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl p-6 border border-[#e4dcce] bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#f1ebdF]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#e3ece6] text-[#3e6b5c] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#182026]">Resolve Incident & Commit Memory</h3>
              <p className="text-[11px] text-[#717b85]">
                {incident.incident_number} &bull; {incident.machine_code} ({incident.problem_category})
              </p>
            </div>
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
            <label className="block text-[#4e5b67] font-medium mb-1">
              Confirmed Root Cause
            </label>
            <textarea
              rows={2}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="e.g. Bearing race micro-spalling due to thermal grease breakdown under high RPM"
              className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#d36d4e] resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-[#4e5b67] font-medium mb-1">
              Resolution Summary
            </label>
            <textarea
              rows={2}
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              placeholder="Overview of physical work carried out on the machine..."
              className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#d36d4e] resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-[#4e5b67] font-medium mb-1">
              Exact Successful Action (Permanent Fix)
            </label>
            <input
              type="text"
              value={successfulAction}
              onChange={(e) => setSuccessfulAction(e.target.value)}
              placeholder="e.g. Replaced with SKF-6208-2Z sealed bearings and flushed oil lines"
              className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#d36d4e]"
              required
            />
          </div>

          <div className="p-3.5 rounded-xl bg-[#fbf1e2] border border-[#df9e52]/40 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#df9e52] font-bold text-xs">
              <Brain className="w-3.5 h-3.5" />
              <span>Lesson Learned (Permanent Hindsight Memory Bank Commit)</span>
            </div>
            <p className="text-[11px] text-[#717b85]">
              This rule will be cited in future AI diagnostic sessions across all matching equipment:
            </p>
            <textarea
              rows={2}
              value={lessonLearned}
              onChange={(e) => setLessonLearned(e.target.value)}
              placeholder="e.g. Always check bearing runout before re-tensioning drive belts to avoid false alignment diagnoses."
              className="w-full bg-white border border-[#df9e52]/30 rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#df9e52] resize-none"
            />
          </div>

          <div>
            <label className="block text-[#4e5b67] font-medium mb-1">
              Total Machine Downtime (Hours)
            </label>
            <input
              type="number"
              step="0.1"
              value={downtimeHours}
              onChange={(e) => setDowntimeHours(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#faf7f2] border border-[#e4dbcd] rounded-xl px-3 py-2 text-[#182026] focus:outline-none focus:border-[#d36d4e]"
            />
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
              className="px-5 py-2 rounded-xl bg-[#3e6b5c] hover:bg-[#2f5549] text-white font-semibold flex items-center gap-1.5 active:scale-95 disabled:opacity-50 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Committing to Memory...' : 'Mark Resolved & Index Memory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
