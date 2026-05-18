import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SharedLayout() {
  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary/30 min-h-screen">
      <Sidebar />
      <main className="ml-[240px] min-h-screen flex flex-col">
        <Topbar />
        <div className="flex-1 p-lg">
          <Outlet />
        </div>
        
        {/* FAB Action (Contextual: Dashboard) */}
        <Button 
          className="fixed bottom-lg right-lg w-14 h-14 rounded-full shadow-lg z-50 p-0"
          size="icon"
        >
          <Plus size={32} />
        </Button>
      </main>
    </div>
  );
}
