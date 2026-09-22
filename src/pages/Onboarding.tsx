import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { usePets } from '@/features/pets/PetsContext';
import { PetForm } from '@/features/pets/PetForm';
import { Logo } from '@/components/Logo';
import { useI18n } from '@/i18n';
import { createPet, type PetInput } from '@/services/petService';

export default function Onboarding() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { refresh, setCurrentPetId } = usePets();
  const navigate = useNavigate();

  async function handleCreate(input: PetInput) {
    if (!user) return;
    const id = await createPet(user.uid, input);
    await refresh();
    setCurrentPetId(id);
    navigate('/app', { replace: true });
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <Logo size={32} />
      <h1 className="mb-6 mt-8 text-2xl font-extrabold tracking-tight">{t('onboarding.title')}</h1>
      <PetForm onSubmit={handleCreate} submitLabel={t('petForm.create')} />
    </main>
  );
}
