import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    await store.ensureInitialized();
    const body = await request.json();
    const { userId, amount, action, reason } = body;

    const rawAmount = Number(amount);
    if (
      !userId ||
      typeof userId !== 'string' ||
      !userId.trim() ||
      amount === undefined ||
      amount === null ||
      typeof amount === 'boolean' ||
      isNaN(rawAmount) ||
      !Number.isInteger(rawAmount) ||
      rawAmount <= 0
    ) {
      return jsonResponse({ success: false, error: 'userId and a positive whole integer amount are required' }, 400);
    }

    if (action !== undefined && action !== 'credit' && action !== 'deduct') {
      return jsonResponse({ success: false, error: "action must be either 'credit' or 'deduct'" }, 400);
    }

    const delta = action === 'deduct' ? -rawAmount : rawAmount;
    const updated = await store.adjustUserCoins(userId.trim(), delta);

    if (!updated) {
      return jsonResponse({ success: false, error: 'User not found' }, 404);
    }

    return jsonResponse({
      success: true,
      message: `Successfully ${action === 'deduct' ? 'deducted' : 'added'} ${rawAmount} coins`,
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
