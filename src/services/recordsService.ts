import {
  collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, updateDoc, where, addDoc,
} from 'firebase/firestore';
import { getDb } from '@/firebase/firebase';
import type { CalendarEvent, MedLogStatus, Medication, MedicationLog, Vaccination } from '@/types';

function subcol(uid: string, petId: string, name: string) {
  return collection(getDb(), 'users', uid, 'pets', petId, name);
}

// ---------- Вакцинации ----------
export type VaccinationInput = Omit<Vaccination, 'id' | 'createdAt' | 'updatedAt'>;

export async function listVaccinations(uid: string, petId: string): Promise<Vaccination[]> {
  const snap = await getDocs(query(subcol(uid, petId, 'vaccinations'), orderBy('date', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vaccination, 'id'>) }));
}
export async function addVaccination(uid: string, petId: string, input: VaccinationInput) {
  const now = Date.now();
  await addDoc(subcol(uid, petId, 'vaccinations'), { ...input, createdAt: now, updatedAt: now });
}
export async function updateVaccination(uid: string, petId: string, id: string, input: Partial<VaccinationInput>) {
  await updateDoc(doc(subcol(uid, petId, 'vaccinations'), id), { ...input, updatedAt: Date.now() });
}
export async function deleteVaccination(uid: string, petId: string, id: string) {
  await deleteDoc(doc(subcol(uid, petId, 'vaccinations'), id));
}

// ---------- Лекарства ----------
export type MedicationInput = Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>;

export async function listMedications(uid: string, petId: string): Promise<Medication[]> {
  const snap = await getDocs(query(subcol(uid, petId, 'medications'), orderBy('startDate', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Medication, 'id'>) }));
}
export async function addMedication(uid: string, petId: string, input: MedicationInput) {
  const now = Date.now();
  await addDoc(subcol(uid, petId, 'medications'), { ...input, createdAt: now, updatedAt: now });
}
export async function deleteMedication(uid: string, petId: string, id: string) {
  await deleteDoc(doc(subcol(uid, petId, 'medications'), id));
}

export async function listMedicationLogsForDate(uid: string, petId: string, date: string): Promise<MedicationLog[]> {
  const snap = await getDocs(query(subcol(uid, petId, 'medicationLogs'), where('date', '==', date)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MedicationLog, 'id'>) }));
}
export async function setMedicationLog(
  uid: string, petId: string, medicationId: string, date: string, time: string, status: MedLogStatus,
) {
  const id = `${medicationId}_${date}_${time}`;
  await setDoc(doc(subcol(uid, petId, 'medicationLogs'), id), { medicationId, date, time, status, at: Date.now() });
}
export async function clearMedicationLog(uid: string, petId: string, medicationId: string, date: string, time: string) {
  const id = `${medicationId}_${date}_${time}`;
  await deleteDoc(doc(subcol(uid, petId, 'medicationLogs'), id));
}

// ---------- События календаря ----------
export type EventInput = Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>;

export async function listEvents(uid: string, petId: string): Promise<CalendarEvent[]> {
  const snap = await getDocs(query(subcol(uid, petId, 'events'), orderBy('date', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CalendarEvent, 'id'>) }));
}
export async function addEvent(uid: string, petId: string, input: EventInput) {
  const now = Date.now();
  await addDoc(subcol(uid, petId, 'events'), { ...input, createdAt: now, updatedAt: now });
}
export async function deleteEvent(uid: string, petId: string, id: string) {
  await deleteDoc(doc(subcol(uid, petId, 'events'), id));
}
