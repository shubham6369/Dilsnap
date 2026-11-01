import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    await store.ensureInitialized();
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId') || searchParams.get('id');
    const phone = searchParams.get('phone') || searchParams.get('mobile');

    let user = userId ? store.getUserById(userId) : undefined;
    if (!user && phone) {
      user = store.getUserByPhone(phone);
    }

    // Fallback: check Authorization Bearer token
    if (!user) {
      const authHeader = req.headers.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim();
        user = store.getUsers().find((u) => u.token === token);
      }
    }

    if (!user) {
      return jsonResponse({ success: false, error: 'User profile not found' }, 404);
    }

    return jsonResponse({
      success: true,
      data: user,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}

async function handleProfileUpdate(req: NextRequest) {
  try {
    await store.ensureInitialized();
    const body = await req.json().catch(() => ({}));
    const idOrPhone = body.userId || body.id || body.phone || body.mobile;

    if (!idOrPhone) {
      return jsonResponse({ success: false, error: 'userId or phone identifier is required' }, 400);
    }

    const updatedUser = await store.updateUserProfile(idOrPhone, {
      name: body.name,
      gender: body.gender,
      avatarUrl: body.avatarUrl || body.avatar,
      phone: body.phone,
    });

    if (!updatedUser) {
      return jsonResponse({ success: false, error: 'User not found' }, 404);
    }

    return jsonResponse({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}

export async function POST(req: NextRequest) {
  return handleProfileUpdate(req);
}

export async function PATCH(req: NextRequest) {
  return handleProfileUpdate(req);
}
