'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { AdminGuard } from '@/components/admin-guard';
import { AdminLayout } from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

function NewProductContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ide: '',
    code: '',
    type_carte: '',
    marque_tv: '',
    modele_tv: '',
    num1: '',
    num2: '',
    compat_tv_models: '',
    taille_tv: '',
    etat_piece: '1',
    etat_enregistrement: 'P',
    source: '',
    prix: '0',
    poids_gr: '0',
    stock_qty: '1',
    est_visible: false,
    commentaire: '',
    ebay_id: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const compatModels = formData.compat_tv_models
        ? formData.compat_tv_models.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const { error } = await supabase.from('products').insert({
        ide: formData.ide,
        code: formData.code,
        type_carte: formData.type_carte,
        marque_tv: formData.marque_tv,
        modele_tv: formData.modele_tv,
        num1: formData.num1,
        num2: formData.num2,
        compat_tv_models: compatModels,
        taille_tv: formData.taille_tv || null,
        etat_piece: formData.etat_piece,
        etat_enregistrement: formData.etat_enregistrement,
        source: formData.source || null,
        prix: parseFloat(formData.prix),
        poids_gr: parseInt(formData.poids_gr),
        stock_qty: parseInt(formData.stock_qty),
        est_visible: formData.est_visible,
        commentaire: formData.commentaire || null,
        ebay_id: formData.ebay_id || null,
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Produit créé avec succès',
      });

      router.push('/admin/produits');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le produit',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div>
        <Link href="/admin/produits" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <h1 className="text-3xl font-bold mb-6">Nouveau produit</h1>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">IDE (interne) *</label>
                  <Input
                    required
                    value={formData.ide}
                    onChange={(e) => setFormData({ ...formData, ide: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Code produit *</label>
                  <Input
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type de carte *</label>
                  <Input
                    required
                    value={formData.type_carte}
                    onChange={(e) => setFormData({ ...formData, type_carte: e.target.value })}
                    placeholder="T-CON, Alimentation, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Marque TV *</label>
                  <Input
                    required
                    value={formData.marque_tv}
                    onChange={(e) => setFormData({ ...formData, marque_tv: e.target.value })}
                    placeholder="Samsung, LG, Philips..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Modèle TV *</label>
                  <Input
                    required
                    value={formData.modele_tv}
                    onChange={(e) => setFormData({ ...formData, modele_tv: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Numéro 1</label>
                  <Input
                    value={formData.num1}
                    onChange={(e) => setFormData({ ...formData, num1: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Numéro 2</label>
                  <Input
                    value={formData.num2}
                    onChange={(e) => setFormData({ ...formData, num2: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Taille TV</label>
                  <Input
                    value={formData.taille_tv}
                    onChange={(e) => setFormData({ ...formData, taille_tv: e.target.value })}
                    placeholder="55'', 49''..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">État pièce</label>
                  <select
                    value={formData.etat_piece}
                    onChange={(e) => setFormData({ ...formData, etat_piece: e.target.value })}
                    className="w-full border rounded p-2"
                  >
                    <option value="1">État 1</option>
                    <option value="2">État 2</option>
                    <option value="3">État 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">État enregistrement</label>
                  <select
                    value={formData.etat_enregistrement}
                    onChange={(e) => setFormData({ ...formData, etat_enregistrement: e.target.value })}
                    className="w-full border rounded p-2"
                  >
                    <option value="P">P - À photographier</option>
                    <option value="C">C - Complet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prix (€) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Poids (g)</label>
                  <Input
                    type="number"
                    value={formData.poids_gr}
                    onChange={(e) => setFormData({ ...formData, poids_gr: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantité stock *</label>
                  <Input
                    type="number"
                    required
                    value={formData.stock_qty}
                    onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Source</label>
                  <Input
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">eBay ID</label>
                  <Input
                    value={formData.ebay_id}
                    onChange={(e) => setFormData({ ...formData, ebay_id: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="visible"
                    checked={formData.est_visible}
                    onChange={(e) => setFormData({ ...formData, est_visible: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="visible" className="text-sm font-medium">
                    Visible sur le site
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Modèles compatibles (séparés par des virgules)
                </label>
                <Textarea
                  rows={3}
                  value={formData.compat_tv_models}
                  onChange={(e) => setFormData({ ...formData, compat_tv_models: e.target.value })}
                  placeholder="55PUS7100, 49PUS7100, UE55KU6000..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Commentaire</label>
                <Textarea
                  rows={4}
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Création...' : 'Créer le produit'}
                </Button>
                <Link href="/admin/produits">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function NewProductPage() {
  return (
    <AdminGuard>
      <NewProductContent />
    </AdminGuard>
  );
}
