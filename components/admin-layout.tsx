'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Package, LayoutDashboard, Upload, Truck, ShoppingBag, RefreshCw, Settings } from 'lucide-react';
import { clearAdminSession } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    clearAdminSession();
    router.push('/admin/login');
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/produits', label: 'Produits', icon: Package },
    { href: '/admin/import-csv', label: 'Import CSV', icon: Upload },
    { href: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
    { href: '/admin/shipping', label: 'Livraison', icon: Truck },
    { href: '/admin/ebay-sync', label: 'eBay Sync', icon: RefreshCw },
    { href: '/admin/ebay-settings', label: 'eBay Config', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="font-bold text-xl text-blue-600">HIFI BAR</div>
              <span className="text-sm text-gray-500">Admin</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 transition ${
                      isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
