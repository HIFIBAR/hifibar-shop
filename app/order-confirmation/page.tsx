'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      loadOrder();
    }
  }, [orderNumber]);

  async function loadOrder() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Chargement...</div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-4">Commande introuvable</p>
        <Link href="/produits">
          <Button>Retour aux produits</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Commande confirmée !</h1>
          <p className="text-gray-600 mb-6">
            Merci pour votre commande. Nous la traiterons dans les plus brefs délais.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="font-semibold mb-4">Détails de la commande</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Numéro de commande :</span>
                <span className="font-semibold">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email :</span>
                <span>{order.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant total :</span>
                <span className="font-semibold">{order.total_price.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison :</span>
                <span>{order.shipping_price.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-sm">
            <p className="text-blue-900">
              Vous recevrez un email de confirmation à <strong>{order.customer_email}</strong> avec tous les détails de votre commande.
            </p>
          </div>

          <Link href="/produits">
            <Button className="w-full">Continuer mes achats</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
