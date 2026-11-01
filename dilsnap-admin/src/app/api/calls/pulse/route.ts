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
    const sessionId = body.sessionId || body.callId;

    if (!sessionId) {
      return jsonResponse({ success: false, error: 'sessionId is required' }, 400);
    }

    const result = await store.pulseCallSession(sessionId);
    if (!result.success) {
      return jsonResponse(
        {
          success: false,
          error: result.error,
          status: result.status,
          remainingCoins: result.remainingCoins,
        },
        result.status === 'insufficient_coins' ? 402 : 400
      );
    }

    return jsonResponse({
      success: true,
      message: 'Call pulse processed and coins debited',
      data: {
        session: result.session,
        remainingCoins: result.remainingCoins,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}
