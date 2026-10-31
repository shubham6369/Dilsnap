import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  await store.ensureInitialized();
  const { searchParams } = new URL(request.url);
  const gender = searchParams.get('gender') || undefined;
  const onlineOnly = searchParams.get('online') === 'true';

  const hosts = store.getHosts({ gender, onlineOnly });
  return jsonResponse({ success: true, count: hosts.length, data: hosts });
}

export async function POST(request: NextRequest) {
  try {
    await store.ensureInitialized();
    const body = await request.json();
    if (!body.name || !body.avatarUrl) {
      return jsonResponse({ success: false, error: 'Name and avatarUrl are required' }, 400);
    }

    const host = await store.addHost({
      name: body.name,
      age: Number(body.age) || 22,
      gender: body.gender || 'Female',
      avatarUrl: body.avatarUrl,
      languages: Array.isArray(body.languages) ? body.languages : (body.languages || 'Hindi, English').split(',').map((s: string) => s.trim()),
      interests: Array.isArray(body.interests) ? body.interests : (body.interests || 'Music, Talk').split(',').map((s: string) => s.trim()),
      bio: body.bio || 'Verified listener on DilSnap',
      coinRatePerMinute: Number(body.coinRatePerMinute) || 30,
      isOnline: body.isOnline !== undefined ? Boolean(body.isOnline) : true,
    });

    return jsonResponse({ success: true, message: 'Host added successfully', data: host }, 201);
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON payload' }, 400);
  }
}
