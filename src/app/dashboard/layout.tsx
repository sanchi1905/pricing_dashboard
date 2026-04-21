'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NavItem = ({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedOrg = localStorage.getItem('org');
    
    if (!storedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
      setOrg(JSON.parse(storedOrg || '{}'));
    }
  }, [router]);

  const handleLogout = async () => {
    // Clear cookies via API or just clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('org');
    router.push('/login');
  };

  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '📊' },
    { href: '/dashboard/products', label: 'Product Catalog', icon: '📦' },
    { href: '/dashboard/recommendations', label: 'AI Queue', icon: '🤖' },
    { href: '/dashboard/audit', label: 'Audit Trail', icon: '📜' },
  ];

  if (user.role === 'ADMIN') {
    navItems.push({ href: '/dashboard/config', label: 'Settings', icon: '⚙️' });
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 fixed h-full">
        <div className="mb-10 px-4">
          <h1 className="text-2xl font-bold tracking-tighter text-blue-500">KLYPUP</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Intelligence</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{org.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
