import React from 'react';
import {
  Cpu,
  Brain,
  Database,
  Activity,
  PlusCircle,
  Stethoscope,
  Sparkles,
  Server
} from 'lucide-react';
import type { SystemHealth } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: SystemHealth | null;
  onOpenNewIncident: () => void;
  onOpenQuickDiagnose: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  health,
  onOpenNewIncident,
  onOpenQuickDiagnose,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080d1a]/90 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-11 h-11 bg-slate-900 border border-white/20 rounded-xl flex items-center justify-center text-white shadow-xl">
              <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-lg tracking-wider text-white">
                BYTE4 AI <span className="text-cyan-400">REMEMBR</span>
              </span>
              <span className="text-[10px] tracking-widest font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                Enterprise v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Every repair becomes knowledge &bull; Persistent Industrial Equipment Memory
            </p>
          </div>
        </div>

        {/* Live Engine Statuses */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/5 text-xs text-slate-300">
            {/* Supabase Status */}
            <div className="flex items-center gap-1.5" title="Supabase / PostgreSQL Schema Status">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">PostgreSQL:</span>
              <span className="text-emerald-400 font-medium">
                {health?.components.supabase.status || 'Online'}
              </span>
            </div>

            <span className="text-slate-700">|</span>

            {/* Hindsight Status */}
            <div className="flex items-center gap-1.5" title="Hindsight Persistent Memory Status">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Hindsight Memory:</span>
              <span className="text-cyan-400 font-medium">Active Bank</span>
            </div>

            <span className="text-slate-700">|</span>

            {/* AI Provider */}
            <div className="flex items-center gap-1.5" title="AI Diagnostic Engine Status">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Diagnostic Reasoner:</span>
              <span className="text-indigo-400 font-medium">Grounded</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenQuickDiagnose}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              <span>AI Diagnose</span>
            </button>

            <button
              onClick={onOpenNewIncident}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Incident</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-3 flex items-center gap-1 overflow-x-auto border-t border-white/5 pt-2 text-sm no-scrollbar">
        {[
          { id: 'dashboard', label: 'Command Center', icon: Activity },
          { id: 'diagnose', label: 'AI Diagnostic Studio', icon: Stethoscope },
          { id: 'fleet', label: 'Machine Fleet', icon: Cpu },
          { id: 'incidents', label: 'Incidents & Work Orders', icon: PlusCircle },
          { id: 'memory', label: 'Memory Bank & Patterns', icon: Brain },
          { id: 'observability', label: 'System Observability', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
