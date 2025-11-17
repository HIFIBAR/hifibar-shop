'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, ExternalLink, ArrowLeft } from 'lucide-react';
import { supabase, type Product, type ProductImage } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { addToCart } from '@/lib/cart';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  async function loadProduct() {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      const { data: imagesData } = await supabase
        .from('images')
        .select('*')
        .eq('product_id', params.id)
        .order('is_main', { ascending: false });

      setImages(imagesData || []);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart() {
    if (!product) return;

    addToCart({
      productId: product.id,
      quantity,
      code: product.code,
      modele_tv: product.modele_tv,
      prix: Number(product.prix),
    });

    toast({
      title: 'Produit ajouté au panier',
      description: `${quantity}x ${product.marque_tv} ${product.modele_tv}`,
    });
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Chargement...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Produit non trouvé</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/produits" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour aux produits
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            {images.length > 0 ? (
              <img src={images[0].url} alt={images[0].alt || product.modele_tv} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-gray-400">Pas d'image disponible</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((img) => (
                <div key={img.id} className="aspect-square bg-gray-100 rounded">
                  <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover rounded" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-4">
            <Badge className="mb-2">{product.type_carte}</Badge>
            <h1 className="text-3xl font-bold mb-2">
              {product.marque_tv} {product.modele_tv}
            </h1>
            <p className="text-sm text-gray-600">Code: {product.code}</p>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {Number(product.prix).toFixed(2)} €
            </div>
            <Badge variant={product.stock_qty > 0 ? 'default' : 'secondary'}>
              {product.stock_qty > 0 ? `En stock (${product.stock_qty})` : 'Rupture de stock'}
            </Badge>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Marque TV:</span>
                <span className="font-semibold">{product.marque_tv}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type de carte:</span>
                <span className="font-semibold">{product.type_carte}</span>
              </div>
              {product.num1 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Numéro 1:</span>
                  <span className="font-semibold">{product.num1}</span>
                </div>
              )}
              {product.num2 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Numéro 2:</span>
                  <span className="font-semibold">{product.num2}</span>
                </div>
              )}
              {product.taille_tv && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Taille TV:</span>
                  <span className="font-semibold">{product.taille_tv}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">État:</span>
                <span className="font-semibold">État {product.etat_piece}</span>
              </div>
              {product.poids_gr > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Poids:</span>
                  <span className="font-semibold">{product.poids_gr}g</span>
                </div>
              )}
            </CardContent>
          </Card>

          {product.compat_tv_models && product.compat_tv_models.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Modèles compatibles:</h3>
              <div className="flex flex-wrap gap-2">
                {product.compat_tv_models.map((model, index) => (
                  <Badge key={index} variant="outline">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {product.commentaire && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description:</h3>
              <p className="text-gray-700">{product.commentaire}</p>
            </div>
          )}

          {product.stock_qty > 0 && (
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                >
                  +
                </Button>
              </div>
              <Button onClick={handleAddToCart} variant="outline" className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Ajouter au panier
              </Button>
            </div>
          )}

          {product.stock_qty > 0 && (
            <Link href="/panier">
              <Button className="w-full mb-4" size="lg">
                Acheter maintenant
              </Button>
            </Link>
          )}

          {product.ebay_id && (
            <a
              href={`https://www.ebay.fr/itm/${product.ebay_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Voir sur eBay
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
