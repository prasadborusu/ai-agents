import React from 'react';
import {
  X,
  CheckCircle2,
  Wrench,
  Brain,
  Zap
} from 'lucide-react';
import type { Incident } from '../types';

interface IncidentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  onOpenResolve: (incident: Incident) => void;
  onDiagnose: (machineId: string, incident: Incident) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  isOpen,
  onClose,
  incident,
  onOpenResolve,
  onDiagnose,
}) => {
  if (!isOpen || !incident) return null;

  const isResolved = incident.status === 'Resolved';
  const isCritical = incident.severity === 'Critical';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl p-6 border border-[#e4dcce] bg-white shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#f1ebdF]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-[#d36d4e] bg-[#f6e4de] px-2.5 py-0.5 rounded-full">
                {incident.incident_number}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#faf7f2] border border-[#e4dcce] text-[#182026] font-medium">
                {incident.machine_code}
              </span>
              {incident.is_recurring && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fbf1e2] text-[#df9e52] font-semibold">
                  {incident.recurring_count}x Recurring Pattern
                </span>
              )}
            </div>
            <h2 className="font-serif text-xl font-bold text-[#182026]">{incident.title}</h2>
            <p className="text-xs text-[#717b85] mt-0.5">
              {incident.machine_name} &bull; {new Date(incident.created_at).toLocaleString()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8a96a3] hover:text-[#182026] hover:bg-[#faf7f2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status / Severity / Category Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-[#faf7f2] border border-[#e4dcce] text-[#4e5b67]">
            Category: <strong className="text-[#182026]">{incident.problem_category}</strong>
          </span>
          <span
            className={`px-3 py-1 rounded-xl font-semibold uppercase text-[10px] ${
              isCritical
                ? 'bg-[#f6e4de] text-[#d36d4e]'
                : 'bg-[#fbf1e2] text-[#df9e52]'
            }`}
          >
            Severity: {incident.severity}
          </span>
          <span
            className={`px-3 py-1 rounded-xl font-medium flex items-center gap-1.5 text-xs ${
              isResolved
                ? 'bg-[#e3ece6] text-[#3e6b5c]'
                : 'bg-[#f6e4de] text-[#d36d4e]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-[#3e6b5c]' : 'bg-[#d36d4e]'}`} />
            <span>Status: {incident.status}</span>
          </span>
        </div>

        {/* Description & Observed Behavior */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#ece4d6] space-y-1">
            <span className="text-[10px] font-bold text-[#717b85] uppercase tracking-wider block">
              Incident Description
            </span>
            <p className="text-xs text-[#182026] leading-relaxed">{incident.description}</p>
          </div>

          {incident.observed_behavior && (
            <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#ece4d6] space-y-1">
              <span className="text-[10px] font-bold text-[#717b85] uppercase tracking-wider block">
                Observed Physical Behavior
              </span>
              <p className="text-xs text-[#4e5b67] leading-relaxed">{incident.observed_behavior}</p>
            </div>
          )}
        </div>

        {/* Telemetry Snapshot if available */}
        {incident.measurements && Object.keys(incident.measurements).length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#ece4d6] space-y-2">
            <span className="text-[10px] font-bold text-[#717b85] uppercase tracking-wider block">
              Sensor Telemetry Snapshot at Failure
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(incident.measurements).map(([key, val]) => (
                <div key={key} className="p-2 rounded-lg bg-white border border-[#e4dcce] text-xs">
                  <span className="text-[#717b85] capitalize block text-[10px]">{key.replace('_', ' ')}</span>
                  <span className="font-mono font-bold text-[#d36d4e] mt-0.5 block">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnostic Attempts Timeline */}
        {incident.diagnostic_attempts && incident.diagnostic_attempts.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#182026] uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-[#d36d4e]" />
              <span>Field Diagnostic Attempts Timeline</span>
            </span>
            <div className="space-y-2">
              {incident.diagnostic_attempts.map((att) => {
                const isFail = att.outcome === 'FAILED';
                const isPass = att.outcome === 'RESOLVED';
                return (
                  <div
                    key={att.id}
                    className={`p-3 rounded-xl border text-xs ${
                      isFail
                        ? 'bg-[#faeae4] border-[#d36d4e]/30'
                        : isPass
                        ? 'bg-[#e3ece6] border-[#3e6b5c]/30'
                        : 'bg-[#faf7f2] border-[#e4dcce]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[11px] text-[#182026]">
                          Attempt #{att.attempt_order}
                        </span>
                        {att.technician_name && (
                          <span className="text-[#717b85] text-[11px]">by {att.technician_name}</span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFail
                            ? 'bg-white text-[#d36d4e]'
                            : isPass
                            ? 'bg-white text-[#3e6b5c]'
                            : 'bg-white text-[#647482]'
                        }`}
                      >
                        {att.outcome}
                      </span>
                    </div>

                    {att.hypothesis && (
                      <p className="text-[11px] text-[#717b85] mb-1">
                        <strong className="text-[#182026]">Hypothesis:</strong> {att.hypothesis}
                      </p>
                    )}
                    <p className="text-[#182026]">
                      <strong className="text-[#717b85]">Action:</strong> {att.action_taken}
                    </p>
                    {att.notes && (
                      <p className="text-[11px] text-[#717b85] mt-1 italic">{att.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resolution & Learned Memory (if resolved) */}
        {isResolved && (
          <div className="p-4 rounded-xl bg-[#e3ece6]/70 border border-[#3e6b5c]/30 space-y-3">
            <div className="flex items-center gap-2 text-[#3e6b5c] font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Resolved Repair & Memory Ingestion</span>
            </div>

            {incident.root_cause && (
              <div>
                <span className="text-[11px] text-[#717b85] font-semibold block">Confirmed Root Cause:</span>
                <p className="text-xs text-[#182026] font-medium">{incident.root_cause}</p>
              </div>
            )}

            {incident.successful_action && (
              <div>
                <span className="text-[11px] text-[#717b85] font-semibold block">Permanent Solution:</span>
                <p className="text-xs text-[#3e6b5c] font-bold">{incident.successful_action}</p>
              </div>
            )}

            {incident.lesson_learned && (
              <div className="p-2.5 rounded-lg bg-white border border-[#3e6b5c]/20">
                <span className="text-[11px] text-[#3e6b5c] font-bold flex items-center gap-1.5 mb-1">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Hindsight Learned Lesson:</span>
                </span>
                <p className="text-xs text-[#4e5b67]">{incident.lesson_learned}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#f1ebdF] flex items-center justify-between">
          <span className="text-xs text-[#8a96a3]">ID: {incident.id.slice(0, 8)}...</span>
          <div className="flex items-center gap-2">
            {!isResolved && (
              <button
                onClick={() => {
                  onClose();
                  onOpenResolve(incident);
                }}
                className="px-4 py-2 rounded-xl bg-[#3e6b5c] hover:bg-[#2f5549] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolve Work Order</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onDiagnose(incident.machine_id, incident);
              }}
              className="px-4 py-2 rounded-xl bg-[#d36d4e] hover:bg-[#c25838] text-white font-semibold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Run AI Diagnosis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
