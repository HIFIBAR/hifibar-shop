import { BaseCarrier } from './base';
import { ShippingRate, ShipmentRequest, ShipmentResponse, ShippingAddress } from '../types';

export class ColissimoCarrier extends BaseCarrier {
  private readonly baseUrl = 'https://ws.colissimo.fr/sls-ws';

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
          carrier: 'colissimo',
          service: 'DOMICILE',
          delivery_type: 'home',
          price: homePrice,
          currency: 'EUR',
          estimated_days: 2,
          description: 'Colissimo Domicile - Livraison à domicile'
        },
        {
          carrier: 'colissimo',
          service: 'PICKUP',
          delivery_type: 'pickup',
          price: pickupPrice,
          currency: 'EUR',
          estimated_days: 1,
          description: 'Colissimo - Retrait au dépôt'
        }
      ];
    } catch (error) {
      console.error('Colissimo rate error:', error);
      return [];
    }
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Colissimo API key not configured'
      };
    }

    try {
      return {
        success: true,
        tracking_number: `6A${Date.now()}`,
        label_url: '/api/labels/placeholder.pdf',
        error: 'Demo mode - Real API integration needed'
      };
    } catch (error) {
      return this.handleApiError(error, 'Colissimo');
    }
  }

  async trackShipment(trackingNumber: string): Promise<any> {
    return { status: 'unknown', tracking: trackingNumber };
  }

  private calculatePrice(weight: number, country: string, service: string): number {
    let basePrice = service === 'pickup' ? 5.50 : 6.90;
    const weightPrice = Math.ceil(weight / 1000) * 0.75;
    const countryMultiplier = country === 'FR' ? 1 : 1.8;

    return parseFloat((basePrice + weightPrice * countryMultiplier).toFixed(2));
  }
}
