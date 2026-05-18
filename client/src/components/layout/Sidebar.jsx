import React from 'react';
import { NavLink } from 'react-router-dom';
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
  User 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function Sidebar() {
  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/dashboard/cases", icon: <FolderOpen size={20} />, label: "Case Files" },
    { to: "/dashboard/research", icon: <Scale size={20} />, label: "Research" },
    { to: "/dashboard/analytics", icon: <BarChart size={20} />, label: "Analytics" },
    { to: "/dashboard/documents", icon: <FileText size={20} />, label: "Documents" },
    { to: "/dashboard/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-surface-container-low border-r border-outline-variant/30 flex flex-col py-lg z-40">
      <div className="px-md mb-xl">
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Gavel className="text-on-primary" size={20} />
          </div>
          <div>
            <h2 className="font-headline-md text-[18px] tracking-tighter text-on-surface">LexisAI Pro</h2>
            <p className="font-label-sm text-[12px] text-on-surface-variant opacity-70">Enterprise Legal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-sm space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) => cn(
              "flex items-center gap-md px-md py-md rounded-md font-label-md transition-all duration-200",
              isActive 
                ? "text-on-surface font-bold bg-surface-container-high border-l-4 border-primary" 
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-md mt-auto pt-md space-y-4">
        <Button className="w-full" leftIcon={<Plus size={18} />}>
          New Analysis
        </Button>
        <div className="border-t border-outline-variant/30 pt-md space-y-1">
          <NavLink className="flex items-center gap-md px-md py-md rounded-md text-on-surface-variant hover:bg-surface-container-highest transition-all duration-200" to="/support">
            <HelpCircle size={20} />
            <span className="font-label-md">Support</span>
          </NavLink>
          <NavLink className="flex items-center gap-md px-md py-md rounded-md text-on-surface-variant hover:bg-surface-container-highest transition-all duration-200" to="/profile">
            <User size={20} />
            <span className="font-label-md">Profile</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
