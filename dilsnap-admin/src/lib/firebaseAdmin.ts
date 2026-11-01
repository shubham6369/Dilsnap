import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let firebaseApp: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App {
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  const keyPath = path.join(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(keyPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      return firebaseApp;
    } catch (e) {
      console.error('Error loading serviceAccountKey.json:', e);
    }
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      return firebaseApp;
    } catch (e) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT env:', e);
    }
  }

  firebaseApp = admin.initializeApp({
    projectId: 'dilsnap-a72fb',
  });
  return firebaseApp;
}

export function getFirestoreDb(): admin.firestore.Firestore {
  getFirebaseAdmin();
  return admin.firestore();
}

export function getFirebaseAuth(): admin.auth.Auth {
  getFirebaseAdmin();
  return admin.auth();
}
