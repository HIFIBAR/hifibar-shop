import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const { data: settings } = await supabase
      .from('shipping_settings')
      .select('stripe_secret_key, stripe_webhook_secret')
      .limit(1)
      .maybeSingle();

    if (!settings || !settings.stripe_secret_key || !settings.stripe_webhook_secret) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(settings.stripe_secret_key, {
      apiVersion: '2025-10-29.clover',
    });

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        settings.stripe_webhook_secret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error('No orderId in session metadata');
        return NextResponse.json({ error: 'No orderId' }, { status: 400 });
      }

      const paymentIntent = session.payment_intent as string;

      await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'paid',
          stripe_payment_id: paymentIntent,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (order) {
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
      }

      console.log(`Order ${orderId} marked as paid`);
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
