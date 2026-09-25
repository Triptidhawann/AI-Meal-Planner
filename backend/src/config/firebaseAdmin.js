import { applicationDefault, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from './env.js';

function getFirebaseApp() {
  if (getApps().length) return getApp();
  if (env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey) return initializeApp({ credential: cert({ projectId: env.firebaseProjectId, clientEmail: env.firebaseClientEmail, privateKey: env.firebasePrivateKey.replace(/\\n/g, '\n') }) });
  return initializeApp({ credential: applicationDefault() });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseApp());
}
