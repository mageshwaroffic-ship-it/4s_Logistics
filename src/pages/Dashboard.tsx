import { useState } from 'react';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { JobsTable } from '@/components/dashboard/JobsTable';
import { dummyJobs, statusCounts, JobStatus } from '@/data/dummyData';
import {
  Bell,
  FileText,
  FileSearch,
  UserCheck,
  Send,
  CheckCircle,
  Truck,
  Package,
} from 'lucide-react';

const statusCards: { status: JobStatus; icon: typeof Bell; variant: 'default' | 'warning' | 'success' | 'info' | 'purple' }[] = [
  { status: 'pre-alert', icon: Bell, variant: 'default' },
  { status: 'created', icon: Package, variant: 'info' },
  { status: 'docs-pending', icon: FileText, variant: 'warning' },
  { status: 'verification-pending', icon: FileSearch, variant: 'warning' },
  { status: 'approval-pending', icon: UserCheck, variant: 'warning' },
  { status: 'customs-submitted', icon: Send, variant: 'purple' },
  { status: 'cleared', icon: CheckCircle, variant: 'success' },
  { status: 'delivered', icon: Truck, variant: 'success' },
];

const statusLabels: Record<JobStatus, string> = {
  'pre-alert': 'Pre-Alert Received',
  'created': 'Job Created',
  'docs-pending': 'Documents Pending',
  'verification-pending': 'Verification Pending',
  'approval-pending': 'Approval Pending',
  'customs-submitted': 'Customs Submitted',
  'cleared': 'Cleared',
  'delivered': 'Delivered',
};

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<JobStatus | null>(null);

  const filteredJobs = activeFilter
    ? dummyJobs.filter((job) => job.status === activeFilter)
    : dummyJobs;

  const handleCardClick = (status: JobStatus) => {
    setActiveFilter(activeFilter === status ? null : status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your customs operations</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statusCards.map(({ status, icon, variant }) => (
          <StatusCard
            key={status}
            title={statusLabels[status]}
            count={statusCounts[status]}
            icon={icon}
            variant={variant}
            isActive={activeFilter === status}
            onClick={() => handleCardClick(status)}
          />
        ))}
      </div>

      {/* Jobs Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {activeFilter ? `${statusLabels[activeFilter]} Jobs` : 'Recent Jobs'}
          </h2>
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              className="text-sm text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
        <JobsTable jobs={filteredJobs} />
      </div>
    </div>
  );
}
