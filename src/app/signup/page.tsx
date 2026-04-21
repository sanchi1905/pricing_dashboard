'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    orgName: '',
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Organization created successfully! Redirecting to login...');
        router.push('/login');
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-md p-10 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter text-blue-500 mb-2">KLYPUP</h1>
          <p className="text-gray-400 font-medium tracking-tight">Create your Pricing Intelligence Hub</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Organization Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Acme Corp"
              className="input-field w-full"
              value={formData.orgName}
              onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Admin Name</label>
            <input
              required
              type="text"
              placeholder="Your full name"
              className="input-field w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
            <input
              required
              type="email"
              placeholder="admin@organization.com"
              className="input-field w-full"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Security Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              className="input-field w-full"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glass-button-primary w-full py-3"
          >
            {loading ? 'Initializing Hub...' : 'Create My Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 border-t border-white/5 pt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
