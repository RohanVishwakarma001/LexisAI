import React, { useState, useEffect } from 'react';
import { Layout, Columns, Clock, Search, Filter, Plus, FileText, User, Trash2, ArrowRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import CaseDetailsChatDrawer from './CaseDetailsChatDrawer';

export default function CaseManagementKanbanTimeline() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [newCaseStatus, setNewCaseStatus] = useState('OPEN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState('kanban'); // 'kanban' | 'table'
  const [activeChatCase, setActiveChatCase] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = (caseData) => {
    setActiveChatCase(caseData);
    setIsChatOpen(true);
  };

  // Fetch all cases
  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/cases');
      if (response.data?.status === 'success') {
        setCases(response.data.data.cases);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to load case files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Handle new case submission
  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) {
      toast.error('Case title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/cases', {
        title: newCaseTitle,
        description: newCaseDesc,
        status: newCaseStatus,
      });

      if (response.data?.status === 'success') {
        toast.success('Case file created successfully');
        setNewCaseTitle('');
        setNewCaseDesc('');
        setNewCaseStatus('OPEN');
        setIsModalOpen(false);
        fetchCases();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create case file');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle stage transition
  const handleTransitionStatus = async (caseId, currentStatus) => {
    const statusOrder = ['OPEN', 'IN_PROGRESS', 'CLOSED', 'ARCHIVED'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    try {
      const response = await api.patch(`/cases/${caseId}`, {
        status: nextStatus,
      });

      if (response.data?.status === 'success') {
        toast.success(`Case transitioned to ${nextStatus.replace('_', ' ')}`);
        fetchCases();
      }
    } catch (error) {
      toast.error('Failed to update case stage');
    }
  };

  // Handle delete case
  const handleDeleteCase = async (caseId) => {
    if (!window.confirm('Are you sure you want to delete this case file?')) return;

    try {
      const response = await api.delete(`/cases/${caseId}`);
      if (response.data?.status === 'success') {
        toast.success('Case file deleted successfully');
        fetchCases();
      }
    } catch (error) {
      toast.error('Failed to delete case file');
    }
  };

  // Filter cases based on search
  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Grouped cases for Kanban
  const intakeCases = filteredCases.filter(c => c.status === 'OPEN');
  const discoveryCases = filteredCases.filter(c => c.status === 'IN_PROGRESS');
  const trialCases = filteredCases.filter(c => c.status === 'CLOSED');
  const archivedCases = filteredCases.filter(c => c.status === 'ARCHIVED');

  return (
    <div className="space-y-lg max-w-container-max mx-auto h-[calc(100vh-80px)] flex flex-col relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-lg text-on-surface">Case Files</h1>
          <p className="font-body-md text-on-surface-variant">Manage active litigation, corporate matters, and workflows.</p>
        </div>
        <div className="flex gap-md w-full md:w-auto">
          <Input 
            placeholder="Search cases..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />} 
            className="w-full md:w-[240px]"
          />
          <Button leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>New Case</Button>
        </div>
      </div>

      {/* View Toggles */}
      <div className="flex gap-2 border-b border-outline-variant/30 pb-sm">
        <button 
          onClick={() => setCurrentView('kanban')}
          className={`flex items-center gap-sm px-md py-sm rounded font-label-md transition-colors ${
            currentView === 'kanban' ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <Columns size={16} /> Kanban
        </button>
        <button 
          onClick={() => setCurrentView('table')}
          className={`flex items-center gap-sm px-md py-sm rounded font-label-md transition-colors ${
            currentView === 'table' ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <Layout size={16} /> Table
        </button>
      </div>

      {/* Case content */}
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : currentView === 'kanban' ? (
        /* Kanban Board */
        <div className="flex-1 flex gap-lg overflow-x-auto pb-lg snap-x">
          {/* Column: Intake */}
          <div className="min-w-[300px] w-[300px] bg-surface-container/30 rounded-xl flex flex-col snap-start border border-outline-variant/20">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/80 rounded-t-xl">
              <h3 className="font-label-lg font-bold text-on-surface">Intake (Open)</h3>
              <Badge variant="secondary">{intakeCases.length}</Badge>
            </div>
            <div className="p-md space-y-md overflow-y-auto flex-1">
              {intakeCases.map(c => (
                <CaseCard key={c.id} c={c} onTransition={handleTransitionStatus} onDelete={handleDeleteCase} onOpenChat={handleOpenChat} />
              ))}
              {intakeCases.length === 0 && <EmptyColumn />}
            </div>
          </div>

          {/* Column: Discovery */}
          <div className="min-w-[300px] w-[300px] bg-surface-container/30 rounded-xl flex flex-col snap-start border border-outline-variant/20">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/80 rounded-t-xl">
              <h3 className="font-label-lg font-bold text-on-surface">Discovery</h3>
              <Badge variant="primary">{discoveryCases.length}</Badge>
            </div>
            <div className="p-md space-y-md overflow-y-auto flex-1">
              {discoveryCases.map(c => (
                <CaseCard key={c.id} c={c} onTransition={handleTransitionStatus} onDelete={handleDeleteCase} onOpenChat={handleOpenChat} />
              ))}
              {discoveryCases.length === 0 && <EmptyColumn />}
            </div>
          </div>

          {/* Column: Closed */}
          <div className="min-w-[300px] w-[300px] bg-surface-container/30 rounded-xl flex flex-col snap-start border border-outline-variant/20">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/80 rounded-t-xl">
              <h3 className="font-label-lg font-bold text-on-surface">Closed</h3>
              <Badge variant="success">{trialCases.length}</Badge>
            </div>
            <div className="p-md space-y-md overflow-y-auto flex-1">
              {trialCases.map(c => (
                <CaseCard key={c.id} c={c} onTransition={handleTransitionStatus} onDelete={handleDeleteCase} onOpenChat={handleOpenChat} />
              ))}
              {trialCases.length === 0 && <EmptyColumn />}
            </div>
          </div>

          {/* Column: Archived */}
          <div className="min-w-[300px] w-[300px] bg-surface-container/30 rounded-xl flex flex-col snap-start border border-outline-variant/20">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/80 rounded-t-xl">
              <h3 className="font-label-lg font-bold text-on-surface">Archived</h3>
              <Badge variant="secondary">{archivedCases.length}</Badge>
            </div>
            <div className="p-md space-y-md overflow-y-auto flex-1">
              {archivedCases.map(c => (
                <CaseCard key={c.id} c={c} onTransition={handleTransitionStatus} onDelete={handleDeleteCase} onOpenChat={handleOpenChat} />
              ))}
              {archivedCases.length === 0 && <EmptyColumn />}
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant/30">
                <th className="p-md font-label-md text-on-surface-variant uppercase">Case File</th>
                <th className="p-md font-label-md text-on-surface-variant uppercase">Description</th>
                <th className="p-md font-label-md text-on-surface-variant uppercase">Status</th>
                <th className="p-md font-label-md text-on-surface-variant uppercase">Documents</th>
                <th className="p-md font-label-md text-on-surface-variant uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(c => (
                <tr key={c.id} className="border-b border-outline-variant/10 hover:bg-surface-container/20 transition-colors">
                  <td className="p-md">
                    <p className="font-label-lg text-on-surface font-bold">{c.title}</p>
                    <span className="text-[11px] text-on-surface-variant">ID: {c.id.substring(0, 8)}...</span>
                  </td>
                  <td className="p-md font-body-md text-on-surface-variant max-w-[300px] truncate">
                    {c.description || 'No description provided.'}
                  </td>
                  <td className="p-md">
                    <Badge variant={c.status === 'OPEN' ? 'secondary' : c.status === 'IN_PROGRESS' ? 'primary' : c.status === 'CLOSED' ? 'success' : 'default'}>
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-md font-body-md text-on-surface-variant">
                    {c._count?.documents || 0} Files
                  </td>
                  <td className="p-md text-right">
                    <div className="flex justify-end gap-sm">
                      <Button size="sm" variant="outline" leftIcon={<MessageSquare size={14} />} onClick={() => handleOpenChat(c)}>
                        Chat
                      </Button>
                      <Button size="sm" variant="outline" leftIcon={<ArrowRight size={14} />} onClick={() => handleTransitionStatus(c.id, c.status)}>
                        Progress
                      </Button>
                      <Button size="sm" variant="outline" className="text-error border-error/20 hover:bg-error/10 hover:text-error" onClick={() => handleDeleteCase(c.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-xl text-center font-body-md text-on-surface-variant">
                    No case files found matching search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Case Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-md">
          <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-xl shadow-2xl space-y-lg animate-in fade-in zoom-in duration-200">
            <div>
              <h3 className="font-headline-md text-on-surface">Create New Case File</h3>
              <p className="font-body-md text-on-surface-variant">Initialize a secure workspace for a litigation matter or transaction.</p>
            </div>
            <form onSubmit={handleCreateCase} className="space-y-md">
              <Input 
                label="Case Title" 
                placeholder="Doe v. TechCorp" 
                value={newCaseTitle} 
                onChange={(e) => setNewCaseTitle(e.target.value)}
                required
              />
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">Description</label>
                <textarea
                  className="w-full min-h-[100px] bg-surface-container-low border border-outline-variant/50 rounded-lg p-md text-on-surface font-body-md focus:outline-none focus:border-primary"
                  placeholder="Provide matter description, opposing counsel info, or general briefing details..."
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">Initial Stage</label>
                <select
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg p-md text-on-surface font-body-md focus:outline-none focus:border-primary"
                  value={newCaseStatus}
                  onChange={(e) => setNewCaseStatus(e.target.value)}
                >
                  <option value="OPEN">Intake (Open)</option>
                  <option value="IN_PROGRESS">Discovery (In Progress)</option>
                  <option value="CLOSED">Closed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div className="flex gap-md justify-end pt-md">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting}>Open Case</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Details & Counselor Chat Drawer */}
      <CaseDetailsChatDrawer 
        isOpen={isChatOpen}
        caseData={activeChatCase}
        onClose={() => {
          setIsChatOpen(false);
          setActiveChatCase(null);
        }}
      />
    </div>
  );
}

// Subcomponent: Kanban Case Card
function CaseCard({ c, onTransition, onDelete, onOpenChat }) {
  return (
    <Card className="hover:border-primary/50 transition-all cursor-grab hover:shadow-lg group bg-surface-container-low">
      <CardContent className="p-md space-y-sm">
        <div className="flex justify-between items-start">
          <Badge variant={c.status === 'OPEN' ? 'secondary' : c.status === 'IN_PROGRESS' ? 'primary' : c.status === 'CLOSED' ? 'success' : 'default'}>
            Case
          </Badge>
          <span className="text-[11px] text-on-surface-variant font-mono">#{c.id.substring(0, 5).toUpperCase()}</span>
        </div>
        <h4 onClick={() => onOpenChat(c)} className="font-label-lg font-bold text-on-surface group-hover:text-primary transition-colors cursor-pointer">{c.title}</h4>
        {c.description && <p className="text-[12px] text-on-surface-variant line-clamp-2 leading-relaxed">{c.description}</p>}
        
        <div className="flex items-center justify-between mt-md pt-sm border-t border-outline-variant/20">
          <div className="flex items-center gap-xs text-[11px] text-on-surface-variant">
            <FileText size={12} />
            <span>{c._count?.documents || 0} Docs</span>
          </div>
          <div className="flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onOpenChat(c)} 
              title="Case Counselor Chat" 
              className="p-1 hover:bg-surface-container-high rounded text-primary"
            >
              <MessageSquare size={14} />
            </button>
            <button 
              onClick={() => onTransition(c.id, c.status)} 
              title="Move to Next Stage" 
              className="p-1 hover:bg-surface-container-high rounded text-primary"
            >
              <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => onDelete(c.id)} 
              title="Delete Case File" 
              className="p-1 hover:bg-surface-container-high rounded text-error"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Subcomponent: Empty stage state
function EmptyColumn() {
  return (
    <div className="p-xl text-center border-2 border-dashed border-outline-variant/15 rounded-lg font-body-md text-on-surface-variant/40 py-[40px]">
      No matters.
    </div>
  );
}
