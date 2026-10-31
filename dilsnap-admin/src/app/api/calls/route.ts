import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  await store.ensureInitialized();
  const active = store.getActiveCalls();
  const history = store.getCallHistory();
  return jsonResponse({
    success: true,
    data: {
      activeCalls: active,
      recentHistory: history,
      activeCount: active.length,
    },
  });
}
