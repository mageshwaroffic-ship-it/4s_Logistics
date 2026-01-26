import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CreditCard, Check, DollarSign } from 'lucide-react';

interface DutyPaymentProps {
  dutyAmount: number;
}

export function DutyPayment({ dutyAmount }: DutyPaymentProps) {
  const [isPaid, setIsPaid] = useState(false);

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Duty & Payment</h3>
        <Badge className={isPaid ? 'status-cleared' : 'status-pending'}>
          {isPaid ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Paid
            </>
          ) : (
            'Payment Due'
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Duty Amount</p>
          <p className="text-2xl font-bold">${dutyAmount.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">MPF</p>
          <p className="text-2xl font-bold">$528.00</p>
        </div>
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm text-primary">Total Due</p>
          <p className="text-2xl font-bold text-primary">
            ${(dutyAmount + 528).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download Payment Advice
        </Button>
        {!isPaid ? (
          <Button className="flex-1" onClick={() => setIsPaid(true)}>
            <CreditCard className="w-4 h-4 mr-2" />
            Mark as Paid
          </Button>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 text-success">
            <Check className="w-5 h-5" />
            <span className="font-medium">Payment Confirmed</span>
          </div>
        )}
      </div>
    </div>
  );
}
