// Demand Forecasting Agent
// Predicts demand elasticity using seasonal patterns, category trends, and SKU-level velocity

export interface DemandForecastResult {
  agentName: string;
  demandMultiplier: number;
  seasonalFactor: string;
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  velocityScore: number; // 0-100
  elasticity: 'elastic' | 'inelastic' | 'unit_elastic';
  confidenceInterval: { low: number; high: number };
  insights: string[];
  confidence: number;
  timestamp: string;
}

const SEASONAL_FACTORS: Record<string, Record<number, number>> = {
  'Electronics': { 0: 0.8, 1: 0.7, 2: 0.75, 3: 0.85, 4: 0.9, 5: 0.95, 6: 0.85, 7: 0.9, 8: 1.0, 9: 1.1, 10: 1.4, 11: 1.6 },
  'Audio': { 0: 0.85, 1: 0.75, 2: 0.8, 3: 0.85, 4: 0.9, 5: 1.0, 6: 0.9, 7: 0.95, 8: 1.0, 9: 1.1, 10: 1.3, 11: 1.5 },
  'Wearables': { 0: 1.2, 1: 0.9, 2: 0.85, 3: 0.9, 4: 1.0, 5: 1.1, 6: 0.95, 7: 0.9, 8: 1.0, 9: 1.05, 10: 1.2, 11: 1.4 },
  'Computing': { 0: 0.9, 1: 0.8, 2: 0.85, 3: 0.9, 4: 0.95, 5: 1.0, 6: 0.85, 7: 1.1, 8: 1.2, 9: 1.0, 10: 1.1, 11: 1.3 },
  'Gaming': { 0: 1.1, 1: 0.85, 2: 0.8, 3: 0.9, 4: 0.95, 5: 1.0, 6: 0.95, 7: 0.9, 8: 0.95, 9: 1.0, 10: 1.3, 11: 1.5 },
};

export async function runDemandForecastingAgent(
  productName: string,
  currentPrice: number,
  category: string,
  stockQty: number
): Promise<DemandForecastResult> {
  await new Promise(resolve => setTimeout(resolve, 80));

  const month = new Date().getMonth();
  const categoryFactors = SEASONAL_FACTORS[category] || SEASONAL_FACTORS['Electronics'];
  const seasonalMultiplier = categoryFactors[month] || 1.0;
  
  const seasonalFactor = seasonalMultiplier > 1.1 ? 'high_season' : 
                          seasonalMultiplier < 0.85 ? 'low_season' : 'normal_season';

  // Simulate velocity based on price point and stock
  const priceVelocity = currentPrice > 500 ? 40 : currentPrice > 200 ? 60 : 75;
  const stockBoost = stockQty > 100 ? 10 : stockQty < 20 ? -15 : 0;
  const velocityScore = Math.min(100, Math.max(0, priceVelocity + stockBoost + Math.floor(Math.random() * 20)));

  const trendDirection: 'increasing' | 'stable' | 'decreasing' = 
    velocityScore > 65 ? 'increasing' : velocityScore < 35 ? 'decreasing' : 'stable';

  const elasticity: 'elastic' | 'inelastic' | 'unit_elastic' =
    currentPrice > 400 ? 'elastic' : currentPrice < 100 ? 'inelastic' : 'unit_elastic';

  const demandMultiplier = Math.round((seasonalMultiplier * (0.8 + velocityScore / 200)) * 100) / 100;

  const insights: string[] = [];
  if (seasonalFactor === 'high_season') {
    insights.push(`High seasonal demand for ${category} — demand multiplier at ${demandMultiplier}x.`);
  }
  if (trendDirection === 'increasing') {
    insights.push(`Search trend for "${productName}" is increasing. Consider maintaining or raising prices.`);
  }
  if (elasticity === 'elastic') {
    insights.push('Product shows elastic demand — price reductions could significantly boost volume.');
  }

  return {
    agentName: 'Demand Forecasting Agent',
    demandMultiplier,
    seasonalFactor,
    trendDirection,
    velocityScore,
    elasticity,
    confidenceInterval: {
      low: Math.round((demandMultiplier * 0.85) * 100) / 100,
      high: Math.round((demandMultiplier * 1.15) * 100) / 100
    },
    insights,
    confidence: 65 + Math.floor(Math.random() * 25),
    timestamp: new Date().toISOString()
  };
}
