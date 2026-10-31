export interface Host {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male';
  avatarUrl: string;
  languages: string[];
  interests: string[];
  bio: string;
  coinRatePerMinute: number;
  isOnline: boolean;
  isInCall: boolean;
  isBanned: boolean;
  rating: number;
  totalCalls: number;
  joinedDate: string;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  gender: string;
  avatarUrl: string;
  coinBalance: number;
  totalCalls: number;
  totalSpentInr: number;
  isBanned: boolean;
  joinedDate: string;
}

export interface ActiveCall {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  userId: string;
  userName: string;
  callType: 'video' | 'audio';
  startedAt: string;
  durationSeconds: number;
  coinsBurned: number;
  ratePerMinute: number;
  status: 'active' | 'completed' | 'terminated_by_admin';
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  bonusCoins: number;
  priceInr: number;
  isPopular?: boolean;
}

export interface Gift {
  id: string;
  name: string;
  coinCost: number;
  assetPath: string;
  category: 'Popular' | 'Luxury' | 'Special';
}

export interface AppConfig {
  appName: string;
  version: string;
  maintenanceMode: boolean;
  welcomeBonusCoins: number;
  minVideoCoinRate: number;
  minAudioCoinRate: number;
  cashfreeMode: 'TEST' | 'PROD';
  cashfreeAppId: string;
  broadcastNotice: {
    active: boolean;
    title: string;
    message: string;
    actionUrl?: string;
  };
}
