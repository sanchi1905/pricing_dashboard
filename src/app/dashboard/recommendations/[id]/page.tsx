'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RecommendationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [overridePrice, setOverridePrice] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showOverride, setShowOverride] = useState(false);
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/recommendations/${id}`);
        const json = await res.json();
        setData(json.recommendation);
        setOverridePrice(json.recommendation.recommendedPrice.toString());
      } catch (error) {
        console.error('Error fetching detail:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleApprove = async (priceOverride?: number) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/recommendations/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priceOverride ? { overridePrice: priceOverride } : {}),
      });
      if (res.ok) router.push('/dashboard/recommendations');
    } catch (error) {
      console.error('Approve failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return alert('Please provide a reason');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/recommendations/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      if (res.ok) router.push('/dashboard/recommendations');
    } catch (error) {
      console.error('Reject failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading strategy breakdown...</div>;
  if (!data) return <div className="p-10 text-center">Strategy not found.</div>;

  const agents = data.agentOutputs;
  const isPending = data.status === 'PENDING';

  const AgentCard = ({ title, agent, children }: { title: string; agent: string; children: React.ReactNode }) => (
    <div className="glass-card p-6 border-l-4 border-l-blue-500">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-lg">{title}</h4>
        <span className="text-xs text-gray-500 font-mono italic">{agent}</span>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <Link href="/dashboard/recommendations" className="text-sm text-gray-500 hover:text-white flex items-center gap-2">
        ← Back to Queue
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{data.product.name}</h1>
          <p className="text-gray-400 mt-1">Strategy Intelligence Breakdown • ID: {data.id.slice(0, 8)}</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border ${
          data.status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
          data.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
          'bg-blue-500/10 border-blue-500/20 text-blue-500'
        }`}>
          <span className="font-bold text-sm uppercase tracking-widest">{data.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Rationale Section */}
          <div className="glass-card p-8 bg-blue-600/5 border-blue-500/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🤖</span> AI Rationale
            </h3>
            <p className="text-lg leading-relaxed text-gray-200">
              {data.rationale}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AgentCard title="Market Intelligence" agent="MarketIntelligenceAgent">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Avg Market Price</span>
                <span className="font-mono">${agents.marketIntelligence.averageMarketPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Position</span>
                <span className="capitalize text-blue-400">{agents.marketIntelligence.pricePosition.replace('_', ' ')}</span>
              </div>
              <div className="pt-2">
                <p className="text-xs text-blue-300 italic">“{agents.marketIntelligence.recommendations[0]}”</p>
              </div>
            </AgentCard>

            <AgentCard title="Demand Forecast" agent="DemandForecastingAgent">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Demand Multiplier</span>
                <span className="font-mono text-emerald-400">{agents.demandForecasting.demandMultiplier}x</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Velocity Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${agents.demandForecasting.velocityScore}%` }}></div>
                   </div>
                  <span className="font-mono text-xs">{agents.demandForecasting.velocityScore}/100</span>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-emerald-300 italic">“{agents.demandForecasting.insights[0]}”</p>
              </div>
            </AgentCard>

            <AgentCard title="Inventory & Cost" agent="InventoryCostAgent">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Stock Available</span>
                <span className="font-mono">{agents.inventoryCost.stockQty} units</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Margin Floor</span>
                <span className="font-mono text-red-400">${agents.inventoryCost.marginFloor}</span>
              </div>
              <div className="pt-2">
                {agents.inventoryCost.constraints.map((c: string, i: number) => (
                  <p key={i} className="text-xs text-red-400 mb-1">{c}</p>
                ))}
              </div>
            </AgentCard>

            <AgentCard title="Execution Check" agent="ExecutionComplianceAgent">
               <div className="space-y-1">
                 {agents.executionCompliance.appliedRules.map((rule: string, i: number) => (
                   <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                     <span className="text-emerald-500 text-[8px]">●</span> {rule}
                   </div>
                 ))}
               </div>
               <div className="pt-3 border-t border-white/5 flex gap-2">
                  <span className="badge bg-purple-500/10 text-purple-400 text-[10px]">
                    Route: {agents.executionCompliance.routeTo.replace('_', ' ')}
                  </span>
               </div>
            </AgentCard>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8 sticky top-8">
            <div className="text-center mb-8">
               <div className={`inline-flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 mb-4 ${
                 data.confidenceScore >= 80 ? 'border-emerald-500/30 text-emerald-500' : 'border-blue-500/30 text-blue-500'
               }`}>
                 <span className="text-3xl font-bold leading-none">{data.confidenceScore}</span>
                 <span className="text-[10px] uppercase font-bold tracking-tighter mt-1 opacity-60">Confidence</span>
               </div>
               <p className="text-sm text-gray-400 font-medium">Machine Confidence Score</p>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Current Price</p>
                  <p className="text-xl font-mono">${data.product.currentPrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Recommended</p>
                  <p className="text-2xl font-mono font-bold text-blue-500">${data.recommendedPrice.toFixed(2)}</p>
                </div>
              </div>

              {isPending && (
                <div className="space-y-4 pt-4">
                  {!showOverride && !showReject && (
                    <div className="space-y-3">
                      <button 
                        onClick={() => handleApprove()}
                        className="glass-button-primary w-full py-4 text-lg"
                        disabled={submitting}
                      >
                        Approve Strategy
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setShowOverride(true)}
                          className="glass-button-secondary text-sm"
                        >
                          Modify $
                        </button>
                        <button 
                          onClick={() => setShowReject(true)}
                          className="glass-button-secondary text-sm hover:text-red-400"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {showOverride && (
                    <div className="space-y-4 border border-blue-500/30 p-4 rounded-xl bg-blue-500/5">
                       <p className="text-xs font-bold uppercase text-blue-400">Override Pricing</p>
                       <div className="flex gap-2">
                         <span className="flex items-center text-gray-400">$</span>
                         <input 
                           type="number"
                           value={overridePrice}
                           onChange={(e) => setOverridePrice(e.target.value)}
                           className="input-field flex-1"
                         />
                       </div>
                       <div className="flex gap-2">
                         <button 
                          onClick={() => handleApprove(parseFloat(overridePrice))}
                          className="glass-button-primary flex-1 text-sm"
                         >
                           Set Price
                         </button>
                         <button 
                          onClick={() => setShowOverride(false)}
                          className="glass-button-secondary text-xs"
                         >
                           Cancel
                         </button>
                       </div>
                    </div>
                  )}

                  {showReject && (
                    <div className="space-y-4 border border-red-500/30 p-4 rounded-xl bg-red-500/5">
                       <p className="text-xs font-bold uppercase text-red-400">Reject Strategy</p>
                       <textarea 
                         value={rejectionReason}
                         onChange={(e) => setRejectionReason(e.target.value)}
                         className="input-field w-full text-xs h-24 p-3"
                         placeholder="Provide reason for rejection..."
                       />
                       <div className="flex gap-2">
                         <button 
                          onClick={handleReject}
                          className="bg-red-600 hover:bg-red-500 text-white flex-1 text-sm py-2 rounded-lg"
                         >
                           Confirm Reject
                         </button>
                         <button 
                          onClick={() => setShowReject(false)}
                          className="glass-button-secondary text-xs"
                         >
                           Cancel
                         </button>
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
