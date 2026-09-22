import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { usePets } from '@/features/pets/PetsContext';
import { PetForm } from '@/features/pets/PetForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PetAvatar } from '@/components/PetAvatar';
import { useI18n } from '@/i18n';
import { ageFromBirthDate, formatDateHuman } from '@/utils/date';
import { deletePet, updatePet, type PetInput } from '@/services/petService';

export default function PetProfile() {
  const { t } = useI18n();
  const { petId } = useParams<{ petId: string }>();
  const { user } = useAuth();
  const { pets, refresh, setCurrentPetId, activePets } = usePets();
  const navigate = useNavigate();
  const pet = pets.find((p) => p.id === petId);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<'archive' | 'delete' | null>(null);
  const [busy, setBusy] = useState(false);

  if (!pet) return <p className="text-ink-soft">{t('error.load')}</p>;

  async function handleSave(input: PetInput) {
    if (!user || !pet) return;
    await updatePet(user.uid, pet.id, input);
    await refresh();
    setEditing(false);
  }

  async function handleArchiveToggle() {
    if (!user || !pet) return;
    setBusy(true);
    try {
      await updatePet(user.uid, pet.id, { archived: !pet.archived });
      await refresh();
      if (!pet.archived) {
        const next = activePets.find((p) => p.id !== pet.id);
        if (next) setCurrentPetId(next.id);
      }
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!user || !pet) return;
    setBusy(true);
    try {
      await deletePet(user.uid, pet.id);
      await refresh();
      navigate('/app', { replace: true });
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <>
        <button type="button" onClick={() => setEditing(false)} className="-ml-2 mb-4 flex h-11 w-11 items-center justify-center rounded-ctl text-ink-soft hover:bg-lagoon-50">
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight">{t('pet.edit')}</h1>
        <PetForm initial={pet} onSubmit={handleSave} submitLabel={t('petForm.save')} />
      </>
    );
  }

  const rows: [string, string | undefined][] = [
    [t('petForm.breed'), pet.breed],
    [t('petForm.sex'), pet.sex ? t(pet.sex === 'male' ? 'pet.sex.male' : 'pet.sex.female') : undefined],
    [t('petForm.birthDate'), pet.birthDate ? `${formatDateHuman(pet.birthDate)} (${ageFromBirthDate(pet.birthDate)})` : undefined],
    [t('petForm.weight'), pet.weight != null ? `${pet.weight} ${t(`pet.weight.${pet.weightUnit ?? 'kg'}`)}` : undefined],
    [t('petForm.color'), pet.color],
    [t('petForm.features'), pet.features],
    [t('petForm.neutered'), pet.neutered ? 'Да' : undefined],
    [t('petForm.microchipNumber'), pet.microchipped ? (pet.microchipNumber || 'Да') : undefined],
    [t('petForm.city'), pet.city],
    [t('petForm.notes'), pet.notes],
  ];

  return (
    <>
      <Link to="/app" aria-label={t('auth.back')} className="-ml-2 mb-4 flex h-11 w-11 items-center justify-center rounded-ctl text-ink-soft hover:bg-lagoon-50">
        <ArrowLeft size={22} aria-hidden="true" />
      </Link>

      <div className="mb-5 flex items-center gap-4">
        <PetAvatar pet={pet} size={72} />
        <div>
          <h1 className="text-2xl font-extrabold">{pet.name}</h1>
          {pet.archived && <span className="text-sm text-ink-faint">В архиве</span>}
        </div>
      </div>

      <div className="surface divide-y divide-line">
        {rows.filter(([, v]) => v).map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 p-4">
            <span className="text-ink-faint">{label}</span>
            <span className="text-right font-semibold">{value}</span>
          </div>
        ))}
        {rows.every(([, v]) => !v) && <p className="p-4 text-ink-soft">—</p>}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <button type="button" onClick={() => setEditing(true)} className="btn-secondary"><Pencil size={18} aria-hidden="true" />{t('pet.edit')}</button>
        <button type="button" onClick={() => setConfirm('archive')} className="btn-secondary">
          {pet.archived ? <ArchiveRestore size={18} aria-hidden="true" /> : <Archive size={18} aria-hidden="true" />}
          {pet.archived ? t('pet.unarchive') : t('pet.archive')}
        </button>
        <button type="button" onClick={() => setConfirm('delete')} className="btn bg-berry-100 text-berry-700 hover:bg-berry-100/80">
          <Trash2 size={18} aria-hidden="true" />{t('pet.delete')}
        </button>
      </div>

      {confirm === 'archive' && (
        <ConfirmDialog
          title={pet.archived ? t('pet.unarchive') : t('pet.archive')}
          text={t('pet.archive.confirm')}
          confirmLabel={pet.archived ? t('pet.unarchive') : t('pet.archive')}
          onConfirm={handleArchiveToggle}
          onClose={() => !busy && setConfirm(null)}
        />
      )}
      {confirm === 'delete' && (
        <ConfirmDialog
          title={t('pet.delete')}
          text={t('pet.delete.confirm')}
          confirmLabel={t('common.delete')}
          danger
          onConfirm={handleDelete}
          onClose={() => !busy && setConfirm(null)}
        />
      )}
    </>
  );
}
