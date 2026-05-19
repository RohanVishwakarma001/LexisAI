import React, { useState, useEffect } from 'react';
import { Users, Shield, Database, Briefcase, FileText, Trash2, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function AdminPanelFirmManagement() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all administrative data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, casesRes, docsRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/cases'),
        api.get('/documents'),
      ]);

      if (usersRes.data?.status === 'success') {
        setUsers(usersRes.data.data.users);
      }
      if (casesRes.data?.status === 'success') {
        setCases(casesRes.data.data.cases);
      }
      if (docsRes.data?.status === 'success') {
        setDocuments(docsRes.data.data.documents);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      toast.error('Failed to load administrative directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchAuditLogs = async () => {
    setIsLogsLoading(true);
    try {
      const res = await api.get('/audit');
      if (res.data?.status === 'success') {
        setAuditLogs(res.data.data.logs || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load system audit trails');
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/auth/users/${userId}/role`, { role: newRole });
      if (res.data?.status === 'success') {
        toast.success(`Role updated successfully to ${newRole}`);
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      const res = await api.delete(`/auth/users/${userId}`);
      if (res.data?.status === 'success') {
        toast.success('User profile deactivated successfully.');
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteCase = async (caseId) => {
    if (!window.confirm('Are you sure you want to permanently delete this case? All associated files will also be permanently deleted.')) return;
    try {
      const res = await api.delete(`/cases/${caseId}`);
      if (res.data?.status === 'success') {
        toast.success('Case and associated files deleted permanently.');
        setCases(cases.filter((c) => c.id !== caseId));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete case');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await api.delete(`/documents/${docId}`);
      if (res.data?.status === 'success') {
        toast.success('Document deleted successfully');
        setDocuments(documents.filter((d) => d.id !== docId));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete document');
    }
  };

  // Filter calculations based on active tab
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    if (activeTab === 'users') {
      return users.filter(
        (u) =>
          u.email.toLowerCase().includes(query) ||
          (u.firstName || '').toLowerCase().includes(query) ||
          (u.lastName || '').toLowerCase().includes(query)
      );
    } else if (activeTab === 'cases') {
      return cases.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          (c.description || '').toLowerCase().includes(query) ||
          (c.client?.email || '').toLowerCase().includes(query)
      );
    } else if (activeTab === 'documents') {
      return documents.filter(
        (d) =>
          d.fileName.toLowerCase().includes(query) ||
          d.fileType.toLowerCase().includes(query) ||
          (d.case?.title || '').toLowerCase().includes(query)
      );
    } else if (activeTab === 'audit') {
      return auditLogs.filter(
        (log) =>
          log.action.toLowerCase().includes(query) ||
          log.entity.toLowerCase().includes(query) ||
          (log.user?.email || '').toLowerCase().includes(query) ||
          (log.user?.firstName || '').toLowerCase().includes(query) ||
          (log.user?.lastName || '').toLowerCase().includes(query)
      );
    }
    return [];
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-lg max-w-container-max mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-headline-lg text-on-surface flex items-center gap-sm">
          <Settings className="text-primary w-8 h-8" />
          LexisAI Admin Operations
        </h1>
        <p className="font-body-md text-on-surface-variant">
          Complete database administration console for users, matters, and documents.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <Card className="border-t-4 border-primary bg-surface-container-low">
          <CardContent className="p-md flex items-center gap-md">
            <div className="p-sm bg-primary-container rounded">
              <Users size={24} className="text-on-primary-container" />
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant uppercase">Total Accounts</p>
              <p className="font-headline-md text-on-surface">{users.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-secondary bg-surface-container-low">
          <CardContent className="p-md flex items-center gap-md">
            <div className="p-sm bg-secondary-container rounded">
              <Briefcase size={24} className="text-on-secondary-container" />
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant uppercase">Total Cases / Matters</p>
              <p className="font-headline-md text-on-surface">{cases.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-tertiary bg-surface-container-low">
          <CardContent className="p-md flex items-center gap-md">
            <div className="p-sm bg-tertiary-container rounded">
              <FileText size={24} className="text-on-tertiary-container" />
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant uppercase">Indexed Documents</p>
              <p className="font-headline-md text-on-surface">{documents.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation & Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-md border-b border-outline-variant/30 pb-sm">
        <div className="flex gap-xs bg-surface-container-low p-xs rounded-lg">
          <button
            onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
            className={`px-lg py-md rounded-md font-label-md transition-all ${
              activeTab === 'users'
                ? 'bg-primary text-on-primary font-bold shadow-md'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => { setActiveTab('cases'); setSearchQuery(''); }}
            className={`px-lg py-md rounded-md font-label-md transition-all ${
              activeTab === 'cases'
                ? 'bg-primary text-on-primary font-bold shadow-md'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            Cases ({cases.length})
          </button>
          <button
            onClick={() => { setActiveTab('documents'); setSearchQuery(''); }}
            className={`px-lg py-md rounded-md font-label-md transition-all ${
              activeTab === 'documents'
                ? 'bg-primary text-on-primary font-bold shadow-md'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            Documents ({documents.length})
          </button>
          <button
            onClick={() => { setActiveTab('audit'); setSearchQuery(''); }}
            className={`px-lg py-md rounded-md font-label-md transition-all ${
              activeTab === 'audit'
                ? 'bg-primary text-on-primary font-bold shadow-md'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            Audit Logs
          </button>
        </div>

        <Input
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={16} />}
          className="w-full md:w-[300px]"
        />
      </div>

      {/* Main Admin Data Tables */}
      <Card className="bg-surface-container-low overflow-hidden">
        {isLoading ? (
          <div className="p-xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
            <p className="mt-md text-on-surface-variant font-body-md">Retrieving live administration records...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'users' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Security Role</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((u) => (
                    <TableRow key={u.id} className="hover:bg-surface-container/30 transition-colors">
                      <TableCell className="font-body-md text-on-surface font-bold">{u.email}</TableCell>
                      <TableCell className="font-body-md text-on-surface-variant">{u.firstName || '-'}</TableCell>
                      <TableCell className="font-body-md text-on-surface-variant">{u.lastName || '-'}</TableCell>
                      <TableCell>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-surface-container border border-outline-variant/50 rounded px-sm py-xs font-body-md text-on-surface focus:outline-none focus:border-primary"
                        >
                          <option value="USER">USER</option>
                          <option value="LAWYER">LAWYER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </TableCell>
                      <TableCell className="font-body-md text-on-surface-variant">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Deactivate User"
                          className="h-8 w-8 p-0 text-error border-error/20 hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <td colSpan="6" className="p-xl text-center font-body-md text-on-surface-variant">
                        No registered users found matching the query.
                      </td>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === 'cases' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Files Count</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((c) => (
                    <TableRow key={c.id} className="hover:bg-surface-container/30 transition-colors">
                      <TableCell className="font-body-md text-on-surface font-bold">{c.title}</TableCell>
                      <TableCell className="font-body-md text-on-surface-variant">{c.client?.email || 'System'}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === 'OPEN' ? 'success' : 'secondary'}>{c.status}</Badge>
                      </TableCell>
                      <TableCell className="font-body-md text-on-surface-variant">
                        {c._count?.documents || 0}
                      </TableCell>
                      <TableCell className="font-body-md text-on-surface-variant">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDeleteCase(c.id)}
                          title="Delete Case permanently"
                          className="h-8 w-8 p-0 text-error border-error/20 hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <td colSpan="6" className="p-xl text-center font-body-md text-on-surface-variant">
                        No active cases found matching the query.
                      </td>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === 'documents' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Case Matter</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((d) => (
                    <TableRow key={d.id} className="hover:bg-surface-container/30 transition-colors">
                      <TableCell className="font-body-md text-on-surface font-bold">{d.fileName}</TableCell>
                      <TableCell className="font-body-md text-on-surface-variant">{d.case?.title || 'Unassigned'}</TableCell>
                      <TableCell className="font-body-md text-on-surface-variant">{d.fileType}</TableCell>
                      <TableCell className="font-body-md text-on-surface-variant">
                        {(d.fileSize / 1024).toFixed(1)} KB
                      </TableCell>
                      <TableCell className="font-body-md text-on-surface-variant">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDeleteDocument(d.id)}
                          title="Delete Document permanently"
                          className="h-8 w-8 p-0 text-error border-error/20 hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <td colSpan="6" className="p-xl text-center font-body-md text-on-surface-variant">
                        No documents found matching the query.
                      </td>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === 'audit' && (
              <div>
                {isLogsLoading ? (
                  <div className="p-xl text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
                    <p className="mt-md text-on-surface-variant font-body-md">Retrieving live audit logs...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User / Role</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Entity ID</TableHead>
                        <TableHead>Metadata</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((log) => (
                        <TableRow key={log.id} className="hover:bg-surface-container/30 transition-colors">
                          <TableCell className="font-body-md text-on-surface-variant whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </TableCell>
                          <TableCell className="font-body-md text-on-surface font-bold">
                            {log.user ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-xs">
                                  <span className="text-[13px]">{log.user.firstName} {log.user.lastName}</span>
                                  <Badge variant="outline" className="text-[9px] px-xs py-0.5">{log.user.role}</Badge>
                                </div>
                                <p className="text-[11px] text-on-surface-variant font-mono">{log.user.email}</p>
                              </div>
                            ) : log.userId ? (
                              <span className="text-[11px] font-mono text-on-surface-variant">{log.userId}</span>
                            ) : (
                              <span className="text-on-surface-variant italic text-[13px]">System Scheduler</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              log.action.includes('DELETE') ? 'destructive' :
                              log.action.includes('CREATE') ? 'success' :
                              log.action.includes('REGISTER') ? 'success' : 'outline'
                            }>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-body-md text-on-surface-variant font-semibold">
                            {log.entity}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-on-surface-variant truncate max-w-[120px]" title={log.entityId}>
                            {log.entityId || '-'}
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate text-[11px] font-mono text-on-surface-variant select-all" title={JSON.stringify(log.metadata)}>
                            {log.metadata ? JSON.stringify(log.metadata) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredData.length === 0 && (
                        <TableRow>
                          <td colSpan="6" className="p-xl text-center font-body-md text-on-surface-variant">
                            No system-wide audit logs found.
                          </td>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
