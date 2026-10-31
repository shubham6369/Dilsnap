import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  await store.ensureInitialized();
  const analytics = store.getAnalytics();
  return jsonResponse({ success: true, data: analytics });
}
