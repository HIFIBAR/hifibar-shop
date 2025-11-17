'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Eye, Camera, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminGuard } from '@/components/admin-guard';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function DashboardContent() {
  const [stats, setStats] = useState({
    total: 0,
    visible: 0,
    needsPhoto: 0,
    onEbay: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('est_visible, etat_enregistrement, ebay_id');

      if (!products) return;

      setStats({
        total: products.length,
        visible: products.filter((p) => p.est_visible).length,
        needsPhoto: products.filter((p) => p.etat_enregistrement === 'P').length,
        onEbay: products.filter((p) => p.ebay_id).length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Produits</CardTitle>
              <Package className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Visibles</CardTitle>
              <Eye className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.visible}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">À photographier</CardTitle>
              <Camera className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.needsPhoto}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sur eBay</CardTitle>
              <ExternalLink className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.onEbay}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/produits/nouveau">
              <Button className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                Ajouter un nouveau produit
              </Button>
            </Link>
            <Link href="/admin/import-csv">
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                Importer des produits (CSV)
              </Button>
            </Link>
            <Link href="/admin/produits">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="w-4 h-4 mr-2" />
                Voir tous les produits
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}
