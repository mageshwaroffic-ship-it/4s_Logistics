import { JobStatus } from './types';

export const statusLabels: Record<JobStatus, string> = {
    'pre-alert': 'Pre-Alert Received',
    'created': 'Job Created',
    'docs-pending': 'Documents Pending',
    'verification-pending': 'Verification Pending',
    'approval-pending': 'Approval Pending',
    'customs-submitted': 'Customs Submitted',
    'cleared': 'Cleared',
    'delivered': 'Delivered',
};

export const timelineSteps = [
    'Pre-Alert',
    'Docs',
    'Verification',
    'Entry',
    'Checklist',
    'Approval',
    'Customs',
    'Clearance',
    'Delivery',
    'Billing',
    'Closed',
];

export const getStepIndex = (status: JobStatus): number => {
    switch (status) {
        case 'pre-alert': return 0;
        case 'created': return 1;
        case 'docs-pending': return 1;
        case 'verification-pending': return 2;
        case 'approval-pending': return 5;
        case 'customs-submitted': return 6;
        case 'cleared': return 7;
        case 'delivered': return 8;
        default: return 0;
    }
};
