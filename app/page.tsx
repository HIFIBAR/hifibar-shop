'use client';

import Link from 'next/link';
import { Search, Recycle, Award, DollarSign } from 'lucide-react';

export default function Home() {
  const exampleSearches = [
    '55PUS7100',
    'Carte T-CON',
    'Samsung UE55',
    'LG 49UH610V',
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Cartes électroniques pour TV
            </h1>
            <p className="text-xl text-gray-700 mb-12">
              Trouvez la pièce détachée qu'il vous faut pour réparer votre téléviseur
            </p>

            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="flex items-center bg-white rounded-lg shadow-lg p-4">
                <Search className="text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher par modèle TV, référence carte..."
                  className="flex-1 outline-none text-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      window.location.href = `/produits?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`;
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="text-sm text-gray-600">Exemples :</span>
              {exampleSearches.map((search) => (
                <Link
                  key={search}
                  href={`/produits?search=${encodeURIComponent(search)}`}
                  className="text-sm bg-white px-3 py-1 rounded-full hover:bg-blue-100 transition"
                >
                  {search}
                </Link>
              ))}
            </div>

            <Link
              href="/produits"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Voir tous les produits
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nos valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Recycle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Économie Circulaire</h3>
              <p className="text-gray-600">
                Nous donnons une seconde vie aux composants électroniques pour réduire les déchets.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Qualité Garantie</h3>
              <p className="text-gray-600">
                Toutes nos pièces sont testées et garanties pour assurer votre satisfaction.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Prix Justes</h3>
              <p className="text-gray-600">
                Des tarifs compétitifs pour rendre la réparation accessible à tous.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Besoin d'aide ?</h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Notre équipe est là pour vous accompagner dans votre recherche et vous conseiller sur le choix de la bonne pièce.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </div>
  );
}
