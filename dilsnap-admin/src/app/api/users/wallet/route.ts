import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, action, reason } = body;

    if (!userId || amount === undefined) {
      return jsonResponse({ success: false, error: 'userId and amount are required' }, 400);
    }

    const delta = action === 'deduct' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
    const updated = store.adjustUserCoins(userId, delta);

    if (!updated) {
      return jsonResponse({ success: false, error: 'User not found' }, 404);
    }

    return jsonResponse({
      success: true,
      message: `Successfully ${action === 'deduct' ? 'deducted' : 'added'} ${Math.abs(delta)} coins`,
      data: {
        userId: updated.id,
        newBalance: updated.coinBalance,
        reason: reason || 'Admin wallet adjustment',
      },
    });
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON payload' }, 400);
  }
}
