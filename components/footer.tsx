import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">HIFI BAR</h3>
            <p className="text-sm">
              Spécialiste en cartes électroniques pour TV. Économie circulaire et qualité au meilleur prix.
            </p>
            <p className="text-sm mt-4">
              <a href="https://www.hifibar.eu" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                www.hifibar.eu
              </a>
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/produits" className="hover:text-white transition">
                  Produits
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-white transition">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/panier" className="hover:text-white transition">
                  Panier
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>📧 Email: contact@hifibar.eu</li>
              <li>📱 Tél: 0 777 123 999</li>
              <li>🕐 Du lundi au vendredi</li>
              <li>⏰ 9h - 18h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} HIFI BAR. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
