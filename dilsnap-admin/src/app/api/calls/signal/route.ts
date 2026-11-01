import { NextRequest } from 'next/server';
import { jsonResponse, corsHeaders } from '@/lib/cors';

// Transient in-memory signal store for WebRTC SDP / ICE exchange
interface SignalMessage {
  sessionId: string;
  senderId: string;
  targetId: string;
  type: 'offer' | 'answer' | 'candidate';
  payload: unknown;
  timestamp: number;
}

const signalQueue = new Map<string, SignalMessage[]>();

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');
  const targetId = searchParams.get('peerId') || searchParams.get('targetId');

  if (!sessionId) {
    return jsonResponse({ success: false, error: 'sessionId is required' }, 400);
  }

  const messages = signalQueue.get(sessionId) || [];
  // Filter messages intended for this peer
  const forPeer = targetId ? messages.filter((m) => m.targetId === targetId) : messages;

  // Clear delivered messages
  if (targetId && forPeer.length > 0) {
    const remaining = messages.filter((m) => m.targetId !== targetId);
    signalQueue.set(sessionId, remaining);
  }

  return jsonResponse({
    success: true,
    data: forPeer,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, senderId, targetId, type, payload } = body;

    if (!sessionId || !type || !payload) {
      return jsonResponse({ success: false, error: 'sessionId, type and payload are required' }, 400);
    }

    const message: SignalMessage = {
      sessionId,
      senderId: senderId || 'caller',
      targetId: targetId || 'peer',
      type,
      payload,
      timestamp: Date.now(),
    };

    const current = signalQueue.get(sessionId) || [];
    current.push(message);

    // Limit queue size to last 50 signals
    if (current.length > 50) current.splice(0, current.length - 50);
    signalQueue.set(sessionId, current);

    return jsonResponse({
      success: true,
      message: 'Signal queued successfully',
      data: message,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}
