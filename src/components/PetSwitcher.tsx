import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Plus } from 'lucide-react';
import { usePets } from '@/features/pets/PetsContext';
import { PetAvatar } from './PetAvatar';
import { useI18n } from '@/i18n';

export function PetSwitcher() {
  const { t } = useI18n();
  const { activePets, currentPet, setCurrentPetId } = usePets();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!currentPet) return null;
  if (activePets.length <= 1) {
    return (
      <div className="flex items-center gap-3">
        <PetAvatar pet={currentPet} size={48} />
        <span className="text-xl font-extrabold">{currentPet.name}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} aria-label={t('pet.switcher.label')}
        className="flex min-h-[48px] items-center gap-2 rounded-ctl pr-2 hover:bg-mist">
        <PetAvatar pet={currentPet} size={48} />
        <span className="text-xl font-extrabold">{currentPet.name}</span>
        <ChevronDown size={20} className="text-ink-faint" aria-hidden="true" />
      </button>
      {open && (
        <div role="listbox" className="absolute left-0 z-10 mt-1 w-64 overflow-hidden rounded-card border border-line bg-white shadow-soft">
          {activePets.map((p) => (
            <button key={p.id} type="button" role="option" aria-selected={p.id === currentPet.id}
              onClick={() => { setCurrentPetId(p.id); setOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-mist ${p.id === currentPet.id ? 'bg-lagoon-50' : ''}`}>
              <PetAvatar pet={p} size={36} />
              <span className="font-semibold">{p.name}</span>
            </button>
          ))}
          <Link to="/app/pets/new" onClick={() => setOpen(false)} className="flex items-center gap-3 border-t border-line px-4 py-3 font-semibold text-lagoon-700 hover:bg-lagoon-50">
            <Plus size={20} aria-hidden="true" /> {t('pet.addAnother')}
          </Link>
        </div>
      )}
    </div>
  );
}
