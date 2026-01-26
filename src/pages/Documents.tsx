import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Upload, FileText, Check, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const documents = [
  { id: 'd1', name: 'Bill of Lading', job: 'JOB-2024-001', status: 'uploaded', type: 'BOL', uploadedAt: '2024-01-25' },
  { id: 'd2', name: 'Commercial Invoice', job: 'JOB-2024-001', status: 'missing', type: 'Invoice', uploadedAt: null },
  { id: 'd3', name: 'Packing List', job: 'JOB-2024-001', status: 'uploaded', type: 'Packing', uploadedAt: '2024-01-25' },
  { id: 'd4', name: 'Certificate of Origin', job: 'JOB-2024-002', status: 'rejected', type: 'Certificate', uploadedAt: '2024-01-24' },
  { id: 'd5', name: 'Bill of Lading', job: 'JOB-2024-003', status: 'uploaded', type: 'BOL', uploadedAt: '2024-01-22' },
  { id: 'd6', name: 'FDA Prior Notice', job: 'JOB-2024-003', status: 'uploaded', type: 'Certificate', uploadedAt: '2024-01-23' },
  { id: 'd7', name: 'Commercial Invoice', job: 'JOB-2024-004', status: 'uploaded', type: 'Invoice', uploadedAt: '2024-01-26' },
  { id: 'd8', name: 'Phytosanitary Certificate', job: 'JOB-2024-004', status: 'uploaded', type: 'Certificate', uploadedAt: '2024-01-26' },
];

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.job.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusConfig = {
    uploaded: { icon: Check, label: 'Uploaded', class: 'status-cleared' },
    missing: { icon: AlertCircle, label: 'Missing', class: 'status-missing' },
    rejected: { icon: X, label: 'Rejected', class: 'status-rejected' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Manage all shipment documents</p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Document Name</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocs.map((doc) => {
              const status = statusConfig[doc.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;

              return (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{doc.job}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('status-badge', status.class)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
