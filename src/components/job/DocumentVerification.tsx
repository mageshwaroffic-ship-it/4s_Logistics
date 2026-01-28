import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, Check, X, RotateCcw } from 'lucide-react';

interface DocumentVerificationProps {
  fields?: any;
}

export function DocumentVerification({ fields = {} }: DocumentVerificationProps) {
  const fieldList = [
    { label: 'Invoice Number', value: fields.invoiceNumber || '-', match: !!fields.invoiceNumber },
    { label: 'Invoice Date', value: fields.invoiceDate || '-', match: !!fields.invoiceDate },
    { label: 'Shipper', value: fields.shipper || '-', match: !!fields.shipper },
    { label: 'Consignee', value: fields.consignee || '-', match: !!fields.consignee },
    { label: 'Description', value: fields.description || '-', match: !!fields.description },
    { label: 'Quantity', value: fields.quantity || '-', match: !!fields.quantity },
    { label: 'Unit Price', value: fields.unitPrice || '-', match: false },
    { label: 'Total Value', value: fields.totalValue || '-', match: !!fields.totalValue },
    { label: 'HS Code', value: fields.hsCode || '-', match: false },
    { label: 'Country of Origin', value: fields.countryOfOrigin || '-', match: !!fields.countryOfOrigin },
  ];

  const mismatchCount = fieldList.filter(f => !f.match).length;

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Document Verification</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="w-4 h-4 text-warning" />
          {mismatchCount} mismatches found
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Document Preview */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Commercial Invoice</span>
            <Badge variant="outline" className="ml-auto">PDF</Badge>
          </div>
          <div className="aspect-[3/4] bg-card rounded border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p>Document Preview</p>
              <p className="text-xs">Select a document</p>
            </div>
          </div>
        </div>

        {/* Extracted Fields */}
        <div>
          <h4 className="font-medium mb-4">Extracted Fields</h4>
          <div className="space-y-3">
            {fieldList.map((field, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${!field.match ? 'bg-amber-50 border-amber-200' : 'bg-card'
                  }`}
              >
                <div>
                  <p className="text-sm text-muted-foreground">{field.label}</p>
                  <p className="font-medium">{field.value}</p>
                </div>
                {field.match ? (
                  <Check className="w-5 h-5 text-success" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning" />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button variant="destructive" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Re-upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
