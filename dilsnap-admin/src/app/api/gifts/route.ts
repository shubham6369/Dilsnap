import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  await store.ensureInitialized();
  const gifts = store.getGifts();
  return jsonResponse({ success: true, count: gifts.length, data: gifts });
}

export async function POST(request: NextRequest) {
  try {
    await store.ensureInitialized();
    const body = await request.json();
    if (!body.name || !body.coinCost || !body.assetPath) {
      return jsonResponse({ success: false, error: 'name, coinCost, and assetPath are required' }, 400);
    }
    const gift = await store.addGift({
      name: body.name,
      coinCost: Number(body.coinCost),
      assetPath: body.assetPath,
      category: body.category || 'Popular',
    });
    return jsonResponse({ success: true, message: 'Gift added', data: gift }, 201);
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
  }
}
