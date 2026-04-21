// Pricing Strategy Agent (Central Orchestrator)
// Synthesizes all agent outputs to produce final pricing recommendation

import { MarketIntelligenceResult } from './market-intelligence';
import { DemandForecastResult } from './demand-forecasting';
import { InventoryCostResult } from './inventory-cost';

export interface ContributingFactor {
  factor: string;
  weight: number;
  direction: 'increase' | 'decrease' | 'neutral';
}

export interface PricingStrategyResult {
  agentName: string;
  recommendedPrice: number;
  confidenceScore: number;
  rationale: string;
  contributingFactors: ContributingFactor[];
  uncertaintyFlags: string[];
  priceChangePercent: number;
  timestamp: string;
}

export async function runPricingStrategyAgent(
  productName: string,
  currentPrice: number,
  marketData: MarketIntelligenceResult,
  demandData: DemandForecastResult,
  inventoryData: InventoryCostResult
): Promise<PricingStrategyResult> {
  await new Promise(resolve => setTimeout(resolve, 150));

  const contributingFactors: ContributingFactor[] = [];
  const uncertaintyFlags: string[] = [];
  let priceAdjustment = 0;

  // Factor 1: Market Position (weight: 35%)
  const marketWeight = 0.35;
  if (marketData.pricePosition === 'above_market') {
    const gap = (currentPrice - marketData.averageMarketPrice) / currentPrice;
    priceAdjustment -= gap * marketWeight;
    contributingFactors.push({
      factor: 'Competitor Pricing',
      weight: 35,
      direction: 'decrease'
    });
  } else if (marketData.pricePosition === 'below_market') {
    const gap = (marketData.averageMarketPrice - currentPrice) / currentPrice;
    priceAdjustment += gap * marketWeight * 0.5; // Conservative upward adjustment
    contributingFactors.push({
      factor: 'Competitor Pricing',
      weight: 35,
      direction: 'increase'
    });
  } else {
    contributingFactors.push({
      factor: 'Competitor Pricing',
      weight: 35,
      direction: 'neutral'
    });
  }

  // Factor 2: Demand Signals (weight: 25%)
  const demandWeight = 0.25;
  if (demandData.trendDirection === 'increasing') {
    priceAdjustment += 0.03 * demandWeight * demandData.demandMultiplier;
    contributingFactors.push({
      factor: 'Demand Trends',
      weight: 25,
      direction: 'increase'
    });
  } else if (demandData.trendDirection === 'decreasing') {
    priceAdjustment -= 0.05 * demandWeight;
    contributingFactors.push({
      factor: 'Demand Trends',
      weight: 25,
      direction: 'decrease'
    });
  } else {
    contributingFactors.push({
      factor: 'Demand Trends',
      weight: 25,
      direction: 'neutral'
    });
  }

  // Factor 3: Inventory Pressure (weight: 20%)
  if (inventoryData.overstockFlag) {
    priceAdjustment -= 0.08;
    contributingFactors.push({
      factor: 'Inventory Levels',
      weight: 20,
      direction: 'decrease'
    });
  } else if (inventoryData.stockoutRisk) {
    priceAdjustment += 0.05;
    contributingFactors.push({
      factor: 'Inventory Levels',
      weight: 20,
      direction: 'increase'
    });
  } else {
    contributingFactors.push({
      factor: 'Inventory Levels',
      weight: 20,
      direction: 'neutral'
    });
  }

  // Factor 4: Seasonal Demand (weight: 20%)
  if (demandData.seasonalFactor === 'high_season') {
    priceAdjustment += 0.04;
    contributingFactors.push({
      factor: 'Seasonal Patterns',
      weight: 20,
      direction: 'increase'
    });
  } else if (demandData.seasonalFactor === 'low_season') {
    priceAdjustment -= 0.03;
    contributingFactors.push({
      factor: 'Seasonal Patterns',
      weight: 20,
      direction: 'decrease'
    });
  } else {
    contributingFactors.push({
      factor: 'Seasonal Patterns',
      weight: 20,
      direction: 'neutral'
    });
  }

  // Calculate recommended price
  let recommendedPrice = currentPrice * (1 + priceAdjustment);
  
  // Enforce margin floor
  if (recommendedPrice < inventoryData.marginFloor) {
    recommendedPrice = inventoryData.marginFloor;
    uncertaintyFlags.push('Price was adjusted upward to meet margin floor requirements.');
  }

  // Cap maximum discount at 25%
  if (recommendedPrice < currentPrice * 0.75) {
    recommendedPrice = currentPrice * 0.75;
    uncertaintyFlags.push('Maximum discount cap (25%) applied.');
  }

  recommendedPrice = Math.round(recommendedPrice * 100) / 100;
  const priceChangePercent = Math.round(((recommendedPrice - currentPrice) / currentPrice) * 100 * 100) / 100;

  // Calculate confidence score
  let confidence = Math.round(
    (marketData.confidence * 0.35 +
     demandData.confidence * 0.25 +
     inventoryData.confidence * 0.2 +
     80 * 0.2) // Base strategy confidence
  );

  // Degrade confidence for uncertainty
  if (uncertaintyFlags.length > 0) {
    confidence = Math.max(30, confidence - uncertaintyFlags.length * 8);
  }
  if (marketData.competitorPrices.length < 3) {
    uncertaintyFlags.push('Limited competitor data available — fewer than 3 data points.');
    confidence = Math.max(30, confidence - 10);
  }

  confidence = Math.min(98, Math.max(20, confidence));

  // Generate rationale
  const directionWord = priceChangePercent > 0 ? 'increase' : priceChangePercent < 0 ? 'decrease' : 'maintain';
  const rationale = `Based on analysis across ${marketData.competitorPrices.length} competitors, ${demandData.trendDirection} demand trends (${demandData.seasonalFactor.replace('_', ' ')}), and ${inventoryData.daysOfSupply} days of inventory supply, we recommend a ${Math.abs(priceChangePercent)}% price ${directionWord} for "${productName}". ` +
    `The average market price is $${marketData.averageMarketPrice}, and our current margin stands at ${inventoryData.currentMarginPercent}% (floor: ${Math.round((inventoryData.marginFloor / inventoryData.cogs - 1) * 100)}%). ` +
    (inventoryData.overstockFlag ? `Overstock conditions suggest an aggressive pricing strategy to accelerate sell-through. ` : '') +
    (demandData.trendDirection === 'increasing' ? `Rising demand trends provide room for premium pricing. ` : '') +
    `Confidence is ${confidence >= 80 ? 'high' : confidence >= 60 ? 'moderate' : 'low'} at ${confidence}/100.`;

  return {
    agentName: 'Pricing Strategy Agent',
    recommendedPrice,
    confidenceScore: confidence,
    rationale,
    contributingFactors,
    uncertaintyFlags,
    priceChangePercent,
    timestamp: new Date().toISOString()
  };
}
