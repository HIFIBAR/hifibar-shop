import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const { data: settings } = await supabase
      .from('shipping_settings')
      .select('paypal_client_id, paypal_secret, paypal_mode')
      .limit(1)
      .maybeSingle();

    if (!settings || !settings.paypal_client_id || !settings.paypal_secret) {
      return NextResponse.json({ error: 'PayPal not configured' }, { status: 500 });
    }

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    const paypalItems = items?.map(item => ({
      name: item.product_name.substring(0, 127),
      description: `Code: ${item.product_code}`,
      quantity: item.quantity.toString(),
      unit_amount: {
        currency_code: 'EUR',
        value: item.unit_price.toFixed(2),
      },
    })) || [];

    if (order.shipping_price > 0) {
      paypalItems.push({
        name: `Livraison - ${order.selected_carrier}`,
        description: order.carrier_service,
        quantity: '1',
        unit_amount: {
          currency_code: 'EUR',
          value: order.shipping_price.toFixed(2),
        },
      });
    }

    const baseUrl = settings.paypal_mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const auth = Buffer.from(`${settings.paypal_client_id}:${settings.paypal_secret}`).toString('base64');

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: order.order_number,
          items: paypalItems,
          amount: {
            currency_code: 'EUR',
            value: order.total_price.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: order.total_price.toFixed(2),
              },
            },
          },
        }],
        application_context: {
          brand_name: 'HIFI BAR',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${request.nextUrl.origin}/api/checkout/capture-paypal-order?orderId=${orderId}`,
          cancel_url: `${request.nextUrl.origin}/checkout?cancelled=true`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayPal order creation error:', data);
      return NextResponse.json({ error: data.message || 'PayPal error' }, { status: 500 });
    }

    await supabase
      .from('orders')
      .update({
        paypal_order_id: data.id,
        payment_method: 'paypal',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return NextResponse.json({ id: data.id, links: data.links });

  } catch (error: any) {
    console.error('PayPal order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
