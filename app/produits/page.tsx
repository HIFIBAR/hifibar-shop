'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { supabase, type Product } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    marque: '',
    type_carte: '',
    taille: '',
    etat: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearch(searchParam);
    }
  }, []);

  useEffect(() => {
    loadBrands();
    loadProducts();
  }, [search, filters]);

  async function loadBrands() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('marque_tv')
        .eq('est_visible', true);

      if (error) throw error;

      const uniqueBrands = Array.from(new Set(data?.map(p => p.marque_tv).filter(Boolean) || []));
      setBrands(uniqueBrands.sort());
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('est_visible', true)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`modele_tv.ilike.%${search}%,num1.ilike.%${search}%,num2.ilike.%${search}%,code.ilike.%${search}%,ide.ilike.%${search}%,marque_tv.ilike.%${search}%,type_carte.ilike.%${search}%`);
      }

      if (filters.marque) {
        query = query.eq('marque_tv', filters.marque);
      }
      if (filters.type_carte) {
        query = query.eq('type_carte', filters.type_carte);
      }
      if (filters.taille) {
        query = query.eq('taille_tv', filters.taille);
      }
      if (filters.etat) {
        query = query.eq('etat_piece', filters.etat);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Nos produits</h1>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Marque TV</label>
                <select
                  value={filters.marque}
                  onChange={(e) => setFilters({ ...filters, marque: e.target.value })}
                  className="w-full border rounded p-2"
                >
                  <option value="">Toutes</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type de carte</label>
                <select
                  value={filters.type_carte}
                  onChange={(e) => setFilters({ ...filters, type_carte: e.target.value })}
                  className="w-full border rounded p-2"
                >
                  <option value="">Tous</option>
                  <option value="T-CON">T-CON</option>
                  <option value="Alimentation">Alimentation</option>
                  <option value="Principale">Principale</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">État</label>
                <select
                  value={filters.etat}
                  onChange={(e) => setFilters({ ...filters, etat: e.target.value })}
                  className="w-full border rounded p-2"
                >
                  <option value="">Tous</option>
                  <option value="1">État 1</option>
                  <option value="2">État 2</option>
                  <option value="3">État 3</option>
                </select>
              </div>

              <Button
                variant="outline"
                onClick={() => setFilters({ marque: '', type_carte: '', taille: '', etat: '' })}
                className="w-full"
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun produit trouvé</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">{products.length} produit(s) trouvé(s)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/produits/${product.id}`}>
                    <Card className="hover:shadow-lg transition h-full">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-100 rounded mb-3 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Pas d'image</span>
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {product.marque_tv} {product.modele_tv}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">{product.type_carte}</p>
                        {(product.num1 || product.num2) && (
                          <div className="text-xs text-gray-500 mb-2 space-y-0.5">
                            {product.num1 && <div>N°1: {product.num1}</div>}
                            {product.num2 && <div>N°2: {product.num2}</div>}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-blue-600">
                            {product.prix.toFixed(2)} €
                          </span>
                          <Badge variant={product.stock_qty > 0 ? 'default' : 'secondary'}>
                            {product.stock_qty > 0 ? 'En stock' : 'Rupture'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
