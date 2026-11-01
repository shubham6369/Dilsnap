import assert from 'node:assert/strict';
import { POST as sendOtpPost } from '../src/app/api/auth/send-otp/route.ts';
import { POST as verifyOtpPost } from '../src/app/api/auth/verify-otp/route.ts';
import { GET as profileGet, POST as profilePost } from '../src/app/api/user/profile/route.ts';
import { GET as walletBalanceGet } from '../src/app/api/wallet/balance/route.ts';
import { POST as walletDeductPost } from '../src/app/api/wallet/deduct/route.ts';
import { POST as walletCreditPost } from '../src/app/api/wallet/credit/route.ts';
import { POST as callStartPost } from '../src/app/api/calls/start/route.ts';
import { POST as callPulsePost } from '../src/app/api/calls/pulse/route.ts';
import { POST as callEndPost } from '../src/app/api/calls/end/route.ts';
import { POST as paymentOrderPost } from '../src/app/api/payments/create-order/route.ts';
import { POST as paymentWebhookPost } from '../src/app/api/payments/webhook/route.ts';

function createMockRequest(url, method = 'GET', body = null) {
  const reqUrl = new URL(url, 'http://localhost:3000');
  return {
    url: reqUrl.toString(),
    nextUrl: reqUrl,
    method,
    headers: new Headers(),
    json: async () => body || {},
  };
}

async function testHttpEndpoints() {
  console.log('--- Testing Next.js Route Handlers Directly ---');

  // 1. Send OTP Route
  const sendReq = createMockRequest('http://localhost:3000/api/auth/send-otp', 'POST', {
    phone: '+91 91234 56789',
  });
  const sendRes = await sendOtpPost(sendReq);
  const sendData = await sendRes.json();
  assert.equal(sendRes.status, 200);
  assert.equal(sendData.success, true);
  console.log('✓ /api/auth/send-otp route returned 200 OK');

  // 2. Verify OTP Route
  const verifyReq = createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', {
    phone: '+91 91234 56789',
    otp: '1234',
  });
  const verifyRes = await verifyOtpPost(verifyReq);
  const verifyData = await verifyRes.json();
  assert.equal(verifyRes.status, 200);
  assert.equal(verifyData.success, true);
  const user = verifyData.data.user;
  assert.ok(user.id);
  console.log('✓ /api/auth/verify-otp route returned 200 OK (User: ' + user.id + ')');

  // 3. User Profile Route
  const profPostReq = createMockRequest('http://localhost:3000/api/user/profile', 'POST', {
    userId: user.id,
    name: 'DilSnap Super Star',
    gender: 'Female',
  });
  const profPostRes = await profilePost(profPostReq);
  const profPostData = await profPostRes.json();
  assert.equal(profPostRes.status, 200);
  assert.equal(profPostData.data.name, 'DilSnap Super Star');
  console.log('✓ /api/user/profile POST returned 200 OK');

  const profGetReq = createMockRequest(`http://localhost:3000/api/user/profile?userId=${user.id}`);
  const profGetRes = await profileGet(profGetReq);
  const profGetData = await profGetRes.json();
  assert.equal(profGetRes.status, 200);
  assert.equal(profGetData.data.name, 'DilSnap Super Star');
  console.log('✓ /api/user/profile GET returned 200 OK');

  // 4. Wallet Balance Route
  const balReq = createMockRequest(`http://localhost:3000/api/wallet/balance?userId=${user.id}`);
  const balRes = await walletBalanceGet(balReq);
  const balData = await balRes.json();
  assert.equal(balRes.status, 200);
  assert.equal(balData.data.coins, 120);
  console.log('✓ /api/wallet/balance GET returned 200 OK (Coins: ' + balData.data.coins + ')');

  // 5. Wallet Credit Route
  const credReq = createMockRequest('http://localhost:3000/api/wallet/credit', 'POST', {
    userId: user.id,
    amount: 100,
    reason: 'Festive bonus credit',
  });
  const credRes = await walletCreditPost(credReq);
  const credData = await credRes.json();
  assert.equal(credRes.status, 200);
  assert.equal(credData.data.newBalance, 220);
  console.log('✓ /api/wallet/credit POST returned 200 OK');

  // 6. Wallet Deduct Route
  const dedReq = createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
    userId: user.id,
    amount: 50,
    reason: 'Audio Call minute rate',
  });
  const dedRes = await walletDeductPost(dedReq);
  const dedData = await dedRes.json();
  assert.equal(dedRes.status, 200);
  assert.equal(dedData.data.newBalance, 170);
  console.log('✓ /api/wallet/deduct POST returned 200 OK');

  // Over-deduct check
  const overReq = createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
    userId: user.id,
    amount: 500,
    reason: 'Invalid excessive deduct',
  });
  const overRes = await walletDeductPost(overReq);
  assert.equal(overRes.status, 400);
  console.log('✓ /api/wallet/deduct rejected overdraft with 400 Bad Request');

  // Fractional amount check
  const fracReq = createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
    userId: user.id,
    amount: 15.75,
    reason: 'Invalid fractional amount',
  });
  const fracRes = await walletDeductPost(fracReq);
  assert.equal(fracRes.status, 400);
  console.log('✓ /api/wallet/deduct rejected fractional coin amount with 400 Bad Request');

  // 7. Call Session Routes (Start, Pulse, End)
  const callStartReq = createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
    userId: user.id,
    hostId: 'lst_101',
    callType: 'video',
  });
  const callStartRes = await callStartPost(callStartReq);
  const callStartData = await callStartRes.json();
  assert.equal(callStartRes.status, 200);
  const sessionId = callStartData.data.sessionId;
  console.log('✓ /api/calls/start POST returned 200 OK (Session: ' + sessionId + ')');

  const callPulseReq = createMockRequest('http://localhost:3000/api/calls/pulse', 'POST', {
    sessionId,
  });
  const callPulseRes = await callPulsePost(callPulseReq);
  const callPulseData = await callPulseRes.json();
  assert.equal(callPulseRes.status, 200);
  console.log('✓ /api/calls/pulse POST returned 200 OK');

  const callEndReq = createMockRequest('http://localhost:3000/api/calls/end', 'POST', {
    sessionId,
    durationSeconds: 90,
  });
  const callEndRes = await callEndPost(callEndReq);
  const callEndData = await callEndRes.json();
  assert.equal(callEndRes.status, 200);
  assert.equal(callEndData.data.session.status, 'completed');
  assert.equal(callEndData.data.session.durationSeconds, 90);
  console.log('✓ /api/calls/end POST returned 200 OK with recorded duration');

  // 8. Payment Order & Webhook Routes
  const orderReq = createMockRequest('http://localhost:3000/api/payments/create-order', 'POST', {
    userId: user.id,
    packageId: 'pkg_starter',
  });
  const orderRes = await paymentOrderPost(orderReq);
  const orderData = await orderRes.json();
  assert.equal(orderRes.status, 200);
  const orderId = orderData.data.orderId;
  console.log('✓ /api/payments/create-order POST returned 200 OK (OrderId: ' + orderId + ')');

  const webhookReq = createMockRequest('http://localhost:3000/api/payments/webhook', 'POST', {
    orderId,
    status: 'PAID',
    paymentSessionId: 'cf_trans_00192',
  });
  const webhookRes = await paymentWebhookPost(webhookReq);
  const webhookData = await webhookRes.json();
  assert.equal(webhookRes.status, 200);
  assert.equal(webhookData.data.order.status, 'paid');
  console.log('✓ /api/payments/webhook POST returned 200 OK');

  console.log('\n========================================');
  console.log('ALL ROUTE HANDLER TESTS PASSED 100%!');
  console.log('========================================');
}

testHttpEndpoints().catch((err) => {
  console.error('Route handler tests failed:', err);
  process.exit(1);
});
