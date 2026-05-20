import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, AlertTriangle, Timer, CheckCircle, 
  FileText, Image as ImageIcon, Clock, ChevronRight, FileCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function MainDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch overview metrics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/analytics/overview');
        if (response.data?.status === 'success') {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to sync executive stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Format bytes
  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-lg max-w-container-max mx-auto px-xs md:px-0 animate-pulse">
        {/* Hero Banner Skeleton */}
        <div className="h-32 bg-surface-container-high/40 rounded-xl border border-outline-variant/20" />
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-surface-container-low border border-outline-variant/20 rounded-xl p-md flex flex-col justify-between">
              <div className="h-3.5 w-1/3 bg-surface-container-highest rounded" />
              <div className="h-6 w-1/2 bg-surface-container-highest rounded" />
              <div className="h-3 w-1/4 bg-surface-container-highest rounded" />
            </div>
          ))}
        </div>

        {/* Main Bento Layout Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-8 h-80 bg-surface-container-low border border-outline-variant/20 rounded-xl p-md space-y-md">
            <div className="h-6 w-1/4 bg-surface-container-highest rounded" />
            <div className="space-y-sm">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-surface-container-highest/50 rounded" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 h-80 bg-surface-container-low border border-outline-variant/20 rounded-xl p-md space-y-md">
            <div className="h-6 w-1/3 bg-surface-container-highest rounded" />
            <div className="space-y-sm">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-surface-container-highest/50 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback defaults
  const activeCases = stats?.activeCases ?? 0;
  const pendingFilings = stats?.pendingFilings ?? 0;
  const billableHours = stats?.billableHours ?? 0.0;
  const documentsAnalyzed = stats?.documentsAnalyzed ?? 0;
  const recentDocuments = stats?.recentDocuments ?? [];

  return (
    <div className="space-y-lg max-w-container-max mx-auto px-xs md:px-0 transition-all duration-300">
      
      {/* Hero / AI Brief Section */}
      <section className="ai-glow rounded-xl p-md md:p-lg bg-surface-container-lowest/40 backdrop-blur-sm flex flex-col md:flex-row gap-lg items-center border border-primary/10 transition-premium hover:border-primary/20">
        <div className="flex-1 space-y-md">
          <div className="flex items-center gap-sm">
            <Sparkles className="text-secondary animate-pulse" size={20} />
            <span className="font-label-md text-secondary tracking-widest uppercase text-[10px] font-semibold">AI Intelligence Brief</span>
          </div>
          <h1 className="font-headline-lg text-on-surface text-[22px] md:text-[28px] font-semibold tracking-tight">
            Welcome back, Counsel {user?.firstName || 'User'}.
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed text-[14px] md:text-[15px]">
            {activeCases > 0 ? (
              <>
                You have <span className="text-primary font-bold">{activeCases} active case files</span> and <span className="text-secondary font-bold">{documentsAnalyzed} indexed files</span> in your secure vault. LexisAI co-counsel briefs are compiled and ready inside the Research tab.
              </>
            ) : (
              <>
                Welcome to your secure legal sandbox. To begin, click **Case Files** in the sidebar to initialize your first litigation matter, then upload briefs into the **Document Vault**.
              </>
            )}
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <Card className="bento-card">
          <CardContent className="p-md space-y-xs">
            <p className="font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-semibold">Active Cases</p>
            <p className="font-headline-lg text-on-surface text-[26px] font-semibold">{activeCases}</p>
            <div className="text-[12px] text-primary flex items-center gap-1 font-label-md">
              <TrendingUp size={14} className="shrink-0" />
              <span>Live in PostgreSQL</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card">
          <CardContent className="p-md space-y-xs">
            <p className="font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-semibold">Pending Tasks</p>
            <p className="font-headline-lg text-on-surface text-[26px] font-semibold">{pendingFilings}</p>
            <div className="text-[12px] text-error flex items-center gap-1 font-label-md">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{pendingFilings > 0 ? `${pendingFilings} matters open` : 'All tasks cleared'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card">
          <CardContent className="p-md space-y-xs">
            <p className="font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-semibold">Billable Hours (MTD)</p>
            <p className="font-headline-lg text-on-surface text-[26px] font-semibold">{billableHours}</p>
            <div className="text-[12px] text-secondary flex items-center gap-1 font-label-md">
              <Timer size={14} className="shrink-0" />
              <span>Caseload ratio</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card">
          <CardContent className="p-md space-y-xs">
            <p className="font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-semibold">Documents Indexed</p>
            <p className="font-headline-lg text-on-surface text-[26px] font-semibold">{documentsAnalyzed}</p>
            <div className="text-[12px] text-success flex items-center gap-1 font-label-md">
              <CheckCircle size={14} className="shrink-0" />
              <span>AI Summary Ready</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Recent Documents Table (Col 1-8) */}
        <Card className="lg:col-span-8 flex flex-col bento-card overflow-hidden">
          <CardHeader className="flex justify-between items-center pb-sm border-b border-outline-variant/20 px-md md:px-lg">
            <CardTitle className="text-[16px] md:text-[18px] font-semibold">Recent Vault Documents</CardTitle>
            <Link to="/dashboard/documents" className="text-primary font-label-md hover:underline flex items-center gap-xs text-[12px]">
              Vault View <ChevronRight size={14} />
            </Link>
          </CardHeader>
          
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Assigned Case</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDocuments.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-md truncate max-w-[240px]">
                        {doc.fileType === 'PDF' ? (
                          <FileText className="text-primary shrink-0" size={18} />
                        ) : ['PNG', 'JPG', 'JPEG'].includes(doc.fileType) ? (
                          <ImageIcon className="text-secondary shrink-0" size={18} />
                        ) : (
                          <FileCode className="text-on-surface-variant shrink-0" size={18} />
                        )}
                        <div className="truncate">
                          <p className="font-body-md text-on-surface truncate text-[13px] md:text-[14px]">{doc.fileName}</p>
                          <p className="text-[10px] text-on-surface-variant font-mono">#{doc.id.substring(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-body-md text-on-surface-variant truncate max-w-[140px] text-[13px] md:text-[14px]">
                      {doc.case?.title || 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">Indexed</Badge>
                    </TableCell>
                    <TableCell className="font-body-md text-on-surface-variant whitespace-nowrap text-[13px] md:text-[14px]">
                      {formatBytes(doc.fileSize)}
                    </TableCell>
                  </TableRow>
                ))}
                {recentDocuments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-xl text-center font-body-md text-on-surface-variant text-[13px] md:text-[14px]">
                      No files recently uploaded. Visit the Documents tab to add discovery evidence.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Dynamic Activity Feed (Col 9-12) */}
        <Card className="lg:col-span-4 flex flex-col bento-card max-h-[400px]">
          <CardHeader className="border-b border-outline-variant/20 px-md md:px-lg">
            <CardTitle className="text-[16px] md:text-[18px] font-semibold">Recent Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-lg pb-md scrollbar-thin">
            {recentDocuments.map((doc, idx) => (
              <div key={doc.id} className="flex gap-md relative">
                {idx < recentDocuments.length - 1 && (
                  <div className="absolute left-[15px] top-10 bottom-[-20px] w-[1px] bg-outline-variant/20"></div>
                )}
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 z-10">
                  <FileText size={14} className="text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-body-md text-on-surface text-[12px] md:text-[13px] leading-snug">
                    Document <span className="font-bold text-primary">{doc.fileName}</span> was uploaded and AI-indexed under <span className="font-bold">{doc.case?.title}</span>.
                  </p>
                  <p className="text-[10px] text-on-surface-variant flex items-center gap-xs font-medium">
                    <Clock size={10} className="shrink-0" />
                    {new Date(doc.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {activeCases > 0 && recentDocuments.length === 0 && (
              <div className="flex gap-md relative">
                <div className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0 z-10">
                  <TrendingUp size={14} className="text-secondary" />
                </div>
                <div className="space-y-1">
                  <p className="font-body-md text-on-surface text-[12px] md:text-[13px] leading-snug">
                    Case files database loaded. Total caseload set to <span className="font-bold text-secondary">{activeCases} active matters</span>.
                  </p>
                </div>
              </div>
            )}

            {activeCases === 0 && (
              <div className="text-center py-xl text-on-surface-variant font-body-md text-[13px] md:text-[14px]">
                No recent actions recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
