import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  await store.ensureInitialized();
  const packages = store.getPackages();
  return jsonResponse({ success: true, count: packages.length, data: packages });
}

export async function POST(request: NextRequest) {
  try {
    await store.ensureInitialized();
    const body = await request.json();
    if (!body.name || !body.coins || !body.priceInr) {
      return jsonResponse({ success: false, error: 'name, coins, and priceInr are required' }, 400);
    }
    const pkg = await store.addPackage({
      name: body.name,
      coins: Number(body.coins),
      bonusCoins: Number(body.bonusCoins) || 0,
      priceInr: Number(body.priceInr),
      isPopular: Boolean(body.isPopular),
    });
    return jsonResponse({ success: true, message: 'Package added', data: pkg }, 201);
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
  }
}
