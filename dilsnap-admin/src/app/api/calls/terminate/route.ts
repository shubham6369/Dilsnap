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
    const { callId } = body;
    if (!callId) {
      return jsonResponse({ success: false, error: 'callId is required' }, 400);
    }

    const terminated = await store.terminateCall(callId);
    if (!terminated) {
      return jsonResponse({ success: false, error: 'Active call not found' }, 404);
    }

    return jsonResponse({
      success: true,
      message: 'Call terminated immediately by Admin',
      data: terminated,
    });
  } catch {
    return jsonResponse({ success: false, error: 'Invalid payload' }, 400);
  }
}
