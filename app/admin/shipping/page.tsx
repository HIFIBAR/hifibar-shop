'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminGuard } from '@/components/admin-guard';
import { AdminLayout } from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Package } from 'lucide-react';
import type { ShippingSettings } from '@/lib/shipping/types';

function ShippingSettingsContent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ShippingSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('shipping_settings')
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
        .from('shipping_settings')
        .update({
          sender_name: settings.sender_name,
          sender_address: settings.sender_address,
          sender_postal_code: settings.sender_postal_code,
          sender_city: settings.sender_city,
          sender_country: settings.sender_country,
          pickup_allowed_dhl: settings.pickup_allowed_dhl,
          pickup_allowed_ups: settings.pickup_allowed_ups,
          pickup_allowed_laposte: settings.pickup_allowed_laposte,
          api_key_colissimo: settings.api_key_colissimo,
          api_key_mondial_relay: settings.api_key_mondial_relay,
          api_key_dhl: settings.api_key_dhl,
          api_key_ups: settings.api_key_ups,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Paramètres de livraison enregistrés',
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
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Paramètres de livraison</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adresse d'expédition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom / Raison sociale</label>
                <Input
                  value={settings.sender_name}
                  onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })}
                  placeholder="HIFI BAR"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Adresse complète</label>
                <Input
                  value={settings.sender_address}
                  onChange={(e) => setSettings({ ...settings, sender_address: e.target.value })}
                  placeholder="123 Rue de la République"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Code postal</label>
                  <Input
                    value={settings.sender_postal_code}
                    onChange={(e) => setSettings({ ...settings, sender_postal_code: e.target.value })}
                    placeholder="75001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ville</label>
                  <Input
                    value={settings.sender_city}
                    onChange={(e) => setSettings({ ...settings, sender_city: e.target.value })}
                    placeholder="Paris"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pays</label>
                <Input
                  value={settings.sender_country}
                  onChange={(e) => setSettings({ ...settings, sender_country: e.target.value })}
                  placeholder="FR"
                  maxLength={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options de retrait</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Autoriser le retrait des colis directement à votre adresse :
              </p>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="pickup_laposte"
                  checked={settings.pickup_allowed_laposte}
                  onChange={(e) => setSettings({ ...settings, pickup_allowed_laposte: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="pickup_laposte" className="text-sm font-medium">
                  Autoriser le retrait pour La Poste / Colissimo
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="pickup_dhl"
                  checked={settings.pickup_allowed_dhl}
                  onChange={(e) => setSettings({ ...settings, pickup_allowed_dhl: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="pickup_dhl" className="text-sm font-medium">
                  Autoriser le retrait pour DHL Express
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="pickup_ups"
                  checked={settings.pickup_allowed_ups}
                  onChange={(e) => setSettings({ ...settings, pickup_allowed_ups: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="pickup_ups" className="text-sm font-medium">
                  Autoriser le retrait pour UPS
                </label>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Note : Mondial Relay ne permet pas le retrait au dépôt (uniquement Points Relais)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clés API des transporteurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Colissimo / La Poste</label>
                <Input
                  type="password"
                  value={settings.api_key_colissimo}
                  onChange={(e) => setSettings({ ...settings, api_key_colissimo: e.target.value })}
                  placeholder="Clé API Colissimo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mondial Relay</label>
                <Input
                  type="password"
                  value={settings.api_key_mondial_relay}
                  onChange={(e) => setSettings({ ...settings, api_key_mondial_relay: e.target.value })}
                  placeholder="Clé API Mondial Relay"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">DHL Express</label>
                <Input
                  type="password"
                  value={settings.api_key_dhl}
                  onChange={(e) => setSettings({ ...settings, api_key_dhl: e.target.value })}
                  placeholder="Clé API DHL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">UPS</label>
                <Input
                  type="password"
                  value={settings.api_key_ups}
                  onChange={(e) => setSettings({ ...settings, api_key_ups: e.target.value })}
                  placeholder="Clé API UPS"
                />
              </div>

              <p className="text-sm text-gray-600">
                Les clés API sont stockées de manière sécurisée et ne sont jamais exposées côté client.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paiements - Stripe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Clé publique Stripe</label>
                <Input
                  type="text"
                  value={(settings as any).stripe_public_key || ''}
                  onChange={(e) => setSettings({ ...settings, stripe_public_key: e.target.value } as any)}
                  placeholder="pk_test_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Clé secrète Stripe</label>
                <Input
                  type="password"
                  value={(settings as any).stripe_secret_key || ''}
                  onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value } as any)}
                  placeholder="sk_test_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Webhook Secret Stripe</label>
                <Input
                  type="password"
                  value={(settings as any).stripe_webhook_secret || ''}
                  onChange={(e) => setSettings({ ...settings, stripe_webhook_secret: e.target.value } as any)}
                  placeholder="whsec_..."
                />
              </div>

              <p className="text-sm text-gray-600">
                Stripe gère les paiements CB, Apple Pay et Google Pay automatiquement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paiements - PayPal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Client ID PayPal</label>
                <Input
                  type="text"
                  value={(settings as any).paypal_client_id || ''}
                  onChange={(e) => setSettings({ ...settings, paypal_client_id: e.target.value } as any)}
                  placeholder="Client ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Secret PayPal</label>
                <Input
                  type="password"
                  value={(settings as any).paypal_secret || ''}
                  onChange={(e) => setSettings({ ...settings, paypal_secret: e.target.value } as any)}
                  placeholder="Secret"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mode PayPal</label>
                <select
                  value={(settings as any).paypal_mode || 'sandbox'}
                  onChange={(e) => setSettings({ ...settings, paypal_mode: e.target.value } as any)}
                  className="w-full border rounded p-2"
                >
                  <option value="sandbox">Sandbox (Test)</option>
                  <option value="live">Live (Production)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Serveur SMTP</label>
                <Input
                  type="text"
                  value={(settings as any).smtp_host || ''}
                  onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value } as any)}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Port SMTP</label>
                <Input
                  type="number"
                  value={(settings as any).smtp_port || 587}
                  onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) } as any)}
                  placeholder="587"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Utilisateur SMTP</label>
                <Input
                  type="text"
                  value={(settings as any).smtp_user || ''}
                  onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value } as any)}
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mot de passe SMTP</label>
                <Input
                  type="password"
                  value={(settings as any).smtp_password || ''}
                  onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value } as any)}
                  placeholder="Mot de passe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email expéditeur</label>
                <Input
                  type="email"
                  value={(settings as any).sender_email || ''}
                  onChange={(e) => setSettings({ ...settings, sender_email: e.target.value } as any)}
                  placeholder="contact@hifibar.com"
                />
              </div>

              <p className="text-sm text-gray-600">
                Configuration pour l'envoi des emails de confirmation de commande.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function ShippingSettingsPage() {
  return (
    <AdminGuard>
      <ShippingSettingsContent />
    </AdminGuard>
  );
}
