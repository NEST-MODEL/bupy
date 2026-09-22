import { Cat, Dog } from 'lucide-react';
import type { Pet } from '@/types';

export function PetAvatar({ pet, size = 40 }: { pet: Pick<Pet, 'species' | 'photoDataUrl' | 'name'>; size?: number }) {
  if (pet.photoDataUrl) {
    return <img src={pet.photoDataUrl} alt="" style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover" />;
  }
  const Icon = pet.species === 'cat' ? Cat : Dog;
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-lagoon-50 text-lagoon-600"
      aria-hidden="true"
    >
      <Icon size={Math.round(size * 0.55)} />
    </span>
  );
}
