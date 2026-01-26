import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck } from 'lucide-react';

interface ChecklistProps {
  items: { id: string; label: string; checked: boolean }[];
}

export function Checklist({ items: initialItems }: ChecklistProps) {
  const [items, setItems] = useState(initialItems);

  const completedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;
  const isComplete = completedCount === totalCount;

  const handleToggle = (id: string) => {
    setItems(items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Pre-Filing Checklist</h3>
        </div>
        <Badge className={isComplete ? 'status-cleared' : 'status-pending'}>
          {completedCount} / {totalCount} Complete
        </Badge>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              item.checked ? 'bg-emerald-50 border-emerald-200' : 'bg-card hover:bg-muted/50'
            }`}
            onClick={() => handleToggle(item.id)}
          >
            <Checkbox
              checked={item.checked}
              onCheckedChange={() => handleToggle(item.id)}
              className="data-[state=checked]:bg-success data-[state=checked]:border-success"
            />
            <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
