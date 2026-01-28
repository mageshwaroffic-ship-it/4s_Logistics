import { useState, useEffect } from 'react';
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
import { Search, Plus, Filter, Download, Loader2, MoreHorizontal, Eye, Pencil, Trash2, Ship, FileBox } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = "http://localhost:8000/api";

interface Job {
  id: number;
  tenant_id: number;
  job_no: string;
  bl_no: string | null;
  shipping_line: string | null;
  vessel_name: string | null;
  voyage_no: string | null;
  pol: string | null;
  pod: string | null;
  eta: string | null;
  ata: string | null;
  status: string;
  customer_id: number | null;
  customer_name: string | null;
  created_at: string;
}

interface Customer {
  id: number;
  company_name: string;
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

  // New job form
  const [newJob, setNewJob] = useState({
    job_no: '',
    customer_id: '',
    bl_no: '',
    shipping_line: '',
    vessel_name: '',
    pol: '',
    pod: '',
    eta: '',
  });

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
      job.bl_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.pod?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Create job
  const handleCreateJob = async () => {
    if (!newJob.customer_id || !newJob.pod || !newJob.eta) {
      toast.error("Please fill in required fields: Customer, Port, ETA");
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
          bl_no: newJob.bl_no || null,
          shipping_line: newJob.shipping_line || null,
          vessel_name: newJob.vessel_name || null,
          pol: newJob.pol || null,
          pod: newJob.pod,
          eta: newJob.eta,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create job');
      }

      const data = await response.json();
      toast.success(`Job ${data.job_no} created successfully!`);

      setNewJob({
        job_no: '',
        customer_id: '',
        bl_no: '',
        shipping_line: '',
        vessel_name: '',
        pol: '',
        pod: '',
        eta: '',
      });
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
          setNewJob({ ...newJob, job_no: generateJobNo() });
          setIsDialogOpen(true);
        }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <p className="text-2xl font-bold text-purple-600">{jobs.filter(j => j.status === 'in_transit').length}</p>
              <p className="text-sm text-gray-500">In Transit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{jobs.filter(j => j.status === 'arrived').length}</p>
              <p className="text-sm text-gray-500">Arrived</p>
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
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{jobs.filter(j => j.status === 'delivered').length}</p>
              <p className="text-sm text-gray-500">Delivered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-[350px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by Job No, Customer, B/L, Port..."
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
                  <TableHead>B/L Number</TableHead>
                  <TableHead>Port (POD)</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/jobs/${job.id}`)}>
                    <TableCell className="font-medium text-blue-600">{job.job_no}</TableCell>
                    <TableCell>{job.customer_name || '-'}</TableCell>
                    <TableCell>{job.bl_no || '-'}</TableCell>
                    <TableCell>{job.pod || '-'}</TableCell>
                    <TableCell>{job.eta ? new Date(job.eta).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[job.status] || job.status}
                      </span>
                    </TableCell>
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
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
            <DialogDescription>
              Enter the details for the new import job.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Job No</Label>
              <Input
                className="col-span-3"
                value={newJob.job_no}
                onChange={(e) => setNewJob({ ...newJob, job_no: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Customer *</Label>
              <Select
                value={newJob.customer_id}
                onValueChange={(value) => setNewJob({ ...newJob, customer_id: value })}
              >
                <SelectTrigger className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">B/L Number</Label>
              <Input
                className="col-span-3"
                value={newJob.bl_no}
                onChange={(e) => setNewJob({ ...newJob, bl_no: e.target.value })}
                placeholder="e.g., MAEU123456789"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Shipping Line</Label>
              <Input
                className="col-span-3"
                value={newJob.shipping_line}
                onChange={(e) => setNewJob({ ...newJob, shipping_line: e.target.value })}
                placeholder="e.g., Maersk, MSC, CMA CGM"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Vessel Name</Label>
              <Input
                className="col-span-3"
                value={newJob.vessel_name}
                onChange={(e) => setNewJob({ ...newJob, vessel_name: e.target.value })}
                placeholder="e.g., MSC Anna"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Port of Loading</Label>
              <Input
                className="col-span-3"
                value={newJob.pol}
                onChange={(e) => setNewJob({ ...newJob, pol: e.target.value })}
                placeholder="e.g., Shanghai, China"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Port (POD) *</Label>
              <Select
                value={newJob.pod}
                onValueChange={(value) => setNewJob({ ...newJob, pod: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select port of discharge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mundra">Mundra</SelectItem>
                  <SelectItem value="Nhava Sheva">Nhava Sheva (JNPT)</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Kolkata">Kolkata</SelectItem>
                  <SelectItem value="Tuticorin">Tuticorin</SelectItem>
                  <SelectItem value="Cochin">Cochin</SelectItem>
                  <SelectItem value="Mumbai Air">Mumbai Air Cargo</SelectItem>
                  <SelectItem value="Delhi Air">Delhi Air Cargo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">ETA *</Label>
              <Input
                type="date"
                className="col-span-3"
                value={newJob.eta}
                onChange={(e) => setNewJob({ ...newJob, eta: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateJob} disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
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
              Are you sure you want to delete job "{deletingJob?.job_no}"? This will also delete all containers, milestones, and documents associated with this job.
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
