// Agent Orchestrator
// Runs the full multi-agent pipeline: Market → Demand → Inventory → Strategy → Execution

import { prisma } from '../prisma';
import { runMarketIntelligenceAgent } from './market-intelligence';
import { runDemandForecastingAgent } from './demand-forecasting';
import { runInventoryCostAgent } from './inventory-cost';
import { runPricingStrategyAgent } from './pricing-strategy';
import { runExecutionComplianceAgent } from './execution-compliance';

export interface OrchestrationResult {
  productId: string;
  productName: string;
  recommendationId: string;
  recommendedPrice: number;
  confidenceScore: number;
  rationale: string;
  status: string;
  agentOutputs: Record<string, unknown>;
}

export async function runAgentPipeline(productId: string, orgId: string): Promise<OrchestrationResult> {
  // Fetch product data
  const product = await prisma.product.findFirst({
    where: { id: productId, orgId },
  });

  if (!product) {
    throw new Error('Product not found or access denied');
  }

  // Fetch org config
  const config = await prisma.orgConfig.findUnique({
    where: { orgId },
  });

  const autoExecuteThreshold = config?.autoExecuteThreshold ?? 90;
  const maxDiscountPercent = config?.maxDiscountPercent ?? 25;

  // Step 1: Market Intelligence Agent
  const marketData = await runMarketIntelligenceAgent(
    product.name,
    product.currentPrice,
    product.category,
    product.sku
  );

  // Step 2: Demand Forecasting Agent
  const demandData = await runDemandForecastingAgent(
    product.name,
    product.currentPrice,
    product.category,
    product.stockQty
  );

  // Step 3: Inventory & Cost Agent
  const inventoryData = await runInventoryCostAgent(
    product.name,
    product.currentPrice,
    product.cogs,
    product.stockQty,
    product.category
  );

  // Step 4: Pricing Strategy Agent (synthesizes all)
  const pricingResult = await runPricingStrategyAgent(
    product.name,
    product.currentPrice,
    marketData,
    demandData,
    inventoryData
  );

  // Step 5: Execution & Compliance Agent
  const executionResult = await runExecutionComplianceAgent(
    pricingResult,
    product.currentPrice,
    product.cogs,
    autoExecuteThreshold,
    maxDiscountPercent
  );

  // Store competitor prices
  for (const cp of marketData.competitorPrices) {
    await prisma.competitorPrice.create({
      data: {
        productId: product.id,
        competitorName: cp.competitor,
        price: cp.price,
        capturedAt: new Date(cp.timestamp),
      },
    });
  }

  // Determine final status
  const status = executionResult.autoExecute ? 'EXECUTED' : 'PENDING';

  // Create recommendation record
  const agentOutputs = {
    marketIntelligence: marketData,
    demandForecasting: demandData,
    inventoryCost: inventoryData,
    pricingStrategy: pricingResult,
    executionCompliance: executionResult,
  };

  const recommendation = await prisma.pricingRecommendation.create({
    data: {
      productId: product.id,
      orgId,
      status,
      recommendedPrice: executionResult.finalRecommendedPrice,
      confidenceScore: pricingResult.confidenceScore,
      rationale: pricingResult.rationale,
      agentOutputs: JSON.stringify(agentOutputs),
      resolvedAt: status === 'EXECUTED' ? new Date() : null,
    },
  });

  // If auto-executed, create price change and update product
  if (status === 'EXECUTED') {
    await prisma.priceChange.create({
      data: {
        productId: product.id,
        orgId,
        oldPrice: product.currentPrice,
        newPrice: executionResult.finalRecommendedPrice,
        triggeredBy: 'AI',
        recommendationId: recommendation.id,
      },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { currentPrice: executionResult.finalRecommendedPrice },
    });
  }

  return {
    productId: product.id,
    productName: product.name,
    recommendationId: recommendation.id,
    recommendedPrice: executionResult.finalRecommendedPrice,
    confidenceScore: pricingResult.confidenceScore,
    rationale: pricingResult.rationale,
    status,
    agentOutputs,
  };
}

export async function runAgentPipelineForAllProducts(orgId: string): Promise<OrchestrationResult[]> {
  const products = await prisma.product.findMany({
    where: { orgId },
  });

  const results: OrchestrationResult[] = [];
  for (const product of products) {
    try {
      const result = await runAgentPipeline(product.id, orgId);
      results.push(result);
    } catch (error) {
      console.error(`Agent pipeline failed for product ${product.id}:`, error);
    }
  }

  return results;
}
