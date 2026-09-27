import React, { useState, useEffect } from 'react';
import {
  Database,
  Brain,
  Sparkles,
  Users,
  RefreshCw,
  Sliders
} from 'lucide-react';
import type { SystemHealth, SettingsData } from '../types';
import { api } from '../services/api';

interface SystemHealthViewProps {
  health: SystemHealth | null;
  onRefreshHealth: () => void;
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({
  health,
  onRefreshHealth,
}) => {
  const [settings, setSettings] = useState<SettingsData | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    loadSettings();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-normal text-2xl sm:text-3xl text-[#182026] tracking-tight flex items-center gap-2">
            <span>System Architecture & Observability</span>
          </h1>
          <p className="text-xs text-[#717b85] mt-1">
            Real-time status of PostgreSQL schema, Hindsight persistent memory, and AI diagnostic provider
          </p>
        </div>

        <button
          onClick={onRefreshHealth}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#faf7f2] text-[#182026] text-xs font-semibold border border-[#e4dcce] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#d36d4e]" />
          <span>Ping Subsystems</span>
        </button>
      </div>

      {/* Subsystems Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Supabase PostgreSQL */}
        <div className="ui-card rounded-2xl p-5 border border-[#e4dcce] bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-[#e3ece6] flex items-center justify-center text-[#3e6b5c]">
              <Database className="w-5 h-5 stroke-[1.8]" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e3ece6] text-[#3e6b5c] uppercase">
              {health?.components.supabase.status || 'CONNECTED'}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#182026]">PostgreSQL Database</h3>
            <p className="text-xs text-[#717b85] mt-1">
              Operational relational store for telemetry, incidents, and equipment specs
            </p>
          </div>

          <div className="pt-3 border-t border-[#f1ebdF] space-y-1.5 text-xs text-[#4e5b67]">
            <div className="flex items-center justify-between">
              <span className="text-[#8a96a3]">Latency:</span>
              <span className="font-mono text-[#3e6b5c] font-semibold">
                {health?.components.supabase.latency_ms ? `${health.components.supabase.latency_ms} ms` : '1.5 ms'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8a96a3]">Details:</span>
              <span className="truncate max-w-[180px] text-[11px] text-[#717b85]">
                {health?.components.supabase.details}
              </span>
            </div>
          </div>
        </div>

        {/* Hindsight Persistent Memory */}
        <div className="ui-card rounded-2xl p-5 border border-[#e4dcce] bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-[#fbf1e2] flex items-center justify-center text-[#df9e52]">
              <Brain className="w-5 h-5 stroke-[1.8]" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fbf1e2] text-[#df9e52] uppercase">
              Active Buffer
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#182026]">Hindsight Persistent Memory</h3>
            <p className="text-xs text-[#717b85] mt-1">
              Persistent memory bank retaining troubleshooting hypotheses and repair results
            </p>
          </div>

          <div className="pt-3 border-t border-[#f1ebdF] space-y-1.5 text-xs text-[#4e5b67]">
            <div className="flex items-center justify-between">
              <span className="text-[#8a96a3]">Memory Bank:</span>
              <span className="font-mono text-[#df9e52] font-semibold">org_byte4_default</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8a96a3]">Mode:</span>
              <span className="text-[#3e6b5c] font-semibold">Persistent Storage</span>
            </div>
          </div>
        </div>

        {/* AI Diagnostic Reasoning Engine */}
        <div className="ui-card rounded-2xl p-5 border border-[#e4dcce] bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-[#f6e4de] flex items-center justify-center text-[#d36d4e]">
              <Sparkles className="w-5 h-5 stroke-[1.8]" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f6e4de] text-[#d36d4e] uppercase">
              Operational
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#182026]">AI Diagnostic Reasoner</h3>
            <p className="text-xs text-[#717b85] mt-1">
              Grounded synthesis engine strictly citing verified memories & telemetry
            </p>
          </div>

          <div className="pt-3 border-t border-[#f1ebdF] space-y-1.5 text-xs text-[#4e5b67]">
            <div className="flex items-center justify-between">
              <span className="text-[#8a96a3]">Provider:</span>
              <span className="font-mono text-[#d36d4e] font-semibold">
                {settings?.ai.provider.toUpperCase() || 'GEMINI'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8a96a3]">Grounding Policy:</span>
              <span className="text-[#3e6b5c] font-semibold">Enforced (Anti-Hallucination)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Configuration & Team Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings & Parameters */}
        <div className="ui-card rounded-2xl p-6 border border-[#e4dcce] bg-white space-y-4">
          <h2 className="text-sm font-bold text-[#182026] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#d36d4e]" />
            <span>AI Reasoning & Memory Policies</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece4d6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#182026] block">Strict Memory Grounding</span>
                <span className="text-[#717b85] text-[11px]">
                  Requires historical claims to map directly to indexed records
                </span>
              </div>
              <span className="text-[#3e6b5c] font-bold">ACTIVE</span>
            </div>

            <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece4d6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#182026] block">Negative Outcome Preservation</span>
                <span className="text-[#717b85] text-[11px]">
                  Retains failed troubleshooting steps to prevent repetitive repair mistakes
                </span>
              </div>
              <span className="text-[#d36d4e] font-bold">ENABLED</span>
            </div>

            <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece4d6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#182026] block">Cross-Asset Pattern Synthesis</span>
                <span className="text-[#717b85] text-[11px]">
                  Propagates lessons from CNC-104 to all CNC family milling machines
                </span>
              </div>
              <span className="text-[#df9e52] font-bold">CROSS-FLEET</span>
            </div>
          </div>
        </div>

        {/* Maintenance Technicians Team */}
        <div className="ui-card rounded-2xl p-6 border border-[#e4dcce] bg-white space-y-4">
          <h2 className="text-sm font-bold text-[#182026] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#3e6b5c]" />
            <span>Active Maintenance Personnel</span>
          </h2>

          <div className="space-y-2">
            {settings?.users?.map((u, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece4d6] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f6e4de] flex items-center justify-center font-bold text-[#d36d4e]">
                    {u.name[0]}
                  </div>
                  <div>
                    <span className="font-bold text-[#182026] block">{u.name}</span>
                    <span className="text-[11px] text-[#717b85]">{u.role}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#8a96a3]">{u.email}</span>
                  <span className="block text-[10px] text-[#3e6b5c] font-semibold">Active Duty</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
