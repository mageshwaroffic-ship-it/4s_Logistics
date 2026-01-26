import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Plus, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const invoices = [
  { id: 'INV-2024-001', job: 'JOB-2024-007', customer: 'Southern Imports Inc.', amount: 7778, status: 'paid', date: '2024-01-22' },
  { id: 'INV-2024-002', job: 'JOB-2024-005', customer: 'Midwest Manufacturing', amount: 10278, status: 'pending', date: '2024-01-26' },
  { id: 'INV-2024-003', job: 'JOB-2024-003', customer: 'Pacific Imports LLC', amount: 6178, status: 'sent', date: '2024-01-27' },
  { id: 'INV-2024-004', job: 'JOB-2024-004', customer: 'Atlantic Distributors', amount: 16778, status: 'draft', date: '2024-01-28' },
];

const statusConfig = {
  paid: { label: 'Paid', class: 'status-cleared' },
  sent: { label: 'Sent', class: 'status-submitted' },
  pending: { label: 'Pending', class: 'status-pending' },
  draft: { label: 'Draft', class: 'status-prealert' },
};

export default function BillingPage() {
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter((i) => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter((i) => i.status !== 'paid').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-muted-foreground">Manage invoices and payments</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="section-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="section-card">
          <div className="flex items-center gap-2 text-success mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Paid</span>
          </div>
          <p className="text-2xl font-bold text-success">${paidAmount.toLocaleString()}</p>
        </div>
        <div className="section-card">
          <div className="flex items-center gap-2 text-warning mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-warning">${pendingAmount.toLocaleString()}</p>
        </div>
        <div className="section-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">This Month</span>
          </div>
          <p className="text-2xl font-bold">{invoices.length} invoices</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Invoice #</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const status = statusConfig[invoice.status as keyof typeof statusConfig];

              return (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.job}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell className="font-semibold">${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={`status-badge ${status.class}`}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
