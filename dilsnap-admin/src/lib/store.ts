import { Host, User, ActiveCall, CoinPackage, Gift, AppConfig } from './types';
import { put, list } from '@vercel/blob';

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
    mobile: '+91 98765 43210',
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    coinBalance: 240,
    totalCalls: 18,
    totalSpentInr: 1298,
    isBanned: false,
    joinedDate: '2026-02-15',
  },
  {
    id: 'usr_002',
    name: 'Vikram Malhotra',
    mobile: '+91 98112 23344',
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    coinBalance: 520,
    totalCalls: 34,
    totalSpentInr: 2997,
    isBanned: false,
    joinedDate: '2026-02-01',
  },
  {
    id: 'usr_003',
    name: 'Amit Patel',
    mobile: '+91 99001 88776',
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80',
    coinBalance: 40,
    totalCalls: 6,
    totalSpentInr: 498,
    isBanned: false,
    joinedDate: '2026-02-22',
  },
  {
    id: 'usr_004',
    name: 'Sanjay Rawat',
    mobile: '+91 97654 11223',
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80',
    coinBalance: 0,
    totalCalls: 2,
    totalSpentInr: 99,
    isBanned: true,
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
    durationSeconds: 145,
    coinsBurned: 120,
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
    durationSeconds: 380,
    coinsBurned: 190,
    ratePerMinute: 30,
    status: 'completed',
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
  coinPackages: CoinPackage[];
  gifts: Gift[];
  appConfig: AppConfig;
  lastUpdated: string;
}

// Global In-Memory Working State
let state: DatabaseSchema = {
  hosts: [...defaultHosts],
  users: [...defaultUsers],
  activeCalls: [...defaultActiveCalls],
  callHistory: [...defaultCallHistory],
  coinPackages: [...defaultPackages],
  gifts: [...defaultGifts],
  appConfig: { ...defaultConfig },
  lastUpdated: new Date().toISOString(),
};

let isHydrated = false;
let lastHydratedAt = 0;
const HYDRATION_TTL_MS = 5000; // Re-check blob every 5 seconds on active lambdas

// Asynchronously persist the current database state to Vercel Blob
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
        if (remoteData.users) state.users = remoteData.users;
        if (remoteData.activeCalls) state.activeCalls = remoteData.activeCalls;
        if (remoteData.callHistory) state.callHistory = remoteData.callHistory;
        if (remoteData.coinPackages) state.coinPackages = remoteData.coinPackages;
        if (remoteData.gifts) state.gifts = remoteData.gifts;
        if (remoteData.appConfig) state.appConfig = remoteData.appConfig;
        if (remoteData.lastUpdated) state.lastUpdated = remoteData.lastUpdated;
      }
    } else {
      // First run: save defaults into the blob store
      await persistState();
    }
  } catch (error) {
    console.error('Hydration from Vercel Blob error:', error);
  } finally {
    isHydrated = true;
    lastHydratedAt = now;
  }
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

  getUserById: (id: string) => state.users.find((u) => u.id === id),

  adjustUserCoins: async (id: string, delta: number) => {
    const user = state.users.find((u) => u.id === id);
    if (!user) return null;
    user.coinBalance = Math.max(0, user.coinBalance + delta);
    await persistState();
    return user;
  },

  toggleUserBan: async (id: string) => {
    const user = state.users.find((u) => u.id === id);
    if (!user) return null;
    user.isBanned = !user.isBanned;
    await persistState();
    return user;
  },

  // Calls
  getActiveCalls: () => [...state.activeCalls],

  getCallHistory: () => [...state.callHistory],

  terminateCall: async (callId: string) => {
    const callIndex = state.activeCalls.findIndex((c) => c.id === callId);
    if (callIndex === -1) return null;
    const terminated = state.activeCalls.splice(callIndex, 1)[0];
    terminated.status = 'terminated_by_admin';
    state.callHistory.unshift(terminated);

    // Free up host inCall status
    const host = state.hosts.find((h) => h.id === terminated.hostId);
    if (host) host.isInCall = false;

    await persistState();
    return terminated;
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
    const totalRevenue = state.users.reduce((acc, u) => acc + u.totalSpentInr, 0) + 48250;
    const coinsInCirculation = state.users.reduce((acc, u) => acc + u.coinBalance, 0);
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
