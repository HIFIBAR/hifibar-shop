import { Recycle, Award, DollarSign, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">À propos de HIFI BAR</h1>

      <div className="max-w-4xl mx-auto">
        <div className="prose prose-lg mb-12">
          <p className="text-xl text-gray-700 leading-relaxed">
            HIFI BAR est spécialisé dans la vente de cartes électroniques pour téléviseurs.
            Notre mission est de prolonger la durée de vie de vos appareils en proposant des
            pièces détachées de qualité à des prix accessibles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Recycle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">Notre mission</h2>
              </div>
              <p className="text-gray-700">
                Réduire les déchets électroniques en donnant une seconde vie aux composants.
                Chaque réparation est un geste pour la planète.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold">Qualité garantie</h2>
              </div>
              <p className="text-gray-700">
                Toutes nos pièces sont soigneusement testées avant expédition.
                Nous garantissons la qualité de chaque composant.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold">Prix justes</h2>
              </div>
              <p className="text-gray-700">
                Nous proposons des tarifs compétitifs pour rendre la réparation accessible
                à tous, sans compromettre la qualité.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold">Conseil personnalisé</h2>
              </div>
              <p className="text-gray-700">
                Notre équipe vous accompagne pour trouver la bonne pièce et réussir
                votre réparation.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-green-50">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-4 text-center">Notre engagement</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
                <p className="text-gray-700">Pièces disponibles</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
                <p className="text-gray-700">Clients satisfaits</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">5000+</div>
                <p className="text-gray-700">TV réparées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">L'économie circulaire au coeur de nos valeurs</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            En choisissant de réparer plutôt que de remplacer, vous contribuez à réduire
            l'impact environnemental des déchets électroniques. Ensemble, construisons
            un avenir plus durable.
          </p>
        </div>
      </div>
    </div>
  );
}
