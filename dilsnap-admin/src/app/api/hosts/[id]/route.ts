import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const host = store.getHostById(id);
  if (!host) {
    return jsonResponse({ success: false, error: 'Host not found' }, 404);
  }
  return jsonResponse({ success: true, data: host });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updated = store.updateHost(id, body);
    if (!updated) {
      return jsonResponse({ success: false, error: 'Host not found' }, 404);
    }
    return jsonResponse({ success: true, message: 'Host updated', data: updated });
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const deleted = store.deleteHost(id);
  if (!deleted) {
    return jsonResponse({ success: false, error: 'Host not found' }, 404);
  }
  return jsonResponse({ success: true, message: 'Host deleted successfully' });
}
