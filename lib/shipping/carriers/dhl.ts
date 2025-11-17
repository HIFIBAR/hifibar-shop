import { BaseCarrier } from './base';
import { ShippingRate, ShipmentRequest, ShipmentResponse, ShippingAddress } from '../types';

export class DHLCarrier extends BaseCarrier {
  private readonly baseUrl = 'https://express.api.dhl.com';

  async getRates(
    sender: ShippingAddress,
    recipient: ShippingAddress,
    weight: number
  ): Promise<ShippingRate[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const homePrice = this.calculatePrice(weight, recipient.country, 'home');
      const pickupPrice = this.calculatePrice(weight, recipient.country, 'pickup');

      return [
        {
          carrier: 'dhl',
          service: 'EXPRESS',
          delivery_type: 'home',
          price: homePrice,
          currency: 'EUR',
          estimated_days: 1,
          description: 'DHL Express - Livraison express à domicile'
        },
        {
          carrier: 'dhl',
          service: 'PICKUP',
          delivery_type: 'pickup',
          price: pickupPrice,
          currency: 'EUR',
          estimated_days: 1,
          description: 'DHL Express - Retrait en dépôt'
        }
      ];
    } catch (error) {
      console.error('DHL rate error:', error);
      return [];
    }
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'DHL API key not configured'
      };
    }

    try {
      return {
        success: true,
        tracking_number: `DHL${Date.now()}`,
        label_url: '/api/labels/placeholder.pdf',
        error: 'Demo mode - Real API integration needed'
      };
    } catch (error) {
      return this.handleApiError(error, 'DHL');
    }
  }

  private calculatePrice(weight: number, country: string, service: string): number {
    let basePrice = service === 'pickup' ? 12.00 : 15.00;
    const weightPrice = Math.ceil(weight / 1000) * 2.00;
    const countryMultiplier = country === 'FR' ? 1 : 2.5;

    return parseFloat((basePrice + weightPrice * countryMultiplier).toFixed(2));
  }
}
