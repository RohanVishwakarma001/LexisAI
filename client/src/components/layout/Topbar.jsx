import React from 'react';
import { Search, ChevronRight, Bell } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant/50 px-lg py-md flex justify-between items-center">
      <div className="flex items-center gap-md">
        <nav className="flex items-center text-on-surface-variant font-label-md gap-sm">
          <span>Proton Legal</span>
          <ChevronRight size={14} />
          <span className="text-on-surface font-bold">Dashboard</span>
        </nav>
      </div>
      <div className="flex items-center gap-lg">
        <div className="relative w-[400px]">
          <Input 
            placeholder="Search cases, docs, or ask AI (Cmd + K)" 
            leftIcon={<Search size={18} />} 
            className="w-full h-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant text-[10px] text-on-surface-variant">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant text-[10px] text-on-surface-variant">K</kbd>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest/50 text-on-surface-variant transition-colors">
            <Bell size={20} />
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARydaUHPL1PfbaPAeEVzBYSIVc3Qo55oD22lg-gL3RYwDloBto-lQGaQAhNPx1VBXeM2KSfZLuxst1B8_LdbR9J7rra7Su8B5TdBZErdZStAyJfE1AoYQ6mPAGgn2on6f-tTMH7odUehJ6IU4tM3j2vvBDeLUEaPCcIjJE6mXMxn6tvK2-oJVwDdwC9leALccKq91eZCAuH3De5Ss1cwKvip3zJzuhTF_UgPzd47DYI14VmSYIgoLKWxYD1tidc8hU6VeBiJ77En4" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
}
