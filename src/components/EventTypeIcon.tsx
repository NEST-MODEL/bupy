import { Pill, Syringe, Bug, Stethoscope, FlaskConical, Scissors, Sparkles, PawPrint } from 'lucide-react';
import type { EventType } from '@/types';

const ICONS: Record<EventType, typeof Pill> = {
  medication: Pill, vaccination: Syringe, dewormer: Bug, vet: Stethoscope,
  test: FlaskConical, grooming: Scissors, dental: Sparkles, other: PawPrint,
};

export function EventTypeIcon({ type, size = 20 }: { type: EventType; size?: number }) {
  const Icon = ICONS[type];
  return <Icon size={size} aria-hidden="true" />;
}
