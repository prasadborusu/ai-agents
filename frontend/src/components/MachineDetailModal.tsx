import React from 'react';
import {
  X,
  Activity,
  Zap,
  MapPin
} from 'lucide-react';
import { MachineIllustration } from './Artwork';
import type { Machine } from '../types';

interface MachineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine | null;
  onDiagnose: (machineId: string) => void;
  onSelectIncidentById?: (incidentId: string) => void;
}

export const MachineDetailModal: React.FC<MachineDetailModalProps> = ({
  isOpen,
  onClose,
  machine,
  onDiagnose,
  onSelectIncidentById,
}) => {
  if (!isOpen || !machine) return null;

  const isAlert = machine.status === 'Alert';
  const isWarning = machine.status === 'Warning';

  const illustType = machine.type_name.toLowerCase().includes('pump')
    ? 'pump'
    : machine.type_name.toLowerCase().includes('press')
    ? 'press'
    : machine.type_name.toLowerCase().includes('conveyor')
    ? 'conveyor'
    : 'cnc';

  const illustColor = isAlert ? 'terracotta' : isWarning ? 'ochre' : 'sage';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl p-6 border border-[#e4dcce] bg-white shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#f1ebdF]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-base text-[#182026]">
                {machine.machine_code}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#faf7f2] border border-[#e4dcce] text-[#717b85] font-medium">
                {machine.type_name}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                  isAlert
                    ? 'bg-[#f6e4de] text-[#d36d4e]'
                    : isWarning
                    ? 'bg-[#fbf1e2] text-[#df9e52]'
                    : 'bg-[#e3ece6] text-[#3e6b5c]'
                }`}
              >
                {machine.status}
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#182026]">{machine.name}</h2>
            <div className="flex items-center gap-3 text-xs text-[#717b85] mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8a96a3]" />
                {machine.location_name}
              </span>
              <span>&bull;</span>
              <span>Manufacturer: {machine.manufacturer || 'OEM Standard'}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8a96a3] hover:text-[#182026] hover:bg-[#faf7f2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Machine Illustration Banner */}
        <div className="bg-[#faf7f2] rounded-2xl p-2 border border-[#ece4d6]">
          <MachineIllustration type={illustType} color={illustColor} className="w-full h-32" />
        </div>

        {/* Operating Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece4d6]">
            <span className="text-[10px] text-[#717b85] uppercase font-semibold block">Operating Hours</span>
            <span className="font-bold text-base text-[#182026] mt-1 block">
              {Math.round(machine.operating_hours)} hrs
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece4d6]">
            <span className="text-[10px] text-[#717b85] uppercase font-semibold block">Lifetime Incidents</span>
            <span className="font-bold text-base text-[#182026] mt-1 block">
              {machine.total_incidents} logged
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece4d6]">
            <span className="text-[10px] text-[#717b85] uppercase font-semibold block">Risk Assessment</span>
            <span
              className={`font-bold text-sm mt-1 block uppercase ${
                machine.risk_level === 'Critical'
                  ? 'text-[#d36d4e]'
                  : machine.risk_level === 'High'
                  ? 'text-[#df9e52]'
                  : 'text-[#3e6b5c]'
              }`}
            >
              {machine.risk_level}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece4d6]">
            <span className="text-[10px] text-[#717b85] uppercase font-semibold block">Model / Serial</span>
            <span className="text-xs text-[#182026] mt-1 block truncate font-medium">
              {machine.model_number || 'N/A'}
            </span>
          </div>
        </div>

        {/* Live Telemetry Sensors */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#182026] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#d36d4e]" />
            <span>Real-Time Sensor Telemetry Matrix</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {machine.metrics?.map((m) => {
              const isCrit = m.status === 'Critical';
              const isWarn = m.status === 'Warning';
              return (
                <div
                  key={m.id}
                  className="p-3 rounded-xl border border-[#e4dcce] bg-[#faf7f2] flex flex-col justify-between"
                >
                  <span className="text-[10px] text-[#717b85] uppercase font-medium capitalize truncate">
                    {m.metric_name.replace('_', ' ')}
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-bold text-[#182026]">{m.metric_value}</span>
                    <span className="text-xs text-[#717b85]">{m.unit}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase mt-1 px-1.5 py-0.2 rounded w-fit ${
                      isCrit
                        ? 'bg-[#f6e4de] text-[#d36d4e]'
                        : isWarn
                        ? 'bg-[#fbf1e2] text-[#df9e52]'
                        : 'bg-[#e3ece6] text-[#3e6b5c]'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Incidents for this Machine */}
        {machine.recent_incidents && machine.recent_incidents.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#182026] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#3e6b5c]" />
              <span>Recent Equipment Incident History</span>
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {machine.recent_incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncidentById?.(inc.id)}
                  className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece4d6] hover:border-[#cfc3b0] cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#182026]">{inc.incident_number}</span>
                      <span className="font-semibold text-[#182026]">{inc.problem_category}</span>
                    </div>
                    <p className="text-[11px] text-[#717b85] truncate max-w-md mt-0.5">{inc.title}</p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                        inc.status === 'Resolved'
                          ? 'bg-[#e3ece6] text-[#3e6b5c]'
                          : 'bg-[#f6e4de] text-[#d36d4e]'
                      }`}
                    >
                      {inc.status}
                    </span>
                    <span className="block text-[10px] text-[#8a96a3] mt-1 font-mono">
                      {new Date(inc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-[#f1ebdF] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#faf7f2] hover:bg-[#ede5d8] text-[#717b85] text-xs"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onDiagnose(machine.id);
            }}
            className="px-5 py-2 rounded-xl bg-[#d36d4e] hover:bg-[#c25838] text-white font-semibold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch AI Diagnosis for {machine.machine_code}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
