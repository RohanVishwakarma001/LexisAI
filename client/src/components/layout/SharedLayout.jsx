import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Plus, FolderPlus, FileUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function SharedLayout() {
  const [isDialOpen, setIsDialOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dialRef = useRef(null);

  // Close speed dial when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialRef.current && !dialRef.current.contains(event.target)) {
        setIsDialOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (route, message) => {
    setIsDialOpen(false);
    navigate(route);
    if (message) {
      toast.success(message);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary/30 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="lg:ml-[240px] ml-0 min-h-screen flex flex-col transition-all duration-300 ease-in-out">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <div className="flex-1 p-lg relative pb-[100px]">
          <Outlet />
        </div>
        
        {/* Dynamic Speed Dial Action Component */}
        <div ref={dialRef} className="fixed bottom-lg right-lg z-50 flex flex-col items-end gap-sm">
          {/* Expanded Speed Dial Shortcuts */}
          {isDialOpen && (
            <div className="flex flex-col gap-sm items-end animate-in fade-in slide-in-from-bottom-5 duration-200">
              {/* Shortcut: Create Case */}
              <button 
                onClick={() => handleAction('/dashboard/cases', 'Redirected to Case Files Board')}
                className="flex items-center gap-sm bg-surface-container-high border border-outline-variant/40 px-md py-sm rounded-full shadow-md text-on-surface hover:bg-surface-container-highest transition-all duration-150 cursor-pointer"
              >
                <span className="text-[12px] font-label-md">New Legal Case</span>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <FolderPlus size={16} />
                </div>
              </button>

              {/* Shortcut: Upload Document */}
              <button 
                onClick={() => handleAction('/dashboard/documents', 'Redirected to Document Vault Ingestion')}
                className="flex items-center gap-sm bg-surface-container-high border border-outline-variant/40 px-md py-sm rounded-full shadow-md text-on-surface hover:bg-surface-container-highest transition-all duration-150 cursor-pointer"
              >
                <span className="text-[12px] font-label-md">Upload Vault Evidence</span>
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                  <FileUp size={16} />
                </div>
              </button>

              {/* Shortcut: Ask AI Research */}
              <button 
                onClick={() => handleAction('/dashboard/research', 'Co-Counsel initialized')}
                className="flex items-center gap-sm bg-surface-container-high border border-outline-variant/40 px-md py-sm rounded-full shadow-md text-on-surface hover:bg-surface-container-highest transition-all duration-150 cursor-pointer"
              >
                <span className="text-[12px] font-label-md">Ask AI Co-Counsel</span>
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success animate-pulse">
                  <Sparkles size={16} />
                </div>
              </button>
            </div>
          )}

          {/* Core Floating Action Button */}
          <button 
            onClick={() => setIsDialOpen(!isDialOpen)}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-on-primary bg-primary hover:bg-primary/95 transition-all duration-300 transform cursor-pointer ${
              isDialOpen ? 'rotate-45 bg-error hover:bg-error/95' : ''
            }`}
          >
            <Plus size={28} />
          </button>
        </div>
      </main>
    </div>
  );
}
