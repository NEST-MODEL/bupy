import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getDb, getFirebaseAuth } from '@/firebase/firebase';
import type { UserProfile } from '@/types';

export interface RegisterInput {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  locale: string;
}

export async function register(input: RegisterInput): Promise<void> {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
  const displayName = [input.firstName.trim(), input.lastName?.trim()].filter(Boolean).join(' ');
  await updateProfile(cred.user, { displayName });

  const now = Date.now();
  const profile: UserProfile = {
    firstName: input.firstName.trim(),
    email: input.email.trim(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Almaty',
    locale: input.locale,
    consentAcceptedAt: now,
    createdAt: now,
    ...(input.lastName?.trim() ? { lastName: input.lastName.trim() } : {}),
  };
  await setDoc(doc(getDb(), 'users', cred.user.uid), profile);
}

export async function login(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
}

export async function logout(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
}
