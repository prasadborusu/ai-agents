import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Zap,
  ShieldAlert
} from 'lucide-react';
import type { Incident, Machine } from '../types';

interface IncidentsViewProps {
  incidents: Incident[];
  machines: Machine[];
  onSelectIncident: (incident: Incident) => void;
  onOpenResolveModal: (incident: Incident) => void;
  onDiagnoseIncident: (machineId: string, incident: Incident) => void;
  onOpenNewIncident: () => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  machines,
  onSelectIncident,
  onOpenResolveModal,
  onDiagnoseIncident,
  onOpenNewIncident,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [machineFilter, setMachineFilter] = useState('all');
  const [recurringOnly, setRecurringOnly] = useState(false);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.incident_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.problem_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.machine_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inc.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    const matchesMachine = machineFilter === 'all' || inc.machine_id === machineFilter;
    const matchesRecurring = !recurringOnly || inc.is_recurring;

    return matchesSearch && matchesStatus && matchesSeverity && matchesMachine && matchesRecurring;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-normal text-2xl sm:text-3xl text-[#182026] tracking-tight flex items-center gap-2">
            <span>Incidents & Maintenance Work Orders</span>
          </h1>
          <p className="text-xs text-[#717b85] mt-1">
            Field troubleshooting records, technician diagnostic attempts, and resolved memory lessons
          </p>
        </div>

        <button
          onClick={onOpenNewIncident}
          className="px-4 py-2.5 rounded-xl bg-[#d36d4e] hover:bg-[#c25838] text-white font-semibold text-xs shadow-md shadow-[#d36d4e]/20 active:scale-95 transition-all flex items-center gap-2 self-start lg:self-auto"
        >
          <AlertTriangle className="w-4 h-4 text-[#fbf1e2]" />
          <span>Report New Machine Incident</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="ui-card p-3 rounded-2xl border border-[#e4dcce] bg-white flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#8a96a3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search incident number, asset code, category..."
            className="w-full bg-[#faf7f2] pl-9 pr-3 py-1.5 rounded-xl text-xs text-[#182026] border border-[#e4dbcd] focus:outline-none focus:border-[#d36d4e]"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#faf7f2] px-3 py-1.5 rounded-xl text-xs text-[#182026] border border-[#e4dbcd] focus:outline-none focus:border-[#d36d4e]"
        >
          <option value="all">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Investigating">Investigating</option>
          <option value="Action Taken">Action Taken</option>
          <option value="Resolved">Resolved</option>
        </select>

        {/* Severity Filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-[#faf7f2] px-3 py-1.5 rounded-xl text-xs text-[#182026] border border-[#e4dbcd] focus:outline-none focus:border-[#d36d4e]"
        >
          <option value="all">All Severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        {/* Machine Filter */}
        <select
          value={machineFilter}
          onChange={(e) => setMachineFilter(e.target.value)}
          className="bg-[#faf7f2] px-3 py-1.5 rounded-xl text-xs text-[#182026] border border-[#e4dbcd] focus:outline-none focus:border-[#d36d4e]"
        >
          <option value="all">All Machines</option>
          {machines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.machine_code} - {m.name}
            </option>
          ))}
        </select>

        {/* Recurring Toggle */}
        <button
          onClick={() => setRecurringOnly(!recurringOnly)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
            recurringOnly
              ? 'bg-[#fbf1e2] text-[#df9e52] border-[#df9e52]/40'
              : 'bg-[#faf7f2] text-[#647482] border-[#e4dbcd] hover:border-[#cfc3b0]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#df9e52]" />
          <span>Recurring Issues Only</span>
        </button>
      </div>

      {/* Incidents Table */}
      <div className="ui-card rounded-2xl border border-[#e4dcce] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#f1ebdF] bg-[#faf7f2]/70 text-[#717b85] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Equipment</th>
                <th className="py-3 px-4">Problem Category & Title</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Memory Index</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efe4]">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8a96a3]">
                    No incidents match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => {
                  const isResolved = inc.status === 'Resolved';
                  const isCritical = inc.severity === 'Critical';
                  const isHigh = inc.severity === 'High';

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className="hover:bg-[#faf7f2]/60 cursor-pointer transition-colors"
                    >
                      {/* ID & Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#182026]">{inc.incident_number}</span>
                          {inc.is_recurring && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#fbf1e2] text-[#df9e52] font-semibold">
                              {inc.recurring_count}x
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8a96a3] block font-normal mt-0.5">
                          {new Date(inc.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Equipment */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-[#182026] block">
                          {inc.machine_code}
                        </span>
                        <span className="text-[11px] text-[#717b85] block truncate max-w-[130px]">
                          {inc.machine_name}
                        </span>
                      </td>

                      {/* Problem Category & Title */}
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-semibold text-[#182026] block truncate">
                          {inc.problem_category}
                        </span>
                        <span className="text-[11px] text-[#717b85] block truncate mt-0.5">
                          {inc.title}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            isCritical
                              ? 'bg-[#f6e4de] text-[#d36d4e]'
                              : isHigh
                              ? 'bg-[#fbf1e2] text-[#df9e52]'
                              : 'bg-[#e3ece6] text-[#3e6b5c]'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            isResolved
                              ? 'bg-[#e3ece6] text-[#3e6b5c]'
                              : 'bg-[#f6e4de] text-[#d36d4e]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isResolved ? 'bg-[#3e6b5c]' : 'bg-[#d36d4e]'
                            }`}
                          />
                          <span>{inc.status}</span>
                        </span>
                      </td>

                      {/* Memory Index Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#3e6b5c] font-medium">
                            Indexed & Learned
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#8a96a3]">Awaiting fix</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {!isResolved && (
                            <button
                              onClick={() => onOpenResolveModal(inc)}
                              className="px-2.5 py-1 rounded-xl bg-[#e3ece6] hover:bg-[#c5d9cd] text-[#3e6b5c] text-[11px] font-semibold transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                          <button
                            onClick={() => onDiagnoseIncident(inc.machine_id, inc)}
                            className="px-2.5 py-1 rounded-xl bg-[#f6e4de] hover:bg-[#edc8bc] text-[#d36d4e] text-[11px] font-semibold transition-colors flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Diagnose</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
