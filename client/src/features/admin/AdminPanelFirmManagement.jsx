import React from 'react';
import { Users, Shield, Database, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export default function AdminPanelFirmManagement() {
  return (
    <div className="space-y-lg max-w-container-max mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-lg text-on-surface">Firm Management</h1>
          <p className="font-body-md text-on-surface-variant">Administrative controls for personnel, security, and data.</p>
        </div>
        <Button leftIcon={<Plus size={18} />}>Invite User</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <Card className="border-t-4 border-primary">
          <CardContent className="p-md flex items-center gap-md">
            <div className="p-sm bg-primary-container rounded">
              <Users size={24} className="text-on-primary-container" />
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant uppercase">Total Users</p>
              <p className="font-headline-md text-on-surface">142</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-secondary">
          <CardContent className="p-md flex items-center gap-md">
            <div className="p-sm bg-secondary-container rounded">
              <Shield size={24} className="text-on-secondary-container" />
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant uppercase">Security Score</p>
              <p className="font-headline-md text-on-surface">98/100</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-tertiary">
          <CardContent className="p-md flex items-center gap-md">
            <div className="p-sm bg-tertiary-container rounded">
              <Database size={24} className="text-on-tertiary-container" />
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant uppercase">Storage Used</p>
              <p className="font-headline-md text-on-surface">4.2 TB</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personnel Directory</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { name: 'Sarah Jenkins', role: 'Senior Partner', dept: 'Litigation', status: 'Active' },
              { name: 'Marcus Wright', role: 'Associate', dept: 'Corporate', status: 'Active' },
              { name: 'Elena Rodriguez', role: 'Paralegal', dept: 'Real Estate', status: 'On Leave' },
            ].map((user, i) => (
              <TableRow key={i}>
                <TableCell className="font-body-md text-on-surface font-bold">{user.name}</TableCell>
                <TableCell className="font-body-md text-on-surface-variant">{user.role}</TableCell>
                <TableCell className="font-body-md text-on-surface-variant">{user.dept}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Active' ? 'success' : 'secondary'}>{user.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
