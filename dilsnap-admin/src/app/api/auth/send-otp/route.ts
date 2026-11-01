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

    if (!rawPhone || rawPhone.length < 8) {
      return jsonResponse(
        {
          success: false,
          error: 'Please provide a valid phone number (minimum 10 digits)',
        },
        400
      );
    }

    const result = await store.sendOtp(rawPhone);
    if (!result.success) {
      return jsonResponse(
        {
          success: false,
          error: result.message,
        },
        400
      );
    }

    return jsonResponse({
      success: true,
      message: result.message,
      data: {
        phone: result.phone,
        otp: result.otp, // Demo OTP returned for development & test automation
        expiresInSeconds: 300,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}
