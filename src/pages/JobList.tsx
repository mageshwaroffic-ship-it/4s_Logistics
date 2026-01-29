import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search, Plus, Filter, Download, Loader2, MoreHorizontal, Eye, Trash2,
  FileBox, Upload, FileText, X, Check, AlertCircle, Package
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = "http://localhost:8000/api";

interface Job {
  id: number;
  tenant_id: number;
  job_no: string;
  customer_id: number | null;
  customer_name: string | null;
  bl_file_path: string | null;
  packing_list_path: string | null;
  incoterm: string | null;
  invoice_path: string | null;
  freight_payment_path: string | null;
  misc_charges_amount: number | null;
  status: string;
  created_at: string;
}

interface Customer {
  id: number;
  company_name: string;
}

interface IncotermResult {
  detected: boolean;
  term: string | null;
  category: string | null;
  required_docs: string[];
  needs_freight: boolean;
  extract_misc: boolean;
}

const statusColors: Record<string, string> = {
  'created': 'bg-gray-100 text-gray-800',
  'in_transit': 'bg-blue-100 text-blue-800',
  'arrived': 'bg-purple-100 text-purple-800',
  'cleared': 'bg-green-100 text-green-800',
  'delivered': 'bg-emerald-100 text-emerald-800',
  'closed': 'bg-slate-100 text-slate-800',
};

const statusLabels: Record<string, string> = {
  'created': 'Created',
  'in_transit': 'In Transit',
  'arrived': 'Arrived',
  'cleared': 'Cleared',
  'delivered': 'Delivered',
  'closed': 'Closed',
};

export default function JobList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);

  // File upload refs
  const blFileRef = useRef<HTMLInputElement>(null);
  const plFileRef = useRef<HTMLInputElement>(null);
  const invoiceFileRef = useRef<HTMLInputElement>(null);
  const freightFileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [newJob, setNewJob] = useState({
    job_no: '',
    customer_id: '',
    // Files
    bl_file: null as File | null,
    bl_file_path: '',
    pl_file: null as File | null,
    packing_list_path: '',
    invoice_file: null as File | null,
    invoice_path: '',
    freight_file: null as File | null,
    freight_payment_path: '',
    // Extracted data
    incoterm: '',
    misc_charges_amount: 0,
  });

  // INCOTERM detection state
  const [incotermResult, setIncotermResult] = useState<IncotermResult | null>(null);
  const [uploadingBL, setUploadingBL] = useState(false);
  const [uploadingPL, setUploadingPL] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [uploadingFreight, setUploadingFreight] = useState(false);

  // Get tenant_id from localStorage
  const getTenantId = () => {
    const tenant = localStorage.getItem("4s_tenant");
    if (tenant) {
      return JSON.parse(tenant).id;
    }
    return null;
  };

  // Generate job number
  const generateJobNo = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `JOB/${year}${month}/${random}`;
  };

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const tenantId = getTenantId();
      const url = tenantId
        ? `${API_URL}/new-jobs?tenant_id=${tenantId}`
        : `${API_URL}/new-jobs`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const tenantId = getTenantId();
      const url = tenantId
        ? `${API_URL}/customers?tenant_id=${tenantId}`
        : `${API_URL}/customers`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCustomers();
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.job_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.incoterm?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Upload file helper
  const uploadFile = async (file: File, docType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    formData.append('job_no', newJob.job_no || 'temp');

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return await response.json();
  };

  // Handle BL file selection
  const handleBLFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBL(true);
    try {
      const result = await uploadFile(file, 'bl');
      setNewJob({
        ...newJob,
        bl_file: file,
        bl_file_path: result.file_path,
      });
      toast.success(`Bill of Lading uploaded`);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload Bill of Lading");
    } finally {
      setUploadingBL(false);
    }
  };

  // Handle PL file selection - extracts INCOTERM
  const handlePLFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPL(true);
    try {
      const result = await uploadFile(file, 'packing_list');

      // Check if INCOTERM was detected
      if (result.incoterm) {
        setIncotermResult(result.incoterm);
        if (result.incoterm.detected && result.incoterm.term) {
          setNewJob({
            ...newJob,
            pl_file: file,
            packing_list_path: result.file_path,
            incoterm: result.incoterm.term,
          });
          toast.success(`Packing List uploaded. Detected INCOTERM: ${result.incoterm.term}`);
        } else {
          setNewJob({
            ...newJob,
            pl_file: file,
            packing_list_path: result.file_path,
          });
          toast.info("Packing List uploaded. INCOTERM not detected - please select manually.");
        }
      } else {
        setNewJob({
          ...newJob,
          pl_file: file,
          packing_list_path: result.file_path,
        });
        toast.success(`Packing List uploaded`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload Packing List");
    } finally {
      setUploadingPL(false);
    }
  };

  // Handle Invoice file selection
  const handleInvoiceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingInvoice(true);
    try {
      // Use extract endpoint if misc charges needed
      const extractMisc = incotermResult?.extract_misc ||
        ['CFR', 'C&F', 'CNF', 'FOB', 'EXW', 'FCA'].includes(newJob.incoterm);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_no', newJob.job_no || 'temp');
      formData.append('extract_misc', extractMisc.toString());

      const response = await fetch(`${API_URL}/upload/extract-invoice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      setNewJob({
        ...newJob,
        invoice_file: file,
        invoice_path: result.file_path,
        misc_charges_amount: result.misc_charges || 0,
      });

      if (result.misc_charges > 0) {
        toast.success(`Invoice uploaded. Misc charges: ₹${result.misc_charges.toLocaleString()}`);
      } else {
        toast.success(`Invoice uploaded`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload Invoice");
    } finally {
      setUploadingInvoice(false);
    }
  };

  // Handle Freight file selection
  const handleFreightFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFreight(true);
    try {
      const result = await uploadFile(file, 'freight');
      setNewJob({
        ...newJob,
        freight_file: file,
        freight_payment_path: result.file_path,
      });
      toast.success(`Freight Payment document uploaded`);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload Freight Payment");
    } finally {
      setUploadingFreight(false);
    }
  };

  // Check if freight is required based on INCOTERM
  const needsFreightPayment = () => {
    const freightTerms = ['FOB', 'EXW', 'FCA'];
    return freightTerms.includes(newJob.incoterm) ||
      (incotermResult?.needs_freight === true);
  };

  // Reset form
  const resetForm = () => {
    setNewJob({
      job_no: '',
      customer_id: '',
      bl_file: null,
      bl_file_path: '',
      pl_file: null,
      packing_list_path: '',
      invoice_file: null,
      invoice_path: '',
      freight_file: null,
      freight_payment_path: '',
      incoterm: '',
      misc_charges_amount: 0,
    });
    setIncotermResult(null);
    if (blFileRef.current) blFileRef.current.value = '';
    if (plFileRef.current) plFileRef.current.value = '';
    if (invoiceFileRef.current) invoiceFileRef.current.value = '';
    if (freightFileRef.current) freightFileRef.current.value = '';
  };

  // Create job
  const handleCreateJob = async () => {
    // Validation
    if (!newJob.customer_id) {
      toast.error("Please select a customer");
      return;
    }
    if (!newJob.bl_file_path) {
      toast.error("Bill of Lading is required");
      return;
    }
    if (!newJob.packing_list_path) {
      toast.error("Packing List is required");
      return;
    }
    if (!newJob.invoice_path) {
      toast.error("Invoice is required");
      return;
    }
    if (needsFreightPayment() && !newJob.freight_payment_path) {
      toast.error("Freight Payment (Arrival Notice / Certificate) is required for FOB/EXW/FCA");
      return;
    }

    setIsCreating(true);
    try {
      const tenantId = getTenantId();
      const jobNo = newJob.job_no || generateJobNo();

      const response = await fetch(`${API_URL}/new-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          job_no: jobNo,
          customer_id: parseInt(newJob.customer_id),
          bl_file_path: newJob.bl_file_path,
          packing_list_path: newJob.packing_list_path,
          incoterm: newJob.incoterm || null,
          invoice_path: newJob.invoice_path,
          freight_payment_path: newJob.freight_payment_path || null,
          misc_charges_amount: newJob.misc_charges_amount || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create job');
      }

      const data = await response.json();
      toast.success(`Job ${data.job_no} created successfully!`);

      resetForm();
      setIsDialogOpen(false);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.message || "Failed to create job");
    } finally {
      setIsCreating(false);
    }
  };

  // Delete job
  const handleDeleteJob = async () => {
    if (!deletingJob) return;

    try {
      const response = await fetch(`${API_URL}/new-jobs/${deletingJob.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error("Failed to delete job");

      toast.success(`Job ${deletingJob.job_no} deleted`);
      setIsDeleteDialogOpen(false);
      setDeletingJob(null);
      fetchJobs();
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  // File upload component
  const FileUploadButton = ({
    label,
    file,
    onSelect,
    onClear,
    inputRef,
    uploading,
    required = false,
    accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
  }: {
    label: string;
    file: File | null;
    onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
    uploading: boolean;
    required?: boolean;
    accept?: string;
  }) => (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onSelect}
          className="hidden"
        />
        {file ? (
          <div className="flex-1 flex items-center gap-2 p-3 border rounded-lg bg-green-50 border-green-200">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="flex-1 text-sm truncate">{file.name}</span>
            <Button variant="ghost" size="icon" onClick={onClear}>
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : `Upload ${label}`}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileBox className="h-7 w-7 text-blue-600" />
            Jobs
          </h1>
          <p className="text-gray-500 mt-1">Manage all import jobs</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setNewJob(prev => ({ ...prev, job_no: generateJobNo() }));
          setIsDialogOpen(true);
        }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{jobs.length}</p>
              <p className="text-sm text-gray-500">Total Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{jobs.filter(j => j.status === 'created').length}</p>
              <p className="text-sm text-gray-500">New</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{jobs.filter(j => j.status === 'in_transit').length}</p>
              <p className="text-sm text-gray-500">In Transit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{jobs.filter(j => j.status === 'cleared').length}</p>
              <p className="text-sm text-gray-500">Cleared</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-[350px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by Job No, Customer, INCOTERM..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? "No jobs found matching your filters"
                : "No jobs yet. Create your first job!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>INCOTERM</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/jobs/${job.id}`)}>
                    <TableCell className="font-medium text-blue-600">{job.job_no}</TableCell>
                    <TableCell>{job.customer_name || '-'}</TableCell>
                    <TableCell>
                      {job.incoterm ? (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {job.incoterm}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {job.bl_file_path && <span className="text-green-600 text-xs">BL</span>}
                        {job.packing_list_path && <span className="text-green-600 text-xs">PL</span>}
                        {job.invoice_path && <span className="text-green-600 text-xs">INV</span>}
                        {job.freight_payment_path && <span className="text-green-600 text-xs">FRT</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[job.status] || job.status}
                      </span>
                    </TableCell>
                    <TableCell>{job.created_at ? new Date(job.created_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setDeletingJob(job);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Job Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
            <DialogDescription>
              Upload required documents. Additional documents may be required based on INCOTERM detected from Packing List.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Job No */}
            <div className="space-y-2">
              <Label>Job No</Label>
              <Input
                value={newJob.job_no}
                onChange={(e) => setNewJob({ ...newJob, job_no: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <Label>Customer <span className="text-red-500">*</span></Label>
              <Select
                value={newJob.customer_id}
                onValueChange={(value) => setNewJob({ ...newJob, customer_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <hr className="my-2" />

            {/* Mandatory Documents */}
            <div className="space-y-1">
              <h4 className="font-medium text-sm text-gray-700">Required Documents</h4>
            </div>

            {/* Bill of Lading */}
            <FileUploadButton
              label="Bill of Lading"
              file={newJob.bl_file}
              onSelect={handleBLFileSelect}
              onClear={() => {
                setNewJob({ ...newJob, bl_file: null, bl_file_path: '' });
                if (blFileRef.current) blFileRef.current.value = '';
              }}
              inputRef={blFileRef}
              uploading={uploadingBL}
              required
            />

            {/* Packing List */}
            <FileUploadButton
              label="Packing List"
              file={newJob.pl_file}
              onSelect={handlePLFileSelect}
              onClear={() => {
                setNewJob({ ...newJob, pl_file: null, packing_list_path: '', incoterm: '' });
                setIncotermResult(null);
                if (plFileRef.current) plFileRef.current.value = '';
              }}
              inputRef={plFileRef}
              uploading={uploadingPL}
              required
            />

            {/* INCOTERM Display/Select */}
            {newJob.packing_list_path && (
              <div className="space-y-2">
                <Label>INCOTERM</Label>
                {incotermResult?.detected ? (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-700">{incotermResult.term}</span>
                    <span className="text-sm text-gray-500">- Detected from Packing List</span>
                  </div>
                ) : (
                  <Select
                    value={newJob.incoterm}
                    onValueChange={(value) => setNewJob({ ...newJob, incoterm: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select INCOTERM (not detected)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAP">DAP - Delivered at Place</SelectItem>
                      <SelectItem value="CIF">CIF - Cost Insurance Freight</SelectItem>
                      <SelectItem value="CFR">CFR / C&F - Cost and Freight</SelectItem>
                      <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                      <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                      <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Invoice */}
            <FileUploadButton
              label="Invoice"
              file={newJob.invoice_file}
              onSelect={handleInvoiceFileSelect}
              onClear={() => {
                setNewJob({ ...newJob, invoice_file: null, invoice_path: '', misc_charges_amount: 0 });
                if (invoiceFileRef.current) invoiceFileRef.current.value = '';
              }}
              inputRef={invoiceFileRef}
              uploading={uploadingInvoice}
              required
            />

            {/* Show misc charges if extracted */}
            {newJob.misc_charges_amount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="text-sm">Misc Charges: <strong>₹{newJob.misc_charges_amount.toLocaleString()}</strong></span>
              </div>
            )}

            {/* Freight Payment - only for FOB, EXW, FCA */}
            {needsFreightPayment() && (
              <>
                <hr className="my-2" />
                <div className="space-y-1">
                  <h4 className="font-medium text-sm text-gray-700">Additional Documents (Required for {newJob.incoterm || 'FOB/EXW/FCA'})</h4>
                </div>
                <FileUploadButton
                  label="Freight Payment (Arrival Notice / Certificate)"
                  file={newJob.freight_file}
                  onSelect={handleFreightFileSelect}
                  onClear={() => {
                    setNewJob({ ...newJob, freight_file: null, freight_payment_path: '' });
                    if (freightFileRef.current) freightFileRef.current.value = '';
                  }}
                  inputRef={freightFileRef}
                  uploading={uploadingFreight}
                  required
                />
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateJob}
              disabled={isCreating || uploadingBL || uploadingPL || uploadingInvoice || uploadingFreight}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Job'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete job "{deletingJob?.job_no}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
