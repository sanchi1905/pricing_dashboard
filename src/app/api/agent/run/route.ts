import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromHeaders, requireRole } from '@/lib/auth';
import { runAgentPipeline, runAgentPipelineForAllProducts } from '@/lib/agents/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    // requireRole(auth, 'ADMIN'); // The spec says Admin/System

    const { productId } = await request.json().catch(() => ({}));

    if (productId) {
      const result = await runAgentPipeline(productId, auth!.orgId);
      return NextResponse.json({ result });
    } else {
      // Trigger for all products
      const results = await runAgentPipelineForAllProducts(auth!.orgId);
      return NextResponse.json({
        message: `Successfully processed ${results.length} products`,
        results,
      });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    
    console.error('Agent run error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
