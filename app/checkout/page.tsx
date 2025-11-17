'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCart, clearCart, CartItem } from '@/lib/cart';
import { shippingService } from '@/lib/shipping/shipping-service';
import { calculateCartWeight } from '@/lib/shipping/weight-calculator';
import { ShippingRateCard } from '@/components/shipping/shipping-rate-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { ShippingRate } from '@/lib/shipping/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRates, setLoadingRates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [totalWeight, setTotalWeight] = useState(0);

  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'FR'
  });

  useEffect(() => {
    loadCartData();
  }, []);

  async function loadCartData() {
    const cartItems = getCart();
    setCart(cartItems);

    if (cartItems.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', cartItems.map(item => item.productId));

      if (error) throw error;
      setProducts(data || []);

      const weight = calculateCartWeight(cartItems, data || []);
      setTotalWeight(weight);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les produits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGetRates() {
    if (!customerInfo.postal_code || !customerInfo.city) {
      toast({
        title: 'Informations manquantes',
        description: 'Veuillez renseigner votre code postal et ville',
        variant: 'destructive',
      });
      return;
    }

    setLoadingRates(true);
    try {
      const rates = await shippingService.getAllRates(
        {
          name: customerInfo.name,
          address: customerInfo.address,
          postal_code: customerInfo.postal_code,
          city: customerInfo.city,
          country: customerInfo.country,
        },
        totalWeight
      );

      setShippingRates(rates);

      if (rates.length === 0) {
        toast({
          title: 'Aucun transporteur disponible',
          description: 'Veuillez vérifier votre adresse',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error getting rates:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les tarifs de livraison',
        variant: 'destructive',
      });
    } finally {
      setLoadingRates(false);
    }
  }

  async function handleCreateOrderAndPay() {
    if (!customerInfo.email || !customerInfo.name || !customerInfo.address) {
      toast({
        title: 'Informations manquantes',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedRate) {
      toast({
        title: 'Livraison non sélectionnée',
        description: 'Veuillez choisir une option de livraison',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product?.prix || 0) * item.quantity;
      }, 0);

      const orderNumber = `CMD${Date.now()}`;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_email: customerInfo.email,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          shipping_address: customerInfo.address,
          shipping_postal_code: customerInfo.postal_code,
          shipping_city: customerInfo.city,
          shipping_country: customerInfo.country,
          subtotal: subtotal,
          subtotal_products: subtotal,
          shipping_price: selectedRate.price,
          total_price: subtotal + selectedRate.price,
          total_weight: totalWeight,
          selected_carrier: selectedRate.carrier,
          carrier_service: selectedRate.service,
          delivery_type: selectedRate.delivery_type,
          status: 'pending',
          payment_status: 'pending',
          shipping_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          order_id: orderData.id,
          product_id: item.productId,
          product_code: product?.code || '',
          product_name: `${product?.marque_tv || ''} ${product?.modele_tv || ''}`,
          quantity: item.quantity,
          unit_price: product?.prix || 0,
          unit_weight: product?.poids_gr || 0,
          total_price: (product?.prix || 0) * item.quantity,
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setCreatedOrderId(orderData.id);

      if (paymentMethod === 'stripe') {
        const response = await fetch('/api/checkout/create-stripe-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderData.id }),
        });

        const data = await response.json();

        if (!response.ok || !data.url) {
          throw new Error(data.error || 'Erreur Stripe');
        }

        clearCart();
        window.location.href = data.url;
      } else if (paymentMethod === 'paypal') {
        const response = await fetch('/api/checkout/create-paypal-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderData.id }),
        });

        const data = await response.json();

        if (!response.ok || !data.links) {
          throw new Error(data.error || 'Erreur PayPal');
        }

        const approveLink = data.links.find((link: any) => link.rel === 'approve');
        if (approveLink) {
          clearCart();
          window.location.href = approveLink.href;
        }
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer la commande',
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  }

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product?.prix || 0) * item.quantity;
  }, 0);

  const total = subtotal + (selectedRate?.price || 0);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Chargement...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-4">Votre panier est vide</p>
        <Link href="/produits">
          <Button>Voir les produits</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/panier" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour au panier
      </Link>

      <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet *</label>
                  <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Téléphone</label>
                <Input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Adresse *</label>
                <Input
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  placeholder="123 Rue de la République"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Code postal *</label>
                  <Input
                    value={customerInfo.postal_code}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, postal_code: e.target.value })}
                    placeholder="75001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ville *</label>
                  <Input
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pays *</label>
                  <Input
                    value={customerInfo.country}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, country: e.target.value })}
                    placeholder="FR"
                    maxLength={2}
                  />
                </div>
              </div>

              <Button
                onClick={handleGetRates}
                disabled={loadingRates}
                className="w-full"
              >
                {loadingRates && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Obtenir les options de livraison
              </Button>
            </CardContent>
          </Card>

          {shippingRates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Options de livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shippingRates.map((rate, index) => (
                  <ShippingRateCard
                    key={`${rate.carrier}-${rate.service}-${index}`}
                    rate={rate}
                    selected={selectedRate === rate}
                    onSelect={() => setSelectedRate(rate)}
                    weight={totalWeight}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{product.marque_tv} {product.modele_tv} x{item.quantity}</span>
                    <span>{(product.prix * item.quantity).toFixed(2)} €</span>
                  </div>
                );
              })}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                {selectedRate && (
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>{selectedRate.price.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              {selectedRate && (
                <>
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">Mode de paiement</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setPaymentMethod('stripe')}
                        className={`w-full p-3 border rounded-lg text-left transition ${
                          paymentMethod === 'stripe' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="font-semibold">Carte bancaire</div>
                        <div className="text-xs text-gray-600">Visa, Mastercard, Amex + Apple Pay / Google Pay</div>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('paypal')}
                        className={`w-full p-3 border rounded-lg text-left transition ${
                          paymentMethod === 'paypal' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="font-semibold">PayPal</div>
                        <div className="text-xs text-gray-600">Payer avec votre compte PayPal</div>
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateOrderAndPay}
                    disabled={submitting}
                    className="w-full"
                    size="lg"
                  >
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Payer en toute sécurité
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    🔒 Paiement 100% sécurisé
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
