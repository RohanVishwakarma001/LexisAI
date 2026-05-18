import React from 'react';
import { 
  Sparkles, TrendingUp, AlertTriangle, Timer, CheckCircle, 
  FileText, Image as ImageIcon, File, User, Clock, 
  ChevronLeft, ChevronRight, MoreHorizontal, Gavel, Users 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

export default function MainDashboard() {
  return (
    <div className="space-y-lg max-w-container-max mx-auto">
      {/* Hero / AI Insight Section */}
      <section className="ai-glow rounded-xl p-lg bg-surface-container-lowest/40 backdrop-blur-sm flex flex-col md:flex-row gap-lg items-center border border-primary/10">
        <div className="flex-1 space-y-md">
          <div className="flex items-center gap-sm">
            <Sparkles className="text-secondary" size={20} />
            <span className="font-label-md text-secondary tracking-widest uppercase">AI Intelligence Brief</span>
          </div>
          <h1 className="font-headline-lg text-on-surface">Good morning, Counsel.</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">
            Based on overnight updates in <span className="text-primary font-bold">State v. Anderson</span>, the opposing counsel has filed a motion to suppress. AI analysis suggests a 78% probability of success for our counter-argument based on the newly discovered precinct logs.
          </p>
          <div className="flex gap-md">
            <Button>Review Motion</Button>
            <Button variant="outline">Generate Response</Button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <Card>
          <CardContent className="p-md space-y-xs">
            <p className="font-label-md text-on-surface-variant uppercase">Active Cases</p>
            <p className="font-headline-lg text-on-surface">24</p>
            <div className="text-[12px] text-primary flex items-center gap-1 font-label-md">
              <TrendingUp size={14} />
              <span>+2 from last week</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-md space-y-xs">
            <p className="font-label-md text-on-surface-variant uppercase">Pending Filings</p>
            <p className="font-headline-lg text-on-surface">12</p>
            <div className="text-[12px] text-error flex items-center gap-1 font-label-md">
              <AlertTriangle size={14} />
              <span>3 urgent tasks</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-md space-y-xs">
            <p className="font-label-md text-on-surface-variant uppercase">Billable Hours (MTD)</p>
            <p className="font-headline-lg text-on-surface">142.5</p>
            <div className="text-[12px] text-secondary flex items-center gap-1 font-label-md">
              <Timer size={14} />
              <span>85% of target</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-md space-y-xs">
            <p className="font-label-md text-on-surface-variant uppercase">Documents Analyzed</p>
            <p className="font-headline-lg text-on-surface">1.2k</p>
            <div className="text-[12px] text-on-surface-variant/50 flex items-center gap-1 font-label-md">
              <CheckCircle size={14} />
              <span>SOC2 Compliant</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Layout Grid: Bento Style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Recent Documents: Table (Col 1-8) */}
        <Card className="lg:col-span-8 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <button className="text-primary font-label-md hover:underline">View All</button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Case ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-md">
                    <FileText className="text-on-surface-variant" size={20} />
                    <div>
                      <p className="font-body-md text-on-surface group-hover:text-primary transition-colors">deposition_voluntary.pdf</p>
                      <p className="text-[12px] text-on-surface-variant">PDF • 4.2 MB</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-body-md text-on-surface-variant">#L-2024-098</TableCell>
                <TableCell><Badge variant="secondary">Summary Ready</Badge></TableCell>
                <TableCell className="font-body-md text-on-surface-variant">2h ago</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-md">
                    <ImageIcon className="text-on-surface-variant" size={20} />
                    <div>
                      <p className="font-body-md text-on-surface group-hover:text-primary transition-colors">exhibit_A_scene.jpg</p>
                      <p className="text-[12px] text-on-surface-variant">IMG • 8.1 MB</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-body-md text-on-surface-variant">#L-2024-098</TableCell>
                <TableCell><Badge variant="primary">OCR Processing</Badge></TableCell>
                <TableCell className="font-body-md text-on-surface-variant">4h ago</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        {/* Activity Feed (Col 9-12) */}
        <Card className="lg:col-span-4 flex flex-col h-[400px]">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-lg">
            <div className="flex gap-md relative">
              <div className="absolute left-4 top-10 bottom-0 w-[1px] bg-outline-variant/30"></div>
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 z-10">
                <User size={16} className="text-on-primary-container" />
              </div>
              <div className="space-y-1">
                <p className="font-body-md text-on-surface">
                  <span className="font-bold">Sarah Jenkins</span> added a comment
                </p>
                <p className="text-[12px] text-on-surface-variant">15 mins ago</p>
              </div>
            </div>
            <div className="flex gap-md relative">
              <div className="absolute left-4 top-10 bottom-0 w-[1px] bg-outline-variant/30"></div>
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0 z-10">
                <Sparkles size={16} className="text-on-secondary-container" />
              </div>
              <div className="space-y-1">
                <p className="font-body-md text-on-surface">
                  <span className="font-bold">AI Agent</span> completed cross-reference
                </p>
                <p className="text-[12px] text-on-surface-variant">42 mins ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
