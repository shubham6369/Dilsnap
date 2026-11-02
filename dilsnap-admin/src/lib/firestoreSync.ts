import { getFirestoreDb } from './firebaseAdmin';
import {
  Host,
  User,
  CoinPackage,
  Gift,
  AppConfig,
  CallSession,
  WalletTransaction,
  PaymentOrder,
} from './types';

export type SystemConfig = AppConfig;

/**
 * Remove undefined values to prevent Firestore serialization errors
 */
function sanitizeForFirestore<T extends Record<string, any>>(data: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

/**
 * Sync Host document to Cloud Firestore
 */
export async function syncHostToFirestore(host: Host): Promise<void> {
  if (!host?.id) return;
  try {
    const db = getFirestoreDb();
    const sanitized = sanitizeForFirestore({
      ...host,
      updatedAt: new Date().toISOString(),
    });
    await db.collection('hosts').doc(host.id).set(sanitized, { merge: true });
  } catch (error: any) {
    console.warn(`[FirestoreSync] Failed to sync host (${host.id}):`, error?.message || error);
  }
}

/**
 * Delete Host document from Cloud Firestore
 */
export async function deleteHostFromFirestore(hostId: string): Promise<void> {
  if (!hostId) return;
  try {
    const db = getFirestoreDb();
    await db.collection('hosts').doc(hostId).delete();
  } catch (error: any) {
    console.warn(`[FirestoreSync] Failed to delete host (${hostId}):`, error?.message || error);
  }
}

/**
 * Sync CoinPackage document to Cloud Firestore
 */
export async function syncPackageToFirestore(pkg: CoinPackage): Promise<void> {
  if (!pkg?.id) return;
  try {
    const db = getFirestoreDb();
    const sanitized = sanitizeForFirestore({
      ...pkg,
      updatedAt: new Date().toISOString(),
    });
    await db.collection('coinPackages').doc(pkg.id).set(sanitized, { merge: true });
  } catch (error: any) {
    console.warn(`[FirestoreSync] Failed to sync package (${pkg.id}):`, error?.message || error);
  }
}

/**
 * Delete CoinPackage document from Cloud Firestore
 */
export async function deletePackageFromFirestore(pkgId: string): Promise<void> {
  if (!pkgId) return;
  try {
    const db = getFirestoreDb();
    await db.collection('coinPackages').doc(pkgId).delete();
  } catch (error: any) {
    console.warn(`[FirestoreSync] Failed to delete package (${pkgId}):`, error?.message || error);
  }
}

/**
 * Sync Gift document to Cloud Firestore
 */
export async function syncGiftToFirestore(gift: Gift): Promise<void> {
  if (!gift?.id) return;
  try {
    const db = getFirestoreDb();
    const sanitized = sanitizeForFirestore({
      ...gift,
      updatedAt: new Date().toISOString(),
    });
    await db.collection('gifts').doc(gift.id).set(sanitized, { merge: true });
  } catch (error: any) {
    console.warn(`[FirestoreSync] Failed to sync gift (${gift.id}):`, error?.message || error);
  }
}

/**
 * Delete Gift document from Cloud Firestore
 */
export async function deleteGiftFromFirestore(giftId: string): Promise<void> {
  if (!giftId) return;
  try {
    const db = getFirestoreDb();
    await db.collection('gifts').doc(giftId).delete();
  } catch (error: any) {
    console.warn(`[FirestoreSync] Failed to delete gift (${giftId}):`, error?.message || error);
  }
}

/**
 * Sync SystemConfig document to Cloud Firestore
 */
export async function syncConfigToFirestore(config: SystemConfig): Promise<void> {
  if (!config) return;
  try {
    const db = getFirestoreDb();
    const sanitized = sanitizeForFirestore({
      ...config,
      updatedAt: new Date().toISOString(),
    });
    await db.collection('systemConfig').doc('default').set(sanitized, { merge: true });
  } catch (error: any) {
    console.warn('[FirestoreSync] Failed to sync systemConfig:', error?.message || error);
  }
}

/**
 * Sync User document to Cloud Firestore
 */
export async function syncUserToFirestore(user: User): Promise<void> {
  if (!user?.id) return;
  try {
    const db = getFirestoreDb();
    const sanitized = sanitizeForFirestore({
      ...user,
      updatedAt: new Date().toISOString(),
    });
    await db.collection('users').doc(user.id).set(sanitized, { merge: true });
  } catch (error: any) {
    console.warn(`[FirestoreSync] Failed to sync user (${user.id}):`, error?.message || error);
  }
}

/**
 * Sync CallSession document to Cloud Firestore
 */
export async function syncCallSessionToFirestore(session: CallSession): Promise<void> {
  if (!session?.id) return;
  try {
    const db = getFirestoreDb();
    const sanitized = sanitizeForFirestore({
      ...session,
      updatedAt: new Date().toISOString(),
    });
    await db.collection('callSessions').doc(session.id).set(sanitized, { merge: true });
  } catch (error: any) {
    console.warn(`[FirestoreSync] Failed to sync callSession (${session.id}):`, error?.message || error);
  }
}

/**
 * Sync WalletTransaction document to Cloud Firestore
 */
export async function syncWalletTxToFirestore(tx: WalletTransaction): Promise<void> {
  if (!tx?.id) return;
  try {
    const db = getFirestoreDb();
    const sanitized = sanitizeForFirestore({
      ...tx,
      updatedAt: new Date().toISOString(),
    });
    await db.collection('walletTransactions').doc(tx.id).set(sanitized, { merge: true });
  } catch (error: any) {
    console.warn(`[FirestoreSync] Failed to sync walletTx (${tx.id}):`, error?.message || error);
  }
}

/**
 * Sync PaymentOrder document to Cloud Firestore
 */
export async function syncPaymentOrderToFirestore(order: PaymentOrder): Promise<void> {
  if (!order?.id) return;
  try {
    const db = getFirestoreDb();
    const sanitized = sanitizeForFirestore({
      ...order,
      updatedAt: new Date().toISOString(),
    });
    await db.collection('paymentOrders').doc(order.id).set(sanitized, { merge: true });
  } catch (error: any) {
    console.warn(`[FirestoreSync] Failed to sync paymentOrder (${order.id}):`, error?.message || error);
  }
}
