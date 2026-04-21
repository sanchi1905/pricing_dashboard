'use client';

import { useState, useEffect } from 'react';

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAudit() {
      try {
        const res = await fetch('/api/audit');
        const data = await res.json();
        setLogs(data.auditTrail || []);
      } catch (error) {
        console.error('Audit trail load failed:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAudit();
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">System Audit Trail</h1>
        <p className="text-gray-400 mt-1">Immutable history of pricing actions and platform adjustments.</p>
      </header>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Timestamp</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Product</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Old Price</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-center">→</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">New Price</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-center">Trigger</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Approver / Actor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-6 py-6 bg-white/5">&nbsp;</td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  No pricing actions recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors text-sm">
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                    {new Date(log.executedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <div>{log.product.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{log.product.sku}</div>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-400 font-mono">${log.oldPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center text-gray-600">→</td>
                  <td className="px-6 py-4 text-right font-bold text-white font-mono">${log.newPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`badge ${
                      log.triggeredBy === 'AI' ? 'bg-purple-500/10 text-purple-400' :
                      log.triggeredBy === 'MANUAL' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {log.triggeredBy}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {log.recommendation?.approvalActions?.[0]?.user?.name || (log.triggeredBy === 'AI' ? 'System Orchestrator' : 'Manual Edit')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
