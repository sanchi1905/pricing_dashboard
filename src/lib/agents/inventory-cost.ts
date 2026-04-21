// Inventory & Cost Agent
// Monitors stock levels, COGS, and margin thresholds

export interface InventoryCostResult {
  agentName: string;
  stockQty: number;
  cogs: number;
  marginFloor: number;
  currentMarginPercent: number;
  overstockFlag: boolean;
  stockoutRisk: boolean;
  reorderPoint: number;
  daysOfSupply: number;
  constraints: string[];
  confidence: number;
  timestamp: string;
}

export async function runInventoryCostAgent(
  productName: string,
  currentPrice: number,
  cogs: number,
  stockQty: number,
  category: string
): Promise<InventoryCostResult> {
  await new Promise(resolve => setTimeout(resolve, 60));

  const marginFloorPercents: Record<string, number> = {
    'Electronics': 15,
    'Audio': 20,
    'Wearables': 25,
    'Computing': 12,
    'Gaming': 18,
    'Accessories': 30,
  };

  const marginFloorPct = marginFloorPercents[category] || 15;
  const marginFloor = Math.round(cogs * (1 + marginFloorPct / 100) * 100) / 100;
  const currentMarginPercent = Math.round(((currentPrice - cogs) / currentPrice) * 100 * 100) / 100;
  
  // Estimate daily sales velocity
  const dailySalesEstimate = stockQty > 200 ? 8 : stockQty > 50 ? 4 : 2;
  const daysOfSupply = Math.round(stockQty / dailySalesEstimate);
  const reorderPoint = dailySalesEstimate * 14; // 2 weeks safety stock

  const overstockFlag = daysOfSupply > 90;
  const stockoutRisk = daysOfSupply < 14;

  const constraints: string[] = [];
  
  if (currentPrice < marginFloor) {
    constraints.push(`⚠️ Current price ($${currentPrice}) is BELOW margin floor ($${marginFloor}). Price increase required.`);
  }
  if (overstockFlag) {
    constraints.push(`📦 Overstock detected: ${daysOfSupply} days of supply. Consider aggressive pricing to move inventory.`);
  }
  if (stockoutRisk) {
    constraints.push(`🔴 Stockout risk: Only ${daysOfSupply} days of supply remaining. Avoid discounting.`);
  }
  if (currentMarginPercent < marginFloorPct + 5) {
    constraints.push(`Thin margin: ${currentMarginPercent}% — close to the ${marginFloorPct}% floor for ${category}.`);
  }

  return {
    agentName: 'Inventory & Cost Agent',
    stockQty,
    cogs,
    marginFloor,
    currentMarginPercent,
    overstockFlag,
    stockoutRisk,
    reorderPoint,
    daysOfSupply,
    constraints,
    confidence: 80 + Math.floor(Math.random() * 15),
    timestamp: new Date().toISOString()
  };
}
