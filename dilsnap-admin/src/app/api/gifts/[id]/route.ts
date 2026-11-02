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
  const gift = store.getGiftById(id);
  if (!gift) {
    return jsonResponse({ success: false, error: 'Gift not found' }, 404);
  }
  return jsonResponse({ success: true, data: gift, gift });
}

async function handleUpdate(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await store.ensureInitialized();
    const { id } = await context.params;
    const body = await request.json();
    const updated = await store.updateGift(id, body);
    if (!updated) {
      return jsonResponse({ success: false, error: 'Gift not found' }, 404);
    }
    return jsonResponse({
      success: true,
      message: 'Gift updated successfully',
      data: updated,
      gift: updated,
    });
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON payload' }, 400);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await store.ensureInitialized();
  const { id } = await context.params;
  const deleted = await store.deleteGift(id);
  if (!deleted) {
    return jsonResponse({ success: false, error: 'Gift not found' }, 404);
  }
  return jsonResponse({
    success: true,
    message: 'Gift deleted successfully',
    id,
  });
}
