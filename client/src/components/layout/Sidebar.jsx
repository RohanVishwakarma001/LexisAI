import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Gavel, 
  LayoutDashboard, 
  FolderOpen, 
  Scale, 
  BarChart, 
  FileText, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function Sidebar({ isOpen, onClose }) {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/dashboard/cases", icon: <FolderOpen size={20} />, label: "Case Files" },
    { to: "/dashboard/research", icon: <Scale size={20} />, label: "Research" },
    { to: "/dashboard/analytics", icon: <BarChart size={20} />, label: "Analytics" },
    { to: "/dashboard/documents", icon: <FileText size={20} />, label: "Documents" },
    { to: "/dashboard/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  const handleNewAnalysisClick = () => {
    navigate('/dashboard/research');
    toast.success('Co-counsel legal drafting suite initialized.');
    if (onClose) onClose();
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-200" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside 
        className={cn(
          "fixed left-0 top-0 h-full w-[240px] bg-surface-container-low border-r border-outline-variant/30 flex flex-col py-lg z-40 transition-all duration-300 ease-in-out",
          "lg:translate-x-0 lg:left-0", // On large screens, lock to screen
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0" // On mobile, slide drawer
        )}
      >
        {/* Mobile Sidebar Close Button */}
        <div className="lg:hidden absolute right-4 top-4">
          <button 
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-highest transition-colors cursor-pointer"
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Brand Logo Header */}
        <div className="px-md mb-xl">
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shrink-0 shadow-md">
              <Gavel className="text-on-primary" size={20} />
            </div>
            <div>
              <h2 className="font-headline-md text-[18px] tracking-tighter text-on-surface font-semibold">LexisAI Pro</h2>
              <p className="font-label-sm text-[12px] text-on-surface-variant opacity-70">Enterprise Legal</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Registry */}
        <nav className="flex-1 px-sm space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              onClick={handleLinkClick}
              className={({ isActive }) => cn(
                "flex items-center gap-md px-md py-md rounded-lg font-label-md transition-all duration-200",
                isActive 
                  ? "text-on-surface font-bold bg-surface-container-high border-l-4 border-primary shadow-sm" 
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent"
              )}
            >
              <div className="shrink-0">{item.icon}</div>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Support & Action Controls */}
        <div className="px-md mt-auto pt-md space-y-4">
          <Button 
            className="w-full shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all" 
            leftIcon={<Plus size={18} />}
            onClick={handleNewAnalysisClick}
          >
            New Analysis
          </Button>
          
          <div className="border-t border-outline-variant/30 pt-md space-y-1">
            <NavLink 
              className="flex items-center gap-md px-md py-md rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-all duration-200" 
              to="/dashboard"
              onClick={() => {
                toast.success('Help desk portal simulation');
                handleLinkClick();
              }}
            >
              <HelpCircle size={20} />
              <span className="font-label-md">Support</span>
            </NavLink>
            <button 
              onClick={() => {
                logout();
                handleLinkClick();
              }}
              className="w-full flex items-center gap-md px-md py-md rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-error transition-all duration-200 text-left cursor-pointer"
            >
              <LogOut size={20} />
              <span className="font-label-md">Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
