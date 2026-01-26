import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { extractedFields } from '@/data/dummyData';
import { FileText, AlertTriangle, Check, X, RotateCcw } from 'lucide-react';

export function DocumentVerification() {
  const fields = [
    { label: 'Invoice Number', value: extractedFields.invoiceNumber, match: true },
    { label: 'Invoice Date', value: extractedFields.invoiceDate, match: true },
    { label: 'Shipper', value: extractedFields.shipper, match: true },
    { label: 'Consignee', value: extractedFields.consignee, match: true },
    { label: 'Description', value: extractedFields.description, match: true },
    { label: 'Quantity', value: extractedFields.quantity, match: true },
    { label: 'Unit Price', value: extractedFields.unitPrice, match: false },
    { label: 'Total Value', value: extractedFields.totalValue, match: true },
    { label: 'HS Code', value: extractedFields.hsCode, match: false },
    { label: 'Country of Origin', value: extractedFields.countryOfOrigin, match: true },
  ];

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Document Verification</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="w-4 h-4 text-warning" />
          2 mismatches found
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
              <p className="text-xs">INV-2024-88291.pdf</p>
            </div>
          </div>
        </div>

        {/* Extracted Fields */}
        <div>
          <h4 className="font-medium mb-4">Extracted Fields</h4>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  !field.match ? 'bg-amber-50 border-amber-200' : 'bg-card'
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
