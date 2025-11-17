'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag } from 'lucide-react';
import { getCart, updateCartItemQuantity, removeFromCart, getCartTotal, type CartItem } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  function loadCart() {
    setCart(getCart());
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <p className="text-gray-600 mb-8">Découvrez nos produits et ajoutez-les à votre panier</p>
        <Link href="/produits">
          <Button>Voir les produits</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Votre panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.modele_tv}</h3>
                    <p className="text-sm text-gray-600 mb-2">Code: {item.code}</p>
                    <p className="text-lg font-bold text-blue-600">{item.prix.toFixed(2)} €</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{getCartTotal().toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frais de port</span>
                  <span>À calculer</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{getCartTotal().toFixed(2)} €</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button className="w-full" size="lg">
                  Commander maintenant
                </Button>
              </Link>
              <Link href="/demande-devis">
                <Button variant="outline" className="w-full mt-3">
                  Ou demander un devis
                </Button>
              </Link>
              <Link href="/produits">
                <Button variant="ghost" className="w-full mt-2">
                  Continuer mes achats
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
