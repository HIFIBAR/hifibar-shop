import { supabase } from '@/lib/supabase';
import { MondialRelayCarrier } from './carriers/mondial-relay';
import { ColissimoCarrier } from './carriers/colissimo';
import { DHLCarrier } from './carriers/dhl';
import { UPSCarrier } from './carriers/ups';
import {
  ShippingSettings,
  ShippingRate,
  ShippingAddress,
  ShipmentRequest,
  ShipmentResponse,
  RelayPoint,
  CarrierType
} from './types';

export class ShippingService {
  private settings: ShippingSettings | null = null;

  async getSettings(): Promise<ShippingSettings | null> {
    if (this.settings) {
      return this.settings;
    }

    try {
      const { data, error } = await supabase
        .from('shipping_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      this.settings = data;
      return data;
    } catch (error) {
      console.error('Error loading shipping settings:', error);
      return null;
    }
  }

  async getAllRates(
    recipient: ShippingAddress,
    weight: number
  ): Promise<ShippingRate[]> {
    const settings = await this.getSettings();
    if (!settings) {
      return [];
    }

    const sender: ShippingAddress = {
      name: settings.sender_name,
      address: settings.sender_address,
      postal_code: settings.sender_postal_code,
      city: settings.sender_city,
      country: settings.sender_country
    };

    const carriers = [
      new MondialRelayCarrier(settings.api_key_mondial_relay),
      new ColissimoCarrier(settings.api_key_colissimo),
      new DHLCarrier(settings.api_key_dhl),
      new UPSCarrier(settings.api_key_ups)
    ];

    const allRates: ShippingRate[] = [];

    for (const carrier of carriers) {
      try {
        const rates = await carrier.getRates(sender, recipient, weight);
        allRates.push(...rates);
      } catch (error) {
        console.error(`Error getting rates from carrier:`, error);
      }
    }

    const filteredRates = allRates.filter(rate => {
      if (rate.delivery_type === 'pickup') {
        if (rate.carrier === 'dhl' && !settings.pickup_allowed_dhl) return false;
        if (rate.carrier === 'ups' && !settings.pickup_allowed_ups) return false;
        if (rate.carrier === 'colissimo' && !settings.pickup_allowed_laposte) return false;
      }
      return true;
    });

    return filteredRates.sort((a, b) => a.price - b.price);
  }

  async getRelayPoints(
    carrier: CarrierType,
    address: string,
    postalCode: string,
    city: string,
    country: string
  ): Promise<RelayPoint[]> {
    const settings = await this.getSettings();
    if (!settings) {
      return [];
    }

    if (carrier === 'mondial_relay') {
      const mondialRelay = new MondialRelayCarrier(settings.api_key_mondial_relay);
      return mondialRelay.getRelayPoints(address, postalCode, city, country);
    }

    return [];
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    const settings = await this.getSettings();
    if (!settings) {
      return {
        success: false,
        error: 'Shipping settings not configured'
      };
    }

    let carrier;
    switch (request.carrier) {
      case 'mondial_relay':
        carrier = new MondialRelayCarrier(settings.api_key_mondial_relay);
        break;
      case 'colissimo':
        carrier = new ColissimoCarrier(settings.api_key_colissimo);
        break;
      case 'dhl':
        carrier = new DHLCarrier(settings.api_key_dhl);
        break;
      case 'ups':
        carrier = new UPSCarrier(settings.api_key_ups);
        break;
      default:
        return {
          success: false,
          error: 'Unknown carrier'
        };
    }

    return carrier.createShipment(request);
  }
}

export const shippingService = new ShippingService();
