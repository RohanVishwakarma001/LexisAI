import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Folder, Trash2, Search, Filter, X, Sparkles, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function DocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Selected document for AI inspection panel
  const [activeDoc, setActiveDoc] = useState(null);

  // Fetch documents and cases
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const docsResponse = await api.get('/documents');
      const casesResponse = await api.get('/cases');
      
      if (docsResponse.data?.status === 'success') {
        setDocuments(docsResponse.data.data.documents);
      }
      if (casesResponse.data?.status === 'success') {
        setCases(casesResponse.data.data.cases);
        if (casesResponse.data.data.cases.length > 0) {
          setSelectedCaseId(casesResponse.data.data.cases[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching vault data:', error);
      toast.error('Failed to load document vault');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format bytes
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Handle file select
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle upload submit
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please choose a file to upload');
      return;
    }
    if (!selectedCaseId) {
      toast.error('Please assign this document to a case file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('caseId', selectedCaseId);

    setIsUploading(true);
    try {
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.status === 'success') {
        toast.success('Document uploaded & AI indexed successfully!');
        setIsUploadOpen(false);
        setSelectedFile(null);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to index file');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete document
  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const response = await api.delete(`/documents/${id}`);
      if (response.data?.status === 'success') {
        toast.success('Document removed');
        if (activeDoc && activeDoc.id === id) {
          setActiveDoc(null);
        }
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to remove document');
    }
  };

  // Filter docs
  const filteredDocs = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.case?.title && doc.case.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-lg max-w-container-max mx-auto relative flex flex-col lg:flex-row gap-lg items-start">
      
      {/* Main Content Area */}
      <div className="flex-1 space-y-lg w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
          <div>
            <h1 className="font-headline-lg text-on-surface">Document Vault</h1>
            <p className="font-body-md text-on-surface-variant">Secure, searchable storage with AI-powered indexing.</p>
          </div>
          <div className="flex gap-md">
            <Button leftIcon={<UploadCloud size={18} />} onClick={() => setIsUploadOpen(true)}>Upload File</Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-md">
          <Input 
            placeholder="Search documents by filename or case association..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />} 
            className="flex-1"
          />
        </div>

        {/* Folders Grid (Live Cases shortcut) */}
        <div>
          <h2 className="font-label-lg text-on-surface-variant mb-md uppercase tracking-wider">Active Matters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-md">
            {cases.slice(0, 4).map((c) => (
              <Card 
                key={c.id} 
                onClick={() => setSearchQuery(c.title)}
                className="hover:border-primary/50 transition-colors cursor-pointer group bg-surface-container-low"
              >
                <CardContent className="p-md flex items-center gap-md">
                  <div className="w-10 h-10 bg-surface-container-high rounded flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Folder className="text-on-surface-variant group-hover:text-primary transition-colors" size={20} />
                  </div>
                  <div className="truncate flex-1">
                    <h4 className="font-label-md text-on-surface group-hover:text-primary transition-colors truncate">{c.title}</h4>
                    <p className="text-[11px] text-on-surface-variant">{c._count?.documents || 0} items</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {cases.length === 0 && (
              <div className="col-span-4 text-center p-md bg-surface-container-low/30 border border-dashed border-outline-variant/10 rounded-lg text-on-surface-variant">
                No active matters. Create a case file to begin.
              </div>
            )}
          </div>
        </div>

        {/* Files list */}
        <Card className="bg-surface-container-low overflow-hidden">
          {isLoading ? (
            <div className="p-xl text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Case File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-surface-container/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-md truncate max-w-[240px]">
                        <FileText className="text-primary shrink-0" size={20} />
                        <span 
                          onClick={() => setActiveDoc(doc)}
                          className="font-body-md text-on-surface hover:text-primary cursor-pointer transition-colors truncate"
                          title="Click to view AI Analysis"
                        >
                          {doc.fileName}
                        </span>
                      </div>
                    </TableCell>
                    <td className="p-md font-body-md text-on-surface-variant truncate max-w-[140px]">
                      {doc.case?.title || 'Unassigned'}
                    </td>
                    <TableCell className="font-body-md text-on-surface-variant">{doc.fileType}</TableCell>
                    <TableCell className="font-body-md text-on-surface-variant">{formatBytes(doc.fileSize)}</TableCell>
                    <TableCell>
                      <Badge variant="success">Indexed</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-xs">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => setActiveDoc(doc)} 
                          title="Inspect AI insights"
                          className="h-8 w-8 p-0"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => handleDeleteDoc(doc.id)} 
                          title="Remove document"
                          className="h-8 w-8 p-0 text-error border-error/20 hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDocs.length === 0 && (
                  <TableRow>
                    <td colSpan="6" className="p-xl text-center font-body-md text-on-surface-variant">
                      No documents stored in vault. Click "Upload File" to add discovery materials.
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Side-Drawer Panel: AI OCR and Summaries */}
      {activeDoc && (
        <div className="w-full lg:w-[360px] bg-surface-container-high/90 backdrop-blur-md rounded-xl border border-outline-variant/30 p-lg shadow-xl shrink-0 space-y-lg animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-md">
            <h3 className="font-headline-md text-on-surface flex items-center gap-xs">
              <Sparkles className="text-secondary shrink-0" size={18} />
              AI Intelligence
            </h3>
            <button 
              onClick={() => setActiveDoc(null)} 
              className="p-1 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-sm">
            <div className="flex items-center gap-sm">
              <FileText className="text-primary shrink-0" size={24} />
              <div className="truncate">
                <p className="font-label-lg font-bold text-on-surface truncate">{activeDoc.fileName}</p>
                <span className="text-[11px] text-on-surface-variant">{activeDoc.fileType} • {formatBytes(activeDoc.fileSize)}</span>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant flex items-center gap-xs">
              <Clock size={12} />
              Uploaded on {new Date(activeDoc.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* AI Summary Block */}
          <div className="space-y-xs">
            <h4 className="font-label-md text-secondary uppercase tracking-widest text-[10px]">AI Executive Summary</h4>
            <div className="p-md bg-surface-container-low rounded-lg border border-secondary/10">
              <p className="font-body-md text-on-surface leading-relaxed">
                {activeDoc.metadata?.aiSummary || 'AI Summary parsing is complete.'}
              </p>
            </div>
          </div>

          {/* OCR text block */}
          <div className="space-y-xs">
            <h4 className="font-label-md text-primary uppercase tracking-widest text-[10px]">OCR Text Index Preview</h4>
            <div className="p-md bg-surface-container-low rounded-lg border border-primary/10 max-h-[160px] overflow-y-auto font-mono text-[11px] text-on-surface-variant leading-relaxed">
              {activeDoc.metadata?.ocrText || 'No OCR transcript available.'}
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal Dialog */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-md">
          <div className="w-full max-w-[460px] bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-xl shadow-2xl space-y-lg animate-in fade-in zoom-in duration-200">
            <div>
              <h3 className="font-headline-md text-on-surface flex items-center gap-sm">
                <UploadCloud className="text-primary" size={24} />
                Upload Discovery Document
              </h3>
              <p className="font-body-md text-on-surface-variant">Your files will be automatically indexed, scanned via OCR, and briefed by AI.</p>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="space-y-md">
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">Select Matter (Case File)</label>
                <select
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg p-md text-on-surface font-body-md focus:outline-none focus:border-primary"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  required
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                  {cases.length === 0 && (
                    <option disabled>No cases active. Please create a case first.</option>
                  )}
                </select>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">Choose File</label>
                <div className="border-2 border-dashed border-outline-variant/40 hover:border-primary/50 transition-colors rounded-lg p-xl text-center cursor-pointer relative bg-surface-container-low/30">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                  />
                  <div className="flex flex-col items-center gap-xs text-on-surface-variant">
                    <UploadCloud size={32} className="text-on-surface-variant/70" />
                    {selectedFile ? (
                      <p className="font-label-md text-primary font-bold">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="font-label-md">Click to choose document</p>
                        <p className="text-[10px]">PDF, DOCX, TXT, or Image (Max 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-md justify-end pt-md">
                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={isUploading} disabled={!selectedFile || cases.length === 0}>Upload & Process</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
