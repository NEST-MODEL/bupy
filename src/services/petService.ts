import {
  addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc,
} from 'firebase/firestore';
import { getDb } from '@/firebase/firebase';
import { withTimeout } from '@/utils/withTimeout';
import type { Pet } from '@/types';

const petsCol = (uid: string) => collection(getDb(), 'users', uid, 'pets');

export async function listPets(uid: string): Promise<Pet[]> {
  const snap = await withTimeout(getDocs(query(petsCol(uid), orderBy('createdAt', 'asc'))));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Pet, 'id'>) }));
}

export type PetInput = Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>;

export async function createPet(uid: string, input: PetInput): Promise<string> {
  const now = Date.now();
  const ref = await withTimeout(addDoc(petsCol(uid), { ...input, createdAt: now, updatedAt: now }));
  return ref.id;
}

export async function updatePet(uid: string, petId: string, input: Partial<PetInput>): Promise<void> {
  await withTimeout(updateDoc(doc(petsCol(uid), petId), { ...input, updatedAt: Date.now() }));
}

export async function deletePet(uid: string, petId: string): Promise<void> {
  // Примечание: подколлекции (вакцинации, лекарства и т.д.) правила не удаляют каскадно —
  // при необходимости полной очистки их нужно удалить отдельными вызовами.
  await withTimeout(deleteDoc(doc(petsCol(uid), petId)));
}
