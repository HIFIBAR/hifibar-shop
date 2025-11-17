export type CarrierType = 'colissimo' | 'mondial_relay' | 'dhl' | 'ups';

export type DeliveryType = 'home' | 'pickup' | 'relay';

export interface ShippingSettings {
  id: string;
  sender_name: string;
  sender_address: string;
  sender_postal_code: string;
  sender_city: string;
  sender_country: string;
  pickup_allowed_dhl: boolean;
  pickup_allowed_ups: boolean;
  pickup_allowed_laposte: boolean;
  api_key_colissimo: string;
  api_key_mondial_relay: string;
  api_key_dhl: string;
  api_key_ups: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface RelayPoint {
  id: string;
  name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  opening_hours?: string;
}

export interface ShippingRate {
  carrier: CarrierType;
  service: string;
  delivery_type: DeliveryType;
  price: number;
  currency: string;
  estimated_days?: number;
  description?: string;
}

export interface ShipmentRequest {
  order_id: string;
  carrier: CarrierType;
  service: string;
  delivery_type: DeliveryType;
  sender: ShippingAddress;
  recipient: ShippingAddress;
  relay_point?: RelayPoint;
  weight_grams: number;
  packages: Array<{
    weight: number;
    length?: number;
    width?: number;
    height?: number;
  }>;
  reference?: string;
}

export interface ShipmentResponse {
  success: boolean;
  tracking_number?: string;
  label_url?: string;
  label_base64?: string;
  error?: string;
  carrier_response?: any;
}

export interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_postal_code: string;
  shipping_city: string;
  shipping_country: string;
  billing_address: string;
  billing_postal_code: string;
  billing_city: string;
  billing_country: string;
  subtotal: number;
  shipping_price: number;
  total_price: number;
  total_weight: number;
  selected_carrier: string;
  carrier_service: string;
  delivery_type: string;
  relay_point_id: string;
  relay_point_name: string;
  relay_point_address: string;
  tracking_number: string;
  label_pdf_url: string;
  status: string;
  payment_status: string;
  shipping_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_weight: number;
  total_price: number;
  created_at: string;
}
