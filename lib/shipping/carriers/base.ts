import { ShippingRate, ShipmentRequest, ShipmentResponse, RelayPoint, ShippingAddress } from '../types';

export abstract class BaseCarrier {
  protected apiKey: string;
  protected testMode: boolean;

  constructor(apiKey: string, testMode: boolean = false) {
    this.apiKey = apiKey;
    this.testMode = testMode;
  }

  abstract getRates(
    sender: ShippingAddress,
    recipient: ShippingAddress,
    weight: number
  ): Promise<ShippingRate[]>;

  abstract createShipment(request: ShipmentRequest): Promise<ShipmentResponse>;

  async getRelayPoints?(
    address: string,
    postalCode: string,
    city: string,
    country: string
  ): Promise<RelayPoint[]> {
    return [];
  }

  async trackShipment?(trackingNumber: string): Promise<any> {
    return { status: 'unknown', tracking: trackingNumber };
  }

  protected async handleApiError(error: any, carrier: string): Promise<ShipmentResponse> {
    console.error(`${carrier} API Error:`, error);
    return {
      success: false,
      error: error.message || `${carrier} API error`,
      carrier_response: error
    };
  }
}
