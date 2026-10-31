import { Host, User, ActiveCall, CoinPackage, Gift, AppConfig } from './types';

// Pre-seeded verified hosts matching the DilSnap mobile app
let hosts: Host[] = [
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

let users: User[] = [
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

let activeCalls: ActiveCall[] = [
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
  {
    id: 'call_live_902',
    hostId: 'lst_101',
    hostName: 'Priya Sharma',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    userId: 'usr_001',
    userName: 'Rahul Sharma',
    callType: 'audio',
    startedAt: new Date(Date.now() - 42000).toISOString(),
    durationSeconds: 42,
    coinsBurned: 20,
    ratePerMinute: 20,
    status: 'active',
  },
];

let callHistory: ActiveCall[] = [
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
  {
    id: 'call_hist_802',
    hostId: 'lst_103',
    hostName: 'Riya Sen',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    userId: 'usr_003',
    userName: 'Amit Patel',
    callType: 'audio',
    startedAt: new Date(Date.now() - 14400000).toISOString(),
    durationSeconds: 210,
    coinsBurned: 70,
    ratePerMinute: 20,
    status: 'completed',
  },
];

let coinPackages: CoinPackage[] = [
  { id: 'pkg_starter', name: 'Starter Pack', coins: 100, bonusCoins: 20, priceInr: 99 },
  { id: 'pkg_popular', name: 'Most Popular', coins: 300, bonusCoins: 80, priceInr: 249, isPopular: true },
  { id: 'pkg_value', name: 'Super Value', coins: 650, bonusCoins: 200, priceInr: 499 },
  { id: 'pkg_vip', name: 'VIP Diamond Pack', coins: 1500, bonusCoins: 500, priceInr: 999 },
  { id: 'pkg_royalty', name: 'Royalty Club', coins: 4000, bonusCoins: 1500, priceInr: 2499 },
];

let gifts: Gift[] = [
  { id: 'gift_like', name: 'Thumbs Up', coinCost: 5, assetPath: 'assets/gif/like.gif', category: 'Popular' },
  { id: 'gift_heart', name: 'Heart Shower', coinCost: 15, assetPath: 'assets/gif/love.gif', category: 'Popular' },
  { id: 'gift_box', name: 'Mystery Gift', coinCost: 30, assetPath: 'assets/gif/gift.gif', category: 'Popular' },
  { id: 'gift_cake', name: 'Celebration Cake', coinCost: 50, assetPath: 'assets/image/cake.png', category: 'Luxury' },
  { id: 'gift_diamond', name: 'Blue Diamond', coinCost: 100, assetPath: 'assets/image/diamond.png', category: 'Luxury' },
  { id: 'gift_crown', name: 'Royal Crown', coinCost: 250, assetPath: 'assets/image/badge.png', category: 'Special' },
];

let appConfig: AppConfig = {
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

// Store Operations
export const store = {
  // Hosts
  getHosts: (filters?: { gender?: string; onlineOnly?: boolean }) => {
    let result = [...hosts];
    if (filters?.gender && filters.gender !== 'All') {
      result = result.filter((h) => h.gender.toLowerCase() === filters.gender?.toLowerCase());
    }
    if (filters?.onlineOnly) {
      result = result.filter((h) => h.isOnline && !h.isBanned);
    }
    return result;
  },

  getHostById: (id: string) => hosts.find((h) => h.id === id),

  addHost: (host: Omit<Host, 'id' | 'rating' | 'totalCalls' | 'joinedDate' | 'isInCall' | 'isBanned'>) => {
    const newHost: Host = {
      ...host,
      id: `lst_${Date.now()}`,
      rating: 5.0,
      totalCalls: 0,
      isInCall: false,
      isBanned: false,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    hosts.unshift(newHost);
    return newHost;
  },

  updateHost: (id: string, updates: Partial<Host>) => {
    const index = hosts.findIndex((h) => h.id === id);
    if (index === -1) return null;
    hosts[index] = { ...hosts[index], ...updates };
    return hosts[index];
  },

  deleteHost: (id: string) => {
    const prevLen = hosts.length;
    hosts = hosts.filter((h) => h.id !== id);
    return hosts.length < prevLen;
  },

  // Users
  getUsers: () => [...users],

  getUserById: (id: string) => users.find((u) => u.id === id),

  adjustUserCoins: (id: string, delta: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    user.coinBalance = Math.max(0, user.coinBalance + delta);
    return user;
  },

  toggleUserBan: (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    user.isBanned = !user.isBanned;
    return user;
  },

  // Calls
  getActiveCalls: () => [...activeCalls],

  getCallHistory: () => [...callHistory],

  terminateCall: (callId: string) => {
    const callIndex = activeCalls.findIndex((c) => c.id === callId);
    if (callIndex === -1) return null;
    const terminated = activeCalls.splice(callIndex, 1)[0];
    terminated.status = 'terminated_by_admin';
    callHistory.unshift(terminated);

    // Free up host inCall status
    const host = hosts.find((h) => h.id === terminated.hostId);
    if (host) host.isInCall = false;

    return terminated;
  },

  // Packages
  getPackages: () => [...coinPackages],

  addPackage: (pkg: Omit<CoinPackage, 'id'>) => {
    const newPkg: CoinPackage = { ...pkg, id: `pkg_${Date.now()}` };
    coinPackages.push(newPkg);
    return newPkg;
  },

  updatePackage: (id: string, updates: Partial<CoinPackage>) => {
    const index = coinPackages.findIndex((p) => p.id === id);
    if (index === -1) return null;
    coinPackages[index] = { ...coinPackages[index], ...updates };
    return coinPackages[index];
  },

  deletePackage: (id: string) => {
    coinPackages = coinPackages.filter((p) => p.id !== id);
    return true;
  },

  // Gifts
  getGifts: () => [...gifts],

  addGift: (gift: Omit<Gift, 'id'>) => {
    const newGift: Gift = { ...gift, id: `gift_${Date.now()}` };
    gifts.push(newGift);
    return newGift;
  },

  updateGift: (id: string, updates: Partial<Gift>) => {
    const index = gifts.findIndex((g) => g.id === id);
    if (index === -1) return null;
    gifts[index] = { ...gifts[index], ...updates };
    return gifts[index];
  },

  deleteGift: (id: string) => {
    gifts = gifts.filter((g) => g.id !== id);
    return true;
  },

  // Config
  getConfig: () => ({ ...appConfig }),

  updateConfig: (updates: Partial<AppConfig>) => {
    appConfig = { ...appConfig, ...updates };
    return appConfig;
  },

  // Analytics Metrics
  getAnalytics: () => {
    const totalRevenue = users.reduce((acc, u) => acc + u.totalSpentInr, 0) + 48250;
    const coinsInCirculation = users.reduce((acc, u) => acc + u.coinBalance, 0);
    const totalCallsCount = hosts.reduce((acc, h) => acc + h.totalCalls, 0);
    const activeCallsCount = activeCalls.length;
    const onlineHostsCount = hosts.filter((h) => h.isOnline && !h.isBanned).length;
    const totalUsersCount = users.length + 1420;

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
