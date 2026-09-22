export type Species = 'dog' | 'cat';
export type Sex = 'male' | 'female';
export type WeightUnit = 'kg' | 'g' | 'lb';

export interface UserProfile {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  city?: string;
  timezone: string;   // IANA, по умолчанию Asia/Almaty
  locale: string;     // ru-KZ | kk-KZ | en-US
  consentAcceptedAt: number; // ms since epoch: согласие с Terms и Privacy
  createdAt: number;
}

export interface Pet {
  id: string;
  species: Species;
  name: string;
  breed?: string;
  sex?: Sex;
  birthDate?: string; // YYYY-MM-DD
  weight?: number;
  weightUnit?: WeightUnit;
  color?: string;
  features?: string;
  neutered?: boolean;
  microchipped?: boolean;
  microchipNumber?: string;
  city?: string;
  notes?: string;
  photoDataUrl?: string; // сжатое превью (≤ ~60 КБ); Firebase Storage не используем — он требует Blaze
  archived?: boolean;
  createdAt: number;
  updatedAt: number;
}

export const PET_SUBCOLLECTIONS = [
  'vaccinations',
  'medicalRecords',
  'tests',
  'medications',
  'medicationLogs',
  'events',
  'documents',
] as const;
export type PetSubcollection = (typeof PET_SUBCOLLECTIONS)[number];

export interface Vaccination {
  id: string;
  name: string;
  date: string;            // YYYY-MM-DD — дата постановки (или планируемая дата)
  administered: boolean;   // false = запланирована, true = выполнена
  batch?: string;
  manufacturer?: string;
  clinic?: string;
  vet?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Medication {
  id: string;
  name: string;
  dosageAmount?: string;
  dosageUnit?: string;
  times: string[];          // ["10:00", "22:00"]
  startDate: string;        // YYYY-MM-DD
  endDate?: string;         // YYYY-MM-DD, пусто — без конца
  prescribedBy?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type MedLogStatus = 'taken' | 'missed';
export interface MedicationLog {
  id: string;               // `${medicationId}_${date}_${time}`
  medicationId: string;
  date: string;
  time: string;
  status: MedLogStatus;
  at: number;
}

export type EventType = 'medication' | 'vaccination' | 'dewormer' | 'vet' | 'test' | 'grooming' | 'dental' | 'other';
export const EVENT_TYPES: EventType[] = ['medication', 'vaccination', 'dewormer', 'vet', 'test', 'grooming', 'dental', 'other'];

export interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  date: string;    // YYYY-MM-DD
  time?: string;   // HH:mm
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
