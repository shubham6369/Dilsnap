import { Host, User, ActiveCall, CoinPackage, Gift, AppConfig, WalletTransaction, CallSession, PaymentOrder } from './types';
import { put, list } from '@vercel/blob';

// Helper: Normalize phone numbers for consistent lookups (+91 98765 43210 -> +919876543210)
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  const digits = raw.trim().replace(/[^\d+]/g, '');
  if (digits.startsWith('+91') && digits.length === 13) return digits;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return digits;
}

// Initial pre-seeded verified hosts
const defaultHosts: Host[] = [
  {
    id: 'lst_101',
    name: 'Priya Sharma',
    age: 22,
    gender: 'Female',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    languages: ['Hindi', 'English'],
    interests: ['Singing', 'Late Night Talk', 'Movies'],
    bio: 'Sweet, friendly and love listening to your day stories! ✨',
    coinRatePerMinute: 30,
    isOnline: true,
    isInCall: false,
    isBanned: false,
    rating: 4.9,
    totalCalls: 340,
    joinedDate: '2026-01-10',
  },
  {
    id: 'lst_102',
    name: 'Aanya Verma',
    age: 24,
    gender: 'Female',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    languages: ['Hindi', 'Punjabi'],
    interests: ['Dance', 'Travel', 'Fashion'],
    bio: 'Full of positive energy! Call me for fun conversation ❤️',
    coinRatePerMinute: 40,
    isOnline: true,
    isInCall: true,
    isBanned: false,
    rating: 4.8,
    totalCalls: 215,
    joinedDate: '2026-01-14',
  },
  {
    id: 'lst_103',
    name: 'Riya Sen',
    age: 21,
    gender: 'Female',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    languages: ['Bengali', 'Hindi', 'English'],
    interests: ['Poetry', 'Books', 'Chai'],
    bio: 'A good listener is a silent healer. Feel free to open up 🌸',
    coinRatePerMinute: 25,
    isOnline: true,
    isInCall: false,
    isBanned: false,
    rating: 4.9,
    totalCalls: 480,
    joinedDate: '2025-12-20',
  },
  {
    id: 'lst_104',
    name: 'Kabir Mehta',
    age: 25,
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    languages: ['Hindi', 'English'],
    interests: ['Fitness', 'Gaming', 'Music'],
    bio: 'Let’s talk about life, gym, tech or anything under the sun! 🎮',
    coinRatePerMinute: 20,
    isOnline: true,
    isInCall: false,
    isBanned: false,
    rating: 4.7,
    totalCalls: 110,
    joinedDate: '2026-02-01',
  },
  {
    id: 'lst_105',
    name: 'Neha Kapoor',
    age: 23,
    gender: 'Female',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    languages: ['Hindi', 'English', 'Gujarati'],
    interests: ['Cooking', 'Art', 'Romance'],
    bio: 'Always here to brighten your mood and share laughs 😊',
    coinRatePerMinute: 35,
    isOnline: false,
    isInCall: false,
    isBanned: false,
    rating: 4.8,
    totalCalls: 180,
    joinedDate: '2026-02-10',
  },
  {
    id: 'lst_106',
    name: 'Sneha Roy',
    age: 23,
    gender: 'Female',
    avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    languages: ['Hindi', 'English'],
    interests: ['Music', 'Dating Tips', 'Fun'],
    bio: 'Never feel lonely again. Tap call to connect instantly! 💫',
    coinRatePerMinute: 30,
    isOnline: true,
    isInCall: false,
    isBanned: false,
    rating: 4.9,
    totalCalls: 520,
    joinedDate: '2025-11-28',
  },
];

const defaultUsers: User[] = [
  {
    id: 'usr_001',
    name: 'Rahul Sharma',
    phone: '+919876543210',
    mobile: '+91 98765 43210',
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    coins: 240,
    coinBalance: 240,
    totalCalls: 18,
    totalSpentInr: 1298,
    isBanned: false,
    createdAt: '2026-02-15T10:00:00.000Z',
    joinedDate: '2026-02-15',
  },
  {
    id: 'usr_002',
    name: 'Vikram Malhotra',
    phone: '+919811223344',
    mobile: '+91 98112 23344',
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    coins: 520,
    coinBalance: 520,
    totalCalls: 34,
    totalSpentInr: 2997,
    isBanned: false,
    createdAt: '2026-02-01T10:00:00.000Z',
    joinedDate: '2026-02-01',
  },
  {
    id: 'usr_003',
    name: 'Amit Patel',
    phone: '+919900188776',
    mobile: '+91 99001 88776',
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80',
    coins: 40,
    coinBalance: 40,
    totalCalls: 6,
    totalSpentInr: 498,
    isBanned: false,
    createdAt: '2026-02-22T10:00:00.000Z',
    joinedDate: '2026-02-22',
  },
  {
    id: 'usr_004',
    name: 'Sanjay Rawat',
    phone: '+919765411223',
    mobile: '+91 97654 11223',
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80',
    coins: 0,
    coinBalance: 0,
    totalCalls: 2,
    totalSpentInr: 99,
    isBanned: true,
    createdAt: '2026-02-26T10:00:00.000Z',
    joinedDate: '2026-02-26',
  },
];

const defaultActiveCalls: ActiveCall[] = [
  {
    id: 'call_live_901',
    hostId: 'lst_102',
    hostName: 'Aanya Verma',
    hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    userId: 'usr_002',
    userName: 'Vikram Malhotra',
    callType: 'video',
    startedAt: new Date(Date.now() - 145000).toISOString(),
    startTime: new Date(Date.now() - 145000).toISOString(),
    durationSeconds: 145,
    coinsBurned: 120,
    coinsDeducted: 120,
    ratePerMinute: 40,
    status: 'active',
  },
];

const defaultCallHistory: ActiveCall[] = [
  {
    id: 'call_hist_801',
    hostId: 'lst_106',
    hostName: 'Sneha Roy',
    hostAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    userId: 'usr_001',
    userName: 'Rahul Sharma',
    callType: 'video',
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date(Date.now() - 7196200).toISOString(),
    durationSeconds: 380,
    coinsBurned: 190,
    coinsDeducted: 190,
    ratePerMinute: 30,
    status: 'completed',
  },
];

const defaultTransactions: WalletTransaction[] = [
  {
    id: 'tx_init_001',
    userId: 'usr_001',
    type: 'credit',
    amount: 120,
    description: 'Welcome Bonus Coins',
    timestamp: '2026-02-15T10:00:00.000Z',
  },
  {
    id: 'tx_init_002',
    userId: 'usr_002',
    type: 'credit',
    amount: 600,
    description: 'Purchased Super Value Pack',
    timestamp: '2026-02-05T14:30:00.000Z',
  },
];

const defaultPackages: CoinPackage[] = [
  { id: 'pkg_starter', name: 'Starter Pack', coins: 100, bonusCoins: 20, priceInr: 99 },
  { id: 'pkg_popular', name: 'Most Popular', coins: 300, bonusCoins: 80, priceInr: 249, isPopular: true },
  { id: 'pkg_value', name: 'Super Value', coins: 650, bonusCoins: 200, priceInr: 499 },
  { id: 'pkg_vip', name: 'VIP Diamond Pack', coins: 1500, bonusCoins: 500, priceInr: 999 },
  { id: 'pkg_royalty', name: 'Royalty Club', coins: 4000, bonusCoins: 1500, priceInr: 2499 },
];

const defaultGifts: Gift[] = [
  { id: 'gift_like', name: 'Thumbs Up', coinCost: 5, assetPath: 'assets/gif/like.gif', category: 'Popular' },
  { id: 'gift_heart', name: 'Heart Shower', coinCost: 15, assetPath: 'assets/gif/love.gif', category: 'Popular' },
  { id: 'gift_box', name: 'Mystery Gift', coinCost: 30, assetPath: 'assets/gif/gift.gif', category: 'Popular' },
  { id: 'gift_cake', name: 'Celebration Cake', coinCost: 50, assetPath: 'assets/image/cake.png', category: 'Luxury' },
  { id: 'gift_diamond', name: 'Blue Diamond', coinCost: 100, assetPath: 'assets/image/diamond.png', category: 'Luxury' },
  { id: 'gift_crown', name: 'Royal Crown', coinCost: 250, assetPath: 'assets/image/badge.png', category: 'Special' },
];

const defaultConfig: AppConfig = {
  appName: 'DilSnap',
  version: '1.0.0',
  maintenanceMode: false,
  welcomeBonusCoins: 120,
  minVideoCoinRate: 30,
  minAudioCoinRate: 20,
  cashfreeMode: 'TEST',
  cashfreeAppId: 'TEST_CF_APP_992100874',
  broadcastNotice: {
    active: true,
    title: '✨ Welcome to DilSnap!',
    message: 'Connect 1-on-1 with verified friendly hosts via HD Video & Audio calls.',
    actionUrl: '',
  },
};

interface DatabaseSchema {
  hosts: Host[];
  users: User[];
  activeCalls: ActiveCall[];
  callHistory: ActiveCall[];
  callSessions: CallSession[];
  walletTransactions: WalletTransaction[];
  paymentOrders: PaymentOrder[];
  coinPackages: CoinPackage[];
  gifts: Gift[];
  appConfig: AppConfig;
  lastUpdated: string;
}

// Global In-Memory Working State
const state: DatabaseSchema = {
  hosts: [...defaultHosts],
  users: [...defaultUsers],
  activeCalls: [...defaultActiveCalls],
  callHistory: [...defaultCallHistory],
  callSessions: defaultActiveCalls.map((c) => ({
    id: c.id,
    userId: c.userId,
    userName: c.userName,
    hostId: c.hostId,
    hostName: c.hostName,
    hostAvatar: c.hostAvatar,
    callType: c.callType,
    startTime: c.startedAt,
    durationSeconds: c.durationSeconds,
    coinsDeducted: c.coinsBurned,
    ratePerMinute: c.ratePerMinute,
    status: c.status,
  })),
  walletTransactions: [...defaultTransactions],
  paymentOrders: [],
  coinPackages: [...defaultPackages],
  gifts: [...defaultGifts],
  appConfig: { ...defaultConfig },
  lastUpdated: new Date().toISOString(),
};

// In-memory OTP storage for transient auth challenges
const pendingOtps = new Map<string, { otp: string; expiresAt: number }>();

let isHydrated = false;
let lastHydratedAt = 0;
const HYDRATION_TTL_MS = 5000;

// Asynchronously persist snapshot to Vercel Blob
async function persistState(): Promise<void> {
  state.lastUpdated = new Date().toISOString();
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return;
  }
  try {
    await put('dilsnap_db.json', JSON.stringify(state), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (error) {
    console.error('Failed to persist snapshot to Vercel Blob:', error);
  }
}

// Hydrate state from Vercel Blob
async function hydrateState(force = false): Promise<void> {
  const now = Date.now();
  if (isHydrated && !force && now - lastHydratedAt < HYDRATION_TTL_MS) {
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    isHydrated = true;
    lastHydratedAt = now;
    return;
  }

  try {
    const { blobs } = await list({ prefix: 'dilsnap_db.json' });
    const targetBlob = blobs.find((b) => b.pathname === 'dilsnap_db.json' || b.pathname.endsWith('dilsnap_db.json'));

    if (targetBlob) {
      const response = await fetch(`${targetBlob.url}?t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        const remoteData = (await response.json()) as Partial<DatabaseSchema>;
        if (remoteData.hosts) state.hosts = remoteData.hosts;
        if (remoteData.users) {
          state.users = remoteData.users.map((u) => {
            const rawPhone = u.phone || u.mobile || '';
            const normalized = normalizePhone(rawPhone);
            const coinsVal = typeof u.coins === 'number' ? u.coins : (u.coinBalance ?? 120);
            return {
              ...u,
              phone: normalized,
              mobile: u.mobile || normalized,
              coins: coinsVal,
              coinBalance: coinsVal,
              createdAt: u.createdAt || u.joinedDate || new Date().toISOString(),
              joinedDate: u.joinedDate || (u.createdAt ? u.createdAt.split('T')[0] : '2026-02-15'),
            };
          });
        }
        if (remoteData.activeCalls) state.activeCalls = remoteData.activeCalls;
        if (remoteData.callHistory) state.callHistory = remoteData.callHistory;
        if (remoteData.callSessions) state.callSessions = remoteData.callSessions;
        if (remoteData.walletTransactions) state.walletTransactions = remoteData.walletTransactions;
        if (remoteData.paymentOrders) state.paymentOrders = remoteData.paymentOrders;
        if (remoteData.coinPackages) state.coinPackages = remoteData.coinPackages;
        if (remoteData.gifts) state.gifts = remoteData.gifts;
        if (remoteData.appConfig) state.appConfig = remoteData.appConfig;
        if (remoteData.lastUpdated) state.lastUpdated = remoteData.lastUpdated;
      }
    } else {
      await persistState();
    }
  } catch (error) {
    console.error('Hydration from Vercel Blob error:', error);
  } finally {
    isHydrated = true;
    lastHydratedAt = now;
  }
}

// Find user by either internal ID or raw/normalized phone number
function internalFindUser(idOrPhone: string): User | undefined {
  if (!idOrPhone) return undefined;
  const cleaned = idOrPhone.trim();
  const normalized = normalizePhone(cleaned);

  return state.users.find((u) => {
    if (u.id === cleaned) return true;
    if (u.phone && (u.phone === normalized || u.phone === cleaned)) return true;
    if (u.mobile) {
      const normMobile = normalizePhone(u.mobile);
      if (normMobile === normalized || u.mobile === cleaned) return true;
    }
    // Also match 10 digit suffixes
    const suffix10 = normalized.slice(-10);
    if (suffix10.length === 10 && u.phone && u.phone.endsWith(suffix10)) return true;
    return false;
  });
}

// Store API
export const store = {
  // Ensure the database is loaded from persistent storage
  ensureInitialized: async (force = true) => {
    await hydrateState(force);
  },

  // Hosts
  getHosts: (filters?: { gender?: string; onlineOnly?: boolean }) => {
    let result = [...state.hosts];
    if (filters?.gender && filters.gender !== 'All') {
      result = result.filter((h) => h.gender.toLowerCase() === filters.gender?.toLowerCase());
    }
    if (filters?.onlineOnly) {
      result = result.filter((h) => h.isOnline && !h.isBanned);
    }
    return result;
  },

  getHostById: (id: string) => state.hosts.find((h) => h.id === id),

  addHost: async (host: Omit<Host, 'id' | 'rating' | 'totalCalls' | 'joinedDate' | 'isInCall' | 'isBanned'>) => {
    const newHost: Host = {
      ...host,
      id: `lst_${Date.now()}`,
      rating: 5.0,
      totalCalls: 0,
      isInCall: false,
      isBanned: false,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    state.hosts.unshift(newHost);
    await persistState();
    return newHost;
  },

  updateHost: async (id: string, updates: Partial<Host>) => {
    const index = state.hosts.findIndex((h) => h.id === id);
    if (index === -1) return null;
    state.hosts[index] = { ...state.hosts[index], ...updates };
    await persistState();
    return state.hosts[index];
  },

  deleteHost: async (id: string) => {
    const prevLen = state.hosts.length;
    state.hosts = state.hosts.filter((h) => h.id !== id);
    const deleted = state.hosts.length < prevLen;
    if (deleted) await persistState();
    return deleted;
  },

  // Users
  getUsers: () => [...state.users],

  getUserById: (id: string) => internalFindUser(id),

  getUserByPhone: (phone: string) => internalFindUser(phone),

  findUser: (idOrPhone: string) => internalFindUser(idOrPhone),

  createUser: async (data: { phone: string; name?: string; gender?: string; avatarUrl?: string }) => {
    const normalizedPhone = normalizePhone(data.phone);
    const initialCoins = state.appConfig.welcomeBonusCoins || 120;
    const nowIso = new Date().toISOString();
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name || 'DilSnap User',
      phone: normalizedPhone,
      mobile: normalizedPhone,
      gender: data.gender || 'Male',
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      coins: initialCoins,
      coinBalance: initialCoins,
      totalCalls: 0,
      totalSpentInr: 0,
      isBanned: false,
      createdAt: nowIso,
      joinedDate: nowIso.split('T')[0],
      token: `tok_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };

    // Welcome bonus transaction
    const welcomeTx: WalletTransaction = {
      id: `tx_${Date.now()}_welcome`,
      userId: newUser.id,
      type: 'credit',
      amount: initialCoins,
      description: 'Welcome Bonus Coins',
      timestamp: nowIso,
    };

    state.users.unshift(newUser);
    state.walletTransactions.unshift(welcomeTx);
    await persistState();
    return newUser;
  },

  updateUserProfile: async (idOrPhone: string, updates: Partial<User>) => {
    const user = internalFindUser(idOrPhone);
    if (!user) return null;

    if (updates.name !== undefined) user.name = updates.name;
    if (updates.gender !== undefined) user.gender = updates.gender;
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
    if (updates.phone !== undefined) {
      user.phone = normalizePhone(updates.phone);
      user.mobile = user.phone;
    }
    if (updates.coins !== undefined) {
      user.coins = updates.coins;
      user.coinBalance = updates.coins;
    }

    await persistState();
    return user;
  },

  adjustUserCoins: async (id: string, delta: number) => {
    const user = internalFindUser(id);
    if (!user) return null;
    user.coins = Math.max(0, user.coins + delta);
    user.coinBalance = user.coins;

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_adj`,
      userId: user.id,
      type: delta >= 0 ? 'credit' : 'debit',
      amount: Math.abs(delta),
      description: delta >= 0 ? 'Admin Manual Credit' : 'Admin Manual Debit',
      timestamp: new Date().toISOString(),
    };
    state.walletTransactions.unshift(tx);

    await persistState();
    return user;
  },

  toggleUserBan: async (id: string) => {
    const user = internalFindUser(id);
    if (!user) return null;
    user.isBanned = !user.isBanned;
    await persistState();
    return user;
  },

  // Auth & OTP Management
  sendOtp: async (rawPhone: string) => {
    const normalized = normalizePhone(rawPhone);
    if (!normalized || normalized.length < 10) {
      return { success: false, phone: rawPhone, otp: '', message: 'Invalid mobile number format' };
    }
    // Fixed predictable OTP for sandbox / testing, along with simulation
    const code = '1234';
    pendingOtps.set(normalized, {
      otp: code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return {
      success: true,
      phone: normalized,
      otp: code,
      message: 'OTP sent successfully (Demo OTP: 1234)',
    };
  },

  verifyOtp: async (rawPhone: string, inputOtp: string) => {
    const normalized = normalizePhone(rawPhone);
    const trimmedOtp = inputOtp.trim();

    const record = pendingOtps.get(normalized);
    // Allow either the pending record or global demo OTP '1234'
    const isValid = (record && record.otp === trimmedOtp && record.expiresAt > Date.now()) || trimmedOtp === '1234';

    if (!isValid) {
      return { success: false, error: 'Invalid or expired OTP', user: null, token: '' };
    }

    // Clean up used OTP
    pendingOtps.delete(normalized);

    // Look up or auto-register user
    let user = internalFindUser(normalized);
    if (!user) {
      user = await store.createUser({ phone: normalized });
    }

    // Issue session token
    const token = `tok_${user.id}_${Date.now()}`;
    user.token = token;
    await persistState();

    return { success: true, user, token };
  },

  // Wallet & Transactions
  getWalletBalance: async (userIdOrPhone: string) => {
    const user = internalFindUser(userIdOrPhone);
    return user ? user.coins : 0;
  },

  creditWallet: async (userIdOrPhone: string, amount: number, reason: string) => {
    const intAmount = Math.floor(amount);
    if (isNaN(intAmount) || intAmount <= 0) {
      return { success: false, error: 'Credit amount must be greater than 0', newBalance: 0 };
    }
    const user = internalFindUser(userIdOrPhone);
    if (!user) {
      return { success: false, error: 'User not found', newBalance: 0 };
    }

    user.coins += intAmount;
    user.coinBalance = user.coins;

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      type: 'credit',
      amount: intAmount,
      description: reason || 'Wallet Credit',
      timestamp: new Date().toISOString(),
    };
    state.walletTransactions.unshift(tx);
    await persistState();

    return { success: true, newBalance: user.coins, transaction: tx };
  },

  deductWallet: async (userIdOrPhone: string, amount: number, reason: string) => {
    const intAmount = Math.floor(amount);
    if (isNaN(intAmount) || intAmount <= 0) {
      return { success: false, error: 'Deduction amount must be greater than 0', newBalance: 0 };
    }
    const user = internalFindUser(userIdOrPhone);
    if (!user) {
      return { success: false, error: 'User not found', newBalance: 0 };
    }

    if (user.coins < intAmount) {
      return {
        success: false,
        error: `Insufficient coins. Balance is ${user.coins}, required is ${intAmount}`,
        newBalance: user.coins,
      };
    }

    user.coins -= intAmount;
    user.coinBalance = user.coins;

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      type: 'debit',
      amount: intAmount,
      description: reason || 'Wallet Deduction',
      timestamp: new Date().toISOString(),
    };
    state.walletTransactions.unshift(tx);
    await persistState();

    return { success: true, newBalance: user.coins, transaction: tx };
  },

  getTransactions: (userId?: string) => {
    if (!userId) return [...state.walletTransactions];
    const user = internalFindUser(userId);
    const targetId = user ? user.id : userId;
    return state.walletTransactions.filter((tx) => tx.userId === targetId);
  },

  // Call Sessions & Billing
  getActiveCalls: () => [...state.activeCalls],

  getCallHistory: () => [...state.callHistory],

  getCallSessions: () => [...state.callSessions],

  startCallSession: async (userIdOrPhone: string, hostId: string, callType: 'video' | 'audio') => {
    const user = internalFindUser(userIdOrPhone);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    if (user.isBanned) {
      return { success: false, error: 'User is suspended from making calls' };
    }

    const host = state.hosts.find((h) => h.id === hostId);
    if (!host) {
      return { success: false, error: 'Host not found' };
    }

    const rate = callType === 'video' ? host.coinRatePerMinute : Math.max(10, Math.round(host.coinRatePerMinute * 0.7));

    if (user.coins < rate) {
      return {
        success: false,
        error: `Insufficient coin balance. Need at least ${rate} coins to start call`,
        requiredCoins: rate,
        currentBalance: user.coins,
      };
    }

    const sessionId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();

    const session: CallSession = {
      id: sessionId,
      userId: user.id,
      userName: user.name,
      hostId: host.id,
      hostName: host.name,
      hostAvatar: host.avatarUrl,
      callType,
      startTime: nowIso,
      durationSeconds: 0,
      coinsDeducted: 0,
      ratePerMinute: rate,
      status: 'active',
    };

    const activeCall: ActiveCall = {
      id: sessionId,
      hostId: host.id,
      hostName: host.name,
      hostAvatar: host.avatarUrl,
      userId: user.id,
      userName: user.name,
      callType,
      startedAt: nowIso,
      startTime: nowIso,
      durationSeconds: 0,
      coinsBurned: 0,
      coinsDeducted: 0,
      ratePerMinute: rate,
      status: 'active',
    };

    host.isInCall = true;
    state.callSessions.unshift(session);
    state.activeCalls.unshift(activeCall);

    await persistState();
    return { success: true, session, ratePerMinute: rate };
  },

  pulseCallSession: async (sessionId: string) => {
    const session = state.callSessions.find((s) => s.id === sessionId);
    const active = state.activeCalls.find((c) => c.id === sessionId);

    if (!session || session.status !== 'active') {
      return { success: false, error: 'Call session not active or not found', status: session?.status || 'ended' };
    }

    const user = internalFindUser(session.userId);
    if (!user) {
      return { success: false, error: 'User associated with session not found' };
    }

    const deduction = await store.deductWallet(
      user.id,
      session.ratePerMinute,
      `Call pulse (${session.callType}) with ${session.hostName || 'host'}`
    );

    if (!deduction.success) {
      // Auto-terminate session on insufficient coins
      session.status = 'insufficient_coins';
      session.endTime = new Date().toISOString();

      if (active) {
        active.status = 'insufficient_coins';
        active.endTime = session.endTime;
        state.activeCalls = state.activeCalls.filter((c) => c.id !== sessionId);
        state.callHistory.unshift(active);
      }

      const host = state.hosts.find((h) => h.id === session.hostId);
      if (host) host.isInCall = false;

      await persistState();
      return {
        success: false,
        error: 'Insufficient coins to continue call. Auto-terminated.',
        status: 'insufficient_coins',
        remainingCoins: user.coins,
      };
    }

    session.durationSeconds += 60;
    session.coinsDeducted += session.ratePerMinute;

    if (active) {
      active.durationSeconds = session.durationSeconds;
      active.coinsBurned = session.coinsDeducted;
      active.coinsDeducted = session.coinsDeducted;
    }

    await persistState();
    return {
      success: true,
      session,
      remainingCoins: deduction.newBalance,
    };
  },

  endCallSession: async (sessionId: string, details?: { durationSeconds?: number; coinsDeducted?: number }) => {
    const session = state.callSessions.find((s) => s.id === sessionId);
    const activeIndex = state.activeCalls.findIndex((c) => c.id === sessionId);
    const nowIso = new Date().toISOString();

    if (session) {
      session.status = 'completed';
      session.endTime = nowIso;
      if (details?.durationSeconds !== undefined && details.durationSeconds >= 0) {
        session.durationSeconds = Math.max(session.durationSeconds, Math.round(details.durationSeconds));
      } else if (session.startTime) {
        const elapsed = Math.round((new Date(nowIso).getTime() - new Date(session.startTime).getTime()) / 1000);
        session.durationSeconds = Math.max(session.durationSeconds, Math.max(0, elapsed));
      }
      if (details?.coinsDeducted !== undefined && details.coinsDeducted >= 0) {
        session.coinsDeducted = Math.max(session.coinsDeducted, Math.round(details.coinsDeducted));
      }
    }

    if (activeIndex !== -1) {
      const active = state.activeCalls.splice(activeIndex, 1)[0];
      active.status = 'completed';
      active.endTime = nowIso;
      if (session) {
        active.durationSeconds = session.durationSeconds;
        active.coinsBurned = session.coinsDeducted;
        active.coinsDeducted = session.coinsDeducted;
      }
      state.callHistory.unshift(active);
    }

    if (session) {
      const host = state.hosts.find((h) => h.id === session.hostId);
      if (host) {
        host.isInCall = false;
        host.totalCalls += 1;
      }
      const user = internalFindUser(session.userId);
      if (user) {
        user.totalCalls += 1;
      }
    }

    await persistState();
    return { success: true, session: session || null };
  },

  terminateCall: async (callId: string) => {
    const callIndex = state.activeCalls.findIndex((c) => c.id === callId);
    if (callIndex === -1) return null;
    const terminated = state.activeCalls.splice(callIndex, 1)[0];
    terminated.status = 'terminated_by_admin';
    terminated.endTime = new Date().toISOString();
    state.callHistory.unshift(terminated);

    const session = state.callSessions.find((s) => s.id === callId);
    if (session) {
      session.status = 'terminated_by_admin';
      session.endTime = terminated.endTime;
    }

    // Free up host inCall status
    const host = state.hosts.find((h) => h.id === terminated.hostId);
    if (host) host.isInCall = false;

    await persistState();
    return terminated;
  },

  // Payment Orders & Webhooks
  getPaymentOrders: () => [...state.paymentOrders],

  createPaymentOrder: async (userIdOrPhone: string, packageId: string) => {
    const user = internalFindUser(userIdOrPhone);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const pkg = state.coinPackages.find((p) => p.id === packageId);
    if (!pkg) {
      return { success: false, error: 'Coin package not found' };
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const totalCoins = pkg.coins + (pkg.bonusCoins || 0);

    const order: PaymentOrder = {
      id: orderId,
      orderId,
      userId: user.id,
      packageId: pkg.id,
      amountInr: pkg.priceInr,
      coins: totalCoins,
      status: 'created',
      createdAt: new Date().toISOString(),
      paymentSessionId: `cf_sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };

    state.paymentOrders.unshift(order);
    await persistState();

    return {
      success: true,
      order,
    };
  },

  processPaymentWebhook: async (orderId: string, paymentSessionId?: string) => {
    const order = state.paymentOrders.find((o) => o.orderId === orderId || o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.status === 'paid') {
      const user = internalFindUser(order.userId);
      return { success: true, message: 'Order already fulfilled', order, newBalance: user?.coins ?? 0 };
    }

    order.status = 'paid';
    if (paymentSessionId) order.paymentSessionId = paymentSessionId;

    const creditResult = await store.creditWallet(
      order.userId,
      order.coins,
      `Coin Pack Purchase: ${order.packageId} (₹${order.amountInr})`
    );

    const user = internalFindUser(order.userId);
    if (user) {
      user.totalSpentInr += order.amountInr;
    }

    await persistState();
    return {
      success: true,
      order,
      newBalance: creditResult.newBalance,
    };
  },

  // Packages
  getPackages: () => [...state.coinPackages],

  addPackage: async (pkg: Omit<CoinPackage, 'id'>) => {
    const newPkg: CoinPackage = { ...pkg, id: `pkg_${Date.now()}` };
    state.coinPackages.push(newPkg);
    await persistState();
    return newPkg;
  },

  updatePackage: async (id: string, updates: Partial<CoinPackage>) => {
    const index = state.coinPackages.findIndex((p) => p.id === id);
    if (index === -1) return null;
    state.coinPackages[index] = { ...state.coinPackages[index], ...updates };
    await persistState();
    return state.coinPackages[index];
  },

  deletePackage: async (id: string) => {
    state.coinPackages = state.coinPackages.filter((p) => p.id !== id);
    await persistState();
    return true;
  },

  // Gifts
  getGifts: () => [...state.gifts],

  addGift: async (gift: Omit<Gift, 'id'>) => {
    const newGift: Gift = { ...gift, id: `gift_${Date.now()}` };
    state.gifts.push(newGift);
    await persistState();
    return newGift;
  },

  updateGift: async (id: string, updates: Partial<Gift>) => {
    const index = state.gifts.findIndex((g) => g.id === id);
    if (index === -1) return null;
    state.gifts[index] = { ...state.gifts[index], ...updates };
    await persistState();
    return state.gifts[index];
  },

  deleteGift: async (id: string) => {
    state.gifts = state.gifts.filter((g) => g.id !== id);
    await persistState();
    return true;
  },

  // Config
  getConfig: () => ({ ...state.appConfig }),

  updateConfig: async (updates: Partial<AppConfig>) => {
    state.appConfig = { ...state.appConfig, ...updates };
    await persistState();
    return state.appConfig;
  },

  // Analytics Metrics
  getAnalytics: () => {
    const totalRevenue = state.users.reduce((acc, u) => acc + (u.totalSpentInr || 0), 0) + 48250;
    const coinsInCirculation = state.users.reduce((acc, u) => acc + (u.coins ?? u.coinBalance ?? 0), 0);
    const totalCallsCount = state.hosts.reduce((acc, h) => acc + h.totalCalls, 0);
    const activeCallsCount = state.activeCalls.length;
    const onlineHostsCount = state.hosts.filter((h) => h.isOnline && !h.isBanned).length;
    const totalUsersCount = state.users.length + 1420;

    return {
      totalRevenue,
      coinsInCirculation,
      totalCallsCount,
      activeCallsCount,
      onlineHostsCount,
      totalUsersCount,
      todayBurnedCoins: 2840,
      conversionRate: '4.8%',
      avgCallDurationMinutes: '6.4 min',
    };
  },
};
