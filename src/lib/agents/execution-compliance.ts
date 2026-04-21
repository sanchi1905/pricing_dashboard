// Execution & Compliance Agent
// Validates recommendations against business rules and routes to approval

import { PricingStrategyResult } from './pricing-strategy';

export interface ExecutionComplianceResult {
  agentName: string;
  approved: boolean;
  autoExecute: boolean;
  violations: string[];
  appliedRules: string[];
  finalRecommendedPrice: number;
  routeTo: 'auto_execute' | 'analyst_queue' | 'admin_escalation';
  timestamp: string;
}

export async function runExecutionComplianceAgent(
  pricingResult: PricingStrategyResult,
  currentPrice: number,
  cogs: number,
  autoExecuteThreshold: number = 90,
  maxDiscountPercent: number = 25,
  marginFloorPercent: number = 15
): Promise<ExecutionComplianceResult> {
  await new Promise(resolve => setTimeout(resolve, 50));

  const violations: string[] = [];
  const appliedRules: string[] = [];
  let finalPrice = pricingResult.recommendedPrice;
  let approved = true;

  // Rule 1: Margin floor check
  const marginFloor = cogs * (1 + marginFloorPercent / 100);
  if (finalPrice < marginFloor) {
    violations.push(`Price $${finalPrice} is below margin floor $${marginFloor.toFixed(2)} (${marginFloorPercent}% minimum margin).`);
    finalPrice = marginFloor;
    approved = false;
  }
  appliedRules.push(`Margin floor check: ${marginFloorPercent}% minimum → $${marginFloor.toFixed(2)}`);

  // Rule 2: Maximum discount check
  const discountPercent = ((currentPrice - finalPrice) / currentPrice) * 100;
  if (discountPercent > maxDiscountPercent) {
    violations.push(`Discount of ${discountPercent.toFixed(1)}% exceeds maximum allowed ${maxDiscountPercent}%.`);
    finalPrice = currentPrice * (1 - maxDiscountPercent / 100);
    approved = false;
  }
  appliedRules.push(`Max discount check: ${maxDiscountPercent}% cap`);

  // Rule 3: Absurd price check (don't increase more than 15%)
  const increasePercent = ((finalPrice - currentPrice) / currentPrice) * 100;
  if (increasePercent > 15) {
    violations.push(`Price increase of ${increasePercent.toFixed(1)}% is excessive. Capped at 15%.`);
    finalPrice = currentPrice * 1.15;
  }
  appliedRules.push('Max increase check: 15% cap');

  finalPrice = Math.round(finalPrice * 100) / 100;

  // Determine routing
  let routeTo: 'auto_execute' | 'analyst_queue' | 'admin_escalation';
  if (violations.length > 0) {
    routeTo = 'admin_escalation';
  } else if (pricingResult.confidenceScore >= autoExecuteThreshold) {
    routeTo = 'auto_execute';
  } else {
    routeTo = 'analyst_queue';
  }

  const autoExecute = routeTo === 'auto_execute' && violations.length === 0;

  return {
    agentName: 'Execution & Compliance Agent',
    approved: approved && violations.length === 0,
    autoExecute,
    violations,
    appliedRules,
    finalRecommendedPrice: finalPrice,
    routeTo,
    timestamp: new Date().toISOString()
  };
}
