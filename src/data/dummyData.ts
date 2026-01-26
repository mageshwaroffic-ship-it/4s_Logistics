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
  id: string;
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
}

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

export const statusCounts: Record<JobStatus, number> = {
  'pre-alert': 12,
  'created': 8,
  'docs-pending': 15,
  'verification-pending': 6,
  'approval-pending': 4,
  'customs-submitted': 9,
  'cleared': 23,
  'delivered': 45,
};

export const dummyJobs: Job[] = [
  {
    id: 'JOB-2024-001',
    importer: 'TechCorp Industries',
    port: 'Los Angeles',
    status: 'docs-pending',
    eta: '2024-01-28',
    pendingAction: 'Missing Commercial Invoice',
    needsAction: true,
    containerNumber: 'MSKU1234567',
    blNumber: 'MAEU123456789',
    origin: 'Shanghai, China',
    destination: 'Los Angeles, CA',
    dutyAmount: 12450.00,
    invoiceAmount: 85000.00,
    documents: [
      { id: 'd1', name: 'Bill of Lading', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-25' },
      { id: 'd2', name: 'Commercial Invoice', status: 'missing', source: 'customer' },
      { id: 'd3', name: 'Packing List', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-25' },
      { id: 'd4', name: 'Certificate of Origin', status: 'missing', source: 'customer' },
    ],
    checklistItems: [
      { id: 'c1', label: 'Verify HS Code classification', checked: false },
      { id: 'c2', label: 'Confirm duty rate calculation', checked: false },
      { id: 'c3', label: 'Check importer bond status', checked: true },
      { id: 'c4', label: 'Validate entry data', checked: false },
    ],
  },
  {
    id: 'JOB-2024-002',
    importer: 'Global Trade Co.',
    port: 'New York',
    status: 'verification-pending',
    eta: '2024-01-29',
    pendingAction: 'Document Verification Required',
    needsAction: true,
    containerNumber: 'CMAU7654321',
    blNumber: 'COSU987654321',
    origin: 'Hamburg, Germany',
    destination: 'Newark, NJ',
    dutyAmount: 8750.00,
    invoiceAmount: 62000.00,
    documents: [
      { id: 'd1', name: 'Bill of Lading', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-24' },
      { id: 'd2', name: 'Commercial Invoice', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-24' },
      { id: 'd3', name: 'Packing List', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-24' },
      { id: 'd4', name: 'EUR.1 Certificate', status: 'rejected', source: 'customer', uploadedAt: '2024-01-24' },
    ],
    checklistItems: [
      { id: 'c1', label: 'Verify HS Code classification', checked: true },
      { id: 'c2', label: 'Confirm duty rate calculation', checked: true },
      { id: 'c3', label: 'Check importer bond status', checked: true },
      { id: 'c4', label: 'Validate entry data', checked: false },
    ],
  },
  {
    id: 'JOB-2024-003',
    importer: 'Pacific Imports LLC',
    port: 'Seattle',
    status: 'customs-submitted',
    eta: '2024-01-27',
    pendingAction: 'Awaiting CBP Response',
    needsAction: false,
    containerNumber: 'OOLU9876543',
    blNumber: 'ONEY456789123',
    origin: 'Busan, South Korea',
    destination: 'Seattle, WA',
    dutyAmount: 5200.00,
    invoiceAmount: 38000.00,
    documents: [
      { id: 'd1', name: 'Bill of Lading', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-22' },
      { id: 'd2', name: 'Commercial Invoice', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-22' },
      { id: 'd3', name: 'Packing List', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-22' },
      { id: 'd4', name: 'FDA Prior Notice', status: 'uploaded', source: 'ops', uploadedAt: '2024-01-23' },
    ],
    checklistItems: [
      { id: 'c1', label: 'Verify HS Code classification', checked: true },
      { id: 'c2', label: 'Confirm duty rate calculation', checked: true },
      { id: 'c3', label: 'Check importer bond status', checked: true },
      { id: 'c4', label: 'Validate entry data', checked: true },
    ],
  },
  {
    id: 'JOB-2024-004',
    importer: 'Atlantic Distributors',
    port: 'Miami',
    status: 'approval-pending',
    eta: '2024-01-30',
    pendingAction: 'Customer Approval Required',
    needsAction: true,
    containerNumber: 'HAPG5432109',
    blNumber: 'HLCU321654987',
    origin: 'Santos, Brazil',
    destination: 'Miami, FL',
    dutyAmount: 15800.00,
    invoiceAmount: 95000.00,
    documents: [
      { id: 'd1', name: 'Bill of Lading', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-26' },
      { id: 'd2', name: 'Commercial Invoice', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-26' },
      { id: 'd3', name: 'Packing List', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-26' },
      { id: 'd4', name: 'Phytosanitary Certificate', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-26' },
    ],
    checklistItems: [
      { id: 'c1', label: 'Verify HS Code classification', checked: true },
      { id: 'c2', label: 'Confirm duty rate calculation', checked: true },
      { id: 'c3', label: 'Check importer bond status', checked: true },
      { id: 'c4', label: 'Validate entry data', checked: true },
    ],
  },
  {
    id: 'JOB-2024-005',
    importer: 'Midwest Manufacturing',
    port: 'Chicago',
    status: 'cleared',
    eta: '2024-01-26',
    pendingAction: 'Schedule Delivery',
    needsAction: true,
    containerNumber: 'YMLU1357924',
    blNumber: 'YMLM789123456',
    origin: 'Rotterdam, Netherlands',
    destination: 'Chicago, IL',
    dutyAmount: 9300.00,
    invoiceAmount: 72000.00,
    documents: [
      { id: 'd1', name: 'Bill of Lading', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-20' },
      { id: 'd2', name: 'Commercial Invoice', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-20' },
      { id: 'd3', name: 'Packing List', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-20' },
      { id: 'd4', name: 'Customs Entry', status: 'uploaded', source: 'ops', uploadedAt: '2024-01-24' },
    ],
    checklistItems: [
      { id: 'c1', label: 'Verify HS Code classification', checked: true },
      { id: 'c2', label: 'Confirm duty rate calculation', checked: true },
      { id: 'c3', label: 'Check importer bond status', checked: true },
      { id: 'c4', label: 'Validate entry data', checked: true },
    ],
  },
  {
    id: 'JOB-2024-006',
    importer: 'West Coast Electronics',
    port: 'Long Beach',
    status: 'pre-alert',
    eta: '2024-02-02',
    pendingAction: 'Create Job',
    needsAction: true,
    containerNumber: 'EGLV2468135',
    blNumber: 'EISU159357486',
    origin: 'Shenzhen, China',
    destination: 'Long Beach, CA',
    dutyAmount: 0,
    invoiceAmount: 125000.00,
    documents: [],
    checklistItems: [],
  },
  {
    id: 'JOB-2024-007',
    importer: 'Southern Imports Inc.',
    port: 'Houston',
    status: 'delivered',
    eta: '2024-01-22',
    pendingAction: 'Generate Invoice',
    needsAction: false,
    containerNumber: 'MSCU8024679',
    blNumber: 'MEDU753951852',
    origin: 'Cartagena, Colombia',
    destination: 'Houston, TX',
    dutyAmount: 6800.00,
    invoiceAmount: 48000.00,
    documents: [
      { id: 'd1', name: 'Bill of Lading', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-15' },
      { id: 'd2', name: 'Commercial Invoice', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-15' },
      { id: 'd3', name: 'Packing List', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-15' },
      { id: 'd4', name: 'POD', status: 'uploaded', source: 'ops', uploadedAt: '2024-01-22' },
    ],
    checklistItems: [
      { id: 'c1', label: 'Verify HS Code classification', checked: true },
      { id: 'c2', label: 'Confirm duty rate calculation', checked: true },
      { id: 'c3', label: 'Check importer bond status', checked: true },
      { id: 'c4', label: 'Validate entry data', checked: true },
    ],
  },
  {
    id: 'JOB-2024-008',
    importer: 'Northern Logistics',
    port: 'Boston',
    status: 'created',
    eta: '2024-02-01',
    pendingAction: 'Request Documents',
    needsAction: true,
    containerNumber: 'CSNU3692581',
    blNumber: 'COAU852369147',
    origin: 'Liverpool, UK',
    destination: 'Boston, MA',
    dutyAmount: 0,
    invoiceAmount: 55000.00,
    documents: [
      { id: 'd1', name: 'Bill of Lading', status: 'uploaded', source: 'customer', uploadedAt: '2024-01-27' },
    ],
    checklistItems: [],
  },
];

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

export const extractedFields = {
  invoiceNumber: 'INV-2024-88291',
  invoiceDate: '2024-01-20',
  shipper: 'Shanghai Export Trading Co.',
  consignee: 'TechCorp Industries',
  description: 'Electronic Components - Circuit Boards',
  quantity: '5,000 units',
  unitPrice: '$17.00',
  totalValue: '$85,000.00',
  currency: 'USD',
  incoterms: 'FOB Shanghai',
  hsCode: '8534.00.0040',
  countryOfOrigin: 'China',
  weight: '2,500 kg',
};

export const missingDocuments = [
  { id: 'm1', name: 'Commercial Invoice', required: true },
  { id: 'm2', name: 'Certificate of Origin', required: true },
  { id: 'm3', name: 'TSCA Certificate', required: false },
];

export const entryFormData = {
  entryNumber: 'ENT-2024-001234',
  entryDate: '2024-01-28',
  importerOfRecord: 'TechCorp Industries',
  consignee: 'TechCorp Industries',
  portOfEntry: 'Los Angeles, CA (2704)',
  modeOfTransport: 'Ocean',
  vesselName: 'EVER GIVEN',
  voyageNumber: '024E',
  arrivalDate: '2024-01-28',
  billOfLading: 'MAEU123456789',
  containerNumber: 'MSKU1234567',
  hsCode: '8534.00.0040',
  description: 'Electronic Components - Circuit Boards',
  quantity: '5,000 units',
  declaredValue: '$85,000.00',
  dutyRate: '0%',
  estimatedDuty: '$0.00',
  hmfFee: '$21.25',
  mpfFee: '$528.00',
  totalEstimate: '$549.25',
};
