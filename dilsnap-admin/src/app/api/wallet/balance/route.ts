import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    await store.ensureInitialized();
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId') || searchParams.get('id');
    const phone = searchParams.get('phone') || searchParams.get('mobile');

    const idOrPhone = userId || phone;
    if (!idOrPhone) {
      return jsonResponse({ success: false, error: 'userId or phone query parameter is required' }, 400);
    }

    const user = store.findUser(idOrPhone);
    if (!user) {
      return jsonResponse({ success: false, error: 'User not found' }, 404);
    }

    const transactions = store.getTransactions(user.id);

    return jsonResponse({
      success: true,
      data: {
        userId: user.id,
        phone: user.phone,
        coinBalance: user.coins,
        coins: user.coins,
        transactions: transactions.slice(0, 20),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}
