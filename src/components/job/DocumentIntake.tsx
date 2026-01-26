import { Document } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentIntakeProps {
  documents: Document[];
}

const statusConfig = {
  uploaded: { icon: Check, label: 'Uploaded', class: 'status-cleared' },
  missing: { icon: AlertCircle, label: 'Missing', class: 'status-missing' },
  rejected: { icon: X, label: 'Rejected', class: 'status-rejected' },
};

export function DocumentIntake({ documents }: DocumentIntakeProps) {
  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Document Intake</h3>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => {
          const status = statusConfig[doc.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={doc.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border',
                doc.status === 'missing' && 'bg-orange-50 border-orange-200',
                doc.status === 'rejected' && 'bg-red-50 border-red-200',
                doc.status === 'uploaded' && 'bg-card'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  doc.status === 'uploaded' ? 'bg-muted' : 
                  doc.status === 'missing' ? 'bg-orange-100' : 'bg-red-100'
                )}>
                  <FileText className={cn(
                    'w-5 h-5',
                    doc.status === 'uploaded' ? 'text-muted-foreground' :
                    doc.status === 'missing' ? 'text-orange-600' : 'text-red-600'
                  )} />
                </div>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  {doc.uploadedAt && (
                    <p className="text-sm text-muted-foreground">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="secondary" className={cn('status-badge capitalize', status.class)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {doc.source === 'customer' ? 'Customer' : 'Ops'}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
