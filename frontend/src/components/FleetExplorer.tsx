import React, { useState } from 'react';
import {
  Search,
  Activity,
  Clock,
  Wrench,
  Zap
} from 'lucide-react';
import { MachineIllustration } from './Artwork';
import type { Machine } from '../types';

interface FleetExplorerProps {
  machines: Machine[];
  onSelectMachine: (machine: Machine) => void;
  onDiagnoseMachine: (machineId: string) => void;
}

export const FleetExplorer: React.FC<FleetExplorerProps> = ({
  machines,
  onSelectMachine,
  onDiagnoseMachine,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.machine_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || m.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || m.type_name === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const uniqueTypes = Array.from(new Set(machines.map((m) => m.type_name)));

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Filters Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-normal text-2xl sm:text-3xl text-[#182026] tracking-tight flex items-center gap-2">
            <span>Equipment Fleet</span>
          </h1>
          <p className="text-xs text-[#717b85] mt-1">
            Active production machinery monitored with continuous sensor streams & Hindsight memory buffers
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8a96a3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code, name, bay..."
              className="bg-white pl-9 pr-3 py-1.5 rounded-xl text-xs w-48 text-[#182026] border border-[#e4dcce] focus:outline-none focus:border-[#d36d4e]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white px-3 py-1.5 rounded-xl text-xs text-[#182026] border border-[#e4dcce] focus:outline-none focus:border-[#d36d4e]"
          >
            <option value="all">All Statuses</option>
            <option value="Good">Good</option>
            <option value="Warning">Warning</option>
            <option value="Alert">Alert</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white px-3 py-1.5 rounded-xl text-xs text-[#182026] border border-[#e4dcce] focus:outline-none focus:border-[#d36d4e]"
          >
            <option value="all">All Machine Types</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Machine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMachines.map((machine) => {
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
            <div
              key={machine.id}
              className="ui-card rounded-2xl border border-[#e4dcce] bg-white p-5 transition-all flex flex-col justify-between hover:border-[#cfc3b0]"
            >
              <div>
                {/* Header: Machine Code & Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#182026]">
                      {machine.machine_code}
                    </span>
                    <span className="text-[11px] text-[#717b85]">{machine.type_name}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isAlert
                        ? 'bg-[#f6e4de] text-[#d36d4e]'
                        : isWarning
                        ? 'bg-[#fbf1e2] text-[#df9e52]'
                        : 'bg-[#e3ece6] text-[#3e6b5c]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isAlert ? 'bg-[#d36d4e]' : isWarning ? 'bg-[#df9e52]' : 'bg-[#3e6b5c]'
                      }`}
                    />
                    <span>{machine.status}</span>
                  </span>
                </div>

                {/* Machine Illustration */}
                <div className="my-2">
                  <MachineIllustration type={illustType} color={illustColor} />
                </div>

                {/* Name & Location */}
                <h3 className="font-serif font-bold text-sm text-[#182026] tracking-tight">{machine.name}</h3>
                <p className="text-[11px] text-[#717b85] mt-0.5">{machine.location_name}</p>

                {/* Meta details */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#4e5b67] py-2.5 border-y border-[#f1ebdF]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8a96a3]" />
                    <span>{Math.round(machine.operating_hours)} hrs run</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#8a96a3]" />
                    <span>{machine.total_incidents} incidents</span>
                  </div>
                </div>

                {/* Live Telemetry Sensors */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-[#717b85] uppercase tracking-wider block">
                    Active Sensor Telemetry
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {machine.metrics?.slice(0, 4).map((m) => {
                      const isCrit = m.status === 'Critical';
                      const isWarn = m.status === 'Warning';
                      return (
                        <div
                          key={m.id}
                          className="p-2 rounded-lg bg-[#faf7f2] border border-[#ece4d6] text-xs flex flex-col justify-between"
                        >
                          <span className="text-[10px] text-[#717b85] capitalize truncate">
                            {m.metric_name.replace('_', ' ')}
                          </span>
                          <span
                            className={`font-mono font-bold text-xs mt-0.5 ${
                              isCrit
                                ? 'text-[#d36d4e]'
                                : isWarn
                                ? 'text-[#df9e52]'
                                : 'text-[#3e6b5c]'
                            }`}
                          >
                            {m.metric_value} {m.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[#f1ebdF] flex items-center gap-2">
                <button
                  onClick={() => onSelectMachine(machine)}
                  className="flex-1 py-1.5 rounded-xl bg-[#faf7f2] hover:bg-[#ede5d8] text-[#182026] text-xs font-semibold border border-[#e4dbcd] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-[#d36d4e]" />
                  <span>Telemetry</span>
                </button>
                <button
                  onClick={() => onDiagnoseMachine(machine.id)}
                  className="flex-1 py-1.5 rounded-xl bg-[#d36d4e] hover:bg-[#c25838] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Diagnose</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
