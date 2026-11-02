import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    await store.ensureInitialized();
    const rawBody = await req.json().catch(() => null);

    if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
      return jsonResponse({ success: false, error: 'Invalid webhook payload structure' }, 400);
    }

    // HMAC signature verification (strictly enforced in production)
    const isProduction = process.env.NODE_ENV === 'production';
    const webhookSecret = process.env.CASHFREE_SECRET_KEY;
    const signature = req.headers.get('x-webhook-signature') || req.headers.get('x-cashfree-signature');

    if (isProduction && !webhookSecret) {
      console.error('[Webhook] CASHFREE_SECRET_KEY is missing in production environment');
      return jsonResponse({ success: false, error: 'Webhook secret not configured' }, 500);
    }

    if (webhookSecret || signature) {
      if (!signature) {
        return jsonResponse({ success: false, error: 'Missing webhook signature header' }, 401);
      }

      const expectedSig = crypto
        .createHmac('sha256', webhookSecret || '')
        .update(JSON.stringify(rawBody))
        .digest('base64');

      const isSandboxAllowed = !isProduction && signature === 'sandbox_test_signature';

      let signaturesMatch = false;
      try {
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSig);
        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
          signaturesMatch = true;
        }
      } catch {
        signaturesMatch = false;
      }

      if (!signaturesMatch && !isSandboxAllowed) {
        return jsonResponse({ success: false, error: 'Invalid webhook signature' }, 401);
      }
    }

    // Support both direct DilSnap order schema and Cashfree webhook payload
    const orderId =
      rawBody.orderId ||
      rawBody.order_id ||
      rawBody.data?.order?.order_id ||
      rawBody.data?.order_id;

    const paymentSessionId =
      rawBody.paymentSessionId ||
      rawBody.payment_session_id ||
      rawBody.data?.payment?.cf_payment_id ||
      rawBody.data?.payment_session_id;

    const paymentStatus =
      rawBody.status ||
      rawBody.order_status ||
      rawBody.data?.order?.order_status ||
      rawBody.data?.payment?.payment_status ||
      'SUCCESS';

    if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
      return jsonResponse({ success: false, error: 'orderId is required' }, 400);
    }

    // Verify payment status represents successful capture
    const statusStr = String(paymentStatus || '').toUpperCase();
    const isSuccess =
      statusStr === 'SUCCESS' ||
      statusStr === 'PAID' ||
      statusStr === 'COMPLETED';

    if (!isSuccess) {
      return jsonResponse(
        {
          success: false,
          error: `Payment webhook received non-success status: ${paymentStatus}`,
        },
        400
      );
    }

    const result = await store.processPaymentWebhook(orderId.trim(), paymentSessionId);
    if (!result.success) {
      return jsonResponse({ success: false, error: result.error }, 400);
    }

    return jsonResponse({
      success: true,
      message: 'Payment verified and coins credited',
      data: {
        order: result.order,
        newBalance: result.newBalance,
        coinBalance: result.newBalance,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}
