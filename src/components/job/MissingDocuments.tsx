import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { missingDocuments } from '@/data/dummyData';
import { Upload, AlertCircle } from 'lucide-react';

export function MissingDocuments() {
  return (
    <div className="section-card border-warning/50 bg-amber-50/50">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-warning" />
        <h3 className="text-lg font-semibold">Missing Documents</h3>
        <Badge className="status-badge status-missing ml-auto">
          {missingDocuments.length} Required
        </Badge>
      </div>

      <div className="space-y-3">
        {missingDocuments.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 rounded-lg bg-card border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-sm text-muted-foreground">
                  {doc.required ? 'Required for clearance' : 'Optional'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
