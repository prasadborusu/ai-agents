import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

interface TopNavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-4 px-8 relative z-20">
      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-[#8a96a3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
          placeholder="Search machines, incidents, memories..."
          className="w-full bg-white/80 hover:bg-white focus:bg-white text-xs text-[#182026] placeholder-[#8a96a3] pl-10 pr-4 py-2.5 rounded-xl border border-[#e4dbcd] focus:outline-none focus:border-[#d36d4e] transition-all shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
        />
      </div>

      {/* Right User & Notification Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl text-[#4e5b67] hover:bg-white/70 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d36d4e] ring-2 ring-[#f7f4ee]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 cursor-pointer pl-1 py-1 pr-2 rounded-xl hover:bg-white/70 transition-colors">
          <div className="w-8 h-8 rounded-full bg-[#2a333b] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            P
          </div>
          <span className="text-xs font-semibold text-[#182026]">Prasad</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#8a96a3]" />
        </div>
      </div>
    </div>
  );
};
