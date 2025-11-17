import { BaseCarrier } from './base';
import { ShippingRate, ShipmentRequest, ShipmentResponse, RelayPoint, ShippingAddress } from '../types';

export class MondialRelayCarrier extends BaseCarrier {
  private readonly baseUrl = 'https://api.mondialrelay.com';

  async getRates(
    sender: ShippingAddress,
    recipient: ShippingAddress,
    weight: number
  ): Promise<ShippingRate[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const basePrice = this.calculatePrice(weight, recipient.country);

      return [
        {
          carrier: 'mondial_relay',
          service: 'RELAY_POINT',
          delivery_type: 'relay',
          price: basePrice,
          currency: 'EUR',
          estimated_days: 3,
          description: 'Livraison en Point Relais'
        }
      ];
    } catch (error) {
      console.error('Mondial Relay rate error:', error);
      return [];
    }
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Mondial Relay API key not configured'
      };
    }

    try {
      return {
        success: true,
        tracking_number: `MR${Date.now()}`,
        label_url: '/api/labels/placeholder.pdf',
        error: 'Demo mode - Real API integration needed'
      };
    } catch (error) {
      return this.handleApiError(error, 'Mondial Relay');
    }
  }

  async getRelayPoints(
    address: string,
    postalCode: string,
    city: string,
    country: string
  ): Promise<RelayPoint[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      return [
        {
          id: 'MR001',
          name: 'Relais Colis - Centre Ville',
          address: '123 Rue Principale',
          postal_code: postalCode,
          city: city,
          country: country,
          distance: 0.5
        },
        {
          id: 'MR002',
          name: 'Point Relais - Gare',
          address: '45 Avenue de la Gare',
          postal_code: postalCode,
          city: city,
          country: country,
          distance: 1.2
        }
      ];
    } catch (error) {
      console.error('Mondial Relay relay points error:', error);
      return [];
    }
  }

  private calculatePrice(weight: number, country: string): number {
    const basePrice = 4.95;
    const weightPrice = Math.ceil(weight / 1000) * 0.50;
    const countryMultiplier = country === 'FR' ? 1 : 1.5;

    return parseFloat((basePrice + weightPrice * countryMultiplier).toFixed(2));
  }
}
