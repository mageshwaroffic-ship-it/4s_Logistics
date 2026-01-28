import { useNavigate } from 'react-router-dom';
import { Job, JobStatus } from '@/types';
import { statusLabels } from '@/constants';
import { cn } from '@/lib/utils';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface JobsTableProps {
  jobs: Job[];
  showNeedsAction?: boolean;
}

const statusStyles: Record<JobStatus, string> = {
  'pre-alert': 'status-prealert',
  'created': 'status-created',
  'docs-pending': 'status-pending',
  'verification-pending': 'status-pending',
  'approval-pending': 'status-pending',
  'customs-submitted': 'status-submitted',
  'cleared': 'status-cleared',
  'delivered': 'status-delivered',
};

export function JobsTable({ jobs, showNeedsAction = true }: JobsTableProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[140px]">Job ID</TableHead>
            <TableHead>Importer</TableHead>
            <TableHead>Port</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>ETA</TableHead>
            <TableHead>Pending Action</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No jobs found.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className={cn(
                  'cursor-pointer hover:bg-muted/50 transition-colors',
                  showNeedsAction && job.needsAction && 'table-row-highlight'
                )}
              >
                <TableCell className="font-medium">{job.jobNumber || job.id}</TableCell>
                <TableCell>{job.importer}</TableCell>
                <TableCell>{job.port}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn('status-badge', statusStyles[job.status])}>
                    {statusLabels[job.status]}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(job.eta).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {job.needsAction && (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    )}
                    <span className={cn(job.needsAction && 'font-medium')}>
                      {job.pendingAction}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
