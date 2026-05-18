import React, { useEffect, useRef } from 'react';
import { Search, ChevronRight, Bell, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuthStore();
  const location = useLocation();
  const searchInputRef = useRef(null);

  // Compute breadcrumb dynamically based on the current active pathname
  const getBreadcrumbName = () => {
    const path = location.pathname;
    if (path.endsWith('/cases')) return 'Case Files';
    if (path.endsWith('/research')) return 'Research';
    if (path.endsWith('/analytics')) return 'Analytics';
    if (path.endsWith('/documents')) return 'Documents';
    if (path.endsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  // Keyboard shortcut listener for Cmd + K or Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNotificationsClick = () => {
    toast.success('Your workspace is secure. All system protocols are green.', {
      icon: '🛡️',
    });
  };

  const userInitials = `${(user?.firstName || 'R').charAt(0)}${(user?.lastName || 'N').charAt(0)}`.toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-outline-variant/45 px-lg py-md flex justify-between items-center transition-all duration-300">
      
      {/* Mobile Menu & Dynamic Breadcrumbs */}
      <div className="flex items-center gap-sm md:gap-md">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer mr-xs"
          aria-label="Open Navigation Drawer"
        >
          <Menu size={22} />
        </button>

        <nav className="flex items-center text-on-surface-variant font-label-md gap-xs md:gap-sm select-none">
          <span className="text-[12px] md:text-[13px] hover:text-on-surface transition-colors cursor-pointer">
            {user?.firstName ? `${user.firstName} Legal` : 'Proton Legal'}
          </span>
          <ChevronRight size={14} className="text-on-surface-variant/50" />
          <span className="text-on-surface font-semibold text-[12px] md:text-[13px]">{getBreadcrumbName()}</span>
        </nav>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-md md:gap-lg">
        {/* Search Bar - Collapsed on smaller mobile, expanded on md */}
        <div className="relative hidden md:block w-[280px] lg:w-[400px]">
          <input 
            ref={searchInputRef}
            type="text"
            className="w-full h-10 pl-11 pr-16 bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-premium text-[13px]"
            placeholder="Search cases, docs, or ask AI (Cmd + K)" 
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
            <Search size={18} />
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none select-none opacity-85">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant text-[10px] text-on-surface-variant font-mono">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant text-[10px] text-on-surface-variant font-mono">K</kbd>
          </div>
        </div>

        {/* Notifications & Avatar */}
        <div className="flex items-center gap-sm md:gap-md">
          <button 
            onClick={handleNotificationsClick}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest/50 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            aria-label="View notifications log"
          >
            <Bell size={20} />
          </button>
          
          {/* Dynamically Styled Avatar Bubble */}
          <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center select-none cursor-pointer hover:border-primary/80 transition-colors overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} className="w-full h-full object-cover" alt="User Profile Avatar" />
            ) : (
              <span className="font-label-md text-primary font-bold text-[14px]">
                {userInitials}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
