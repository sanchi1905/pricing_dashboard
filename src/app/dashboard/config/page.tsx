'use client';

import { useState, useEffect } from 'react';

export default function AdminConfig() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        setConfig(data.config);
      } catch (error) {
        console.error('Config load failed:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoExecuteThreshold: parseInt(config.autoExecuteThreshold),
          maxDiscountPercent: parseFloat(config.maxDiscountPercent),
        }),
      });

      if (res.ok) {
        setMessage('Configuration saved successfully! ✨');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Config save failed:', error);
      setMessage('⚠️ Error saving configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 animate-pulse">Loading system governance rules...</div>;
  if (!config) return <div className="p-10">Configuration not available.</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
        <p className="text-gray-400 mt-1">Manage AI decision boundaries and safety thresholds.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="glass-card p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="block text-sm font-bold uppercase tracking-widest text-blue-400">
                Auto-Execution Threshold
              </label>
              <p className="text-xs text-gray-500 italic pb-2">
                Minimum AI confidence score required to trigger price updates without human approval.
              </p>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="50" 
                  max="99" 
                  value={config.autoExecuteThreshold}
                  onChange={(e) => setConfig({...config, autoExecuteThreshold: e.target.value})}
                  className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
                <span className="font-mono text-xl font-bold w-12">{config.autoExecuteThreshold}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold uppercase tracking-widest text-blue-400">
                Max Discount Cap
              </label>
              <p className="text-xs text-gray-500 italic pb-2">
                Hard safety limit for machine-proposed discounts (relative to current price).
              </p>
              <div className="flex gap-2 items-center">
                <input 
                  type="number"
                  value={config.maxDiscountPercent}
                  onChange={(e) => setConfig({...config, maxDiscountPercent: e.target.value})}
                  className="input-field w-24 text-center font-bold"
                />
                <span className="text-gray-500 font-bold">%</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Category Margin Floors (%)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(config.marginFloorByCategory).map(([cat, val]: any) => (
                <div key={cat} className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{cat}</p>
                  <p className="text-lg font-mono font-bold text-gray-300">{val}%</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-4 leading-relaxed italic">
              Floor margins are applied *after* taxes and overhead. The Pricing Strategy Agent will prioritize these floors over volume gains.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            type="submit"
            disabled={saving}
            className="glass-button-primary px-10"
          >
            {saving ? 'Updating Rules...' : 'Save Global Config'}
          </button>
          
          {message && (
            <span className="text-emerald-400 font-medium animate-in fade-in slide-in-from-left-2">
              {message}
            </span>
          )}
        </div>
      </form>

      <div className="glass-card p-6 border-l-4 border-l-amber-500 bg-amber-500/5">
         <h4 className="font-bold text-amber-500 flex items-center gap-2">
           <span>⚠️</span> Multi-Tenant Data Isolation Active
         </h4>
         <p className="text-xs text-amber-500/70 mt-1">
           Your configuration changes are scoped ONLY to your organization. They will not affect global AI training or other tenant baselines.
         </p>
      </div>
    </div>
  );
}
