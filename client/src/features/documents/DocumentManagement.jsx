import React from 'react';
import { UploadCloud, FileText, Folder, MoreVertical, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export default function DocumentManagement() {
  return (
    <div className="space-y-lg max-w-container-max mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-lg text-on-surface">Document Vault</h1>
          <p className="font-body-md text-on-surface-variant">Secure, searchable storage with AI-powered indexing.</p>
        </div>
        <div className="flex gap-md">
          <Button leftIcon={<UploadCloud size={18} />}>Upload Files</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-md">
        <Input 
          placeholder="Search documents by content or metadata..." 
          leftIcon={<Search size={18} />} 
          className="flex-1"
        />
        <Button variant="outline" leftIcon={<Filter size={18} />}>Filters</Button>
      </div>

      {/* Folders Grid */}
      <div>
        <h2 className="font-label-lg text-on-surface-variant mb-md uppercase tracking-wider">Quick Access Folders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-md">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="p-md flex items-center gap-md">
                <div className="w-10 h-10 bg-surface-container-high rounded flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Folder className="text-on-surface-variant group-hover:text-primary transition-colors" size={20} />
                </div>
                <div>
                  <h4 className="font-label-md text-on-surface group-hover:text-primary transition-colors">Case #{800 + i}</h4>
                  <p className="text-[12px] text-on-surface-variant">12 items</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Files List */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-md">
                    <FileText className="text-primary" size={20} />
                    <span className="font-body-md text-on-surface hover:text-primary cursor-pointer transition-colors">
                      Deposition_Transcript_Vol{i}.pdf
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-body-md text-on-surface-variant">PDF</TableCell>
                <TableCell className="font-body-md text-on-surface-variant">4.2 MB</TableCell>
                <TableCell><Badge variant="success">Indexed</Badge></TableCell>
                <TableCell className="font-body-md text-on-surface-variant">Oct {10 + i}, 2024</TableCell>
                <TableCell className="text-right">
                  <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded">
                    <MoreVertical size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
