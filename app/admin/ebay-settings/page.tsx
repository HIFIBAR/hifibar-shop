'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminGuard } from '@/components/admin-guard';
import { AdminLayout } from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, ShoppingBag } from 'lucide-react';

function EbaySettingsContent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('ebay_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('ebay_settings')
        .update({
          ebay_app_id: settings.ebay_app_id,
          ebay_cert_id: settings.ebay_cert_id,
          ebay_dev_id: settings.ebay_dev_id,
          ebay_oauth_token: settings.ebay_oauth_token,
          ebay_refresh_token: settings.ebay_refresh_token,
          ebay_site_id: settings.ebay_site_id,
          sync_enabled: settings.sync_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Paramètres eBay enregistrés',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'enregistrer les paramètres',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  if (!settings) {
    return <div className="text-center py-12">Aucun paramètre trouvé</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Paramètres eBay</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identifiants API eBay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">App ID (Client ID)</label>
                <Input
                  type="text"
                  value={settings.ebay_app_id}
                  onChange={(e) => setSettings({ ...settings, ebay_app_id: e.target.value })}
                  placeholder="YourAppId-..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cert ID (Client Secret)</label>
                <Input
                  type="password"
                  value={settings.ebay_cert_id}
                  onChange={(e) => setSettings({ ...settings, ebay_cert_id: e.target.value })}
                  placeholder="PRD-..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dev ID</label>
                <Input
                  type="text"
                  value={settings.ebay_dev_id}
                  onChange={(e) => setSettings({ ...settings, ebay_dev_id: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">OAuth Token</label>
                <Input
                  type="password"
                  value={settings.ebay_oauth_token}
                  onChange={(e) => setSettings({ ...settings, ebay_oauth_token: e.target.value })}
                  placeholder="v^1.1#i^1#..."
                />
                <p className="text-xs text-gray-500 mt-1">Token d'accès pour l'API eBay</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Refresh Token</label>
                <Input
                  type="password"
                  value={settings.ebay_refresh_token}
                  onChange={(e) => setSettings({ ...settings, ebay_refresh_token: e.target.value })}
                  placeholder="v^1.1#i^1#..."
                />
                <p className="text-xs text-gray-500 mt-1">Token de rafraîchissement (optionnel)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Site ID</label>
                <Input
                  type="text"
                  value={settings.ebay_site_id}
                  onChange={(e) => setSettings({ ...settings, ebay_site_id: e.target.value })}
                  placeholder="71"
                />
                <p className="text-xs text-gray-500 mt-1">71 = France, 0 = US, 3 = UK</p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="sync_enabled"
                  checked={settings.sync_enabled}
                  onChange={(e) => setSettings({ ...settings, sync_enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="sync_enabled" className="text-sm font-medium">
                  Activer la synchronisation automatique (toutes les 2 heures)
                </label>
              </div>

              {settings.last_sync_at && (
                <div className="bg-blue-50 rounded p-3">
                  <p className="text-sm text-blue-900">
                    <strong>Dernière synchronisation :</strong>{' '}
                    {new Date(settings.last_sync_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comment configurer ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ol className="list-decimal list-inside space-y-2">
                <li>Allez sur <a href="https://developer.ebay.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">developer.ebay.com</a></li>
                <li>Créez une application (Production environment)</li>
                <li>Copiez les identifiants : App ID, Cert ID, Dev ID</li>
                <li>Générez un OAuth User Token avec les scopes :
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>https://api.ebay.com/oauth/api_scope/sell.inventory</li>
                    <li>https://api.ebay.com/oauth/api_scope/sell.inventory.readonly</li>
                  </ul>
                </li>
                <li>Collez le token OAuth dans le champ ci-dessus</li>
                <li>Enregistrez et testez la synchronisation</li>
              </ol>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
                <p className="text-yellow-900 font-semibold">⚠️ Important</p>
                <p className="text-yellow-800 text-xs mt-1">
                  Les tokens OAuth eBay expirent après quelques heures. Vous devrez les renouveler régulièrement ou utiliser le Refresh Token.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function EbaySettingsPage() {
  return (
    <AdminGuard>
      <EbaySettingsContent />
    </AdminGuard>
  );
}
