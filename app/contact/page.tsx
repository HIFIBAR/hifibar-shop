import { Mail, Phone, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Nous contacter</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet *</label>
                  <Input required placeholder="Jean Dupont" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input type="email" required placeholder="jean.dupont@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
                  <Input type="tel" placeholder="06 12 34 56 78" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sujet *</label>
                  <Input required placeholder="Objet de votre message" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <Textarea required rows={6} placeholder="Votre message..." />
                </div>

                <Button type="submit" className="w-full">Envoyer</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a href="mailto:contact@hifibar.eu" className="text-blue-600 hover:underline">
                    contact@hifibar.eu
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Téléphone</h3>
                  <a href="tel:0777123999" className="text-gray-700 hover:text-green-600">
                    0 777 123 999
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Horaires</h3>
                  <p className="text-gray-700">Lundi - Vendredi</p>
                  <p className="text-gray-700">9h00 - 18h00</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Site web</h3>
                  <a
                    href="https://www.hifibar.eu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    www.hifibar.eu
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Questions fréquentes</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Livraison sous 2-5 jours ouvrés</li>
                <li>• Garantie sur toutes nos pièces</li>
                <li>• Retour possible sous 14 jours</li>
                <li>• Conseils gratuits pour trouver la bonne pièce</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
