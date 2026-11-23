import { getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import {
  type Firestore,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

// Literal process.env.NEXT_PUBLIC_* references so Next inlines them at build time.
const app = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });

/**
 * False when the NEXT_PUBLIC_FIREBASE_* env vars are missing (e.g. not set on
 * Vercel): accounts are switched off and the app runs in guest mode instead of
 * failing the build. Check this before touching `auth` / `db`.
 */
export const firebaseEnabled = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

// ponytail: null-cast when disabled so call sites stay simple; every entry point
// (AuthProvider, the actions in use-auth, AccountButton) checks firebaseEnabled.
export const auth = firebaseEnabled ? getAuth(app) : (null as unknown as Auth);

function createDb(): Firestore {
  // No IndexedDB during prerender.
  if (typeof window === "undefined") return getFirestore(app);
  try {
    // IndexedDB cache: offline reads/writes, queued until back online.
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      ignoreUndefinedProperties: true,
    });
  } catch {
    return getFirestore(app); // already initialized (HMR)
  }
}

export const db = firebaseEnabled ? createDb() : (null as unknown as Firestore);
