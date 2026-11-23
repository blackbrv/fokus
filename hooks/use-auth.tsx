"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, runTransaction } from "firebase/firestore";
import { z } from "zod";
import { auth, db, firebaseEnabled } from "@/lib/firebase";

export type Profile = { displayName: string; username: string; createdAt: number };

// Keep in sync with validUsername() in firestore.rules.
export const usernameSchema = z
  .string()
  .regex(/^[a-z0-9_]{3,20}$/, "3–20 characters: lowercase letters, numbers or _");
export const displayNameSchema = z.string().trim().min(1, "Name is required").max(50, "Max 50 characters");
export const emailSchema = z.email("Enter a valid email");

type AuthState = { user: User | null; profile: Profile | null; loading: boolean };

const AuthContext = createContext<AuthState>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: firebaseEnabled });

  useEffect(() => {
    if (!firebaseEnabled) return;
    let stopProfile: (() => void) | undefined;
    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopProfile?.();
      stopProfile = undefined;
      if (!user) {
        setState({ user: null, profile: null, loading: false });
        return;
      }
      stopProfile = onSnapshot(
        doc(db, "users", user.uid),
        (snap) => setState({ user, profile: snap.exists() ? (snap.data() as Profile) : null, loading: false }),
        () => setState({ user, profile: null, loading: false }),
      );
    });
    return () => {
      stopProfile?.();
      stopAuth();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// ── Actions ─────────────────────────────────────────────────────────────────

function requireFirebase() {
  if (!firebaseEnabled) throw new Error("Accounts aren't available right now.");
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  requireFirebase();
  const snap = await getDoc(doc(db, "usernames", username));
  return !snap.exists() || snap.data().uid === auth.currentUser?.uid;
}

/**
 * Creates or updates the profile, claiming `username` and releasing the old
 * one atomically. firestore.rules enforce the same invariants server-side.
 */
export async function saveProfile(uid: string, displayName: string, username: string) {
  requireFirebase();
  await runTransaction(db, async (tx) => {
    const userRef = doc(db, "users", uid);
    const nameRef = doc(db, "usernames", username);
    const userSnap = await tx.get(userRef);
    const nameSnap = await tx.get(nameRef);
    if (nameSnap.exists() && nameSnap.data().uid !== uid) throw new Error("That username is taken.");

    const old: string | undefined = userSnap.exists() ? userSnap.data().username : undefined;
    if (!nameSnap.exists()) tx.set(nameRef, { uid });
    if (old && old !== username) tx.delete(doc(db, "usernames", old));
    tx.set(
      userRef,
      { displayName: displayName.trim(), username, createdAt: userSnap.exists() ? userSnap.data().createdAt : Date.now() },
      { merge: true },
    );
  });
}

export async function signUp(email: string, password: string, displayName: string, username: string) {
  requireFirebase();
  if (!(await isUsernameAvailable(username))) throw new Error("That username is taken.");
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  // If this loses a race for the username, the account still exists and
  // /account prompts for a new one (profile === null).
  await saveProfile(user.uid, displayName, username);
}

export async function signIn(email: string, password: string) {
  requireFirebase();
  return signInWithEmailAndPassword(auth, email, password);
}
export const signOut = () => (firebaseEnabled ? fbSignOut(auth) : Promise.resolve());
export async function resetPassword(email: string) {
  requireFirebase();
  return sendPasswordResetEmail(auth, email);
}

export function authErrorMessage(e: unknown): string {
  if (!(e instanceof FirebaseError)) return e instanceof Error ? e.message : "Something went wrong.";
  switch (e.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password is too weak.";
    case "auth/invalid-email":
      return "Enter a valid email.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again in a few minutes.";
    case "auth/network-request-failed":
    case "unavailable":
      return "Network error. Check your connection.";
    case "permission-denied":
      return "Couldn't save. That username may have just been taken.";
    default:
      return "Something went wrong. Please try again.";
  }
}
