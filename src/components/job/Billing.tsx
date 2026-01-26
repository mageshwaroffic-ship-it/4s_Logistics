import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, DollarSign } from 'lucide-react';

interface BillingProps {
  invoiceAmount: number;
  dutyAmount: number;
}

export function Billing({ invoiceAmount, dutyAmount }: BillingProps) {
  const serviceFee = 450;
  const total = dutyAmount + 528 + serviceFee;

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Billing & Invoice</h3>
        <Badge className="status-created">
          <FileText className="w-3 h-3 mr-1" />
          Invoice Ready
        </Badge>
      </div>

      <div className="border rounded-lg p-4 mb-4 bg-muted/30">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Invoice Preview</span>
          <span className="text-sm text-muted-foreground ml-auto">INV-2024-001234</span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customs Brokerage Service</span>
            <span className="font-medium">${serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duty Payment (Disbursement)</span>
            <span className="font-medium">${dutyAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">MPF (Disbursement)</span>
            <span className="font-medium">$528.00</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-lg">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download Invoice
        </Button>
        <Button variant="outline" className="flex-1">
          <FileText className="w-4 h-4 mr-2" />
          Send to Customer
        </Button>
      </div>
    </div>
  );
}
