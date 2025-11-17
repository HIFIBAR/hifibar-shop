import { BaseCarrier } from './base';
import { ShippingRate, ShipmentRequest, ShipmentResponse, ShippingAddress } from '../types';

export class UPSCarrier extends BaseCarrier {
  private readonly baseUrl = 'https://onlinetools.ups.com/api';

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
          carrier: 'ups',
          service: 'STANDARD',
          delivery_type: 'home',
          price: homePrice,
          currency: 'EUR',
          estimated_days: 2,
          description: 'UPS Standard - Livraison à domicile'
        },
        {
          carrier: 'ups',
          service: 'PICKUP',
          delivery_type: 'pickup',
          price: pickupPrice,
          currency: 'EUR',
          estimated_days: 2,
          description: 'UPS - Retrait en point UPS'
        }
      ];
    } catch (error) {
      console.error('UPS rate error:', error);
      return [];
    }
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'UPS API key not configured'
      };
    }

    try {
      return {
        success: true,
        tracking_number: `1Z${Date.now()}`,
        label_url: '/api/labels/placeholder.pdf',
        error: 'Demo mode - Real API integration needed'
      };
    } catch (error) {
      return this.handleApiError(error, 'UPS');
    }
  }

  private calculatePrice(weight: number, country: string, service: string): number {
    let basePrice = service === 'pickup' ? 10.00 : 13.00;
    const weightPrice = Math.ceil(weight / 1000) * 1.50;
    const countryMultiplier = country === 'FR' ? 1 : 2.2;

    return parseFloat((basePrice + weightPrice * countryMultiplier).toFixed(2));
  }
}
