import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Truck, Check, Package } from 'lucide-react';

export function TransportDelivery() {
  const [carrier, setCarrier] = useState('');
  const [podUploaded, setPodUploaded] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'in-transit' | 'delivered'>('pending');

  const handleUploadPod = () => {
    setPodUploaded(true);
    setDeliveryStatus('delivered');
  };

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Transport & Delivery</h3>
        <Badge
          className={
            deliveryStatus === 'delivered'
              ? 'status-delivered'
              : deliveryStatus === 'in-transit'
              ? 'status-submitted'
              : 'status-prealert'
          }
        >
          {deliveryStatus === 'delivered' && <Check className="w-3 h-3 mr-1" />}
          {deliveryStatus === 'in-transit' && <Truck className="w-3 h-3 mr-1" />}
          {deliveryStatus === 'pending' && <Package className="w-3 h-3 mr-1" />}
          {deliveryStatus === 'pending'
            ? 'Pending Pickup'
            : deliveryStatus === 'in-transit'
            ? 'In Transit'
            : 'Delivered'}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Transport Carrier</label>
          <Select value={carrier} onValueChange={(v) => { setCarrier(v); setDeliveryStatus('in-transit'); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select carrier..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xpo">XPO Logistics</SelectItem>
              <SelectItem value="jbhunt">J.B. Hunt</SelectItem>
              <SelectItem value="schneider">Schneider</SelectItem>
              <SelectItem value="fedex">FedEx Freight</SelectItem>
              <SelectItem value="ups">UPS Freight</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {carrier && (
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Pickup Date</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estimated Delivery</p>
                <p className="font-medium">
                  {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Destination</p>
                <p className="font-medium">Los Angeles, CA</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tracking #</p>
                <p className="font-medium">TRK-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <label className="text-sm font-medium mb-2 block">Proof of Delivery</label>
          {!podUploaded ? (
            <Button variant="outline" onClick={handleUploadPod} disabled={!carrier}>
              <Upload className="w-4 h-4 mr-2" />
              Upload POD
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-success">
              <Check className="w-5 h-5" />
              <span className="font-medium">POD Uploaded - Delivery Confirmed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
