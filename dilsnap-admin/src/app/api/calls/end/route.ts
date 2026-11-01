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
    const durationSeconds = typeof body.durationSeconds === 'number' ? body.durationSeconds : undefined;
    const coinsDeducted = typeof body.coinsDeducted === 'number' ? body.coinsDeducted : undefined;

    if (!sessionId) {
      return jsonResponse({ success: false, error: 'sessionId is required' }, 400);
    }

    const result = await store.endCallSession(sessionId, { durationSeconds, coinsDeducted });
    if (!result.success || !result.session) {
      return jsonResponse({ success: false, error: 'Failed to end call session or session not found' }, 400);
    }

    return jsonResponse({
      success: true,
      message: 'Call session ended successfully',
      data: {
        session: result.session,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}
