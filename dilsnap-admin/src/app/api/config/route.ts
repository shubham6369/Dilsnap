import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  const config = store.getConfig();
  return jsonResponse({ success: true, data: config });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = store.updateConfig(body);
    return jsonResponse({ success: true, message: 'Configuration updated', data: updated });
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
  }
}
