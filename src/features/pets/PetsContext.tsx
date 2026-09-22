import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { listPets } from '@/services/petService';
import type { Pet } from '@/types';

interface PetsValue {
  pets: Pet[];
  activePets: Pet[];
  loading: boolean;
  error: boolean;
  currentPetId: string | null;
  currentPet: Pet | null;
  setCurrentPetId: (id: string) => void;
  refresh: () => Promise<void>;
}

const PetsContext = createContext<PetsValue | null>(null);
const storageKey = (uid: string) => `bupy.currentPet.${uid}`;

export function PetsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPetId, setCurrentPetIdState] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setPets([]); setLoading(false); return; }
    setLoading(true);
    setError(false);
    try {
      const list = await listPets(user.uid);
      setPets(list);
      setCurrentPetIdState((prev) => {
        if (prev && list.some((p) => p.id === prev && !p.archived)) return prev;
        try {
          const saved = localStorage.getItem(storageKey(user.uid));
          if (saved && list.some((p) => p.id === saved && !p.archived)) return saved;
        } catch { /* ignore */ }
        return list.find((p) => !p.archived)?.id ?? null;
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const setCurrentPetId = useCallback((id: string) => {
    setCurrentPetIdState(id);
    if (user) { try { localStorage.setItem(storageKey(user.uid), id); } catch { /* ignore */ } }
  }, [user]);

  const activePets = useMemo(() => pets.filter((p) => !p.archived), [pets]);
  const currentPet = useMemo(() => pets.find((p) => p.id === currentPetId) ?? null, [pets, currentPetId]);

  const value = useMemo(
    () => ({ pets, activePets, loading, error, currentPetId, currentPet, setCurrentPetId, refresh: load }),
    [pets, activePets, loading, error, currentPetId, currentPet, setCurrentPetId, load],
  );

  return <PetsContext.Provider value={value}>{children}</PetsContext.Provider>;
}

export function usePets(): PetsValue {
  const ctx = useContext(PetsContext);
  if (!ctx) throw new Error('usePets must be used inside PetsProvider');
  return ctx;
}
