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

// Подколлекции питомца: users/{uid}/pets/{petId}/{collection}/{id}
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
