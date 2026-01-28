import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { JobsTable } from '@/components/dashboard/JobsTable';
import { JobStatus } from '@/types';
import { statusLabels } from '@/constants';
import { API_URL } from '../config';
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



// Helper to map backend data to frontend model
const mapBackendJobToFrontend = (backendJob: any): any => {
  return {
    id: backendJob.id, // Use Database ID for routing (Integer)
    jobNumber: backendJob.job_number, // Use Job Number string for display
    importer: backendJob.importer,
    port: 'Mundra', // Backend doesn't return port in list? It does in 'remarks'. Or defaults.
    status: 'created', // Default status for now
    eta: backendJob.eta || new Date().toISOString(),
    needsAction: false,
    pendingAction: 'None'
  };
};

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<JobStatus | null>(null);

  // Fetch Jobs from API
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        console.log("Fetching jobs for dashboard from:", `${API_URL}/api/jobs`);
        const response = await fetch(`${API_URL}/api/jobs`);
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();

        // Map backend jobs to frontend structure
        return (data.jobs || []).map(mapBackendJobToFrontend);
      } catch (error) {
        console.error("Error fetching jobs for dashboard:", error);
        return [];
      }
    }
  });

  // Dynamic Status Counts
  const statusCounts = jobs.reduce((acc: Record<string, number>, job: any) => {
    const status = job.status || 'created';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredJobs = activeFilter
    ? jobs.filter((job: any) => job.status === activeFilter)
    : jobs;

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
            count={statusCounts[status] || 0} // Use dynamic count
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
        {isLoading ? (
          <div className="flex justify-center p-8">Loading...</div>
        ) : (
          <JobsTable jobs={filteredJobs} />
        )}
      </div>
    </div>
  );
}
