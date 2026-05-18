import React from 'react';
import { Layout, Columns, Clock, Search, Filter, Plus, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

export default function CaseManagementKanbanTimeline() {
  return (
    <div className="space-y-lg max-w-container-max mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-lg text-on-surface">Case Files</h1>
          <p className="font-body-md text-on-surface-variant">Manage active litigation, corporate matters, and workflows.</p>
        </div>
        <div className="flex gap-md w-full md:w-auto">
          <Input 
            placeholder="Search cases..." 
            leftIcon={<Search size={18} />} 
            className="w-full md:w-[240px]"
          />
          <Button variant="outline" leftIcon={<Filter size={18} />}>Filter</Button>
          <Button leftIcon={<Plus size={18} />}>New Case</Button>
        </div>
      </div>

      {/* View Toggles */}
      <div className="flex gap-2 border-b border-outline-variant/30 pb-sm">
        <button className="flex items-center gap-sm px-md py-sm rounded bg-surface-container-high text-on-surface font-label-md">
          <Columns size={16} /> Kanban
        </button>
        <button className="flex items-center gap-sm px-md py-sm rounded hover:bg-surface-container-high text-on-surface-variant font-label-md transition-colors">
          <Layout size={16} /> Table
        </button>
        <button className="flex items-center gap-sm px-md py-sm rounded hover:bg-surface-container-high text-on-surface-variant font-label-md transition-colors">
          <Clock size={16} /> Timeline
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-lg overflow-x-auto pb-lg snap-x">
        {/* Column: Intake */}
        <div className="min-w-[320px] w-[320px] bg-surface-container/50 rounded-xl flex flex-col snap-start">
          <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high rounded-t-xl">
            <h3 className="font-headline-md text-on-surface">Intake</h3>
            <Badge variant="secondary">3</Badge>
          </div>
          <div className="p-md space-y-md overflow-y-auto flex-1">
            <Card className="hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing">
              <CardContent className="p-md space-y-sm">
                <div className="flex justify-between items-start">
                  <Badge variant="error">Urgent</Badge>
                  <span className="text-[12px] text-on-surface-variant">#C-889</span>
                </div>
                <h4 className="font-label-lg font-bold text-on-surface">Doe v. TechCorp</h4>
                <p className="text-[12px] text-on-surface-variant line-clamp-2">Initial complaint review and conflict check required.</p>
                <div className="flex items-center gap-sm mt-md pt-sm border-t border-outline-variant/20">
                  <User size={14} className="text-on-surface-variant" />
                  <span className="text-[12px] text-on-surface-variant">Assigned to: Unassigned</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Column: Discovery */}
        <div className="min-w-[320px] w-[320px] bg-surface-container/50 rounded-xl flex flex-col snap-start">
          <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high rounded-t-xl">
            <h3 className="font-headline-md text-on-surface">Discovery</h3>
            <Badge variant="primary">2</Badge>
          </div>
          <div className="p-md space-y-md overflow-y-auto flex-1">
            <Card className="hover:border-primary/50 transition-colors cursor-grab">
              <CardContent className="p-md space-y-sm">
                <div className="flex justify-between items-start">
                  <Badge variant="default">Corporate</Badge>
                  <span className="text-[12px] text-on-surface-variant">#C-842</span>
                </div>
                <h4 className="font-label-lg font-bold text-on-surface">Merger Acquisition - Global</h4>
                <p className="text-[12px] text-on-surface-variant line-clamp-2">Reviewing financial disclosures and vendor contracts.</p>
                <div className="flex items-center gap-sm mt-md pt-sm border-t border-outline-variant/20">
                  <FileText size={14} className="text-on-surface-variant" />
                  <span className="text-[12px] text-on-surface-variant">14 Docs Pending</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Column */}
        <button className="min-w-[320px] w-[320px] bg-surface-container-lowest border-2 border-dashed border-outline-variant/30 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-surface-container-lowest/80 transition-all">
          <div className="flex flex-col items-center gap-sm">
            <Plus size={24} />
            <span className="font-label-md">Add Stage</span>
          </div>
        </button>
      </div>
    </div>
  );
}
