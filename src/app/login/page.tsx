'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store in localStorage for client-side persistence
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('org', JSON.stringify(data.org));
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-glow">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-blue-500">KLYPUP</h1>
          <p className="text-gray-400">Pricing Intelligence Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              placeholder="admin@techmart.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="glass-button-primary w-full"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm">
          <p className="text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Create Organization
            </Link>
          </p>
          
          <div className="pt-4 border-t border-white/5">
            <button 
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/api/auth/seed', { method: 'POST' });
                  const data = await res.json();
                  if (res.ok) alert('✨ Demo data seeded successfully! You can now login.');
                  else alert(data.error || 'Seed failed');
                } catch {
                  alert('Connection failed');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
            >
              First time? Seed Demo Data
            </button>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-gray-600">
          <p>Demo accounts:</p>
          <p>admin@techmart.com / admin123 (ADMIN)</p>
          <p>analyst@techmart.com / analyst123 (ANALYST)</p>
        </div>
      </div>
    </div>
  );
}
