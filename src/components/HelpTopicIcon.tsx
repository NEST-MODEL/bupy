import {
  Scissors, Droplet, Flame, Bug, Sun, Target, Skull, Droplets, Bone, AlertOctagon, Zap,
} from 'lucide-react';

const ICONS: Record<string, typeof Scissors> = {
  cut: Scissors, droplet: Droplet, flame: Flame, bug: Bug, sun: Sun, target: Target,
  skull: Skull, droplets: Droplets, bone: Bone, 'alert-octagon': AlertOctagon, zap: Zap,
};

export function HelpTopicIcon({ icon, size = 22 }: { icon: string; size?: number }) {
  const Icon = ICONS[icon] ?? Bone;
  return <Icon size={size} aria-hidden="true" />;
}
