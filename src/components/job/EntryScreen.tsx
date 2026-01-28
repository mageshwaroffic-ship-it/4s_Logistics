import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Save } from 'lucide-react';

interface EntryScreenProps {
  data?: any;
}

export function EntryScreen({ data = {} }: EntryScreenProps) {
  const fieldGroups = [
    {
      title: 'Entry Information',
      fields: [
        { label: 'Entry Number', value: data.entryNumber || '' },
        { label: 'Entry Date', value: data.entryDate || '' },
        { label: 'Port of Entry', value: data.portOfEntry || '' },
        { label: 'Mode of Transport', value: data.modeOfTransport || '' },
      ],
    },
    {
      title: 'Parties',
      fields: [
        { label: 'Importer of Record', value: data.importerOfRecord || '' },
        { label: 'Consignee', value: data.consignee || '' },
      ],
    },
    {
      title: 'Transport Details',
      fields: [
        { label: 'Vessel Name', value: data.vesselName || '' },
        { label: 'Voyage Number', value: data.voyageNumber || '' },
        { label: 'Arrival Date', value: data.arrivalDate || '' },
        { label: 'Bill of Lading', value: data.billOfLading || '' },
        { label: 'Container Number', value: data.containerNumber || '' },
      ],
    },
    {
      title: 'Goods Information',
      fields: [
        { label: 'HS Code', value: data.hsCode || '' },
        { label: 'Description', value: data.description || '' },
        { label: 'Quantity', value: data.quantity || '' },
        { label: 'Declared Value', value: data.declaredValue || '' },
      ],
    },
  ];

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Entry Form</h3>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button>
            <Send className="w-4 h-4 mr-2" />
            Submit Entry
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {fieldGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h4 className="font-medium text-muted-foreground mb-4">{group.title}</h4>
            <div className="grid grid-cols-2 gap-4">
              {group.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Input defaultValue={field.value} readOnly className="bg-muted/50" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="border-t pt-6">
          <h4 className="font-medium text-muted-foreground mb-4">Duty & Fee Estimates</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Duty Rate</p>
              <p className="text-lg font-semibold">{data.dutyRate || '0%'}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Estimated Duty</p>
              <p className="text-lg font-semibold">{data.estimatedDuty || '$0.00'}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">HMF + MPF</p>
              <p className="text-lg font-semibold">${data.hmfMpf || '$0.00'}</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary">Total Estimate</p>
              <p className="text-lg font-bold text-primary">{data.totalEstimate || '$0.00'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
