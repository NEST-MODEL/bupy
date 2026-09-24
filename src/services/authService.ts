import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
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

/**
 * Удаляет сам аккаунт (Firebase Auth) и его профильный документ users/{uid}.
 * Питомцев и их подколлекции НЕ удаляет каскадно (Firestore этого не делает автоматически) —
 * пользователь предупреждён об этом в интерфейсе перед подтверждением.
 */
export async function deleteAccount(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(getDb(), 'users', user.uid)).catch(() => { /* документ мог не существовать */ });
  await deleteUser(user);
}
