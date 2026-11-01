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
  phone: string;
  mobile: string;
  gender: string;
  avatarUrl: string;
  coins: number;
  coinBalance: number;
  totalCalls: number;
  totalSpentInr: number;
  isBanned: boolean;
  createdAt: string;
  joinedDate: string;
  token?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: string;
}

export interface CallSession {
  id: string;
  userId: string;
  userName?: string;
  hostId: string;
  hostName?: string;
  hostAvatar?: string;
  callType: 'video' | 'audio';
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  coinsDeducted: number;
  ratePerMinute: number;
  status: 'active' | 'completed' | 'terminated_by_admin' | 'insufficient_coins';
}

export interface PaymentOrder {
  id: string;
  orderId: string;
  userId: string;
  packageId: string;
  amountInr: number;
  coins: number;
  status: 'created' | 'paid' | 'failed';
  createdAt: string;
  paymentSessionId?: string;
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
  startTime?: string;
  endTime?: string;
  durationSeconds: number;
  coinsBurned: number;
  coinsDeducted?: number;
  ratePerMinute: number;
  status: 'active' | 'completed' | 'terminated_by_admin' | 'insufficient_coins';
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
