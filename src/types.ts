export type JobStatus =
    | 'pre-alert'
    | 'created'
    | 'docs-pending'
    | 'verification-pending'
    | 'approval-pending'
    | 'customs-submitted'
    | 'cleared'
    | 'delivered';

export type DocumentStatus = 'uploaded' | 'missing' | 'rejected';
export type DocumentSource = 'customer' | 'ops';

export interface Document {
    id: string;
    name: string;
    status: DocumentStatus;
    source: DocumentSource;
    uploadedAt?: string;
}

export interface Job {
    id: string | number;
    jobNumber?: string;
    importer: string;
    port: string;
    status: JobStatus;
    eta: string;
    pendingAction: string;
    needsAction: boolean;
    containerNumber: string;
    blNumber: string;
    origin: string;
    destination: string;
    dutyAmount: number;
    invoiceAmount: number;
    documents: Document[];
    checklistItems: { id: string; label: string; checked: boolean }[];
    entryDetails?: any;
}
