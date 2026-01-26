import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Check, Clock, Mail } from 'lucide-react';

export function CustomerApproval() {
  const [status, setStatus] = useState<'pending' | 'sent' | 'approved'>('pending');

  const handleSendApproval = () => {
    setStatus('sent');
  };

  const handleSimulateApproval = () => {
    setStatus('approved');
  };

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Customer Approval</h3>
        <Badge
          className={
            status === 'approved'
              ? 'status-cleared'
              : status === 'sent'
              ? 'status-pending'
              : 'status-prealert'
          }
        >
          {status === 'approved' && <Check className="w-3 h-3 mr-1" />}
          {status === 'sent' && <Clock className="w-3 h-3 mr-1" />}
          {status === 'pending' ? 'Not Sent' : status === 'sent' ? 'Awaiting Response' : 'Approved'}
        </Badge>
      </div>

      {status === 'pending' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            Send entry details to customer for review and approval
          </p>
          <Button onClick={handleSendApproval}>
            <Send className="w-4 h-4 mr-2" />
            Send for Approval
          </Button>
        </div>
      )}

      {status === 'sent' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-warning" />
          </div>
          <p className="font-medium mb-2">Approval Request Sent</p>
          <p className="text-sm text-muted-foreground mb-4">
            Sent to customer@techcorp.com on {new Date().toLocaleDateString()}
          </p>
          <Button variant="outline" onClick={handleSimulateApproval}>
            Simulate Approval
          </Button>
        </div>
      )}

      {status === 'approved' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <p className="font-medium text-success mb-2">Approved by Customer</p>
          <p className="text-sm text-muted-foreground">
            Approved on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
