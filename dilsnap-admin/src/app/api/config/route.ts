import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  await store.ensureInitialized();
  const config = store.getConfig();
  return jsonResponse({ success: true, data: config, config });
}

export async function POST(request: NextRequest) {
  try {
    await store.ensureInitialized();
    const body = await request.json();
    const updated = await store.updateConfig(body);
    return jsonResponse({ success: true, message: 'Configuration updated', data: updated, config: updated });
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await store.ensureInitialized();
    const body = await request.json();
    const updated = await store.updateConfig(body);
    return jsonResponse({ success: true, message: 'Configuration updated', data: updated, config: updated });
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
  }
}
