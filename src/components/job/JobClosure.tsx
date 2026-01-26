import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, Check, Lock } from 'lucide-react';

export function JobClosure() {
  const [isClosed, setIsClosed] = useState(false);

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Job Closure</h3>
        <Badge className={isClosed ? 'status-cleared' : 'status-prealert'}>
          {isClosed ? (
            <>
              <Lock className="w-3 h-3 mr-1" />
              Closed & Archived
            </>
          ) : (
            'Open'
          )}
        </Badge>
      </div>

      {!isClosed ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Archive className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            Close this job when all tasks are complete and billing is finalized
          </p>
          <Button onClick={() => setIsClosed(true)}>
            <Archive className="w-4 h-4 mr-2" />
            Close Job
          </Button>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <p className="font-medium text-success mb-2">Job Closed Successfully</p>
          <p className="text-sm text-muted-foreground">
            Archived on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
