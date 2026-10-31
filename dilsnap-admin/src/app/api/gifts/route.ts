import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  const gifts = store.getGifts();
  return jsonResponse({ success: true, count: gifts.length, data: gifts });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.coinCost) {
      return jsonResponse({ success: false, error: 'name and coinCost are required' }, 400);
    }
    const gift = store.addGift({
      name: body.name,
      coinCost: Number(body.coinCost),
      assetPath: body.assetPath || 'assets/image/diamond.png',
      category: body.category || 'Popular',
    });
    return jsonResponse({ success: true, message: 'Gift added', data: gift }, 201);
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
  }
}
