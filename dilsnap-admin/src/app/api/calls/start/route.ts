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
    const userId = body.userId || body.phone;
    const hostId = body.hostId;
    const callType = body.callType === 'audio' ? 'audio' : 'video';

    if (!userId) {
      return jsonResponse({ success: false, error: 'userId or phone is required' }, 400);
    }
    if (!hostId) {
      return jsonResponse({ success: false, error: 'hostId is required' }, 400);
    }

    const result = await store.startCallSession(userId, hostId, callType);
    if (!result.success) {
      return jsonResponse(
        {
          success: false,
          error: result.error,
          requiredCoins: result.requiredCoins,
          currentBalance: result.currentBalance,
        },
        400
      );
    }

    return jsonResponse({
      success: true,
      message: 'Call session initiated',
      data: {
        session: result.session,
        sessionId: result.session?.id,
        ratePerMinute: result.ratePerMinute,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}
