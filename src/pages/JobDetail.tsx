import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Job } from '@/types';
import { getStepIndex, statusLabels } from '@/constants';
import { API_URL } from '../config';
import { StatusTimeline } from '@/components/job/StatusTimeline';
import { DocumentIntake } from '@/components/job/DocumentIntake';
import { DocumentVerification } from '@/components/job/DocumentVerification';
import { MissingDocuments } from '@/components/job/MissingDocuments';
import { EntryScreen } from '@/components/job/EntryScreen';
import { Checklist } from '@/components/job/Checklist';
import { CustomerApproval } from '@/components/job/CustomerApproval';
import { CustomsSubmission } from '@/components/job/CustomsSubmission';
import { DutyPayment } from '@/components/job/DutyPayment';
import { TransportDelivery } from '@/components/job/TransportDelivery';
import { Billing } from '@/components/job/Billing';
import { JobClosure } from '@/components/job/JobClosure';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, MoreVertical, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Fetch API using ID
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async (): Promise<Job> => {
      if (!jobId) throw new Error("No Job ID");
      const response = await fetch(`${API_URL}/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error('Job not found');
      }
      const backendJob = await response.json();

      // Map to frontend model (duplicates logic from JobList, ideally share this)
      let port = 'Unknown';
      let container = 'TBD';
      if (backendJob.remarks) {
        const portMatch = backendJob.remarks.match(/Port: ([^,]+)/);
        if (portMatch) port = portMatch[1].trim();
        const containerMatch = backendJob.remarks.match(/Container: ([^,]+)/);
        if (containerMatch) container = containerMatch[1].trim();
      }
      let status: any = 'created';
      if (backendJob.cleared_date) status = 'cleared';
      else if (backendJob.bill_of_entry) status = 'customs-submitted';
      else if (backendJob.status) status = backendJob.status; // If available

      return {
        id: backendJob.id,
        jobNumber: backendJob.job_number,
        importer: backendJob.importer,
        port: port !== 'Unknown' ? port : 'Mundra',
        status: status,
        eta: backendJob.eta || new Date().toISOString(),
        pendingAction: 'View Details',
        needsAction: false,
        containerNumber: container,
        blNumber: backendJob.bl_number || 'TBD',
        origin: 'Unknown',
        destination: port !== 'Unknown' ? port : 'Mundra',
        dutyAmount: 0,
        invoiceAmount: 0,
        documents: backendJob.documents || [],
        checklistItems: [],
        entryDetails: backendJob.entryDetails || {}
      };
    },
    enabled: !!jobId
  });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
        <p className="text-muted-foreground mb-4">The job you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  const currentStep = getStepIndex(job.status);
  const hasMissingDocs = false; // Always false for now as we don't have logic, or pass logic

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/jobs')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{job.jobNumber || job.id}</h1>
              <Badge
                className={cn(
                  'status-badge',
                  job.status === 'cleared' || job.status === 'delivered'
                    ? 'status-cleared'
                    : job.status === 'customs-submitted'
                      ? 'status-submitted'
                      : 'status-pending'
                )}
              >
                {statusLabels[job.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{job.importer}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            View in Portal
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Job Summary */}
      <div className="grid grid-cols-5 gap-4">
        <div className="section-card">
          <p className="text-sm text-muted-foreground">Container</p>
          <p className="font-semibold">{job.containerNumber}</p>
        </div>
        <div className="section-card">
          <p className="text-sm text-muted-foreground">B/L Number</p>
          <p className="font-semibold">{job.blNumber}</p>
        </div>
        <div className="section-card">
          <p className="text-sm text-muted-foreground">Origin</p>
          <p className="font-semibold">{job.origin}</p>
        </div>
        <div className="section-card">
          <p className="text-sm text-muted-foreground">Port of Entry</p>
          <p className="font-semibold">{job.port}</p>
        </div>
        <div className="section-card">
          <p className="text-sm text-muted-foreground">ETA</p>
          <p className="font-semibold">{new Date(job.eta).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Status Timeline */}
      <StatusTimeline currentStep={currentStep} />

      {/* Main Content Sections */}
      <div className="space-y-6">
        {/* Document Intake */}
        <DocumentIntake documents={job.documents} />

        {/* Missing Documents - Pass Empty List for now */}
        {hasMissingDocs && <MissingDocuments items={[]} />}

        {/* Document Verification - Pass Empty Fields */}
        <DocumentVerification fields={{}} />

        {/* Entry Form */}
        <EntryScreen data={job.entryDetails} />

        {/* Checklist */}
        {job.checklistItems.length > 0 && <Checklist items={job.checklistItems} />}

        {/* Customer Approval */}
        <CustomerApproval />

        {/* Customs Submission */}
        <CustomsSubmission />

        {/* Duty & Payment */}
        <DutyPayment dutyAmount={job.dutyAmount} />

        {/* Transport & Delivery */}
        <TransportDelivery />

        {/* Billing */}
        <Billing invoiceAmount={job.invoiceAmount} dutyAmount={job.dutyAmount} />

        {/* Job Closure */}
        <JobClosure />
      </div>
    </div>
  );
}
