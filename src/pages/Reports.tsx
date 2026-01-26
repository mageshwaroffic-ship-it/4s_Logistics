import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, BarChart3, PieChart, TrendingUp, FileText } from 'lucide-react';

const reports = [
  { id: 'r1', name: 'Monthly Activity Report', type: 'Activity', period: 'January 2024', status: 'ready' },
  { id: 'r2', name: 'Duty Disbursement Summary', type: 'Financial', period: 'January 2024', status: 'ready' },
  { id: 'r3', name: 'Importer Performance Report', type: 'Analytics', period: 'Q4 2023', status: 'ready' },
  { id: 'r4', name: 'Port Statistics Report', type: 'Analytics', period: 'January 2024', status: 'generating' },
  { id: 'r5', name: 'Compliance Audit Report', type: 'Compliance', period: 'December 2023', status: 'ready' },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and download operational reports</p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="section-card">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Jobs This Month</span>
          </div>
          <p className="text-3xl font-bold">122</p>
          <p className="text-sm text-success">+12% vs last month</p>
        </div>
        <div className="section-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-success" />
            <span className="text-sm text-muted-foreground">Clearance Rate</span>
          </div>
          <p className="text-3xl font-bold">94.2%</p>
          <p className="text-sm text-success">+2.1% vs last month</p>
        </div>
        <div className="section-card">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-info" />
            <span className="text-sm text-muted-foreground">Avg. Clearance Time</span>
          </div>
          <p className="text-3xl font-bold">2.4 days</p>
          <p className="text-sm text-success">-0.3 days vs last month</p>
        </div>
        <div className="section-card">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">Active Importers</span>
          </div>
          <p className="text-3xl font-bold">28</p>
          <p className="text-sm text-muted-foreground">No change</p>
        </div>
      </div>

      {/* Available Reports */}
      <div className="section-card">
        <h2 className="text-lg font-semibold mb-4">Available Reports</h2>
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {report.type} • {report.period}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  className={
                    report.status === 'ready' ? 'status-cleared' : 'status-pending'
                  }
                >
                  {report.status === 'ready' ? 'Ready' : 'Generating...'}
                </Badge>
                <Button variant="outline" size="sm" disabled={report.status !== 'ready'}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
