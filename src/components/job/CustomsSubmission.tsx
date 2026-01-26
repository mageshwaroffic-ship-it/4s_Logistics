import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Check, Clock, FileText, ExternalLink } from 'lucide-react';

export function CustomsSubmission() {
  const [status, setStatus] = useState<'ready' | 'submitted' | 'accepted'>('ready');

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Customs Submission</h3>
        <Badge
          className={
            status === 'accepted'
              ? 'status-cleared'
              : status === 'submitted'
              ? 'status-submitted'
              : 'status-created'
          }
        >
          {status === 'accepted' && <Check className="w-3 h-3 mr-1" />}
          {status === 'submitted' && <Clock className="w-3 h-3 mr-1" />}
          {status === 'ready' ? 'Ready to Submit' : status === 'submitted' ? 'Pending CBP' : 'Accepted'}
        </Badge>
      </div>

      <div className="border rounded-lg p-4 mb-4 bg-muted/30">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Entry Summary Preview</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Entry Number</p>
            <p className="font-medium">ENT-2024-001234</p>
          </div>
          <div>
            <p className="text-muted-foreground">Entry Type</p>
            <p className="font-medium">01 - Consumption</p>
          </div>
          <div>
            <p className="text-muted-foreground">Port</p>
            <p className="font-medium">2704 - Los Angeles</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Lines</p>
            <p className="font-medium">1</p>
          </div>
        </div>
      </div>

      {status === 'ready' && (
        <Button className="w-full" onClick={() => setStatus('submitted')}>
          <Send className="w-4 h-4 mr-2" />
          Submit to CBP
        </Button>
      )}

      {status === 'submitted' && (
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Awaiting CBP Response</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Submitted on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          <Button variant="outline" onClick={() => setStatus('accepted')}>
            Simulate Acceptance
          </Button>
        </div>
      )}

      {status === 'accepted' && (
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 text-success mb-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">Entry Accepted by CBP</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Entry Number: ENT-2024-001234 | Accepted: {new Date().toLocaleDateString()}
          </p>
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            View in ACE Portal
          </Button>
        </div>
      )}
    </div>
  );
}
