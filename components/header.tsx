'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCartCount } from '@/lib/cart';

export function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateCount = () => setCartCount(getCartCount());
    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-green-600">⚡ HIFI BAR</div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/produits" className="text-gray-700 hover:text-blue-600 transition">
              Produits
            </Link>
            <Link href="/a-propos" className="text-gray-700 hover:text-blue-600 transition">
              À propos
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition">
              Contact
            </Link>
            <Link href="/panier" className="relative">
              <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-blue-600 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link href="/produits" className="text-gray-700 hover:text-blue-600 transition">
              Produits
            </Link>
            <Link href="/a-propos" className="text-gray-700 hover:text-blue-600 transition">
              À propos
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition">
              Contact
            </Link>
            <Link href="/panier" className="flex items-center text-gray-700 hover:text-blue-600 transition">
              Panier {cartCount > 0 && `(${cartCount})`}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
