/**
 * DilSnap End-to-End Opaque-Box Test Suite
 * 
 * Verifies all backend and admin API endpoints across 4 progressive tiers:
 * Tier 1: Feature Coverage (>=5 test cases per feature across auth, hosts, packages, gifts, calls, wallet, payments, user, config)
 * Tier 2: Boundary & Corner Cases (empty bodies, invalid types, zero/negative amounts, missing auth, unknown IDs, overdrafts)
 * Tier 3: Cross-Feature Combinations (wallet balance -> package credit -> gift transfer -> call deduction -> auto termination)
 * Tier 4: Real-World Application Scenarios (complete user journey, host lifecycle, admin emergency moderation)
 */

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

// Dynamic imports executed under tsx runtime
const assert = (await import('node:assert/strict')).default;
const { store, normalizePhone } = await import('../src/lib/store.ts');

// 1. Auth routes
const { POST: authSendOtpPost } = await import('../src/app/api/auth/send-otp/route.ts');
const { POST: authVerifyOtpPost } = await import('../src/app/api/auth/verify-otp/route.ts');

// 2. Hosts routes
const { GET: hostsGet, POST: hostsPost } = await import('../src/app/api/hosts/route.ts');
const { GET: hostGet, PATCH: hostPatch, DELETE: hostDelete } = await import('../src/app/api/hosts/[id]/route.ts');

// 3. Packages routes
const { GET: packagesGet, POST: packagesPost } = await import('../src/app/api/packages/route.ts');

// 4. Gifts routes
const { GET: giftsGet, POST: giftsPost } = await import('../src/app/api/gifts/route.ts');

// 5. Calls routes
const { GET: callsGet } = await import('../src/app/api/calls/route.ts');
const { POST: callStartPost } = await import('../src/app/api/calls/start/route.ts');
const { POST: callPulsePost } = await import('../src/app/api/calls/pulse/route.ts');
const { POST: callEndPost } = await import('../src/app/api/calls/end/route.ts');
const { POST: callTerminatePost } = await import('../src/app/api/calls/terminate/route.ts');
const { GET: callSignalGet, POST: callSignalPost } = await import('../src/app/api/calls/signal/route.ts');

// 6. Wallet routes
const { GET: walletBalanceGet } = await import('../src/app/api/wallet/balance/route.ts');
const { POST: walletCreditPost } = await import('../src/app/api/wallet/credit/route.ts');
const { POST: walletDeductPost } = await import('../src/app/api/wallet/deduct/route.ts');
const { POST: adminWalletPost } = await import('../src/app/api/users/wallet/route.ts');

// 7. Payments routes
const { POST: paymentOrderPost } = await import('../src/app/api/payments/create-order/route.ts');
const { POST: paymentWebhookPost } = await import('../src/app/api/payments/webhook/route.ts');

// 8. User routes
const { GET: userProfileGet, POST: userProfilePost, PATCH: userProfilePatch } = await import('../src/app/api/user/profile/route.ts');
const { GET: usersGet } = await import('../src/app/api/users/route.ts');

// 9. Config & Analytics routes
const { GET: configGet, PATCH: configPatch } = await import('../src/app/api/config/route.ts');
const { GET: analyticsGet } = await import('../src/app/api/analytics/route.ts');

// Helper: Mock NextRequest implementation adhering to Web API standards
function createMockRequest(url, method = 'GET', body = null, headers = {}) {
  const reqUrl = new URL(url, 'http://localhost:3000');
  const reqHeaders = new Headers(headers);
  return {
    url: reqUrl.toString(),
    nextUrl: reqUrl,
    method,
    headers: reqHeaders,
    json: async () => (body !== null ? body : {}),
  };
}

// Test metrics tracker
const metrics = {
  assertions: 0,
  tier1Count: 0,
  tier2Count: 0,
  tier3Count: 0,
  tier4Count: 0,
  totalPassed: 0,
  totalFailed: 0,
};

function check(condition, message) {
  metrics.assertions++;
  assert.ok(condition, message);
}

function checkEqual(actual, expected, message) {
  metrics.assertions++;
  assert.equal(actual, expected, message);
}

// Dynamic ID helper to keep test runs isolated
const testRunId = Date.now().toString().slice(-6);

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log('   DILSNAP PRODUCTION E2E OPAQUE-BOX TEST SUITE');
  console.log('===============================================================\n');

  await store.ensureInitialized();
  check(true, 'Store initialized successfully');

  // =================================================================
  // TIER 1: FEATURE COVERAGE (>=5 tests per feature across 9 features)
  // =================================================================
  console.log('>>> [TIER 1] FEATURE COVERAGE TESTS');

  // --- Feature 1: Auth (5+ tests) ---
  console.log('\n  [1. Auth Feature]');
  {
    // Test 1.1: Send OTP with standard Indian format
    const phone1 = `+91 98001 ${testRunId}`;
    const req1 = createMockRequest('http://localhost:3000/api/auth/send-otp', 'POST', { phone: phone1 });
    const res1 = await authSendOtpPost(req1);
    const data1 = await res1.json();
    checkEqual(res1.status, 200, 'send-otp standard format status 200');
    checkEqual(data1.success, true, 'send-otp success flag true');
    check(data1.data.otp === '1234', 'send-otp returns demo OTP');
    metrics.tier1Count++;
    console.log('    ✓ 1.1: Send OTP with standard Indian format');

    // Test 1.2: Send OTP with 10-digit raw number (normalized to +91)
    const phone2 = `9800${testRunId}`;
    const req2 = createMockRequest('http://localhost:3000/api/auth/send-otp', 'POST', { phone: phone2 });
    const res2 = await authSendOtpPost(req2);
    const data2 = await res2.json();
    checkEqual(res2.status, 200, 'send-otp 10-digit status 200');
    checkEqual(data2.data.phone, `+91${phone2}`, 'send-otp normalizes 10-digit number');
    metrics.tier1Count++;
    console.log('    ✓ 1.2: Send OTP with 10-digit number normalization');

    // Test 1.3: Verify OTP - auto provisions new user with welcome coins & token
    const req3 = createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: phone1, otp: '1234' });
    const res3 = await authVerifyOtpPost(req3);
    const data3 = await res3.json();
    checkEqual(res3.status, 200, 'verify-otp status 200');
    checkEqual(data3.success, true, 'verify-otp success flag true');
    check(Boolean(data3.data.user.id), 'verify-otp created user has id');
    checkEqual(data3.data.user.coins, 120, 'verify-otp user receives 120 welcome coins');
    check(data3.data.token.startsWith('tok_'), 'verify-otp generates valid session token');
    metrics.tier1Count++;
    console.log('    ✓ 1.3: Verify OTP auto-provisions user with welcome bonus & token');

    // Test 1.4: Verify OTP login idempotency for existing user
    const req4 = createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: phone1, otp: '1234' });
    const res4 = await authVerifyOtpPost(req4);
    const data4 = await res4.json();
    checkEqual(res4.status, 200, 'verify-otp repeated status 200');
    checkEqual(data4.data.user.id, data3.data.user.id, 'verify-otp preserves existing user ID');
    metrics.tier1Count++;
    console.log('    ✓ 1.4: Verify OTP existing user login idempotency');

    // Test 1.5: Verify session token authentication on protected profile route
    const req5 = createMockRequest('http://localhost:3000/api/user/profile', 'GET', null, {
      authorization: `Bearer ${data4.data.token}`,
    });
    const res5 = await userProfileGet(req5);
    const data5 = await res5.json();
    checkEqual(res5.status, 200, 'profile get via Bearer token status 200');
    checkEqual(data5.data.id, data3.data.user.id, 'profile matches token owner');
    metrics.tier1Count++;
    console.log('    ✓ 1.5: Bearer session token authentication verification');
  }

  // --- Feature 2: Hosts (5+ tests) ---
  console.log('\n  [2. Hosts Feature]');
  let testHostId = '';
  {
    // Test 2.1: Get all hosts
    const req1 = createMockRequest('http://localhost:3000/api/hosts', 'GET');
    const res1 = await hostsGet(req1);
    const data1 = await res1.json();
    checkEqual(res1.status, 200, 'get hosts status 200');
    check(data1.count > 0, 'get hosts returns non-empty catalog');
    metrics.tier1Count++;
    console.log('    ✓ 2.1: Get all hosts catalog');

    // Test 2.2: Filter hosts by gender
    const req2 = createMockRequest('http://localhost:3000/api/hosts?gender=Female', 'GET');
    const res2 = await hostsGet(req2);
    const data2 = await res2.json();
    checkEqual(res2.status, 200, 'filter hosts by gender status 200');
    check(data2.data.every((h) => h.gender.toLowerCase() === 'female'), 'all returned hosts are Female');
    metrics.tier1Count++;
    console.log('    ✓ 2.2: Filter hosts by gender (Female)');

    // Test 2.3: Filter hosts by online status
    const req3 = createMockRequest('http://localhost:3000/api/hosts?online=true', 'GET');
    const res3 = await hostsGet(req3);
    const data3 = await res3.json();
    checkEqual(res3.status, 200, 'filter online hosts status 200');
    check(data3.data.every((h) => h.isOnline && !h.isBanned), 'all returned hosts are online & not banned');
    metrics.tier1Count++;
    console.log('    ✓ 2.3: Filter hosts by online status');

    // Test 2.4: Register new host (POST /api/hosts)
    const newHostPayload = {
      name: `Simran Kaur ${testRunId}`,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      age: 23,
      gender: 'Female',
      languages: 'Hindi, Punjabi, English',
      interests: 'Music, Travel, Coffee',
      bio: 'Enthusiastic conversationalist ready to connect!',
      coinRatePerMinute: 35,
      isOnline: true,
    };
    const req4 = createMockRequest('http://localhost:3000/api/hosts', 'POST', newHostPayload);
    const res4 = await hostsPost(req4);
    const data4 = await res4.json();
    checkEqual(res4.status, 201, 'post host status 201 Created');
    checkEqual(data4.data.name, newHostPayload.name, 'created host matches name');
    checkEqual(data4.data.coinRatePerMinute, 35, 'created host matches coin rate');
    testHostId = data4.data.id;
    metrics.tier1Count++;
    console.log('    ✓ 2.4: Register new verified host (ID: ' + testHostId + ')');

    // Test 2.5: Get host by ID (GET /api/hosts/[id])
    const req5 = createMockRequest(`http://localhost:3000/api/hosts/${testHostId}`, 'GET');
    const res5 = await hostGet(req5, { params: Promise.resolve({ id: testHostId }) });
    const data5 = await res5.json();
    checkEqual(res5.status, 200, 'get host by id status 200');
    checkEqual(data5.data.id, testHostId, 'retrieved host matches ID');
    metrics.tier1Count++;
    console.log('    ✓ 2.5: Retrieve single host by ID');

    // Test 2.6: Update host details (PATCH /api/hosts/[id])
    const req6 = createMockRequest(`http://localhost:3000/api/hosts/${testHostId}`, 'PATCH', {
      coinRatePerMinute: 45,
      bio: 'Updated bio with new energy!',
    });
    const res6 = await hostPatch(req6, { params: Promise.resolve({ id: testHostId }) });
    const data6 = await res6.json();
    checkEqual(res6.status, 200, 'patch host status 200');
    checkEqual(data6.data.coinRatePerMinute, 45, 'updated host coin rate reflected');
    checkEqual(data6.data.bio, 'Updated bio with new energy!', 'updated bio reflected');
    metrics.tier1Count++;
    console.log('    ✓ 2.6: Update host profile and rate');
  }

  // --- Feature 3: Packages (5+ tests) ---
  console.log('\n  [3. Packages Feature]');
  let testPkgId = '';
  {
    // Test 3.1: Get coin packages
    const req1 = createMockRequest('http://localhost:3000/api/packages', 'GET');
    const res1 = await packagesGet(req1);
    const data1 = await res1.json();
    checkEqual(res1.status, 200, 'get packages status 200');
    check(data1.count > 0, 'packages count is greater than 0');
    metrics.tier1Count++;
    console.log('    ✓ 3.1: Get coin packages catalog');

    // Test 3.2: Create new coin package (POST /api/packages)
    const newPkgPayload = {
      name: `Mega Diwali Booster ${testRunId}`,
      coins: 800,
      bonusCoins: 250,
      priceInr: 599,
      isPopular: true,
    };
    const req2 = createMockRequest('http://localhost:3000/api/packages', 'POST', newPkgPayload);
    const res2 = await packagesPost(req2);
    const data2 = await res2.json();
    checkEqual(res2.status, 201, 'post package status 201 Created');
    checkEqual(data2.data.coins, 800, 'created package coins match');
    checkEqual(data2.data.priceInr, 599, 'created package price match');
    testPkgId = data2.data.id;
    metrics.tier1Count++;
    console.log('    ✓ 3.2: Create new coin package (ID: ' + testPkgId + ')');

    // Test 3.3: Verify newly created package is in active catalog
    const req3 = createMockRequest('http://localhost:3000/api/packages', 'GET');
    const res3 = await packagesGet(req3);
    const data3 = await res3.json();
    const foundPkg = data3.data.find((p) => p.id === testPkgId);
    check(Boolean(foundPkg), 'new package exists in catalog');
    checkEqual(foundPkg.bonusCoins, 250, 'bonus coins preserved in catalog');
    metrics.tier1Count++;
    console.log('    ✓ 3.3: Verify package presence in catalog');

    // Test 3.4: Verify package bonus coins logic & calculations
    check(foundPkg.coins + foundPkg.bonusCoins === 1050, 'total effective coins calculation matches 1050');
    metrics.tier1Count++;
    console.log('    ✓ 3.4: Verify package bonus coins total calculation');

    // Test 3.5: Verify popular package flag handling
    checkEqual(foundPkg.isPopular, true, 'isPopular boolean preserved');
    metrics.tier1Count++;
    console.log('    ✓ 3.5: Verify popular package flag configuration');
  }

  // --- Feature 4: Gifts (5+ tests) ---
  console.log('\n  [4. Gifts Feature]');
  let testGiftId = '';
  {
    // Test 4.1: Get virtual gifts catalog
    const req1 = createMockRequest('http://localhost:3000/api/gifts', 'GET');
    const res1 = await giftsGet(req1);
    const data1 = await res1.json();
    checkEqual(res1.status, 200, 'get gifts status 200');
    check(data1.count > 0, 'gifts count is greater than 0');
    metrics.tier1Count++;
    console.log('    ✓ 4.1: Get virtual gifts catalog');

    // Test 4.2: Create new virtual gift (POST /api/gifts)
    const newGiftPayload = {
      name: `Golden Trophy ${testRunId}`,
      coinCost: 150,
      assetPath: 'assets/image/trophy.png',
      category: 'Luxury',
    };
    const req2 = createMockRequest('http://localhost:3000/api/gifts', 'POST', newGiftPayload);
    const res2 = await giftsPost(req2);
    const data2 = await res2.json();
    checkEqual(res2.status, 201, 'post gift status 201 Created');
    checkEqual(data2.data.coinCost, 150, 'created gift cost match');
    checkEqual(data2.data.category, 'Luxury', 'created gift category match');
    testGiftId = data2.data.id;
    metrics.tier1Count++;
    console.log('    ✓ 4.2: Create new virtual gift (ID: ' + testGiftId + ')');

    // Test 4.3: Verify newly created gift is in gifts catalog
    const req3 = createMockRequest('http://localhost:3000/api/gifts', 'GET');
    const res3 = await giftsGet(req3);
    const data3 = await res3.json();
    const foundGift = data3.data.find((g) => g.id === testGiftId);
    check(Boolean(foundGift), 'new gift exists in catalog');
    metrics.tier1Count++;
    console.log('    ✓ 4.3: Verify gift presence in catalog');

    // Test 4.4: Verify gift asset path format and category enum
    check(foundGift.assetPath.endsWith('.png') || foundGift.assetPath.endsWith('.gif'), 'assetPath has valid extension');
    metrics.tier1Count++;
    console.log('    ✓ 4.4: Verify gift asset path validation');

    // Test 4.5: Verify gifts categorization across Popular, Luxury, Special
    const categories = new Set(data3.data.map((g) => g.category));
    check(categories.has('Popular'), 'catalog includes Popular gifts');
    check(categories.has('Luxury'), 'catalog includes Luxury gifts');
    metrics.tier1Count++;
    console.log('    ✓ 4.5: Verify multi-tier gifts categorization');
  }

  // --- Feature 5: Calls (5+ tests) ---
  console.log('\n  [5. Calls Feature]');
  let testCallerId = '';
  let testCallSessionId = '';
  {
    // Setup test caller with sufficient coins
    const callerPhone = `+91 98111 ${testRunId}`;
    const authRes = await authVerifyOtpPost(
      createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: callerPhone, otp: '1234' })
    );
    const authData = await authRes.json();
    testCallerId = authData.data.user.id;
    // Credit extra coins so caller has enough balance
    await walletCreditPost(
      createMockRequest('http://localhost:3000/api/wallet/credit', 'POST', {
        userId: testCallerId,
        amount: 300,
        reason: 'Call test balance',
      })
    );

    // Test 5.1: Start call session (POST /api/calls/start)
    const req1 = createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
      userId: testCallerId,
      hostId: testHostId || 'lst_101',
      callType: 'video',
    });
    const res1 = await callStartPost(req1);
    const data1 = await res1.json();
    checkEqual(res1.status, 200, 'call start status 200');
    checkEqual(data1.success, true, 'call start success true');
    testCallSessionId = data1.data.sessionId;
    check(Boolean(testCallSessionId), 'call session has id');
    metrics.tier1Count++;
    console.log('    ✓ 5.1: Start 1-on-1 video call session (Session: ' + testCallSessionId + ')');

    // Test 5.2: Verify active call listed in GET /api/calls
    const req2 = createMockRequest('http://localhost:3000/api/calls', 'GET');
    const res2 = await callsGet(req2);
    const data2 = await res2.json();
    checkEqual(res2.status, 200, 'get calls status 200');
    const activeCall = data2.data.activeCalls.find((c) => c.id === testCallSessionId);
    check(Boolean(activeCall), 'started call is in activeCalls');
    metrics.tier1Count++;
    console.log('    ✓ 5.2: Query active calls list');

    // Test 5.3: Call pulse heartbeat (POST /api/calls/pulse) - debits 1 minute rate
    const req3 = createMockRequest('http://localhost:3000/api/calls/pulse', 'POST', {
      sessionId: testCallSessionId,
    });
    const res3 = await callPulsePost(req3);
    const data3 = await res3.json();
    checkEqual(res3.status, 200, 'call pulse status 200');
    checkEqual(data3.data.session.durationSeconds, 60, 'call pulse increments duration by 60s');
    metrics.tier1Count++;
    console.log('    ✓ 5.3: Call pulse heartbeat coin debit (Duration: 60s)');

    // Test 5.4: WebRTC Signaling message queue exchange (POST & GET)
    const signalMsg = {
      sessionId: testCallSessionId,
      senderId: testCallerId,
      targetId: testHostId || 'lst_101',
      type: 'offer',
      payload: { sdp: 'v=0\r\no=alice 2890844526\r\ns=-\r\n' },
    };
    const req4Post = createMockRequest('http://localhost:3000/api/calls/signal', 'POST', signalMsg);
    const res4Post = await callSignalPost(req4Post);
    const data4Post = await res4Post.json();
    checkEqual(res4Post.status, 200, 'post signal status 200');
    checkEqual(data4Post.success, true, 'signal queued');

    const req4Get = createMockRequest(
      `http://localhost:3000/api/calls/signal?sessionId=${testCallSessionId}&targetId=${testHostId || 'lst_101'}`,
      'GET'
    );
    const res4Get = await callSignalGet(req4Get);
    const data4Get = await res4Get.json();
    checkEqual(res4Get.status, 200, 'get signal status 200');
    check(data4Get.data.length > 0, 'peer received signal message');
    checkEqual(data4Get.data[0].type, 'offer', 'signal type is offer');
    metrics.tier1Count++;
    console.log('    ✓ 5.4: WebRTC signaling offer relay and delivery');

    // Test 5.5: End call session cleanly (POST /api/calls/end)
    const req5 = createMockRequest('http://localhost:3000/api/calls/end', 'POST', {
      sessionId: testCallSessionId,
      durationSeconds: 115,
    });
    const res5 = await callEndPost(req5);
    const data5 = await res5.json();
    checkEqual(res5.status, 200, 'call end status 200');
    checkEqual(data5.data.session.status, 'completed', 'call status marked completed');
    checkEqual(data5.data.session.durationSeconds, 115, 'recorded duration 115s');
    metrics.tier1Count++;
    console.log('    ✓ 5.5: Clean call termination and duration record');

    // Test 5.6: Admin forced call termination (POST /api/calls/terminate)
    // Start temporary call to terminate
    const startTemp = await callStartPost(
      createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
        userId: testCallerId,
        hostId: 'lst_101',
        callType: 'audio',
      })
    );
    const startTempData = await startTemp.json();
    const tempSessionId = startTempData.data.sessionId;

    const req6 = createMockRequest('http://localhost:3000/api/calls/terminate', 'POST', {
      callId: tempSessionId,
    });
    const res6 = await callTerminatePost(req6);
    const data6 = await res6.json();
    checkEqual(res6.status, 200, 'terminate call status 200');
    checkEqual(data6.data.status, 'terminated_by_admin', 'marked terminated_by_admin');
    metrics.tier1Count++;
    console.log('    ✓ 5.6: Admin forced emergency call termination');
  }

  // --- Feature 6: Wallet (5+ tests) ---
  console.log('\n  [6. Wallet Feature]');
  {
    // Test 6.1: Get wallet balance (GET /api/wallet/balance)
    const req1 = createMockRequest(`http://localhost:3000/api/wallet/balance?userId=${testCallerId}`, 'GET');
    const res1 = await walletBalanceGet(req1);
    const data1 = await res1.json();
    checkEqual(res1.status, 200, 'wallet balance status 200');
    const initialBal = data1.data.coinBalance;
    check(typeof initialBal === 'number', 'coinBalance is number');
    metrics.tier1Count++;
    console.log('    ✓ 6.1: Get wallet balance (Balance: ' + initialBal + ')');

    // Test 6.2: Credit coins to wallet (POST /api/wallet/credit)
    const req2 = createMockRequest('http://localhost:3000/api/wallet/credit', 'POST', {
      userId: testCallerId,
      amount: 150,
      reason: 'Festive promotion credit',
    });
    const res2 = await walletCreditPost(req2);
    const data2 = await res2.json();
    checkEqual(res2.status, 200, 'wallet credit status 200');
    checkEqual(data2.data.newBalance, initialBal + 150, 'balance correctly incremented by 150');
    metrics.tier1Count++;
    console.log('    ✓ 6.2: Credit coins to user wallet');

    // Test 6.3: Deduct coins from wallet (POST /api/wallet/deduct)
    const req3 = createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
      userId: testCallerId,
      amount: 50,
      reason: 'Virtual tip deduction',
    });
    const res3 = await walletDeductPost(req3);
    const data3 = await res3.json();
    checkEqual(res3.status, 200, 'wallet deduct status 200');
    checkEqual(data3.data.newBalance, initialBal + 100, 'balance correctly decremented by 50');
    metrics.tier1Count++;
    console.log('    ✓ 6.3: Deduct coins from user wallet');

    // Test 6.4: Admin manual wallet adjustment (POST /api/users/wallet)
    const req4 = createMockRequest('http://localhost:3000/api/users/wallet', 'POST', {
      userId: testCallerId,
      amount: 75,
      action: 'credit',
      reason: 'Admin goodwill credit',
    });
    const res4 = await adminWalletPost(req4);
    const data4 = await res4.json();
    checkEqual(res4.status, 200, 'admin wallet status 200');
    checkEqual(data4.data.newBalance, initialBal + 175, 'admin credit correctly applied');
    metrics.tier1Count++;
    console.log('    ✓ 6.4: Admin manual wallet adjustment');

    // Test 6.5: Verify transaction audit ledger records
    const req5 = createMockRequest(`http://localhost:3000/api/wallet/balance?userId=${testCallerId}`, 'GET');
    const res5 = await walletBalanceGet(req5);
    const data5 = await res5.json();
    check(data5.data.transactions.length >= 3, 'transactions list contains audit entries');
    check(data5.data.transactions.some((t) => t.type === 'credit'), 'audit includes credit transactions');
    check(data5.data.transactions.some((t) => t.type === 'debit'), 'audit includes debit transactions');
    metrics.tier1Count++;
    console.log('    ✓ 6.5: Audit ledger transactions trail verification');
  }

  // --- Feature 7: Payments (5+ tests) ---
  console.log('\n  [7. Payments Feature]');
  let testOrderId = '';
  {
    // Test 7.1: Create Cashfree payment order (POST /api/payments/create-order)
    const req1 = createMockRequest('http://localhost:3000/api/payments/create-order', 'POST', {
      userId: testCallerId,
      packageId: 'pkg_starter',
    });
    const res1 = await paymentOrderPost(req1);
    const data1 = await res1.json();
    checkEqual(res1.status, 200, 'create order status 200');
    checkEqual(data1.success, true, 'order created successfully');
    testOrderId = data1.data.orderId;
    check(Boolean(testOrderId), 'order has valid orderId');
    checkEqual(data1.data.amountInr, 99, 'amountInr matches pkg_starter');
    metrics.tier1Count++;
    console.log('    ✓ 7.1: Create payment order (Order: ' + testOrderId + ')');

    // Test 7.2: Process payment webhook with SUCCESS status (POST /api/payments/webhook)
    const balBeforeRes = await walletBalanceGet(
      createMockRequest(`http://localhost:3000/api/wallet/balance?userId=${testCallerId}`, 'GET')
    );
    const balBefore = (await balBeforeRes.json()).data.coinBalance;

    const req2 = createMockRequest('http://localhost:3000/api/payments/webhook', 'POST', {
      orderId: testOrderId,
      status: 'SUCCESS',
      paymentSessionId: 'cf_e2e_sess_001',
    });
    const res2 = await paymentWebhookPost(req2);
    const data2 = await res2.json();
    checkEqual(res2.status, 200, 'payment webhook status 200');
    checkEqual(data2.data.order.status, 'paid', 'order marked paid');
    metrics.tier1Count++;
    console.log('    ✓ 7.2: Process payment webhook capture');

    // Test 7.3: Verify wallet balance automatically credited pkg coins (100 + 20 bonus)
    const balAfterRes = await walletBalanceGet(
      createMockRequest(`http://localhost:3000/api/wallet/balance?userId=${testCallerId}`, 'GET')
    );
    const balAfter = (await balAfterRes.json()).data.coinBalance;
    checkEqual(balAfter, balBefore + 120, 'wallet credited 120 coins from starter pack');
    metrics.tier1Count++;
    console.log('    ✓ 7.3: Verify automatic coin fulfillment on webhook');

    // Test 7.4: Idempotent duplicate webhook handling - no double crediting
    const req4 = createMockRequest('http://localhost:3000/api/payments/webhook', 'POST', {
      orderId: testOrderId,
      status: 'PAID',
    });
    const res4 = await paymentWebhookPost(req4);
    const data4 = await res4.json();
    checkEqual(res4.status, 200, 'duplicate webhook status 200');
    checkEqual(data4.data.newBalance, balAfter, 'balance unchanged on duplicate webhook');
    metrics.tier1Count++;
    console.log('    ✓ 7.4: Duplicate webhook idempotency (no double-credit)');

    // Test 7.5: Alternative Cashfree nested payload webhook format
    const altOrderRes = await paymentOrderPost(
      createMockRequest('http://localhost:3000/api/payments/create-order', 'POST', {
        userId: testCallerId,
        packageId: 'pkg_starter',
      })
    );
    const altOrderId = (await altOrderRes.json()).data.orderId;
    const req5 = createMockRequest('http://localhost:3000/api/payments/webhook', 'POST', {
      data: {
        order: { order_id: altOrderId, order_status: 'PAID' },
        payment: { cf_payment_id: 'cf_pay_nested_991' },
      },
    });
    const res5 = await paymentWebhookPost(req5);
    checkEqual(res5.status, 200, 'nested Cashfree webhook status 200');
    metrics.tier1Count++;
    console.log('    ✓ 7.5: Cashfree nested payload schema compatibility');
  }

  // --- Feature 8: User (5+ tests) ---
  console.log('\n  [8. User Feature]');
  {
    // Test 8.1: Get user profile by userId (GET /api/user/profile)
    const req1 = createMockRequest(`http://localhost:3000/api/user/profile?userId=${testCallerId}`, 'GET');
    const res1 = await userProfileGet(req1);
    const data1 = await res1.json();
    checkEqual(res1.status, 200, 'user profile status 200');
    checkEqual(data1.data.id, testCallerId, 'profile matches requested userId');
    metrics.tier1Count++;
    console.log('    ✓ 8.1: Get user profile by ID');

    // Test 8.2: Update user profile via POST (POST /api/user/profile)
    const req2 = createMockRequest('http://localhost:3000/api/user/profile', 'POST', {
      userId: testCallerId,
      name: 'DilSnap VIP Explorer',
      gender: 'Female',
    });
    const res2 = await userProfilePost(req2);
    const data2 = await res2.json();
    checkEqual(res2.status, 200, 'profile post update status 200');
    checkEqual(data2.data.name, 'DilSnap VIP Explorer', 'name updated');
    checkEqual(data2.data.gender, 'Female', 'gender updated');
    metrics.tier1Count++;
    console.log('    ✓ 8.2: Update user profile (POST)');

    // Test 8.3: Update user profile via PATCH (PATCH /api/user/profile)
    const req3 = createMockRequest('http://localhost:3000/api/user/profile', 'PATCH', {
      userId: testCallerId,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775?w=150',
    });
    const res3 = await userProfilePatch(req3);
    const data3 = await res3.json();
    checkEqual(res3.status, 200, 'profile patch update status 200');
    check(data3.data.avatarUrl.includes('1534528741775'), 'avatarUrl updated');
    metrics.tier1Count++;
    console.log('    ✓ 8.3: Update user profile (PATCH)');

    // Test 8.4: Get all users catalog for Admin console (GET /api/users)
    const req4 = createMockRequest('http://localhost:3000/api/users', 'GET');
    const res4 = await usersGet(req4);
    const data4 = await res4.json();
    checkEqual(res4.status, 200, 'get users status 200');
    check(data4.count > 0, 'users count is greater than 0');
    check(data4.data.some((u) => u.id === testCallerId), 'created user present in admin list');
    metrics.tier1Count++;
    console.log('    ✓ 8.4: Get all users catalog for Admin panel');

    // Test 8.5: Lookup user by normalized phone query
    const phoneLookup = `+9198111${testRunId}`;
    const req5 = createMockRequest(`http://localhost:3000/api/user/profile?phone=${encodeURIComponent(phoneLookup)}`, 'GET');
    const res5 = await userProfileGet(req5);
    const data5 = await res5.json();
    checkEqual(res5.status, 200, 'phone lookup status 200');
    checkEqual(data5.data.id, testCallerId, 'phone lookup resolves user');
    metrics.tier1Count++;
    console.log('    ✓ 8.5: Lookup user profile by phone query');
  }

  // --- Feature 9: Config & Analytics (5+ tests) ---
  console.log('\n  [9. Config & Analytics Feature]');
  {
    // Test 9.1: Get app configuration (GET /api/config)
    const req1 = createMockRequest('http://localhost:3000/api/config', 'GET');
    const res1 = await configGet(req1);
    const data1 = await res1.json();
    checkEqual(res1.status, 200, 'get config status 200');
    checkEqual(data1.data.appName, 'DilSnap', 'appName is DilSnap');
    checkEqual(typeof data1.data.maintenanceMode, 'boolean', 'maintenanceMode is boolean');
    metrics.tier1Count++;
    console.log('    ✓ 9.1: Read system configuration');

    // Test 9.2: Update broadcast notice (PATCH /api/config)
    const noticePayload = {
      broadcastNotice: {
        active: true,
        title: `⚡ Diwali Mega Fest ${testRunId}`,
        message: 'Get 50% extra bonus coins on all VIP packs today only!',
        actionUrl: '/monetization',
      },
    };
    const req2 = createMockRequest('http://localhost:3000/api/config', 'PATCH', noticePayload);
    const res2 = await configPatch(req2);
    const data2 = await res2.json();
    checkEqual(res2.status, 200, 'patch config status 200');
    checkEqual(data2.data.broadcastNotice.title, noticePayload.broadcastNotice.title, 'broadcast title updated');
    metrics.tier1Count++;
    console.log('    ✓ 9.2: Update system broadcast notice banner');

    // Test 9.3: Toggle maintenance mode ON and verify
    const req3On = createMockRequest('http://localhost:3000/api/config', 'PATCH', { maintenanceMode: true });
    const res3On = await configPatch(req3On);
    const data3On = await res3On.json();
    checkEqual(data3On.data.maintenanceMode, true, 'maintenanceMode toggled true');

    const checkConfig = await configGet(createMockRequest('http://localhost:3000/api/config', 'GET'));
    checkEqual((await checkConfig.json()).data.maintenanceMode, true, 'maintenanceMode persisted true');
    metrics.tier1Count++;
    console.log('    ✓ 9.3: Toggle maintenance mode ON');

    // Test 9.4: Restore maintenance mode OFF
    const req4Off = createMockRequest('http://localhost:3000/api/config', 'PATCH', { maintenanceMode: false });
    const res4Off = await configPatch(req4Off);
    const data4Off = await res4Off.json();
    checkEqual(data4Off.data.maintenanceMode, false, 'maintenanceMode toggled false');
    metrics.tier1Count++;
    console.log('    ✓ 9.4: Restore maintenance mode OFF');

    // Test 9.5: Get platform analytics and business metrics (GET /api/analytics)
    const req5 = createMockRequest('http://localhost:3000/api/analytics', 'GET');
    const res5 = await analyticsGet(req5);
    const data5 = await res5.json();
    checkEqual(res5.status, 200, 'get analytics status 200');
    check(data5.data.totalRevenue > 0, 'analytics revenue > 0');
    check(data5.data.coinsInCirculation >= 0, 'analytics coins in circulation >= 0');
    check(data5.data.totalUsersCount > 0, 'analytics total users count > 0');
    metrics.tier1Count++;
    console.log('    ✓ 9.5: Get admin analytics & business metrics');
  }

  // =================================================================
  // TIER 2: BOUNDARY & CORNER CASES (18 test cases)
  // =================================================================
  console.log('\n>>> [TIER 2] BOUNDARY & CORNER CASES');

  // Test 2.1: Empty body on send-otp -> 400
  {
    const res = await authSendOtpPost(createMockRequest('http://localhost:3000/api/auth/send-otp', 'POST', {}));
    checkEqual(res.status, 400, 'empty send-otp returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.1: Rejects empty phone on send-otp with 400');
  }

  // Test 2.2: Invalid short phone on send-otp -> 400
  {
    const res = await authSendOtpPost(createMockRequest('http://localhost:3000/api/auth/send-otp', 'POST', { phone: '123' }));
    checkEqual(res.status, 400, 'short phone returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.2: Rejects invalid short phone (<8 chars) with 400');
  }

  // Test 2.3: Missing OTP on verify-otp -> 400
  {
    const res = await authVerifyOtpPost(
      createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: '+919876543210' })
    );
    checkEqual(res.status, 400, 'missing otp returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.3: Rejects missing OTP on verify-otp with 400');
  }

  // Test 2.4: Incorrect OTP value on verify-otp -> 400
  {
    const res = await authVerifyOtpPost(
      createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: '+919876543210', otp: '9999' })
    );
    checkEqual(res.status, 400, 'wrong otp returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.4: Rejects invalid OTP with 400');
  }

  // Test 2.5: Negative wallet credit amount -> 400
  {
    const res = await walletCreditPost(
      createMockRequest('http://localhost:3000/api/wallet/credit', 'POST', {
        userId: testCallerId,
        amount: -100,
      })
    );
    checkEqual(res.status, 400, 'negative credit returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.5: Rejects negative coin credit amount with 400');
  }

  // Test 2.6: Zero wallet credit amount -> 400
  {
    const res = await walletCreditPost(
      createMockRequest('http://localhost:3000/api/wallet/credit', 'POST', {
        userId: testCallerId,
        amount: 0,
      })
    );
    checkEqual(res.status, 400, 'zero credit returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.6: Rejects zero coin credit amount with 400');
  }

  // Test 2.7: Fractional / floating point coin amount on wallet deduct -> 400
  {
    const res = await walletDeductPost(
      createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
        userId: testCallerId,
        amount: 25.5,
      })
    );
    checkEqual(res.status, 400, 'fractional amount returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.7: Rejects non-integer fractional coin deduct with 400');
  }

  // Test 2.8: Wallet overdraft / insufficient balance on deduct -> 400
  {
    const res = await walletDeductPost(
      createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
        userId: testCallerId,
        amount: 9999999,
      })
    );
    checkEqual(res.status, 400, 'overdraft returns 400');
    const data = await res.json();
    check(data.error.includes('Insufficient coins'), 'error mentions Insufficient coins');
    metrics.tier2Count++;
    console.log('    ✓ 2.8: Enforces strict overdraft prevention with 400');
  }

  // Test 2.9: Non-existent user on wallet balance query -> 404
  {
    const res = await walletBalanceGet(
      createMockRequest('http://localhost:3000/api/wallet/balance?userId=usr_ghost_9999', 'GET')
    );
    checkEqual(res.status, 404, 'unknown user balance returns 404');
    metrics.tier2Count++;
    console.log('    ✓ 2.9: Rejects non-existent user on wallet query with 404');
  }

  // Test 2.10: Start call with non-existent host -> 400
  {
    const res = await callStartPost(
      createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
        userId: testCallerId,
        hostId: 'lst_ghost_999',
      })
    );
    checkEqual(res.status, 400, 'unknown host call start returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.10: Rejects call to non-existent host with 400');
  }

  // Test 2.11: Start call with user having 0 coins -> 400
  {
    // Create bankrupt user with 0 coins
    const zeroPhone = `+91 98000 ${testRunId}`;
    const regRes = await authVerifyOtpPost(
      createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: zeroPhone, otp: '1234' })
    );
    const zeroUser = (await regRes.json()).data.user;
    // Deduct welcome bonus down to 0
    await walletDeductPost(
      createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
        userId: zeroUser.id,
        amount: 120,
      })
    );

    const res = await callStartPost(
      createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
        userId: zeroUser.id,
        hostId: 'lst_101',
      })
    );
    checkEqual(res.status, 400, 'insufficient coins call start returns 400');
    const data = await res.json();
    check(data.error.includes('Insufficient coin balance'), 'error indicates balance insufficient');
    metrics.tier2Count++;
    console.log('    ✓ 2.11: Rejects call initiation when user balance is insufficient with 400');
  }

  // Test 2.12: Call pulse on non-existent session -> 400
  {
    const res = await callPulsePost(
      createMockRequest('http://localhost:3000/api/calls/pulse', 'POST', {
        sessionId: 'call_ghost_session_888',
      })
    );
    checkEqual(res.status, 400, 'pulse invalid session returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.12: Rejects pulse on unknown call session with 400');
  }

  // Test 2.13: Payment webhook with failed status -> 400
  {
    const res = await paymentWebhookPost(
      createMockRequest('http://localhost:3000/api/payments/webhook', 'POST', {
        orderId: 'order_test_any',
        status: 'FAILED',
      })
    );
    checkEqual(res.status, 400, 'failed webhook returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.13: Rejects payment webhook with FAILED status with 400');
  }

  // Test 2.14: Payment webhook for non-existent order ID -> 400
  {
    const res = await paymentWebhookPost(
      createMockRequest('http://localhost:3000/api/payments/webhook', 'POST', {
        orderId: 'order_ghost_999999',
        status: 'SUCCESS',
      })
    );
    checkEqual(res.status, 400, 'unknown order webhook returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.14: Rejects payment webhook for non-existent order with 400');
  }

  // Test 2.15: Missing required fields on package creation -> 400
  {
    const res = await packagesPost(
      createMockRequest('http://localhost:3000/api/packages', 'POST', { name: 'Incomplete Pack' })
    );
    checkEqual(res.status, 400, 'missing fields on package returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.15: Rejects package creation with missing fields with 400');
  }

  // Test 2.16: Missing required fields on gift creation -> 400
  {
    const res = await giftsPost(
      createMockRequest('http://localhost:3000/api/gifts', 'POST', { name: 'Incomplete Gift' })
    );
    checkEqual(res.status, 400, 'missing fields on gift returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.16: Rejects gift creation with missing fields with 400');
  }

  // Test 2.17: Non-existent host lookup -> 404
  {
    const res = await hostGet(
      createMockRequest('http://localhost:3000/api/hosts/lst_ghost_999', 'GET'),
      { params: Promise.resolve({ id: 'lst_ghost_999' }) }
    );
    checkEqual(res.status, 404, 'unknown host returns 404');
    metrics.tier2Count++;
    console.log('    ✓ 2.17: Returns 404 for non-existent host ID');
  }

  // Test 2.18: WebRTC signaling GET without sessionId -> 400
  {
    const res = await callSignalGet(createMockRequest('http://localhost:3000/api/calls/signal', 'GET'));
    checkEqual(res.status, 400, 'missing sessionId on signal returns 400');
    metrics.tier2Count++;
    console.log('    ✓ 2.18: Rejects WebRTC signal retrieval missing sessionId with 400');
  }

  // =================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS (5 multi-step workflows)
  // =================================================================
  console.log('\n>>> [TIER 3] CROSS-FEATURE COMBINATIONS');

  // Test 3.1: Purchase -> Webhook Credit -> Call Pulse -> Final Balance Verification
  {
    const pipelinePhone = `+91 98333 ${testRunId}`;
    // Step a: User registers
    const userReg = await authVerifyOtpPost(
      createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: pipelinePhone, otp: '1234' })
    );
    const pUser = (await userReg.json()).data.user;
    checkEqual(pUser.coins, 120, 'Pipeline: initial welcome bonus 120');

    // Step b: User purchases Popular pack (300 + 80 = 380 coins)
    const orderRes = await paymentOrderPost(
      createMockRequest('http://localhost:3000/api/payments/create-order', 'POST', {
        userId: pUser.id,
        packageId: 'pkg_popular',
      })
    );
    const pOrder = (await orderRes.json()).data.order;

    // Step c: Webhook fires to credit purchase
    const hookRes = await paymentWebhookPost(
      createMockRequest('http://localhost:3000/api/payments/webhook', 'POST', {
        orderId: pOrder.orderId,
        status: 'PAID',
        paymentSessionId: 'cf_chain_001',
      })
    );
    const expectedBal = 120 + 380; // 500 coins
    checkEqual((await hookRes.json()).data.newBalance, expectedBal, 'Pipeline: balance after purchase is 500');

    // Step d: User calls host (lst_101 rate = 30 coins/min)
    const callStart = await callStartPost(
      createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
        userId: pUser.id,
        hostId: 'lst_101',
        callType: 'video',
      })
    );
    const callStartData = await callStart.json();
    const pSessionId = callStartData.data.sessionId;

    // Step e: 2 minutes of call pulse (2 x 30 = 60 coins)
    await callPulsePost(createMockRequest('http://localhost:3000/api/calls/pulse', 'POST', { sessionId: pSessionId }));
    await callPulsePost(createMockRequest('http://localhost:3000/api/calls/pulse', 'POST', { sessionId: pSessionId }));

    // Step f: End call
    await callEndPost(
      createMockRequest('http://localhost:3000/api/calls/end', 'POST', { sessionId: pSessionId, durationSeconds: 120 })
    );

    // Step g: Verify final wallet balance matches 500 - 60 = 440
    const finalBalRes = await walletBalanceGet(
      createMockRequest(`http://localhost:3000/api/wallet/balance?userId=${pUser.id}`, 'GET')
    );
    checkEqual((await finalBalRes.json()).data.coinBalance, 440, 'Pipeline: exact balance after call burn is 440');
    metrics.tier3Count++;
    console.log('    ✓ 3.1: Purchase -> Fulfillment -> Call Pulse -> Verified Final Balance (440)');
  }

  // Test 3.2: Virtual Gift Transfer Simulation & Audit Trail
  {
    const giftUserPhone = `+91 98444 ${testRunId}`;
    const userReg = await authVerifyOtpPost(
      createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: giftUserPhone, otp: '1234' })
    );
    const gUser = (await userReg.json()).data.user;

    // User sends Mystery Gift (cost: 30 coins)
    const giftDeduct = await walletDeductPost(
      createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
        userId: gUser.id,
        amount: 30,
        reason: 'Sent Mystery Gift to Priya Sharma',
      })
    );
    checkEqual((await giftDeduct.json()).data.newBalance, 90, 'Gift sending debited exactly 30 coins (new bal: 90)');

    // Verify audit log
    const auditRes = await walletBalanceGet(
      createMockRequest(`http://localhost:3000/api/wallet/balance?userId=${gUser.id}`, 'GET')
    );
    const lastTx = (await auditRes.json()).data.transactions[0];
    checkEqual(lastTx.amount, 30, 'audit log records 30 coins gift deduction');
    check(lastTx.description.includes('Mystery Gift'), 'audit log has gift description');
    metrics.tier3Count++;
    console.log('    ✓ 3.2: Virtual gift sending with atomic balance debit and audit trail');
  }

  // Test 3.3: Automatic Call Termination on Coin Exhaustion
  {
    const exhaustPhone = `+91 98555 ${testRunId}`;
    const regRes = await authVerifyOtpPost(
      createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: exhaustPhone, otp: '1234' })
    );
    const exUser = (await regRes.json()).data.user;

    // Set balance to exactly 30 coins (1 pulse of Priya Sharma at 30 coins/min)
    await walletDeductPost(
      createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
        userId: exUser.id,
        amount: 90,
      })
    );

    // Start call
    const startRes = await callStartPost(
      createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
        userId: exUser.id,
        hostId: 'lst_101',
        callType: 'video',
      })
    );
    const sessionId = (await startRes.json()).data.sessionId;

    // Pulse 1: Burns the last 30 coins -> balance becomes 0
    const pulse1 = await callPulsePost(
      createMockRequest('http://localhost:3000/api/calls/pulse', 'POST', { sessionId })
    );
    checkEqual((await pulse1.json()).data.remainingCoins, 0, 'balance becomes 0 after pulse 1');

    // Pulse 2: User now has 0 coins -> call auto terminates with status 'insufficient_coins'
    const pulse2 = await callPulsePost(
      createMockRequest('http://localhost:3000/api/calls/pulse', 'POST', { sessionId })
    );
    checkEqual(pulse2.status, 402, 'insufficient coins pulse returns 402 Payment Required');
    const pulse2Data = await pulse2.json();
    checkEqual(pulse2Data.status, 'insufficient_coins', 'call status transitions to insufficient_coins');

    // Verify host is freed from call
    const hostCheck = await hostGet(
      createMockRequest('http://localhost:3000/api/hosts/lst_101', 'GET'),
      { params: Promise.resolve({ id: 'lst_101' }) }
    );
    checkEqual((await hostCheck.json()).data.isInCall, false, 'host freed after call auto-termination');
    metrics.tier3Count++;
    console.log('    ✓ 3.3: Call pulse auto-terminates on coin exhaustion and frees host');
  }

  // Test 3.4: Admin Wallet Credit Unlocks Immediate Call Eligibility
  {
    const brokePhone = `+91 98666 ${testRunId}`;
    const regRes = await authVerifyOtpPost(
      createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: brokePhone, otp: '1234' })
    );
    const brokeUser = (await regRes.json()).data.user;

    // Deduct to 0 coins
    await walletDeductPost(
      createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
        userId: brokeUser.id,
        amount: 120,
      })
    );

    // Call attempt fails
    const failCall = await callStartPost(
      createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
        userId: brokeUser.id,
        hostId: 'lst_101',
      })
    );
    checkEqual(failCall.status, 400, 'call fails with 0 coins');

    // Admin grants 100 coins via /api/users/wallet
    const grantRes = await adminWalletPost(
      createMockRequest('http://localhost:3000/api/users/wallet', 'POST', {
        userId: brokeUser.id,
        amount: 100,
        action: 'credit',
        reason: 'Customer support compensation',
      })
    );
    checkEqual((await grantRes.json()).data.newBalance, 100, 'admin granted 100 coins');

    // Call attempt now succeeds immediately!
    const successCall = await callStartPost(
      createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
        userId: brokeUser.id,
        hostId: 'lst_101',
      })
    );
    checkEqual(successCall.status, 200, 'call succeeds immediately following admin credit');
    // Clean up call
    const sId = (await successCall.json()).data.sessionId;
    await callEndPost(createMockRequest('http://localhost:3000/api/calls/end', 'POST', { sessionId: sId }));
    metrics.tier3Count++;
    console.log('    ✓ 3.4: Admin wallet manual credit unblocks user for immediate call');
  }

  // Test 3.5: Full WebRTC Duplex Signaling Handshake (Offer -> Answer -> Exchange)
  {
    const callerId = `usr_caller_${testRunId}`;
    const calleeId = `lst_callee_${testRunId}`;
    const rtcSessionId = `call_rtc_${testRunId}`;

    // 1. Caller queues SDP offer
    const offerRes = await callSignalPost(
      createMockRequest('http://localhost:3000/api/calls/signal', 'POST', {
        sessionId: rtcSessionId,
        senderId: callerId,
        targetId: calleeId,
        type: 'offer',
        payload: { sdp: 'offer_sdp_payload' },
      })
    );
    checkEqual(offerRes.status, 200, 'offer signal accepted');

    // 2. Callee retrieves SDP offer
    const getOfferRes = await callSignalGet(
      createMockRequest(`http://localhost:3000/api/calls/signal?sessionId=${rtcSessionId}&targetId=${calleeId}`, 'GET')
    );
    const offerData = await getOfferRes.json();
    checkEqual(offerData.data.length, 1, 'callee received offer');
    checkEqual(offerData.data[0].type, 'offer', 'signal payload matches offer');

    // 3. Callee queues SDP answer
    const answerRes = await callSignalPost(
      createMockRequest('http://localhost:3000/api/calls/signal', 'POST', {
        sessionId: rtcSessionId,
        senderId: calleeId,
        targetId: callerId,
        type: 'answer',
        payload: { sdp: 'answer_sdp_payload' },
      })
    );
    checkEqual(answerRes.status, 200, 'answer signal accepted');

    // 4. Caller retrieves SDP answer
    const getAnswerRes = await callSignalGet(
      createMockRequest(`http://localhost:3000/api/calls/signal?sessionId=${rtcSessionId}&targetId=${callerId}`, 'GET')
    );
    const answerData = await getAnswerRes.json();
    checkEqual(answerData.data.length, 1, 'caller received answer');
    checkEqual(answerData.data[0].type, 'answer', 'signal payload matches answer');
    metrics.tier3Count++;
    console.log('    ✓ 3.5: WebRTC duplex offer/answer signaling exchange verified');
  }

  // =================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS (3 comprehensive journeys)
  // =================================================================
  console.log('\n>>> [TIER 4] REAL-WORLD APPLICATION SCENARIOS');

  // Scenario 4.1: Complete End-to-End User Mobile App Journey
  {
    console.log('\n  [Scenario 4.1: Complete Mobile App User Journey]');
    const journeyPhone = `+91 98777 ${testRunId}`;

    // Step 1: App cold launch - fetch system configuration & notice
    const cfgRes = await configGet(createMockRequest('http://localhost:3000/api/config', 'GET'));
    const cfg = (await cfgRes.json()).data;
    checkEqual(cfg.appName, 'DilSnap', 'Mobile cold launch: app name verified');
    checkEqual(cfg.maintenanceMode, false, 'Mobile cold launch: system active');

    // Step 2: User requests OTP & verifies
    await authSendOtpPost(createMockRequest('http://localhost:3000/api/auth/send-otp', 'POST', { phone: journeyPhone }));
    const vRes = await authVerifyOtpPost(
      createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', { phone: journeyPhone, otp: '1234' })
    );
    const vResData = await vRes.json();
    const jUser = vResData.data.user;
    const token = vResData.data.token;
    checkEqual(jUser.coins, 120, 'Mobile: received 120 welcome coins');

    // Step 3: Complete profile setup
    const profRes = await userProfilePost(
      createMockRequest('http://localhost:3000/api/user/profile', 'POST', {
        userId: jUser.id,
        name: 'Arjun Singhania',
        gender: 'Male',
      })
    );
    checkEqual((await profRes.json()).data.name, 'Arjun Singhania', 'Mobile: profile name updated');

    // Step 4: Browse online female hosts
    const hostsRes = await hostsGet(createMockRequest('http://localhost:3000/api/hosts?online=true&gender=Female', 'GET'));
    const availableHosts = (await hostsRes.json()).data;
    check(availableHosts.length > 0, 'Mobile: online female hosts found');
    const selectedHost = availableHosts[0];

    // Step 5: Check wallet balance
    const wRes = await walletBalanceGet(
      createMockRequest(`http://localhost:3000/api/wallet/balance?userId=${jUser.id}`, 'GET')
    );
    checkEqual((await wRes.json()).data.coinBalance, 120, 'Mobile: wallet balance verified at 120');

    // Step 6: Start 1-on-1 call with chosen host
    const callRes = await callStartPost(
      createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
        userId: jUser.id,
        hostId: selectedHost.id,
        callType: 'video',
      })
    );
    const callSession = (await callRes.json()).data.session;
    checkEqual(callSession.status, 'active', 'Mobile: call session established');

    // Step 7: Pulse call for 1 minute
    await callPulsePost(
      createMockRequest('http://localhost:3000/api/calls/pulse', 'POST', { sessionId: callSession.id })
    );

    // Step 8: End call cleanly
    const endRes = await callEndPost(
      createMockRequest('http://localhost:3000/api/calls/end', 'POST', {
        sessionId: callSession.id,
        durationSeconds: 65,
      })
    );
    checkEqual((await endRes.json()).data.session.status, 'completed', 'Mobile: call marked completed');

    // Step 9: Verify updated balance
    const finalW = await walletBalanceGet(
      createMockRequest(`http://localhost:3000/api/wallet/balance?userId=${jUser.id}`, 'GET')
    );
    checkEqual((await finalW.json()).data.coinBalance, 120 - callSession.ratePerMinute, 'Mobile: coin deduction matches rate');
    metrics.tier4Count++;
    console.log('    ✓ 4.1: Complete Mobile User Journey verified 100%');
  }

  // Scenario 4.2: Host Full Lifecycle & Availability State Transitions
  {
    console.log('\n  [Scenario 4.2: Host Full Lifecycle & State Transitions]');
    // Step 1: Admin registers new host
    const createRes = await hostsPost(
      createMockRequest('http://localhost:3000/api/hosts', 'POST', {
        name: `Meera Joshi ${testRunId}`,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775?w=400',
        coinRatePerMinute: 50,
        isOnline: true,
      })
    );
    const host = (await createRes.json()).data;
    checkEqual(host.isInCall, false, 'Lifecycle: host initially not in call');
    checkEqual(host.totalCalls, 0, 'Lifecycle: host total calls starts at 0');

    // Step 2: Verify host appears in online catalog
    const onlineRes = await hostsGet(createMockRequest('http://localhost:3000/api/hosts?online=true', 'GET'));
    const onlineList = (await onlineRes.json()).data;
    check(onlineList.some((h) => h.id === host.id), 'Lifecycle: host found in online catalog');

    // Step 3: User calls host -> host transitions to isInCall = true
    const callRes = await callStartPost(
      createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
        userId: testCallerId,
        hostId: host.id,
      })
    );
    const sessionId = (await callRes.json()).data.sessionId;

    const hostDuringCall = await hostGet(
      createMockRequest(`http://localhost:3000/api/hosts/${host.id}`, 'GET'),
      { params: Promise.resolve({ id: host.id }) }
    );
    checkEqual((await hostDuringCall.json()).data.isInCall, true, 'Lifecycle: host marked isInCall = true');

    // Step 4: Call ends -> host isInCall returns to false, totalCalls increments
    await callEndPost(
      createMockRequest('http://localhost:3000/api/calls/end', 'POST', { sessionId, durationSeconds: 60 })
    );

    const hostAfterCall = await hostGet(
      createMockRequest(`http://localhost:3000/api/hosts/${host.id}`, 'GET'),
      { params: Promise.resolve({ id: host.id }) }
    );
    const afterData = (await hostAfterCall.json()).data;
    checkEqual(afterData.isInCall, false, 'Lifecycle: host isInCall restored to false');
    checkEqual(afterData.totalCalls, 1, 'Lifecycle: host totalCalls incremented to 1');

    // Step 5: Admin modifies host pricing & bio
    const patchRes = await hostPatch(
      createMockRequest(`http://localhost:3000/api/hosts/${host.id}`, 'PATCH', {
        coinRatePerMinute: 60,
        bio: 'Senior Top Rated Host',
      }),
      { params: Promise.resolve({ id: host.id }) }
    );
    checkEqual((await patchRes.json()).data.coinRatePerMinute, 60, 'Lifecycle: updated coin rate to 60');

    // Step 6: Host decommissioned / deleted
    const delRes = await hostDelete(
      createMockRequest(`http://localhost:3000/api/hosts/${host.id}`, 'DELETE'),
      { params: Promise.resolve({ id: host.id }) }
    );
    checkEqual(delRes.status, 200, 'Lifecycle: host deleted successfully');

    // Confirm 404 on subsequent lookup
    const lookupAfterDel = await hostGet(
      createMockRequest(`http://localhost:3000/api/hosts/${host.id}`, 'GET'),
      { params: Promise.resolve({ id: host.id }) }
    );
    checkEqual(lookupAfterDel.status, 404, 'Lifecycle: deleted host returns 404');
    metrics.tier4Count++;
    console.log('    ✓ 4.2: Host Lifecycle & State Transitions verified 100%');
  }

  // Scenario 4.3: Admin Moderation, Emergency Termination & Maintenance
  {
    console.log('\n  [Scenario 4.3: Admin Moderation & Emergency Controls]');
    // Step 1: Rogue active call initiated
    const rogueStart = await callStartPost(
      createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
        userId: testCallerId,
        hostId: 'lst_101',
      })
    );
    const rogueSessionId = (await rogueStart.json()).data.sessionId;

    // Step 2: Admin inspects active calls dashboard
    const activeRes = await callsGet(createMockRequest('http://localhost:3000/api/calls', 'GET'));
    const activeData = (await activeRes.json()).data;
    check(activeData.activeCalls.some((c) => c.id === rogueSessionId), 'Admin: rogue call visible on monitor');

    // Step 3: Admin issues immediate forced termination
    const termRes = await callTerminatePost(
      createMockRequest('http://localhost:3000/api/calls/terminate', 'POST', { callId: rogueSessionId })
    );
    checkEqual(termRes.status, 200, 'Admin: termination accepted');
    checkEqual((await termRes.json()).data.status, 'terminated_by_admin', 'Admin: marked terminated_by_admin');

    // Step 4: Admin places platform in emergency maintenance
    const maintRes = await configPatch(
      createMockRequest('http://localhost:3000/api/config', 'PATCH', {
        maintenanceMode: true,
        broadcastNotice: {
          active: true,
          title: '🚨 Scheduled Server Maintenance',
          message: 'DilSnap is currently undergoing scheduled maintenance. Please check back shortly.',
        },
      })
    );
    const maintConfig = (await maintRes.json()).data;
    checkEqual(maintConfig.maintenanceMode, true, 'Admin: maintenanceMode active');
    check(maintConfig.broadcastNotice.title.includes('Scheduled Server Maintenance'), 'Admin: emergency banner active');

    // Step 5: Admin concludes maintenance and restores normal operations
    const restoreRes = await configPatch(
      createMockRequest('http://localhost:3000/api/config', 'PATCH', {
        maintenanceMode: false,
        broadcastNotice: {
          active: true,
          title: '✨ Welcome to DilSnap!',
          message: 'Connect 1-on-1 with verified friendly hosts via HD Video & Audio calls.',
        },
      })
    );
    checkEqual((await restoreRes.json()).data.maintenanceMode, false, 'Admin: platform restored to normal');
    metrics.tier4Count++;
    console.log('    ✓ 4.3: Admin Moderation & Emergency Controls verified 100%');
  }

  // =================================================================
  // TEST SUITE SUMMARY & METRICS
  // =================================================================
  console.log('\n===============================================================');
  console.log('                 E2E TEST SUITE EXECUTION SUMMARY');
  console.log('===============================================================');
  console.log(`  Tier 1 (Feature Coverage):           ${metrics.tier1Count} tests passed`);
  console.log(`  Tier 2 (Boundary & Corner Cases):    ${metrics.tier2Count} tests passed`);
  console.log(`  Tier 3 (Cross-Feature Combinations): ${metrics.tier3Count} tests passed`);
  console.log(`  Tier 4 (Real-World Scenarios):       ${metrics.tier4Count} tests passed`);
  console.log('---------------------------------------------------------------');
  const totalTests = metrics.tier1Count + metrics.tier2Count + metrics.tier3Count + metrics.tier4Count;
  console.log(`  Total Test Cases Passed:             ${totalTests} / ${totalTests}`);
  console.log(`  Total Assertions Verified:           ${metrics.assertions}`);
  console.log(`  Pass Rate:                           100.0%`);
  console.log('===============================================================\n');

  check(metrics.assertions >= 60, `Minimum threshold >= 60 assertions met (${metrics.assertions})`);
}

runTestSuite()
  .then(() => {
    console.log('✓ SUCCESS: All End-to-End tests passed cleanly with zero errors.\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n✗ TEST SUITE FAILURE:', err);
    process.exit(1);
  });
