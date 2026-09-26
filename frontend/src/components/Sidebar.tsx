import React from 'react';
import {
  Home,
  Box,
  Search,
  FileText,
  Database,
  BarChart2,
  Settings,
  ChevronRight
} from 'lucide-react';
import { LogoMark, BotanicalBranch } from './Artwork';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'machines', label: 'Machines', icon: Box },
    { id: 'diagnose', label: 'Diagnose', icon: Search },
    { id: 'incidents', label: 'Incidents', icon: FileText },
    { id: 'memory', label: 'Memory', icon: Database },
    { id: 'insights', label: 'Insights', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#f7f4ee] border-r border-[#e8dfd1] min-h-screen flex flex-col justify-between relative p-6 select-none overflow-hidden">
      {/* Botanical Silhouette in background of sidebar bottom-left */}
      <div className="absolute -left-6 bottom-16 w-36 h-64 pointer-events-none opacity-85 z-0">
        <BotanicalBranch className="w-full h-full" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Brand Header */}
        <div className="flex items-start gap-3.5">
          <LogoMark className="w-11 h-11 flex-shrink-0" />
          <div>
            <div className="flex flex-col">
              <span className="font-bold text-[13px] tracking-[0.22em] text-[#182026] uppercase">
                BYTE4 AI
              </span>
              <span className="text-[10px] tracking-[0.16em] text-[#6b7280] font-semibold uppercase -mt-0.5">
                REMEMBR
              </span>
            </div>
            <p className="text-[11px] text-[#717b85] font-serif italic mt-1 leading-tight">
              Every repair<br />becomes knowledge.
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#d36d4e] text-white shadow-sm'
                    : 'text-[#4e5b67] hover:text-[#182026] hover:bg-[#ede5d8]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6b7782]'}`} />
                <span className="tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Hindsight Connected Pill */}
      <div className="relative z-10 pt-4">
        <div className="ui-card p-3 rounded-2xl flex items-center justify-between border border-[#e4dcce] hover:border-[#cfc3b0] transition-colors cursor-pointer bg-white/90 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3e6b5c]"></span>
            <div>
              <span className="text-[11px] font-bold text-[#182026] block leading-tight">
                Hindsight Connected
              </span>
              <span className="text-[10px] text-[#717b85] block">
                Memory is active
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8a96a3]" />
        </div>
      </div>
    </aside>
  );
};
