import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    await store.ensureInitialized();
    const body = await req.json().catch(() => ({}));
    const idOrPhone = body.userId || body.id || body.phone || body.mobile;
    const rawAmount = Number(body.amount);
    const reason = body.reason || 'Wallet coin credit';

    if (!idOrPhone || typeof idOrPhone !== 'string' || !idOrPhone.trim()) {
      return jsonResponse({ success: false, error: 'userId or phone identifier is required' }, 400);
    }
    if (
      body.amount === undefined ||
      body.amount === null ||
      typeof body.amount === 'boolean' ||
      isNaN(rawAmount) ||
      !Number.isInteger(rawAmount) ||
      rawAmount <= 0
    ) {
      return jsonResponse({ success: false, error: 'Amount must be a positive whole integer' }, 400);
    }

    const result = await store.creditWallet(idOrPhone.trim(), rawAmount, reason);
    if (!result.success) {
      return jsonResponse({ success: false, error: result.error }, 400);
    }

    return jsonResponse({
      success: true,
      message: 'Coins credited successfully',
      data: {
        newBalance: result.newBalance,
        coinBalance: result.newBalance,
        transaction: result.transaction,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}
