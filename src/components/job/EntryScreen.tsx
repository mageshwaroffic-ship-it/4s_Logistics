import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { entryFormData } from '@/data/dummyData';
import { Send, Save } from 'lucide-react';

export function EntryScreen() {
  const fieldGroups = [
    {
      title: 'Entry Information',
      fields: [
        { label: 'Entry Number', value: entryFormData.entryNumber },
        { label: 'Entry Date', value: entryFormData.entryDate },
        { label: 'Port of Entry', value: entryFormData.portOfEntry },
        { label: 'Mode of Transport', value: entryFormData.modeOfTransport },
      ],
    },
    {
      title: 'Parties',
      fields: [
        { label: 'Importer of Record', value: entryFormData.importerOfRecord },
        { label: 'Consignee', value: entryFormData.consignee },
      ],
    },
    {
      title: 'Transport Details',
      fields: [
        { label: 'Vessel Name', value: entryFormData.vesselName },
        { label: 'Voyage Number', value: entryFormData.voyageNumber },
        { label: 'Arrival Date', value: entryFormData.arrivalDate },
        { label: 'Bill of Lading', value: entryFormData.billOfLading },
        { label: 'Container Number', value: entryFormData.containerNumber },
      ],
    },
    {
      title: 'Goods Information',
      fields: [
        { label: 'HS Code', value: entryFormData.hsCode },
        { label: 'Description', value: entryFormData.description },
        { label: 'Quantity', value: entryFormData.quantity },
        { label: 'Declared Value', value: entryFormData.declaredValue },
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
              <p className="text-lg font-semibold">{entryFormData.dutyRate}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Estimated Duty</p>
              <p className="text-lg font-semibold">{entryFormData.estimatedDuty}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">HMF + MPF</p>
              <p className="text-lg font-semibold">${(21.25 + 528).toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary">Total Estimate</p>
              <p className="text-lg font-bold text-primary">{entryFormData.totalEstimate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
