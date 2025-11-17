import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
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
      .select('stripe_secret_key')
      .limit(1)
      .maybeSingle();

    if (!settings || !settings.stripe_secret_key) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(settings.stripe_secret_key, {
      apiVersion: '2025-10-29.clover',
    });

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (items) {
      for (const item of items) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.product_name,
              description: `Code: ${item.product_code}`,
            },
            unit_amount: Math.round(item.unit_price * 100),
          },
          quantity: item.quantity,
        });
      }
    }

    if (order.shipping_price > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Livraison - ${order.selected_carrier}`,
            description: order.carrier_service,
          },
          unit_amount: Math.round(order.shipping_price * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/order-confirmation?order=${order.order_number}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/checkout?cancelled=true`,
      customer_email: order.customer_email,
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          orderNumber: order.order_number,
        },
      },
    });

    await supabase
      .from('orders')
      .update({
        stripe_session_id: session.id,
        payment_method: 'stripe',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error: any) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
