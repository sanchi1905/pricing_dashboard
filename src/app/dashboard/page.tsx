import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingRecommendations: 0,
    avgConfidence: 0,
    executedChanges: 0,
  });
  const [highConfidenceRecs, setHighConfidenceRecs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, recsRes, auditRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/recommendations?status=PENDING'),
          fetch('/api/audit'),
        ]);

        const productsData = await productsRes.json();
        const recsData = await recsRes.json();
        const auditData = await auditRes.json();

        // Calculate some stats
        const pending = recsData.recommendations || [];
        const confidences = pending.map((r: any) => r.confidenceScore);
        const avgConf = confidences.length > 0 ? Math.round(confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length) : 0;

        setStats({
          totalProducts: productsData.products?.length || 0,
          pendingRecommendations: pending.length,
          avgConfidence: avgConf,
          executedChanges: auditData.logs?.length || 0,
        });

        // Filter high confidence (e.g., > 85)
        setHighConfidenceRecs(pending.filter((r: any) => r.confidenceScore >= 85).slice(0, 3));

        // Generate chart data from audit logs or mock if empty
        const logs = auditData.logs || [];
        if (logs.length > 0) {
          const dailyData: Record<string, any> = {};
          logs.slice(0, 20).forEach((log: any) => {
            const date = new Date(log.executedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dailyData[date]) dailyData[date] = { date, recommended: 0, revenue: 0 };
            dailyData[date].recommended += log.newPrice;
            dailyData[date].revenue += log.newPrice * 1.2; // Simulated revenue capture
          });
          setChartData(Object.values(dailyData).reverse());
        } else {
          // Fallback mock data
          setChartData([
            { date: 'Apr 20', recommended: 400, revenue: 440 },
            { date: 'Apr 21', recommended: 300, revenue: 320 },
            { date: 'Apr 22', recommended: 600, revenue: 680 },
            { date: 'Apr 23', recommended: 800, revenue: 950 },
            { date: 'Apr 24', recommended: 500, revenue: 580 },
            { date: 'Apr 25', recommended: 900, revenue: 1100 },
            { date: 'Apr 26', recommended: 700, revenue: 820 },
          ]);
        }
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
        {/* Main Graph */}
        <div className="lg:col-span-2 glass-card p-8 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-bold text-lg">Price Optimization Activity</h3>
            <div className="flex gap-4">
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
          <div className="flex-1 w-full h-[300px]">
            {loading ? (
              <div className="w-full h-full animate-pulse bg-white/5 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    hide 
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="recommended" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Action Queue Snapshot */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-6">High Confidence Queue</h3>
          <div className="flex-1 space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 w-full animate-pulse bg-white/5 rounded-lg" />)
            ) : highConfidenceRecs.length > 0 ? (
              highConfidenceRecs.map((rec) => (
                <Link key={rec.id} href="/dashboard/recommendations" className="block p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-blue-400">{rec.product.name}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-bold">{rec.confidenceScore}%</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-gray-500">Rec: ${rec.recommendedPrice.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400">SKU: {rec.product.sku}</span>
                  </div>
                </Link>
              ))
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
