import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    await store.ensureInitialized();
    const body = await req.json().catch(() => ({}));
    const rawPhone = String(body.phone || body.mobile || body.phoneNumber || '').trim();
    const rawOtp = String(body.otp !== undefined ? body.otp : (body.code !== undefined ? body.code : '')).trim();

    if (!rawPhone) {
      return jsonResponse({ success: false, error: 'Phone number is required' }, 400);
    }
    if (!rawOtp) {
      return jsonResponse({ success: false, error: 'OTP is required' }, 400);
    }

    const result = await store.verifyOtp(rawPhone, rawOtp);
    if (!result.success || !result.user) {
      return jsonResponse({ success: false, error: result.error || 'Invalid or expired OTP' }, 400);
    }

    return jsonResponse({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}
