'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { shippingService } from '@/lib/shipping/shipping-service';
import { AdminGuard } from '@/components/admin-guard';
import { AdminLayout } from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Package, Loader2, Download, Eye } from 'lucide-react';
import type { Order, OrderItem } from '@/lib/shipping/types';

function OrdersContent() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingLabel, setGeneratingLabel] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les commandes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadOrderItems(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error loading order items:', error);
    }
  }

  async function handleGenerateLabel(order: Order) {
    setGeneratingLabel(order.id);
    try {
      const settings = await shippingService.getSettings();
      if (!settings) {
        throw new Error('Paramètres de livraison non configurés');
      }

      const response = await shippingService.createShipment({
        order_id: order.id,
        carrier: order.selected_carrier as any,
        service: order.carrier_service,
        delivery_type: order.delivery_type as any,
        sender: {
          name: settings.sender_name,
          address: settings.sender_address,
          postal_code: settings.sender_postal_code,
          city: settings.sender_city,
          country: settings.sender_country,
        },
        recipient: {
          name: order.customer_name,
          address: order.shipping_address,
          postal_code: order.shipping_postal_code,
          city: order.shipping_city,
          country: order.shipping_country,
          email: order.customer_email,
          phone: order.customer_phone,
        },
        weight_grams: order.total_weight,
        packages: [{ weight: order.total_weight }],
        reference: order.order_number,
      });

      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de la génération de l\'étiquette');
      }

      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: response.tracking_number || '',
          label_pdf_url: response.label_url || '',
          shipping_status: 'label_generated',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: 'Étiquette générée',
        description: `Numéro de suivi : ${response.tracking_number}`,
      });

      loadOrders();
    } catch (error: any) {
      console.error('Error generating label:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de générer l\'étiquette',
        variant: 'destructive',
      });
    } finally {
      setGeneratingLabel(null);
    }
  }

  function handleViewOrder(order: Order) {
    setSelectedOrder(order);
    loadOrderItems(order.id);
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    label_generated: 'bg-blue-100 text-blue-800',
    shipped: 'bg-green-100 text-green-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    label_generated: 'Étiquette générée',
    shipped: 'Expédié',
    delivered: 'Livré',
    cancelled: 'Annulé',
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Gestion des commandes</h1>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              Aucune commande pour le moment
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{order.order_number}</h3>
                        <Badge className={statusColors[order.shipping_status] || 'bg-gray-100'}>
                          {statusLabels[order.shipping_status] || order.shipping_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {order.total_price.toFixed(2)} €
                      </p>
                      <p className="text-sm text-gray-600">
                        dont {order.shipping_price.toFixed(2)} € de livraison
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="font-semibold mb-1">Client</p>
                      <p>{order.customer_name}</p>
                      <p className="text-gray-600">{order.customer_email}</p>
                      {order.customer_phone && <p className="text-gray-600">{order.customer_phone}</p>}
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Livraison</p>
                      <p>{order.shipping_address}</p>
                      <p>{order.shipping_postal_code} {order.shipping_city}</p>
                      <p className="text-gray-600 mt-1">
                        {order.selected_carrier.toUpperCase()} - {order.carrier_service}
                      </p>
                      {order.total_weight > 0 && (
                        <p className="text-gray-600">Poids : {order.total_weight}g</p>
                      )}
                    </div>
                  </div>

                  {order.tracking_number && (
                    <div className="bg-blue-50 rounded p-3 mb-4">
                      <p className="text-sm">
                        <span className="font-semibold">Numéro de suivi :</span> {order.tracking_number}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir détails
                    </Button>

                    {!order.tracking_number && (
                      <Button
                        size="sm"
                        onClick={() => handleGenerateLabel(order)}
                        disabled={generatingLabel === order.id}
                      >
                        {generatingLabel === order.id && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Générer l'étiquette
                      </Button>
                    )}

                    {order.label_pdf_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={order.label_pdf_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger étiquette
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Détails de la commande</h2>
                  <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between border-b pb-2">
                      <div>
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="text-sm text-gray-600">Code: {item.product_code}</p>
                        <p className="text-sm text-gray-600">
                          Quantité: {item.quantity} × {item.unit_price.toFixed(2)} €
                        </p>
                      </div>
                      <p className="font-semibold">{item.total_price.toFixed(2)} €</p>
                    </div>
                  ))}

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span>Sous-total</span>
                      <span>{selectedOrder.subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Livraison</span>
                      <span>{selectedOrder.shipping_price.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{selectedOrder.total_price.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function OrdersPage() {
  return (
    <AdminGuard>
      <OrdersContent />
    </AdminGuard>
  );
}
