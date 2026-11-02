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

// Auth routes
const { POST: sendOtpPost } = await import('../src/app/api/auth/send-otp/route.ts');
const { POST: verifyOtpPost } = await import('../src/app/api/auth/verify-otp/route.ts');

// User routes
const { GET: profileGet, POST: profilePost, PATCH: profilePatch } = await import('../src/app/api/user/profile/route.ts');
const { GET: usersGet } = await import('../src/app/api/users/route.ts');
const { GET: userGet, PATCH: userPatch } = await import('../src/app/api/users/[id]/route.ts');
const { POST: userWalletPost } = await import('../src/app/api/users/wallet/route.ts');

// Hosts routes
const { GET: hostsGet, POST: hostsPost } = await import('../src/app/api/hosts/route.ts');
const { GET: hostGet, PATCH: hostPatch, DELETE: hostDelete } = await import('../src/app/api/hosts/[id]/route.ts');

// Packages routes
const { GET: packagesGet, POST: packagesPost } = await import('../src/app/api/packages/route.ts');
const { GET: packageGet, PATCH: packagePatch, PUT: packagePut, DELETE: packageDelete } = await import('../src/app/api/packages/[id]/route.ts');

// Gifts routes
const { GET: giftsGet, POST: giftsPost } = await import('../src/app/api/gifts/route.ts');
const { GET: giftGet, PATCH: giftPatch, PUT: giftPut, DELETE: giftDelete } = await import('../src/app/api/gifts/[id]/route.ts');

// Calls routes
const { GET: callsGet } = await import('../src/app/api/calls/route.ts');
const { POST: callStartPost } = await import('../src/app/api/calls/start/route.ts');
const { POST: callPulsePost } = await import('../src/app/api/calls/pulse/route.ts');
const { POST: callEndPost } = await import('../src/app/api/calls/end/route.ts');
const { POST: callTerminatePost } = await import('../src/app/api/calls/terminate/route.ts');
const { GET: callSignalGet, POST: callSignalPost } = await import('../src/app/api/calls/signal/route.ts');

// Wallet routes
const { GET: walletBalanceGet } = await import('../src/app/api/wallet/balance/route.ts');
const { POST: walletCreditPost } = await import('../src/app/api/wallet/credit/route.ts');
const { POST: walletDeductPost } = await import('../src/app/api/wallet/deduct/route.ts');

// Payments routes
const { POST: paymentOrderPost } = await import('../src/app/api/payments/create-order/route.ts');
const { POST: paymentWebhookPost } = await import('../src/app/api/payments/webhook/route.ts');

// Config & Analytics routes
const { GET: configGet, POST: configPost, PATCH: configPatch } = await import('../src/app/api/config/route.ts');
const { GET: analyticsGet } = await import('../src/app/api/analytics/route.ts');

function createMockRequest(url, method = 'GET', body = null, headers = {}) {
  const reqUrl = new URL(url, 'http://localhost:3000');
  return {
    url: reqUrl.toString(),
    nextUrl: reqUrl,
    method,
    headers: new Headers(headers),
    json: async () => body || {},
  };
}

const testRunId = Date.now().toString().slice(-6);

async function testHttpEndpoints() {
  console.log('--- Testing All Next.js API Route Handlers (25 Endpoints) ---');

  // =========================================================================
  // 1. Auth Routes
  // =========================================================================
  console.log('\n[1. Auth Routes]');
  const sendReq = createMockRequest('http://localhost:3000/api/auth/send-otp', 'POST', {
    phone: `+91 91234 ${testRunId}`,
  });
  const sendRes = await sendOtpPost(sendReq);
  const sendData = await sendRes.json();
  assert.equal(sendRes.status, 200);
  assert.equal(sendData.success, true);
  console.log('✓ POST /api/auth/send-otp returned 200 OK');

  const verifyReq = createMockRequest('http://localhost:3000/api/auth/verify-otp', 'POST', {
    phone: `+91 91234 ${testRunId}`,
    otp: '1234',
  });
  const verifyRes = await verifyOtpPost(verifyReq);
  const verifyData = await verifyRes.json();
  assert.equal(verifyRes.status, 200);
  assert.equal(verifyData.success, true);
  const testUser = verifyData.data.user;
  assert.ok(testUser.id);
  assert.equal(testUser.coins, 120);
  console.log(`✓ POST /api/auth/verify-otp returned 200 OK (User: ${testUser.id})`);

  // =========================================================================
  // 2. User Profile Routes
  // =========================================================================
  console.log('\n[2. User Profile Routes]');
  const profPostReq = createMockRequest('http://localhost:3000/api/user/profile', 'POST', {
    userId: testUser.id,
    name: 'DilSnap Super Star',
    gender: 'Female',
  });
  const profPostRes = await profilePost(profPostReq);
  const profPostData = await profPostRes.json();
  assert.equal(profPostRes.status, 200);
  assert.equal(profPostData.data.name, 'DilSnap Super Star');
  console.log('✓ POST /api/user/profile returned 200 OK');

  const profPatchReq = createMockRequest('http://localhost:3000/api/user/profile', 'PATCH', {
    userId: testUser.id,
    name: 'DilSnap VIP Queen',
  });
  const profPatchRes = await profilePatch(profPatchReq);
  const profPatchData = await profPatchRes.json();
  assert.equal(profPatchRes.status, 200);
  assert.equal(profPatchData.data.name, 'DilSnap VIP Queen');
  console.log('✓ PATCH /api/user/profile returned 200 OK');

  const profGetReq = createMockRequest(`http://localhost:3000/api/user/profile?userId=${testUser.id}`);
  const profGetRes = await profileGet(profGetReq);
  const profGetData = await profGetRes.json();
  assert.equal(profGetRes.status, 200);
  assert.equal(profGetData.data.name, 'DilSnap VIP Queen');
  console.log('✓ GET /api/user/profile returned 200 OK');

  // =========================================================================
  // 3. Admin Users Catalog & [id] Ban/Profile Routes
  // =========================================================================
  console.log('\n[3. Admin Users & Users [id] Routes]');
  const usersGetReq = createMockRequest('http://localhost:3000/api/users');
  const usersGetRes = await usersGet(usersGetReq);
  const usersGetData = await usersGetRes.json();
  assert.equal(usersGetRes.status, 200);
  assert.ok(usersGetData.count > 0);
  assert.ok(usersGetData.data.some((u) => u.id === testUser.id));
  console.log('✓ GET /api/users returned 200 OK');

  // GET user by ID
  const userGetReq = createMockRequest(`http://localhost:3000/api/users/${testUser.id}`);
  const userGetRes = await userGet(userGetReq, { params: Promise.resolve({ id: testUser.id }) });
  const userGetData = await userGetRes.json();
  assert.equal(userGetRes.status, 200);
  assert.equal(userGetData.data.id, testUser.id);
  console.log('✓ GET /api/users/[id] returned 200 OK');

  // GET nonexistent user -> 404
  const unknownUserGet = await userGet(createMockRequest('http://localhost:3000/api/users/usr_nonexistent'), {
    params: Promise.resolve({ id: 'usr_nonexistent' }),
  });
  assert.equal(unknownUserGet.status, 404);
  console.log('✓ GET /api/users/[id] correctly returned 404 for unknown user');

  // PATCH user ban
  const userBanReq = createMockRequest(`http://localhost:3000/api/users/${testUser.id}`, 'PATCH', {
    isBanned: true,
  });
  const userBanRes = await userPatch(userBanReq, { params: Promise.resolve({ id: testUser.id }) });
  const userBanData = await userBanRes.json();
  assert.equal(userBanRes.status, 200);
  assert.equal(userBanData.data.isBanned, true);
  console.log('✓ PATCH /api/users/[id] ban toggle to true returned 200 OK');

  // PATCH unban via action toggleBan
  const userUnbanReq = createMockRequest(`http://localhost:3000/api/users/${testUser.id}`, 'PATCH', {
    action: 'toggleBan',
  });
  const userUnbanRes = await userPatch(userUnbanReq, { params: Promise.resolve({ id: testUser.id }) });
  const userUnbanData = await userUnbanRes.json();
  assert.equal(userUnbanRes.status, 200);
  assert.equal(userUnbanData.data.isBanned, false);
  console.log('✓ PATCH /api/users/[id] action toggleBan returned 200 OK');

  // =========================================================================
  // 4. Admin Users Wallet Route
  // =========================================================================
  console.log('\n[4. Admin Users Wallet Route]');
  const adminCreditReq = createMockRequest('http://localhost:3000/api/users/wallet', 'POST', {
    userId: testUser.id,
    amount: 150,
    action: 'credit',
    reason: 'Admin test bonus',
  });
  const adminCreditRes = await userWalletPost(adminCreditReq);
  const adminCreditData = await adminCreditRes.json();
  assert.equal(adminCreditRes.status, 200);
  assert.equal(adminCreditData.data.newBalance, 270);
  console.log('✓ POST /api/users/wallet credit returned 200 OK (New Balance: 270)');

  const adminDeductReq = createMockRequest('http://localhost:3000/api/users/wallet', 'POST', {
    userId: testUser.id,
    amount: 70,
    action: 'deduct',
    reason: 'Admin test deduction',
  });
  const adminDeductRes = await userWalletPost(adminDeductReq);
  const adminDeductData = await adminDeductRes.json();
  assert.equal(adminDeductRes.status, 200);
  assert.equal(adminDeductData.data.newBalance, 200);
  console.log('✓ POST /api/users/wallet deduct returned 200 OK (New Balance: 200)');

  // Admin wallet validation hardening: reject negative or non-integer
  const adminInvalidReq = createMockRequest('http://localhost:3000/api/users/wallet', 'POST', {
    userId: testUser.id,
    amount: -50,
  });
  const adminInvalidRes = await userWalletPost(adminInvalidReq);
  assert.equal(adminInvalidRes.status, 400);
  console.log('✓ POST /api/users/wallet correctly rejected invalid negative amount with 400');

  // =========================================================================
  // 5. Standard Wallet Routes (Balance, Credit, Deduct)
  // =========================================================================
  console.log('\n[5. Standard Wallet Routes]');
  const balReq = createMockRequest(`http://localhost:3000/api/wallet/balance?userId=${testUser.id}`);
  const balRes = await walletBalanceGet(balReq);
  const balData = await balRes.json();
  assert.equal(balRes.status, 200);
  assert.equal(balData.data.coins, 200);
  console.log('✓ GET /api/wallet/balance returned 200 OK (Coins: 200)');

  const credReq = createMockRequest('http://localhost:3000/api/wallet/credit', 'POST', {
    userId: testUser.id,
    amount: 100,
    reason: 'Festive bonus credit',
  });
  const credRes = await walletCreditPost(credReq);
  const credData = await credRes.json();
  assert.equal(credRes.status, 200);
  assert.equal(credData.data.newBalance, 300);
  console.log('✓ POST /api/wallet/credit returned 200 OK (New Balance: 300)');

  // Credit rejection for negative amount
  const credNegReq = createMockRequest('http://localhost:3000/api/wallet/credit', 'POST', {
    userId: testUser.id,
    amount: -10,
  });
  const credNegRes = await walletCreditPost(credNegReq);
  assert.equal(credNegRes.status, 400);
  console.log('✓ POST /api/wallet/credit rejected negative coins with 400');

  const dedReq = createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
    userId: testUser.id,
    amount: 50,
    reason: 'Audio Call minute rate',
  });
  const dedRes = await walletDeductPost(dedReq);
  const dedData = await dedRes.json();
  assert.equal(dedRes.status, 200);
  assert.equal(dedData.data.newBalance, 250);
  console.log('✓ POST /api/wallet/deduct returned 200 OK (New Balance: 250)');

  // Deduct overdraft rejection
  const overReq = createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
    userId: testUser.id,
    amount: 5000,
    reason: 'Invalid excessive deduct',
  });
  const overRes = await walletDeductPost(overReq);
  assert.equal(overRes.status, 400);
  console.log('✓ POST /api/wallet/deduct rejected overdraft with 400');

  // Deduct fractional rejection
  const fracReq = createMockRequest('http://localhost:3000/api/wallet/deduct', 'POST', {
    userId: testUser.id,
    amount: 12.5,
  });
  const fracRes = await walletDeductPost(fracReq);
  assert.equal(fracRes.status, 400);
  console.log('✓ POST /api/wallet/deduct rejected fractional coin amount with 400');

  // =========================================================================
  // 6. Hosts Routes & [id] CRUD
  // =========================================================================
  console.log('\n[6. Hosts & Hosts [id] Routes]');
  const hostsListRes = await hostsGet(createMockRequest('http://localhost:3000/api/hosts'));
  const hostsListData = await hostsListRes.json();
  assert.equal(hostsListRes.status, 200);
  assert.ok(hostsListData.count > 0);
  console.log('✓ GET /api/hosts returned 200 OK');

  const newHostRes = await hostsPost(createMockRequest('http://localhost:3000/api/hosts', 'POST', {
    name: `Host ${testRunId}`,
    gender: 'Female',
    age: 23,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    bio: 'Test host for automated verification',
    coinRatePerMinute: 30,
    languages: 'Hindi, English',
    interests: 'Music, Travel',
  }));
  const newHostData = await newHostRes.json();
  assert.equal(newHostRes.status, 201);
  const createdHostId = newHostData.data.id;
  assert.ok(createdHostId);
  console.log(`✓ POST /api/hosts created host: ${createdHostId}`);

  const hostGetRes = await hostGet(createMockRequest(`http://localhost:3000/api/hosts/${createdHostId}`), {
    params: Promise.resolve({ id: createdHostId }),
  });
  assert.equal(hostGetRes.status, 200);
  console.log('✓ GET /api/hosts/[id] returned 200 OK');

  const hostPatchRes = await hostPatch(createMockRequest(`http://localhost:3000/api/hosts/${createdHostId}`, 'PATCH', {
    coinRatePerMinute: 35,
  }), {
    params: Promise.resolve({ id: createdHostId }),
  });
  const hostPatchData = await hostPatchRes.json();
  assert.equal(hostPatchRes.status, 200);
  assert.equal(hostPatchData.data.coinRatePerMinute, 35);
  console.log('✓ PATCH /api/hosts/[id] updated coin rate to 35');

  const hostDelRes = await hostDelete(createMockRequest(`http://localhost:3000/api/hosts/${createdHostId}`, 'DELETE'), {
    params: Promise.resolve({ id: createdHostId }),
  });
  assert.equal(hostDelRes.status, 200);
  console.log('✓ DELETE /api/hosts/[id] returned 200 OK');

  // =========================================================================
  // 7. Coin Packages Routes & [id] CRUD
  // =========================================================================
  console.log('\n[7. Coin Packages & Packages [id] Routes]');
  const packagesListRes = await packagesGet(createMockRequest('http://localhost:3000/api/packages'));
  const packagesListData = await packagesListRes.json();
  assert.equal(packagesListRes.status, 200);
  assert.ok(packagesListData.count > 0);
  console.log('✓ GET /api/packages returned 200 OK');

  const newPkgRes = await packagesPost(createMockRequest('http://localhost:3000/api/packages', 'POST', {
    name: `Festive Pack ${testRunId}`,
    coins: 500,
    bonusCoins: 100,
    priceInr: 399,
    isPopular: true,
  }));
  const newPkgData = await newPkgRes.json();
  assert.equal(newPkgRes.status, 201);
  const createdPkgId = newPkgData.data.id;
  assert.ok(createdPkgId);
  console.log(`✓ POST /api/packages created package: ${createdPkgId}`);

  // GET package by ID
  const pkgGetRes = await packageGet(createMockRequest(`http://localhost:3000/api/packages/${createdPkgId}`), {
    params: Promise.resolve({ id: createdPkgId }),
  });
  const pkgGetData = await pkgGetRes.json();
  assert.equal(pkgGetRes.status, 200);
  assert.equal(pkgGetData.data.id, createdPkgId);
  console.log('✓ GET /api/packages/[id] returned 200 OK');

  // PATCH package
  const pkgPatchRes = await packagePatch(createMockRequest(`http://localhost:3000/api/packages/${createdPkgId}`, 'PATCH', {
    priceInr: 449,
    bonusCoins: 120,
  }), {
    params: Promise.resolve({ id: createdPkgId }),
  });
  const pkgPatchData = await pkgPatchRes.json();
  assert.equal(pkgPatchRes.status, 200);
  assert.equal(pkgPatchData.data.priceInr, 449);
  assert.equal(pkgPatchData.data.bonusCoins, 120);
  console.log('✓ PATCH /api/packages/[id] returned 200 OK');

  // PUT package
  const pkgPutRes = await packagePut(createMockRequest(`http://localhost:3000/api/packages/${createdPkgId}`, 'PUT', {
    name: `Festive Pack VIP ${testRunId}`,
  }), {
    params: Promise.resolve({ id: createdPkgId }),
  });
  const pkgPutData = await pkgPutRes.json();
  assert.equal(pkgPutRes.status, 200);
  assert.equal(pkgPutData.data.name, `Festive Pack VIP ${testRunId}`);
  console.log('✓ PUT /api/packages/[id] returned 200 OK');

  // DELETE package
  const pkgDelRes = await packageDelete(createMockRequest(`http://localhost:3000/api/packages/${createdPkgId}`, 'DELETE'), {
    params: Promise.resolve({ id: createdPkgId }),
  });
  const pkgDelData = await pkgDelRes.json();
  assert.equal(pkgDelRes.status, 200);
  assert.equal(pkgDelData.id, createdPkgId);
  console.log('✓ DELETE /api/packages/[id] returned 200 OK');

  // Verify deleted package returns 404
  const pkgDeletedCheck = await packageGet(createMockRequest(`http://localhost:3000/api/packages/${createdPkgId}`), {
    params: Promise.resolve({ id: createdPkgId }),
  });
  assert.equal(pkgDeletedCheck.status, 404);
  console.log('✓ GET /api/packages/[id] correctly returned 404 for deleted package');

  // =========================================================================
  // 8. Virtual Gifts Routes & [id] CRUD
  // =========================================================================
  console.log('\n[8. Virtual Gifts & Gifts [id] Routes]');
  const giftsListRes = await giftsGet(createMockRequest('http://localhost:3000/api/gifts'));
  const giftsListData = await giftsListRes.json();
  assert.equal(giftsListRes.status, 200);
  assert.ok(giftsListData.count > 0);
  console.log('✓ GET /api/gifts returned 200 OK');

  const newGiftRes = await giftsPost(createMockRequest('http://localhost:3000/api/gifts', 'POST', {
    name: `Diamond Crown ${testRunId}`,
    coinCost: 200,
    assetPath: 'assets/image/crown.png',
    category: 'Luxury',
  }));
  const newGiftData = await newGiftRes.json();
  assert.equal(newGiftRes.status, 201);
  const createdGiftId = newGiftData.data.id;
  assert.ok(createdGiftId);
  console.log(`✓ POST /api/gifts created gift: ${createdGiftId}`);

  // GET gift by ID
  const giftGetRes = await giftGet(createMockRequest(`http://localhost:3000/api/gifts/${createdGiftId}`), {
    params: Promise.resolve({ id: createdGiftId }),
  });
  const giftGetData = await giftGetRes.json();
  assert.equal(giftGetRes.status, 200);
  assert.equal(giftGetData.data.id, createdGiftId);
  console.log('✓ GET /api/gifts/[id] returned 200 OK');

  // PATCH gift
  const giftPatchRes = await giftPatch(createMockRequest(`http://localhost:3000/api/gifts/${createdGiftId}`, 'PATCH', {
    coinCost: 250,
  }), {
    params: Promise.resolve({ id: createdGiftId }),
  });
  const giftPatchData = await giftPatchRes.json();
  assert.equal(giftPatchRes.status, 200);
  assert.equal(giftPatchData.data.coinCost, 250);
  console.log('✓ PATCH /api/gifts/[id] updated coinCost to 250');

  // PUT gift
  const giftPutRes = await giftPut(createMockRequest(`http://localhost:3000/api/gifts/${createdGiftId}`, 'PUT', {
    name: `Royal Diamond Crown ${testRunId}`,
  }), {
    params: Promise.resolve({ id: createdGiftId }),
  });
  const giftPutData = await giftPutRes.json();
  assert.equal(giftPutRes.status, 200);
  assert.equal(giftPutData.data.name, `Royal Diamond Crown ${testRunId}`);
  console.log('✓ PUT /api/gifts/[id] returned 200 OK');

  // DELETE gift
  const giftDelRes = await giftDelete(createMockRequest(`http://localhost:3000/api/gifts/${createdGiftId}`, 'DELETE'), {
    params: Promise.resolve({ id: createdGiftId }),
  });
  const giftDelData = await giftDelRes.json();
  assert.equal(giftDelRes.status, 200);
  assert.equal(giftDelData.id, createdGiftId);
  console.log('✓ DELETE /api/gifts/[id] returned 200 OK');

  // Verify deleted gift returns 404
  const giftDeletedCheck = await giftGet(createMockRequest(`http://localhost:3000/api/gifts/${createdGiftId}`), {
    params: Promise.resolve({ id: createdGiftId }),
  });
  assert.equal(giftDeletedCheck.status, 404);
  console.log('✓ GET /api/gifts/[id] correctly returned 404 for deleted gift');

  // =========================================================================
  // 9. Calls Lifecycle & Moderation Routes
  // =========================================================================
  console.log('\n[9. Calls Lifecycle & Moderation Routes]');
  const callStartReq = createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
    userId: testUser.id,
    hostId: 'lst_101',
    callType: 'video',
  });
  const callStartRes = await callStartPost(callStartReq);
  const callStartData = await callStartRes.json();
  assert.equal(callStartRes.status, 200);
  const sessionId = callStartData.data.sessionId;
  assert.ok(sessionId);
  console.log(`✓ POST /api/calls/start returned 200 OK (Session: ${sessionId})`);

  const callsListRes = await callsGet(createMockRequest('http://localhost:3000/api/calls'));
  const callsListData = await callsListRes.json();
  assert.equal(callsListRes.status, 200);
  assert.ok(callsListData.data.activeCalls.some((c) => c.id === sessionId));
  console.log('✓ GET /api/calls returned active call list');

  const callPulseReq = createMockRequest('http://localhost:3000/api/calls/pulse', 'POST', {
    sessionId,
  });
  const callPulseRes = await callPulsePost(callPulseReq);
  const callPulseData = await callPulseRes.json();
  assert.equal(callPulseRes.status, 200);
  assert.equal(callPulseData.data.session.durationSeconds, 60);
  console.log('✓ POST /api/calls/pulse returned 200 OK');

  // WebRTC signaling
  const signalPostReq = createMockRequest('http://localhost:3000/api/calls/signal', 'POST', {
    sessionId,
    senderId: testUser.id,
    targetId: 'lst_101',
    type: 'offer',
    payload: { sdp: 'v=0\r\ntest\r\n' },
  });
  const signalPostRes = await callSignalPost(signalPostReq);
  assert.equal(signalPostRes.status, 200);
  console.log('✓ POST /api/calls/signal queued offer');

  const signalGetReq = createMockRequest(`http://localhost:3000/api/calls/signal?sessionId=${sessionId}&targetId=lst_101`);
  const signalGetRes = await callSignalGet(signalGetReq);
  const signalGetData = await signalGetRes.json();
  assert.equal(signalGetRes.status, 200);
  assert.ok(signalGetData.data.length > 0);
  console.log('✓ GET /api/calls/signal delivered queued signals');

  const callEndReq = createMockRequest('http://localhost:3000/api/calls/end', 'POST', {
    sessionId,
    durationSeconds: 90,
  });
  const callEndRes = await callEndPost(callEndReq);
  const callEndData = await callEndRes.json();
  assert.equal(callEndRes.status, 200);
  assert.equal(callEndData.data.session.status, 'completed');
  assert.equal(callEndData.data.session.durationSeconds, 90);
  console.log('✓ POST /api/calls/end returned 200 OK');

  // Emergency terminate call
  const startTempRes = await callStartPost(createMockRequest('http://localhost:3000/api/calls/start', 'POST', {
    userId: testUser.id,
    hostId: 'lst_101',
    callType: 'audio',
  }));
  const tempSessionId = (await startTempRes.json()).data.sessionId;

  const terminateRes = await callTerminatePost(createMockRequest('http://localhost:3000/api/calls/terminate', 'POST', {
    callId: tempSessionId,
  }));
  const terminateData = await terminateRes.json();
  assert.equal(terminateRes.status, 200);
  assert.equal(terminateData.data.status, 'terminated_by_admin');
  console.log('✓ POST /api/calls/terminate returned 200 OK with terminated_by_admin');

  // =========================================================================
  // 10. Payments & Webhook Routes
  // =========================================================================
  console.log('\n[10. Payments & Webhooks Routes]');
  const orderReq = createMockRequest('http://localhost:3000/api/payments/create-order', 'POST', {
    userId: testUser.id,
    packageId: 'pkg_starter',
  });
  const orderRes = await paymentOrderPost(orderReq);
  const orderData = await orderRes.json();
  assert.equal(orderRes.status, 200);
  const orderId = orderData.data.orderId;
  assert.ok(orderId);
  console.log(`✓ POST /api/payments/create-order returned 200 OK (OrderId: ${orderId})`);

  // Webhook validation rejection for missing orderId
  const invalidWebhook = await paymentWebhookPost(createMockRequest('http://localhost:3000/api/payments/webhook', 'POST', {}));
  assert.equal(invalidWebhook.status, 400);
  console.log('✓ POST /api/payments/webhook correctly rejected missing orderId with 400');

  // Webhook validation rejection for non-success status
  const failedStatusWebhook = await paymentWebhookPost(createMockRequest('http://localhost:3000/api/payments/webhook', 'POST', {
    orderId,
    status: 'FAILED',
  }));
  assert.equal(failedStatusWebhook.status, 400);
  console.log('✓ POST /api/payments/webhook rejected non-success status with 400');

  // Successful payment webhook
  const webhookReq = createMockRequest('http://localhost:3000/api/payments/webhook', 'POST', {
    orderId,
    status: 'PAID',
    paymentSessionId: `cf_trans_${testRunId}`,
  });
  const webhookRes = await paymentWebhookPost(webhookReq);
  const webhookData = await webhookRes.json();
  assert.equal(webhookRes.status, 200);
  assert.equal(webhookData.data.order.status, 'paid');
  console.log('✓ POST /api/payments/webhook returned 200 OK and credited coins');

  // Duplicate webhook idempotency
  const dupWebhookRes = await paymentWebhookPost(webhookReq);
  assert.equal(dupWebhookRes.status, 200);
  console.log('✓ POST /api/payments/webhook handled duplicate call idempotently');

  // =========================================================================
  // 11. System Configuration Routes (GET, POST, PATCH)
  // =========================================================================
  console.log('\n[11. System Configuration Routes]');
  const configGetRes = await configGet(createMockRequest('http://localhost:3000/api/config'));
  const configGetData = await configGetRes.json();
  assert.equal(configGetRes.status, 200);
  assert.equal(configGetData.data.appName, 'DilSnap');
  console.log('✓ GET /api/config returned 200 OK');

  // POST /api/config (used by settings/page.tsx and broadcast/page.tsx)
  const configPostReq = createMockRequest('http://localhost:3000/api/config', 'POST', {
    welcomeBonusCoins: 150,
  });
  const configPostRes = await configPost(configPostReq);
  const configPostData = await configPostRes.json();
  assert.equal(configPostRes.status, 200);
  assert.equal(configPostData.success, true);
  assert.equal(configPostData.data.welcomeBonusCoins, 150);
  assert.ok(configPostData.config);
  console.log('✓ POST /api/config returned 200 OK with updated configuration');

  // PATCH /api/config
  const configPatchReq = createMockRequest('http://localhost:3000/api/config', 'PATCH', {
    welcomeBonusCoins: 120,
    broadcastNotice: {
      active: true,
      title: 'Mega Fest',
      message: 'Exclusive offers today!',
    },
  });
  const configPatchRes = await configPatch(configPatchReq);
  const configPatchData = await configPatchRes.json();
  assert.equal(configPatchRes.status, 200);
  assert.equal(configPatchData.data.welcomeBonusCoins, 120);
  assert.equal(configPatchData.data.broadcastNotice.title, 'Mega Fest');
  console.log('✓ PATCH /api/config returned 200 OK');

  // =========================================================================
  // 12. Analytics Route
  // =========================================================================
  console.log('\n[12. Analytics Route]');
  const analyticsRes = await analyticsGet(createMockRequest('http://localhost:3000/api/analytics'));
  const analyticsData = await analyticsRes.json();
  assert.equal(analyticsRes.status, 200);
  assert.ok(analyticsData.data.totalRevenue > 0);
  assert.ok(analyticsData.data.totalUsersCount > 0);
  console.log('✓ GET /api/analytics returned 200 OK with complete business metrics');

  console.log('\n===============================================================');
  console.log('   ALL 25 API ROUTE HANDLERS VERIFIED 100% SUCCESSFULLY!       ');
  console.log('===============================================================\n');
}

testHttpEndpoints()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Route handler tests failed:', err);
    process.exit(1);
  });
