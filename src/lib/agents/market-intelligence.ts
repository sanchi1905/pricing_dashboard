// Market Intelligence Agent
// Analyzes competitor pricing data, market trends, and demand signals

export interface CompetitorData {
  competitor: string;
  price: number;
  timestamp: string;
  priceDelta?: number;
}

export interface MarketIntelligenceResult {
  agentName: string;
  competitorPrices: CompetitorData[];
  averageMarketPrice: number;
  lowestCompetitorPrice: number;
  highestCompetitorPrice: number;
  pricePosition: 'below_market' | 'at_market' | 'above_market';
  marketTrend: 'rising' | 'stable' | 'falling';
  recommendations: string[];
  confidence: number;
  timestamp: string;
}

const COMPETITORS = [
  'Amazon', 'Best Buy', 'Walmart', 'Target', 'Newegg',
  'B&H Photo', 'Adorama', 'Micro Center'
];

function generateCompetitorPrices(basePrice: number, category: string): CompetitorData[] {
  const numCompetitors = 3 + Math.floor(Math.random() * 4);
  const selected = [...COMPETITORS].sort(() => Math.random() - 0.5).slice(0, numCompetitors);
  
  return selected.map(competitor => {
    // Generate realistic price variations (-15% to +20%)
    const variation = (Math.random() * 0.35 - 0.15);
    const price = Math.round((basePrice * (1 + variation)) * 100) / 100;
    const daysAgo = Math.floor(Math.random() * 7);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    return {
      competitor,
      price,
      timestamp: date.toISOString(),
      priceDelta: Math.round((price - basePrice) * 100) / 100
    };
  });
}

export async function runMarketIntelligenceAgent(
  productName: string,
  currentPrice: number,
  category: string,
  _sku: string
): Promise<MarketIntelligenceResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const competitorPrices = generateCompetitorPrices(currentPrice, category);
  const prices = competitorPrices.map(c => c.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  let pricePosition: 'below_market' | 'at_market' | 'above_market';
  if (currentPrice < avgPrice * 0.97) pricePosition = 'below_market';
  else if (currentPrice > avgPrice * 1.03) pricePosition = 'above_market';
  else pricePosition = 'at_market';

  // Determine market trend based on recent price movements
  const recentPrices = competitorPrices
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);
  const avgRecentDelta = recentPrices.reduce((sum, c) => sum + (c.priceDelta || 0), 0) / recentPrices.length;
  
  let marketTrend: 'rising' | 'stable' | 'falling';
  if (avgRecentDelta > currentPrice * 0.02) marketTrend = 'rising';
  else if (avgRecentDelta < -currentPrice * 0.02) marketTrend = 'falling';
  else marketTrend = 'stable';

  const recommendations: string[] = [];
  if (pricePosition === 'above_market') {
    recommendations.push(`Current price ($${currentPrice}) is above market average ($${avgPrice.toFixed(2)}). Consider a price reduction.`);
  }
  if (pricePosition === 'below_market') {
    recommendations.push(`Current price ($${currentPrice}) is below market average ($${avgPrice.toFixed(2)}). Opportunity to increase margin.`);
  }
  if (marketTrend === 'falling') {
    recommendations.push('Market trend is falling — preemptive price adjustment may be needed to stay competitive.');
  }

  return {
    agentName: 'Market Intelligence Agent',
    competitorPrices,
    averageMarketPrice: Math.round(avgPrice * 100) / 100,
    lowestCompetitorPrice: minPrice,
    highestCompetitorPrice: maxPrice,
    pricePosition,
    marketTrend,
    recommendations,
    confidence: 70 + Math.floor(Math.random() * 25),
    timestamp: new Date().toISOString()
  };
}
