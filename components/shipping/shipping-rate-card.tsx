import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ShippingRate } from '@/lib/shipping/types';
import { formatWeight } from '@/lib/shipping/weight-calculator';

interface ShippingRateCardProps {
  rate: ShippingRate;
  selected: boolean;
  onSelect: () => void;
  weight?: number;
}

export function ShippingRateCard({ rate, selected, onSelect, weight }: ShippingRateCardProps) {
  const carrierNames = {
    colissimo: 'La Poste / Colissimo',
    mondial_relay: 'Mondial Relay',
    dhl: 'DHL Express',
    ups: 'UPS'
  };

  const deliveryTypeLabels = {
    home: 'Livraison à domicile',
    pickup: 'Retrait en dépôt',
    relay: 'Point Relais'
  };

  return (
    <Card
      className={`p-4 cursor-pointer transition hover:shadow-md ${
        selected ? 'border-2 border-blue-600 bg-blue-50' : 'border'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{carrierNames[rate.carrier]}</h3>
            {selected && <Check className="w-5 h-5 text-blue-600" />}
          </div>
          <p className="text-sm text-gray-600 mb-2">{rate.description || deliveryTypeLabels[rate.delivery_type]}</p>
          {rate.estimated_days && (
            <p className="text-xs text-gray-500">
              Délai estimé : {rate.estimated_days} jour{rate.estimated_days > 1 ? 's' : ''}
            </p>
          )}
          {weight && (
            <p className="text-xs text-gray-500 mt-1">
              Poids total (avec emballage) : {formatWeight(weight)}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {rate.price.toFixed(2)} {rate.currency}
          </div>
        </div>
      </div>
    </Card>
  );
}
