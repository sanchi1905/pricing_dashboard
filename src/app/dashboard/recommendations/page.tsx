'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RecommendationQueue() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recommendations?status=${activeTab}`);
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [activeTab]);

  const StatusTab = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3 font-medium transition-all border-b-2 ${
        activeTab === id ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-transparent text-gray-500 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Strategy Queue</h1>
          <p className="text-gray-400 mt-1">Review and approve machine-generated pricing strategies.</p>
        </div>
      </header>

      <div className="flex border-b border-white/5">
        <StatusTab id="PENDING" label="Pending Review" />
        <StatusTab id="APPROVED" label="Approved" />
        <StatusTab id="REJECTED" label="Rejected" />
        <StatusTab id="EXECUTED" label="Auto-Executed" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="glass-card h-24 animate-pulse" />)
        ) : recommendations.length === 0 ? (
          <div className="glass-card p-20 text-center text-gray-500">
            <div className="text-5xl mb-4">💤</div>
            <p>No {activeTab.toLowerCase()} recommendations found.</p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const priceChange = ((rec.recommendedPrice - rec.product.currentPrice) / rec.product.currentPrice) * 100;
            const isIncrease = priceChange > 0;
            
            return (
              <Link 
                key={rec.id} 
                href={`/dashboard/recommendations/${rec.id}`}
                className="glass-card p-6 flex items-center justify-between hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-lg ${
                    rec.confidenceScore >= 90 ? 'bg-emerald-500/20 text-emerald-500' : 
                    rec.confidenceScore >= 70 ? 'bg-blue-500/20 text-blue-500' : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    <span className="text-xs uppercase opacity-60 leading-none mb-0.5">Conf</span>
                    {rec.confidenceScore}%
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{rec.product.name}</h4>
                    <p className="text-sm text-gray-500">SKU: {rec.product.sku} • {rec.product.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Current</p>
                    <p className="font-mono font-medium">${rec.product.currentPrice.toFixed(2)}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-xl ${isIncrease ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isIncrease ? '↑' : '↓'}
                    </div>
                  </div>

                  <div className="text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Recommended</p>
                    <p className={`font-mono font-bold text-lg ${isIncrease ? 'text-emerald-500' : 'text-red-500'}`}>
                      ${rec.recommendedPrice.toFixed(2)}
                    </p>
                  </div>

                  <div className="w-40 hidden md:block">
                    <p className="text-xs text-gray-500 line-clamp-2 italic">
                      &quot;{rec.rationale}&quot;
                    </p>
                  </div>

                  <div className="text-gray-400 group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
