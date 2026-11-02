import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const adminDir = path.resolve(__dirname, '..');

// Self-spawning shim: If invoked via raw node without tsx module hooks, delegate to npx tsx
if (!process.env.DILSNAP_RUNNING_TSX && !process.env.TSX_TSCONFIG_PATH) {
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawnSync(
    npxCmd,
    ['tsx', '--tsconfig', path.join(adminDir, 'tsconfig.json'), __filename, ...process.argv.slice(2)],
    {
      cwd: adminDir,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        DILSNAP_RUNNING_TSX: '1',
      },
    }
  );
  process.exit(child.status ?? (child.error ? 1 : 0));
}

const assert = (await import('node:assert/strict')).default;
const { store, normalizePhone } = await import('../src/lib/store.ts');

async function runTests() {
  console.log('--- Starting DilSnap Backend Integration Tests ---');

  // Initialize store
  await store.ensureInitialized();
  console.log('✓ Store initialized');

  // Test 1: Phone normalization
  assert.equal(normalizePhone('+91 98765 43210'), '+919876543210');
  assert.equal(normalizePhone('9876543210'), '+919876543210');
  console.log('✓ Test 1: Phone normalization passed');

  // Test 2: Auth Send OTP
  const sendRes = await store.sendOtp('+91 99999 88888');
  assert.equal(sendRes.success, true);
  assert.equal(sendRes.otp, '1234');
  console.log('✓ Test 2: Send OTP passed');

  // Test 3: Auth Verify OTP & Auto-provisioning
  const verifyRes = await store.verifyOtp('+91 99999 88888', '1234');
  assert.equal(verifyRes.success, true);
  assert.ok(verifyRes.user);
  assert.equal(verifyRes.user.phone, '+919999988888');
  assert.equal(verifyRes.user.coins, 120); // Received welcome bonus
  assert.ok(verifyRes.token.startsWith('tok_'));
  const testUserId = verifyRes.user.id;
  console.log('✓ Test 3: Verify OTP & User Provisioning passed (User ID: ' + testUserId + ')');

  // Test 4: Profile Update
  const updateRes = await store.updateUserProfile(testUserId, {
    name: 'Aakash Verma',
    gender: 'Male',
  });
  assert.equal(updateRes?.name, 'Aakash Verma');
  assert.equal(updateRes?.gender, 'Male');
  console.log('✓ Test 4: User Profile Update passed');

  // Test 5: Wallet Balance Query
  const balance = await store.getWalletBalance(testUserId);
  assert.equal(balance, 120);
  console.log('✓ Test 5: Wallet Balance Query passed (Balance: ' + balance + ')');

  // Test 6: Atomic Coin Deduction
  const deductRes = await store.deductWallet(testUserId, 40, 'Test Video Call pulse');
  assert.equal(deductRes.success, true);
  assert.equal(deductRes.newBalance, 80);
  assert.equal(await store.getWalletBalance(testUserId), 80);
  console.log('✓ Test 6: Atomic Deduction passed (New Balance: 80)');

  // Test 7: Double-Spending / Negative Balance Prevention
  const overDeductRes = await store.deductWallet(testUserId, 200, 'Attempt Over-deduction');
  assert.equal(overDeductRes.success, false);
  assert.equal(overDeductRes.newBalance, 80);
  assert.equal(await store.getWalletBalance(testUserId), 80);
  console.log('✓ Test 7: Over-deduction prevention verified (Balance safely maintained at 80)');

  // Test 8: Atomic Coin Credit
  const creditRes = await store.creditWallet(testUserId, 50, 'Promotional Reward');
  assert.equal(creditRes.success, true);
  assert.equal(creditRes.newBalance, 130);
  assert.equal(await store.getWalletBalance(testUserId), 130);
  console.log('✓ Test 8: Atomic Credit passed (New Balance: 130)');

  // Test 9: Call Session Lifecycle (Start -> Pulse -> End)
  const host = store.getHosts()[0];
  assert.ok(host, 'Pre-seeded host must exist');

  const startRes = await store.startCallSession(testUserId, host.id, 'video');
  assert.equal(startRes.success, true);
  assert.ok(startRes.session);
  const sessionId = startRes.session.id;
  assert.equal(startRes.session.status, 'active');
  console.log('✓ Test 9a: Call Session Started (Session ID: ' + sessionId + ')');

  // Pulse call session (deducts 1 minute rate)
  const pulseRes = await store.pulseCallSession(sessionId);
  assert.equal(pulseRes.success, true);
  assert.equal(pulseRes.session?.durationSeconds, 60);
  assert.equal(pulseRes.session?.coinsDeducted, host.coinRatePerMinute);
  console.log('✓ Test 9b: Call Pulse passed (Duration: 60s, Coins Burned: ' + host.coinRatePerMinute + ')');

  // End call session with recorded duration
  const endRes = await store.endCallSession(sessionId, { durationSeconds: 75, coinsDeducted: host.coinRatePerMinute });
  assert.equal(endRes.success, true);
  assert.equal(endRes.session?.status, 'completed');
  assert.equal(endRes.session?.durationSeconds, 75);
  assert.ok(endRes.session?.endTime);
  console.log('✓ Test 9c: Call Session Ended cleanly with verified duration (75s)');

  // Test 10: Payment Order & Webhook Fulfillment
  const pkg = store.getPackages()[0];
  const orderRes = await store.createPaymentOrder(testUserId, pkg.id);
  assert.equal(orderRes.success, true);
  assert.ok(orderRes.order);
  const orderId = orderRes.order.orderId;
  const balanceBeforePayment = await store.getWalletBalance(testUserId);
  console.log('✓ Test 10a: Payment Order Created (Order ID: ' + orderId + ')');

  // Webhook capture
  const webhookRes = await store.processPaymentWebhook(orderId, 'cf_pay_99210');
  assert.equal(webhookRes.success, true);
  assert.equal(webhookRes.order?.status, 'paid');
  const expectedNewBalance = balanceBeforePayment + pkg.coins + (pkg.bonusCoins || 0);
  assert.equal(webhookRes.newBalance, expectedNewBalance);
  console.log('✓ Test 10b: Webhook processed and coins credited (New Balance: ' + webhookRes.newBalance + ')');

  console.log('\n========================================');
  console.log('ALL BACKEND INTEGRATION TESTS PASSED 100%!');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
