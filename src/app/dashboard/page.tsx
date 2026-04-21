'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingRecommendations: 0,
    avgConfidence: 0,
    executedChanges: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, recsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/recommendations?status=PENDING'),
        ]);

        const productsData = await productsRes.json();
        const recsData = await recsRes.json();

        // Calculate some stats
        const pending = recsData.recommendations?.length || 0;
        const confidences = recsData.recommendations?.map((r: any) => r.confidenceScore) || [];
        const avgConf = confidences.length > 0 ? Math.round(confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length) : 0;

        setStats({
          totalProducts: productsData.products?.length || 0,
          pendingRecommendations: pending,
          avgConfidence: avgConf,
          executedChanges: 0, // Would fetch from audit trail in a real app
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) => (
    <div className="glass-card p-6 flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-3xl font-bold">{loading ? '...' : value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">Real-time pricing intelligence and AI performance metrics.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/recommendations" className="glass-button-primary flex items-center gap-2">
            <span>View AI Queue</span>
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Products" value={stats.totalProducts} icon="📦" color="bg-blue-500/10 text-blue-500" />
        <StatCard label="Pending Recommendations" value={stats.pendingRecommendations} icon="🤖" color="bg-amber-500/10 text-amber-500" />
        <StatCard label="Avg Confidence" value={`${stats.avgConfidence}%`} icon="🎯" color="bg-emerald-500/10 text-emerald-500" />
        <StatCard label="Executed Today" value={stats.executedChanges} icon="⚡" color="bg-purple-500/10 text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Graph Placeholder */}
        <div className="lg:col-span-2 glass-card p-8 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-bold text-lg">Price Optimization Activity</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                AI Recommended
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Captured Revenue
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center border border-white/5 bg-white/5 rounded-xl text-gray-500 italic p-10 text-center">
            [ Interactive Chart Engine Placeholder - Recharts ]
            <br />
            Monitoring market trends and price elasticity signals...
          </div>
        </div>

        {/* Action Queue Snapshot */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-6">High Confidence Queue</h3>
          <div className="flex-1 space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 w-full animate-pulse bg-white/5 rounded-lg" />)
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-4">✨</div>
                <p className="text-gray-400 text-sm">All high-value items are up to date.</p>
                <button 
                  onClick={() => fetch('/api/agent/run', { method: 'POST' })}
                  className="mt-4 text-xs text-blue-500 hover:underline"
                >
                  Run Agent Analysis Now
                </button>
              </div>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-white/5">
             <Link href="/dashboard/recommendations" className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
               View Full Intelligence Queue <span>→</span>
             </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Links section */}
      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/products" className="glass-card p-6 flex-1 min-w-[200px] hover:bg-white/10 transition-colors group">
          <div className="text-2xl mb-2">📦</div>
          <h4 className="font-bold">Catalog Management</h4>
          <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-400">Update SKUs, COGS, and inventory levels.</p>
        </Link>
        <Link href="/dashboard/recommendations" className="glass-card p-6 flex-1 min-w-[200px] hover:bg-white/10 transition-colors group">
          <div className="text-2xl mb-2">🤖</div>
          <h4 className="font-bold">AI Strategy Review</h4>
          <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-400">Review, override, or approve AI price suggestions.</p>
        </Link>
        <Link href="/dashboard/audit" className="glass-card p-6 flex-1 min-w-[200px] hover:bg-white/10 transition-colors group">
          <div className="text-2xl mb-2">📜</div>
          <h4 className="font-bold">Execution History</h4>
          <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-400">View audit logs and historical performance.</p>
        </Link>
      </div>
    </div>
  );
}
