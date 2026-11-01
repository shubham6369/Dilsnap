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
    const userId = body.userId || body.phone;
    const packageId = body.packageId;

    if (!userId) {
      return jsonResponse({ success: false, error: 'userId or phone identifier is required' }, 400);
    }
    if (!packageId) {
      return jsonResponse({ success: false, error: 'packageId is required' }, 400);
    }

    const result = await store.createPaymentOrder(userId, packageId);
    if (!result.success) {
      return jsonResponse({ success: false, error: result.error }, 400);
    }

    return jsonResponse({
      success: true,
      message: 'Payment order created successfully',
      data: {
        order: result.order,
        orderId: result.order?.orderId,
        amountInr: result.order?.amountInr,
        coins: result.order?.coins,
        paymentSessionId: result.order?.paymentSessionId,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}
