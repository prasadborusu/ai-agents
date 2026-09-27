import React from 'react';
import {
  Box,
  FileText,
  ShieldCheck,
  RotateCw,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import {
  LandscapeMural,
  BotanicalBranch,
  MachineIllustration
} from './Artwork';
import type { InsightsSummary, Machine, Incident } from '../types';

interface CommandCenterProps {
  insights: InsightsSummary | null;
  machines: Machine[];
  incidents: Incident[];
  onSelectMachine: (machine: Machine) => void;
  onSelectIncident: (incident: Incident) => void;
  onNavigateToDiagnose: (machineId?: string) => void;
  onNavigateToIncidents: () => void;
  onNavigateToMemory: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  insights,
  machines,
  incidents,
  onSelectMachine,
  onSelectIncident,
  onNavigateToDiagnose,
  onNavigateToIncidents,
  onNavigateToMemory,
}) => {
  // Sparkline mini SVG
  const Sparkline = ({ points, color }: { points: number[]; color: string }) => {
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min || 1;
    const width = 64;
    const height = 24;

    const pathData = points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Stacked Bar Chart data matching the screenshot
  const monthlyTrends = [
    { month: 'Jan', resolved: 6, open: 2, recurring: 3 },
    { month: 'Feb', resolved: 9, open: 3, recurring: 4 },
    { month: 'Mar', resolved: 12, open: 3, recurring: 5 },
    { month: 'Apr', resolved: 15, open: 4, recurring: 6 },
    { month: 'May', resolved: 14, open: 4, recurring: 5 },
    { month: 'Jun', resolved: 16, open: 4, recurring: 7 },
  ];

  return (
    <div className="space-y-7 pb-16 relative">
      {/* Background Landscape Mural (Top Right) */}
      <div className="absolute top-[-30px] right-[-20px] w-[560px] h-[360px] pointer-events-none opacity-80 z-0">
        <LandscapeMural className="w-full h-full" />
      </div>

      {/* Welcome Banner */}
      <div className="relative z-10 pt-2">
        <span className="text-xs font-medium text-[#717b85] tracking-wide block">
          Welcome back,
        </span>
        <h1 className="font-serif font-normal text-3xl sm:text-[36px] text-[#182026] tracking-tight mt-0.5 leading-tight">
          Good morning, Prasad
        </h1>
        <p className="text-xs sm:text-[13px] text-[#647482] mt-1.5 font-normal">
          Your organization's maintenance memory, working quietly in the background.
        </p>
      </div>

      {/* 4 Metric / KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Card 1: Machines */}
        <div className="ui-card p-4 rounded-2xl flex items-center justify-between border border-[#e4dcce] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e3ece6] flex items-center justify-center text-[#3e6b5c]">
              <Box className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-2xl font-bold text-[#182026] block leading-none">
                {insights?.total_machines ?? 24}
              </span>
              <span className="text-xs text-[#717b85] block mt-1 font-medium">Machines</span>
              <span className="text-[11px] text-[#3e6b5c] font-semibold flex items-center gap-0.5 mt-0.5">
                ↑ 2 this month
              </span>
            </div>
          </div>
          <Sparkline points={[16, 18, 19, 21, 22, 24]} color="#3e6b5c" />
        </div>

        {/* Card 2: Open Issues */}
        <div className="ui-card p-4 rounded-2xl flex items-center justify-between border border-[#e4dcce] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f6e4de] flex items-center justify-center text-[#d36d4e]">
              <FileText className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-2xl font-bold text-[#182026] block leading-none">
                {insights?.open_issues ?? 7}
              </span>
              <span className="text-xs text-[#717b85] block mt-1 font-medium">Open issues</span>
              <span className="text-[11px] text-[#d36d4e] font-semibold flex items-center gap-0.5 mt-0.5">
                ↓ 3 this month
              </span>
            </div>
          </div>
          <Sparkline points={[14, 12, 11, 9, 8, 7]} color="#d36d4e" />
        </div>

        {/* Card 3: Resolved Incidents */}
        <div className="ui-card p-4 rounded-2xl flex items-center justify-between border border-[#e4dcce] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e3ece6] flex items-center justify-center text-[#3e6b5c]">
              <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-2xl font-bold text-[#182026] block leading-none">
                {insights?.resolved_incidents ?? 142}
              </span>
              <span className="text-xs text-[#717b85] block mt-1 font-medium">Resolved Incidents</span>
              <span className="text-[11px] text-[#3e6b5c] font-semibold flex items-center gap-0.5 mt-0.5">
                ↑ 18 this month
              </span>
            </div>
          </div>
          <Sparkline points={[95, 105, 118, 126, 134, 142]} color="#3e6b5c" />
        </div>

        {/* Card 4: Recurring Problems */}
        <div className="ui-card p-4 rounded-2xl flex items-center justify-between border border-[#e4dcce] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fbf1e2] flex items-center justify-center text-[#df9e52]">
              <RotateCw className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-2xl font-bold text-[#182026] block leading-none">
                {insights?.recurring_problems_count ?? 18}
              </span>
              <span className="text-xs text-[#717b85] block mt-1 font-medium">Recurring Problems</span>
              <span className="text-[11px] text-[#df9e52] font-semibold flex items-center gap-0.5 mt-0.5">
                ↑ 4 this month
              </span>
            </div>
          </div>
          <Sparkline points={[11, 13, 14, 15, 17, 18]} color="#df9e52" />
        </div>
      </div>

      {/* Middle Row (3 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        {/* Left Column: Recent AI Memory Insights (4.5 cols) */}
        <div className="lg:col-span-5 ui-card p-5 rounded-2xl border border-[#e4dcce] bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#f1ebdF]">
              <h2 className="text-sm font-bold text-[#182026] tracking-tight">
                Recent AI Memory Insights
              </h2>
              <button
                onClick={onNavigateToMemory}
                className="text-xs font-medium text-[#717b85] hover:text-[#d36d4e] flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <span>&rarr;</span>
              </button>
            </div>

            <div className="divide-y divide-[#f5efe4]">
              {/* Item 1: CNC-104 */}
              <div
                onClick={() => onNavigateToDiagnose(machines.find((m) => m.machine_code === 'CNC-104')?.id)}
                className="py-3.5 flex items-start justify-between gap-3 cursor-pointer group hover:bg-[#faf7f2]/50 rounded-xl px-1.5 -mx-1.5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f6e4de] flex-shrink-0 flex items-center justify-center text-[#d36d4e] mt-0.5">
                    <MachineIcon type="cnc" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-xs text-[#182026]">CNC-104</span>
                      <span className="text-xs text-[#182026] font-medium">Recurring vibration detected</span>
                    </div>
                    <p className="text-[11px] text-[#717b85] mt-0.5 leading-snug">
                      4 related incidents &bull; Previous successful resolution: Shaft alignment
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 text-[#8a96a3] group-hover:text-[#182026] text-[11px]">
                  <span>2 days ago</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Item 2: Pump-201 */}
              <div
                onClick={() => onNavigateToDiagnose(machines.find((m) => m.machine_code === 'PMP-201')?.id)}
                className="py-3.5 flex items-start justify-between gap-3 cursor-pointer group hover:bg-[#faf7f2]/50 rounded-xl px-1.5 -mx-1.5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#e3ece6] flex-shrink-0 flex items-center justify-center text-[#3e6b5c] mt-0.5">
                    <MachineIcon type="pump" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-xs text-[#182026]">Pump-201</span>
                      <span className="text-xs text-[#182026] font-medium">Overheating pattern detected</span>
                    </div>
                    <p className="text-[11px] text-[#717b85] mt-0.5 leading-snug">
                      3 related incidents &bull; Resolved through coolant pump cleaning
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 text-[#8a96a3] group-hover:text-[#182026] text-[11px]">
                  <span>3 days ago</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Item 3: Press-12 */}
              <div
                onClick={() => onNavigateToDiagnose(machines.find((m) => m.machine_code === 'PRESS-12')?.id)}
                className="py-3.5 flex items-start justify-between gap-3 cursor-pointer group hover:bg-[#faf7f2]/50 rounded-xl px-1.5 -mx-1.5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#fbf1e2] flex-shrink-0 flex items-center justify-center text-[#df9e52] mt-0.5">
                    <MachineIcon type="press" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-xs text-[#182026]">Press-12</span>
                      <span className="text-xs text-[#182026] font-medium">Pressure drop recurring</span>
                    </div>
                    <p className="text-[11px] text-[#717b85] mt-0.5 leading-snug">
                      5 related incidents &bull; Filter replacement resolved the issue
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 text-[#8a96a3] group-hover:text-[#182026] text-[11px]">
                  <span>5 days ago</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Item 4: CONV-03 */}
              <div
                onClick={() => onNavigateToDiagnose(machines.find((m) => m.machine_code === 'CONV-03')?.id)}
                className="py-3.5 flex items-start justify-between gap-3 cursor-pointer group hover:bg-[#faf7f2]/50 rounded-xl px-1.5 -mx-1.5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#eedcd2] flex-shrink-0 flex items-center justify-center text-[#cb5e3f] mt-0.5">
                    <MachineIcon type="conveyor" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-xs text-[#182026]">CONV-03</span>
                      <span className="text-xs text-[#182026] font-medium">Belt misalignment pattern</span>
                    </div>
                    <p className="text-[11px] text-[#717b85] mt-0.5 leading-snug">
                      3 related incidents &bull; Tension adjustment resolved the issue
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 text-[#8a96a3] group-hover:text-[#182026] text-[11px]">
                  <span>6 days ago</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Incident Trends (3.8 cols) */}
        <div className="lg:col-span-4 ui-card p-5 rounded-2xl border border-[#e4dcce] bg-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Botanical Sprig in Card Bottom-Right */}
          <div className="absolute right-[-15px] bottom-[-20px] w-28 h-44 opacity-25 pointer-events-none">
            <BotanicalBranch className="w-full h-full" />
          </div>

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#f1ebdF]">
              <h2 className="text-sm font-bold text-[#182026] tracking-tight">
                Incident Trends
              </h2>
              <div className="flex items-center gap-1 text-xs text-[#717b85] cursor-pointer hover:text-[#182026]">
                <span>Last 6 months</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Stacked Vertical Bar Chart */}
            <div className="pt-6 pb-2 px-1">
              <div className="flex items-end justify-between gap-3 h-44 border-b border-[#ece7dd] pb-1 relative">
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-x-0 top-0 border-b border-[#f1ebdF] text-[9px] text-[#a0abb5] -mt-2">30</div>
                <div className="absolute inset-x-0 top-1/3 border-b border-[#f1ebdF] text-[9px] text-[#a0abb5] -mt-2">20</div>
                <div className="absolute inset-x-0 top-2/3 border-b border-[#f1ebdF] text-[9px] text-[#a0abb5] -mt-2">10</div>
                <div className="absolute inset-x-0 bottom-0 text-[9px] text-[#a0abb5] -mb-1">0</div>

                {monthlyTrends.map((item, idx) => {
                  const maxTotal = 30;
                  const resolvedH = (item.resolved / maxTotal) * 100;
                  const openH = (item.open / maxTotal) * 100;
                  const recurrH = (item.recurring / maxTotal) * 100;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-10">
                      <div className="w-full max-w-[20px] rounded-t-sm flex flex-col-reverse overflow-hidden h-36">
                        {/* Resolved (Bottom: Sage Green) */}
                        <div
                          style={{ height: `${resolvedH}%` }}
                          className="bg-[#3e6b5c] w-full"
                          title={`Resolved: ${item.resolved}`}
                        />
                        {/* Open (Middle: Coral Red) */}
                        <div
                          style={{ height: `${openH}%` }}
                          className="bg-[#d36d4e] w-full"
                          title={`Open: ${item.open}`}
                        />
                        {/* Recurring (Top: Ochre Amber) */}
                        <div
                          style={{ height: `${recurrH}%` }}
                          className="bg-[#df9e52] w-full rounded-t-sm"
                          title={`Recurring: ${item.recurring}`}
                        />
                      </div>
                      <span className="text-[10px] text-[#717b85] font-medium mt-1">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-[#647482]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3e6b5c]" />
                  <span>Resolved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#d36d4e]" />
                  <span>Open</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#df9e52]" />
                  <span>Recurring</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights (3.2 cols) */}
        <div className="lg:col-span-3 ui-card p-5 rounded-2xl border border-[#e4dcce] bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#f1ebdF]">
              <h2 className="text-sm font-bold text-[#182026] tracking-tight">
                AI Insights
              </h2>
              <button
                onClick={onNavigateToMemory}
                className="text-xs font-medium text-[#717b85] hover:text-[#d36d4e] flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <span>&rarr;</span>
              </button>
            </div>

            <p className="text-[11px] text-[#717b85] mt-2 leading-relaxed">
              Patterns and knowledge discovered from 142 historical incidents.
            </p>

            <div className="divide-y divide-[#f5efe4] mt-2">
              {/* Insight 1 */}
              <div
                onClick={onNavigateToMemory}
                className="py-3 flex items-start justify-between gap-2.5 cursor-pointer group hover:bg-[#faf7f2]/50 rounded-xl px-1 -mx-1 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#f6e4de] flex-shrink-0 flex items-center justify-center text-[#d36d4e] mt-0.5">
                    <MachineIcon type="cnc" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#182026] block">CNC Machines</span>
                    <p className="text-[11px] text-[#717b85] mt-0.5 leading-snug">
                      18 vibration incidents &bull; 67% involved alignment issues
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#8a96a3] group-hover:text-[#182026] flex-shrink-0 mt-2" />
              </div>

              {/* Insight 2 */}
              <div
                onClick={onNavigateToMemory}
                className="py-3 flex items-start justify-between gap-2.5 cursor-pointer group hover:bg-[#faf7f2]/50 rounded-xl px-1 -mx-1 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#fbf1e2] flex-shrink-0 flex items-center justify-center text-[#df9e52] mt-0.5">
                    <MachineIcon type="press" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#182026] block">Hydraulic Press</span>
                    <p className="text-[11px] text-[#717b85] mt-0.5 leading-snug">
                      12 pressure drop incidents &bull; 58% resolved through filter replacement
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#8a96a3] group-hover:text-[#182026] flex-shrink-0 mt-2" />
              </div>

              {/* Insight 3 */}
              <div
                onClick={onNavigateToMemory}
                className="py-3 flex items-start justify-between gap-2.5 cursor-pointer group hover:bg-[#faf7f2]/50 rounded-xl px-1 -mx-1 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#e3ece6] flex-shrink-0 flex items-center justify-center text-[#3e6b5c] mt-0.5">
                    <MachineIcon type="pump" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#182026] block">Industrial Pumps</span>
                    <p className="text-[11px] text-[#717b85] mt-0.5 leading-snug">
                      9 overheating incidents &bull; 62% resolved through coolant cleaning
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#8a96a3] group-hover:text-[#182026] flex-shrink-0 mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Machines Carousel / Grid */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#182026] tracking-tight">
              Machines
            </h2>
            <p className="text-xs text-[#717b85] mt-0.5">
              All your equipment and their maintenance status
            </p>
          </div>
          <button
            onClick={() => onNavigateToDiagnose()}
            className="text-xs font-medium text-[#717b85] hover:text-[#d36d4e] flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* 4 Machine Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: CNC-101 */}
          <div
            onClick={() => {
              const m = machines.find((mach) => mach.machine_code === 'CNC-101') || machines[0];
              if (m) onSelectMachine(m);
            }}
            className="ui-card p-4 rounded-2xl border border-[#e4dcce] bg-white group cursor-pointer hover:border-[#cfc3b0] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e3ece6] text-[#3e6b5c]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3e6b5c]" />
                  <span>Good</span>
                </span>
              </div>

              {/* Machine Drawing */}
              <div className="my-1">
                <MachineIllustration type="cnc" color="sage" />
              </div>

              <h3 className="font-bold text-xs text-[#182026] tracking-tight">CNC-101</h3>
              <p className="text-[11px] text-[#717b85]">CNC Machine</p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#f1ebdF] flex items-center justify-between text-[11px] text-[#717b85]">
              <span>4 Incidents</span>
              <span>12 days ago Last Incident</span>
            </div>
          </div>

          {/* Card 2: CNC-104 */}
          <div
            onClick={() => {
              const m = machines.find((mach) => mach.machine_code === 'CNC-104') || machines[1];
              if (m) onSelectMachine(m);
            }}
            className="ui-card p-4 rounded-2xl border border-[#e4dcce] bg-white group cursor-pointer hover:border-[#cfc3b0] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f6e4de] text-[#d36d4e]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d36d4e]" />
                  <span>Alert</span>
                </span>
              </div>

              {/* Machine Drawing */}
              <div className="my-1">
                <MachineIllustration type="cnc" color="terracotta" />
              </div>

              <h3 className="font-bold text-xs text-[#182026] tracking-tight">CNC-104</h3>
              <p className="text-[11px] text-[#717b85]">CNC Machine</p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#f1ebdF] flex items-center justify-between text-[11px] text-[#717b85]">
              <span>8 Incidents</span>
              <span>2 days ago Last Incident</span>
            </div>
          </div>

          {/* Card 3: PMP-201 */}
          <div
            onClick={() => {
              const m = machines.find((mach) => mach.machine_code === 'PMP-201') || machines[2];
              if (m) onSelectMachine(m);
            }}
            className="ui-card p-4 rounded-2xl border border-[#e4dcce] bg-white group cursor-pointer hover:border-[#cfc3b0] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fbf1e2] text-[#df9e52]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#df9e52]" />
                  <span>Warning</span>
                </span>
              </div>

              {/* Machine Drawing */}
              <div className="my-1">
                <MachineIllustration type="pump" color="ochre" />
              </div>

              <h3 className="font-bold text-xs text-[#182026] tracking-tight">PMP-201</h3>
              <p className="text-[11px] text-[#717b85]">Industrial Pump</p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#f1ebdF] flex items-center justify-between text-[11px] text-[#717b85]">
              <span>5 Incidents</span>
              <span>4 days ago Last Incident</span>
            </div>
          </div>

          {/* Card 4: CONV-03 */}
          <div
            onClick={() => {
              const m = machines.find((mach) => mach.machine_code === 'CONV-03') || machines[3];
              if (m) onSelectMachine(m);
            }}
            className="ui-card p-4 rounded-2xl border border-[#e4dcce] bg-white group cursor-pointer hover:border-[#cfc3b0] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e3ece6] text-[#3e6b5c]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3e6b5c]" />
                  <span>Good</span>
                </span>
              </div>

              {/* Machine Drawing */}
              <div className="my-1">
                <MachineIllustration type="conveyor" color="sage" />
              </div>

              <h3 className="font-bold text-xs text-[#182026] tracking-tight">CONV-03</h3>
              <p className="text-[11px] text-[#717b85]">Conveyor</p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#f1ebdF] flex items-center justify-between text-[11px] text-[#717b85]">
              <span>3 Incidents</span>
              <span>7 days ago Last Incident</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: 3 Columns (Recent Incidents Table, Top Recurring Problems, Quote Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        {/* Column 1: Recent Incidents Table (5.2 cols) */}
        <div className="lg:col-span-5 ui-card p-5 rounded-2xl border border-[#e4dcce] bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#f1ebdF]">
              <h2 className="text-sm font-bold text-[#182026] tracking-tight">
                Recent Incidents
              </h2>
              <button
                onClick={onNavigateToIncidents}
                className="text-xs font-medium text-[#717b85] hover:text-[#d36d4e] flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <span>&rarr;</span>
              </button>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] text-[#8a96a3] font-semibold uppercase tracking-wider border-b border-[#f1ebdF]">
                    <th className="pb-2 font-normal">ID</th>
                    <th className="pb-2 font-normal">Machine</th>
                    <th className="pb-2 font-normal">Problem</th>
                    <th className="pb-2 font-normal">Status</th>
                    <th className="pb-2 font-normal text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5efe4]">
                  {[
                    { id: 'INC-1048', machine: 'CNC-104', problem: 'High vibration', status: 'Open', date: 'Sep 27, 2026' },
                    { id: 'INC-1047', machine: 'PMP-201', problem: 'Overheating', status: 'Resolved', date: 'Sep 26, 2026' },
                    { id: 'INC-1046', machine: 'Press-12', problem: 'Pressure drop', status: 'Resolved', date: 'Sep 25, 2026' },
                    { id: 'INC-1045', machine: 'CNC-102', problem: 'Unusual noise', status: 'Open', date: 'Sep 24, 2026' },
                  ].map((row, idx) => {
                    const isOpen = row.status === 'Open';
                    const fullInc = incidents.find((inc) => inc.incident_number === row.id);

                    return (
                      <tr
                        key={idx}
                        onClick={() => fullInc && onSelectIncident(fullInc)}
                        className="hover:bg-[#faf7f2]/60 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 font-medium text-[#182026] text-[11px] whitespace-nowrap">
                          {row.id}
                        </td>
                        <td className="py-2.5 text-[#182026] text-[11px] whitespace-nowrap font-medium">
                          {row.machine}
                        </td>
                        <td className="py-2.5 text-[#647482] text-[11px] whitespace-nowrap">
                          {row.problem}
                        </td>
                        <td className="py-2.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isOpen
                                ? 'bg-[#f6e4de] text-[#d36d4e]'
                                : 'bg-[#e3ece6] text-[#3e6b5c]'
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${isOpen ? 'bg-[#d36d4e]' : 'bg-[#3e6b5c]'}`} />
                            <span>{row.status}</span>
                          </span>
                        </td>
                        <td className="py-2.5 text-[#8a96a3] text-[11px] whitespace-nowrap text-right">
                          {row.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Column 2: Top Recurring Problems (3.8 cols) */}
        <div className="lg:col-span-4 ui-card p-5 rounded-2xl border border-[#e4dcce] bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#f1ebdF]">
              <h2 className="text-sm font-bold text-[#182026] tracking-tight">
                Top Recurring Problems
              </h2>
              <button
                onClick={onNavigateToMemory}
                className="text-xs font-medium text-[#717b85] hover:text-[#d36d4e] flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <span>&rarr;</span>
              </button>
            </div>

            <div className="space-y-3.5 mt-3.5">
              {[
                { name: 'Vibration', count: 18, pct: '85%' },
                { name: 'Overheating', count: 12, pct: '58%' },
                { name: 'Pressure drop', count: 10, pct: '48%' },
                { name: 'Belt misalignment', count: 8, pct: '38%' },
                { name: 'Unusual noise', count: 6, pct: '28%' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#182026] font-medium text-[11px]">{item.name}</span>
                    <span className="text-[#717b85] font-semibold text-[11px]">{item.count}</span>
                  </div>
                  <div className="w-full bg-[#f3ece2] h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: item.pct }}
                      className="bg-[#d36d4e] h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Philosophy Quote & Landscape Card (3 cols) */}
        <div className="lg:col-span-3 ui-card p-5 rounded-2xl border border-[#e4dcce] bg-[#fbf9f4] flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Mountains & Botanical Art Background */}
          <div className="absolute right-[-20px] bottom-[-25px] w-48 h-56 pointer-events-none opacity-85">
            <BotanicalBranch className="w-full h-full" />
          </div>

          <div className="relative z-10 pt-2">
            <blockquote className="font-serif italic text-base text-[#182026] leading-relaxed">
              &ldquo;Every technician's experience builds a smarter tomorrow.&rdquo;
            </blockquote>
            <span className="text-xs text-[#717b85] block mt-2 font-medium">
              &mdash; Byte4 AI
            </span>
          </div>

          <div className="relative z-10 pt-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#e4dcce] text-[10px] font-semibold text-[#717b85] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3e6b5c]" />
              <span>Continuous Knowledge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini helper for category sketch icons
function MachineIcon({ type }: { type: 'cnc' | 'pump' | 'press' | 'conveyor' }) {
  if (type === 'cnc') {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="7" y1="8" x2="17" y2="8" />
        <line x1="12" y1="8" x2="12" y2="14" />
      </svg>
    );
  }
  if (type === 'pump') {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="7" />
        <path d="M12 5V2" />
        <path d="M19 12h3" />
      </svg>
    );
  }
  if (type === 'press') {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16" />
        <path d="M6 20V4h12v16" />
        <path d="M9 10h6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="12" r="3" />
      <path d="M6 9h12" />
      <path d="M6 15h12" />
    </svg>
  );
}
