import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const token = searchParams.get('token');

    if (!orderId || !token) {
      return NextResponse.redirect(`${request.nextUrl.origin}/checkout?error=missing_params`);
    }

    const { data: settings } = await supabase
      .from('shipping_settings')
      .select('paypal_client_id, paypal_secret, paypal_mode')
      .limit(1)
      .maybeSingle();

    if (!settings || !settings.paypal_client_id || !settings.paypal_secret) {
      return NextResponse.redirect(`${request.nextUrl.origin}/checkout?error=paypal_not_configured`);
    }

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.redirect(`${request.nextUrl.origin}/checkout?error=order_not_found`);
    }

    const baseUrl = settings.paypal_mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const auth = Buffer.from(`${settings.paypal_client_id}:${settings.paypal_secret}`).toString('base64');

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'COMPLETED') {
      console.error('PayPal capture error:', data);
      return NextResponse.redirect(`${request.nextUrl.origin}/checkout?error=payment_failed`);
    }

    const payerEmail = data.payer?.email_address || '';

    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_status: 'paid',
        paypal_payer_email: payerEmail,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (items) {
      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock_qty')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const newStock = Math.max(0, product.stock_qty - item.quantity);
          await supabase
            .from('products')
            .update({ stock_qty: newStock })
            .eq('id', item.product_id);
        }
      }
    }

    return NextResponse.redirect(`${request.nextUrl.origin}/order-confirmation?order=${order.order_number}`);

  } catch (error: any) {
    console.error('PayPal capture error:', error);
    return NextResponse.redirect(`${request.nextUrl.origin}/checkout?error=capture_failed`);
  }
}
