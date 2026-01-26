import { useParams, useNavigate } from 'react-router-dom';
import { dummyJobs, getStepIndex, statusLabels } from '@/data/dummyData';
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
import { ArrowLeft, ExternalLink, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const job = dummyJobs.find((j) => j.id === jobId);

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
  const hasMissingDocs = job.documents.some((d) => d.status === 'missing');

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
              <h1 className="text-2xl font-bold">{job.id}</h1>
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

        {/* Missing Documents */}
        {hasMissingDocs && <MissingDocuments />}

        {/* Document Verification */}
        <DocumentVerification />

        {/* Entry Form */}
        <EntryScreen />

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
