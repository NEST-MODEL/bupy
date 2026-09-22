import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { usePets } from '@/features/pets/PetsContext';
import { PetForm } from '@/features/pets/PetForm';
import { useI18n } from '@/i18n';
import { createPet, type PetInput } from '@/services/petService';

export default function PetNew() {
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
    <>
      <Link to="/app" aria-label={t('auth.back')} className="-ml-2 mb-4 flex h-11 w-11 items-center justify-center rounded-ctl text-ink-soft hover:bg-lagoon-50">
        <ArrowLeft size={22} aria-hidden="true" />
      </Link>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">{t('pet.addAnother')}</h1>
      <PetForm onSubmit={handleCreate} submitLabel={t('petForm.create')} />
    </>
  );
}
