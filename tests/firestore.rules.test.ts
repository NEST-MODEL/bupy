// Тесты Security Rules. Запускаются ТОЛЬКО против локального эмулятора (проект demo-bupy),
// production Firebase не затрагивается:  npm run test:rules
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

const emulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const now = 1_760_000_000_000;

const pet = (over: Record<string, unknown> = {}) => ({ species: 'dog', name: 'Рокки', createdAt: now, updatedAt: now, ...over });
const profile = (email: string) => ({
  firstName: 'Алексей', email, timezone: 'Asia/Almaty', locale: 'ru-KZ', consentAcceptedAt: now, createdAt: now,
});

describe.skipIf(!emulator)('Firestore rules', () => {
  let env: RulesTestEnvironment;

  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: 'demo-bupy',
      firestore: { rules: readFileSync('firebase/firestore.rules', 'utf8') },
    });
  });
  afterAll(async () => { await env.cleanup(); });
  beforeEach(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'users/alice/pets/rocky'), pet());
      await setDoc(doc(db, 'users/alice/pets/rocky/vaccinations/v1'), { name: 'Нобивак', date: '2026-01-01' });
    });
  });

  const alice = () => env.authenticatedContext('alice', { email: 'alice@example.com' }).firestore();
  const bob = () => env.authenticatedContext('bob', { email: 'bob@example.com' }).firestore();
  const anon = () => env.unauthenticatedContext().firestore();

  it('owner can read and write own pet', async () => {
    await assertSucceeds(getDoc(doc(alice(), 'users/alice/pets/rocky')));
    await assertSucceeds(setDoc(doc(alice(), 'users/alice/pets/bella'), pet({ name: 'Белла', species: 'cat' })));
    await assertSucceeds(updateDoc(doc(alice(), 'users/alice/pets/rocky'), { weight: 12.5, weightUnit: 'kg' }));
  });

  it('another user cannot read, change or delete the pet (data isolation)', async () => {
    await assertFails(getDoc(doc(bob(), 'users/alice/pets/rocky')));
    await assertFails(updateDoc(doc(bob(), 'users/alice/pets/rocky'), { name: 'Взлом' }));
    await assertFails(deleteDoc(doc(bob(), 'users/alice/pets/rocky')));
    await assertFails(setDoc(doc(bob(), 'users/alice/pets/evil'), pet()));
  });

  it("another user cannot read or write pet records (vaccinations)", async () => {
    await assertFails(getDoc(doc(bob(), 'users/alice/pets/rocky/vaccinations/v1')));
    await assertFails(setDoc(doc(bob(), 'users/alice/pets/rocky/vaccinations/v2'), { name: 'x' }));
    await assertFails(deleteDoc(doc(bob(), 'users/alice/pets/rocky/vaccinations/v1')));
  });

  it('owner can manage records in allowed subcollections only', async () => {
    await assertSucceeds(setDoc(doc(alice(), 'users/alice/pets/rocky/medications/m1'), { name: 'Препарат' }));
    await assertFails(setDoc(doc(alice(), 'users/alice/pets/rocky/secrets/s1'), { x: 1 }));
  });

  it('unauthenticated users have no access', async () => {
    await assertFails(getDoc(doc(anon(), 'users/alice/pets/rocky')));
    await assertFails(setDoc(doc(anon(), 'users/alice/pets/x'), pet()));
    await assertFails(getDoc(doc(anon(), 'users/alice')));
  });

  it('validates pet data', async () => {
    await assertFails(setDoc(doc(alice(), 'users/alice/pets/a'), pet({ species: 'hamster' })));
    await assertFails(setDoc(doc(alice(), 'users/alice/pets/b'), pet({ name: '' })));
    await assertFails(setDoc(doc(alice(), 'users/alice/pets/c'), pet({ isAdmin: true })));
    await assertFails(setDoc(doc(alice(), 'users/alice/pets/d'), pet({ weight: -5 })));
  });

  it('user profile: own doc only, email must match token', async () => {
    await assertSucceeds(setDoc(doc(alice(), 'users/alice'), profile('alice@example.com')));
    await assertFails(setDoc(doc(alice(), 'users/alice'), profile('other@example.com')));
    await assertFails(setDoc(doc(bob(), 'users/alice'), profile('alice@example.com')));
  });

  it('unknown collections are denied', async () => {
    await assertFails(setDoc(doc(alice(), 'pets/rocky'), pet()));
    await assertFails(getDoc(doc(alice(), 'admin/config')));
  });
});
