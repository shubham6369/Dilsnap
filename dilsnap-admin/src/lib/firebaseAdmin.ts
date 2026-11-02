import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

let firebaseApp: App | null = null;

export function getFirebaseAdmin(): App {
  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    return existingApps[0];
  }

  const candidateKeyPaths = [
    path.join(process.cwd(), 'serviceAccountKey.json'),
    path.join(process.cwd(), 'dilsnap-admin', 'serviceAccountKey.json'),
  ];

  for (const keyPath of candidateKeyPaths) {
    if (fs.existsSync(keyPath)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        firebaseApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || 'dilsnap-a72fb',
        });
        return firebaseApp;
      } catch (e) {
        console.error(`Error loading serviceAccountKey.json from ${keyPath}:`, e);
      }
    }
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || 'dilsnap-a72fb',
      });
      return firebaseApp;
    } catch (e) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT env:', e);
    }
  }

  firebaseApp = initializeApp({
    projectId: 'dilsnap-a72fb',
  });
  return firebaseApp;
}

export function getFirestoreDb(): Firestore {
  const app = getFirebaseAdmin();
  return getFirestore(app);
}

export function getFirebaseAuth(): Auth {
  const app = getFirebaseAdmin();
  return getAuth(app);
}
