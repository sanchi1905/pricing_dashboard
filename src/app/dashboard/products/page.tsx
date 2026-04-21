'use client';

import { useState, useEffect } from 'react';

export default function ProductCatalog() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const triggerAnalysis = async (productId: string) => {
    setProcessingId(productId);
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      
      if (!res.ok) throw new Error('Analysis failed');
      
      alert('AI transformation complete! Check the recommendations queue.');
    } catch (error) {
      console.error('Error running agent:', error);
      alert('Agent failed to run.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-gray-400 mt-1">Manage SKUs and monitor inventory health.</p>
        </div>
        <button 
          onClick={fetchProducts}
          className="glass-button-secondary"
        >
          Refresh Data
        </button>
      </header>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">SKU</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Product Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Category</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Price</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">COGS</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-center">Stock</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-6 py-4 bg-white/5">&nbsp;</td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  No products found. Use seed data or add products.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-blue-400">{p.sku}</td>
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className="badge bg-blue-500/10 text-blue-500">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">${p.currentPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-gray-500">${p.cogs.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-mono ${p.stockQty < 15 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {p.stockQty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => triggerAnalysis(p.id)}
                      disabled={processingId === p.id}
                      className="text-xs bg-blue-600/10 text-blue-400 border border-blue-600/20 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                    >
                      {processingId === p.id ? 'Running AI...' : 'Recalculate'}
                    </button>
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
