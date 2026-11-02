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
  await store.ensureInitialized();
  const { id } = await context.params;
  const user = store.getUserById(id);
  if (!user) {
    return jsonResponse({ success: false, error: 'User not found' }, 404);
  }
  return jsonResponse({ success: true, data: user, user });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await store.ensureInitialized();
    const { id } = await context.params;
    const body = await request.json();

    let updated;
    if (body.action === 'toggleBan') {
      updated = await store.toggleUserBan(id);
    } else {
      updated = await store.updateUser(id, body);
    }

    if (!updated) {
      return jsonResponse({ success: false, error: 'User not found' }, 404);
    }

    return jsonResponse({
      success: true,
      message: 'User updated successfully',
      data: updated,
      user: updated,
    });
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON payload' }, 400);
  }
}
