'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Edit, Trash2, Download, Eye, EyeOff } from 'lucide-react';
import { supabase, type Product } from '@/lib/supabase';
import { AdminGuard } from '@/components/admin-guard';
import { AdminLayout } from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

function ProductsManagementContent() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, [search]);

  async function loadProducts() {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`modele_tv.ilike.%${search}%,code.ilike.%${search}%,ide.ilike.%${search}%`);
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

  async function toggleVisibility(product: Product) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ est_visible: !product.est_visible })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `Produit ${!product.est_visible ? 'visible' : 'masqué'}`,
      });

      loadProducts();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la visibilité',
        variant: 'destructive',
      });
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Produit supprimé',
      });

      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le produit',
        variant: 'destructive',
      });
    }
  }

  function exportToCSV() {
    const headers = [
      'ide',
      'code',
      'type_carte',
      'marque_tv',
      'modele_tv',
      'num1',
      'num2',
      'compat_tv_models',
      'taille_tv',
      'etat_piece',
      'etat_enregistrement',
      'source',
      'prix',
      'poids_gr',
      'stock_qty',
      'est_visible',
      'commentaire',
      'ebay_id',
    ];

    const rows = products.map((p) => [
      p.ide,
      p.code,
      p.type_carte,
      p.marque_tv,
      p.modele_tv,
      p.num1,
      p.num2,
      p.compat_tv_models ? p.compat_tv_models.join(',') : '',
      p.taille_tv || '',
      p.etat_piece,
      p.etat_enregistrement,
      p.source || '',
      p.prix,
      p.poids_gr,
      p.stock_qty,
      p.est_visible,
      p.commentaire || '',
      p.ebay_id || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hifibar_products_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Export réussi',
      description: `${products.length} produits exportés`,
    });
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Gestion des produits</h1>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
            <Link href="/admin/produits/nouveau">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau produit
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Modèle TV</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{product.modele_tv}</div>
                        <div className="text-sm text-gray-500">{product.marque_tv}</div>
                      </div>
                    </TableCell>
                    <TableCell>{product.type_carte}</TableCell>
                    <TableCell>{Number(product.prix).toFixed(2)} €</TableCell>
                    <TableCell>
                      <Badge variant={product.stock_qty > 0 ? 'default' : 'secondary'}>
                        {product.stock_qty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(product)}
                      >
                        {product.est_visible ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/produits/${product.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminProductsPage() {
  return (
    <AdminGuard>
      <ProductsManagementContent />
    </AdminGuard>
  );
}
