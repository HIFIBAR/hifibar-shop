'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminGuard } from '@/components/admin-guard';
import { AdminLayout } from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function EbaySyncContent() {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      const { data, error } = await supabase
        .from('ebay_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const response = await fetch('/api/ebay/sync', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Synchronisation réussie',
          description: `${result.itemsCreated} créés, ${result.itemsUpdated} mis à jour`,
        });
      } else {
        toast({
          title: 'Synchronisation terminée avec erreurs',
          description: `${result.errors.length} erreur(s)`,
          variant: 'destructive',
        });
      }

      loadLogs();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Échec de la synchronisation',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  }

  const statusIcons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    failed: <XCircle className="w-5 h-5 text-red-600" />,
    partial: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    running: <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />,
  };

  const statusColors = {
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
  };

  const statusLabels = {
    success: 'Succès',
    failed: 'Échec',
    partial: 'Partiel',
    running: 'En cours',
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Synchronisation eBay</h1>
          </div>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {syncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Dernière sync</p>
              <p className="text-2xl font-bold">
                {logs.length > 0 ? new Date(logs[0].created_at).toLocaleTimeString('fr-FR') : '-'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Articles récupérés</p>
              <p className="text-2xl font-bold text-blue-600">
                {logs.length > 0 ? logs[0].items_fetched : 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Créés</p>
              <p className="text-2xl font-bold text-green-600">
                {logs.length > 0 ? logs[0].items_created : 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Mis à jour</p>
              <p className="text-2xl font-bold text-orange-600">
                {logs.length > 0 ? logs[0].items_updated : 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique des synchronisations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aucune synchronisation effectuée
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <Card key={log.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {statusIcons[log.status as keyof typeof statusIcons]}
                          <div>
                            <p className="font-semibold">
                              {new Date(log.sync_started_at).toLocaleString('fr-FR')}
                            </p>
                            <Badge className={statusColors[log.status as keyof typeof statusColors]}>
                              {statusLabels[log.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-right text-sm">
                          {log.sync_completed_at && (
                            <p className="text-gray-600">
                              Durée :{' '}
                              {Math.round(
                                (new Date(log.sync_completed_at).getTime() -
                                  new Date(log.sync_started_at).getTime()) /
                                  1000
                              )}s
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Récupérés</p>
                          <p className="font-semibold">{log.items_fetched}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Créés</p>
                          <p className="font-semibold text-green-600">{log.items_created}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Mis à jour</p>
                          <p className="font-semibold text-orange-600">{log.items_updated}</p>
                        </div>
                      </div>

                      {log.errors && Array.isArray(log.errors) && log.errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                          <p className="font-semibold text-red-900 mb-2">Erreurs :</p>
                          <ul className="text-sm text-red-800 space-y-1">
                            {log.errors.map((error: string, index: number) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function EbaySyncPage() {
  return (
    <AdminGuard>
      <EbaySyncContent />
    </AdminGuard>
  );
}
