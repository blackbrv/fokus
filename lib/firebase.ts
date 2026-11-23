import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

export const auth = getAuth(app);

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

export const db = createDb();
