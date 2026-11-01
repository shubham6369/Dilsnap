import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { jsonResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    await store.ensureInitialized();
    const rawBody = await req.json().catch(() => ({}));

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

    if (!orderId) {
      return jsonResponse({ success: false, error: 'orderId is required' }, 400);
    }

    // Verify payment status represents successful capture
    const isSuccess =
      paymentStatus.toUpperCase() === 'SUCCESS' ||
      paymentStatus.toUpperCase() === 'PAID' ||
      paymentStatus.toUpperCase() === 'COMPLETED';

    if (!isSuccess) {
      return jsonResponse(
        {
          success: false,
          error: `Payment webhook received non-success status: ${paymentStatus}`,
        },
        400
      );
    }

    const result = await store.processPaymentWebhook(orderId, paymentSessionId);
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
