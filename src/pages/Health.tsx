import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Syringe, Pill, Trash2, ScanLine } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { usePets } from '@/features/pets/PetsContext';
import { EmptyState } from '@/components/EmptyState';
import { Spinner } from '@/components/Spinner';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { VaccinationForm } from '@/features/health/VaccinationForm';
import { MedicationForm } from '@/features/health/MedicationForm';
import { useI18n } from '@/i18n';
import { formatDateHuman, daysDiffFromToday, todayStr } from '@/utils/date';
import { LoadError } from '@/components/LoadError';
import {
  addVaccination, addMedication, deleteVaccination, deleteMedication,
  listVaccinations, listMedications, type VaccinationInput, type MedicationInput,
} from '@/services/recordsService';
import type { Medication, Vaccination } from '@/types';

type Tab = 'vaccinations' | 'medications';

export default function Health() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { currentPet, loading: petsLoading } = usePets();
  const [tab, setTab] = useState<Tab>('vaccinations');
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState<{ kind: Tab; id: string } | null>(null);

  async function load() {
    if (!user || !currentPet) return;
    setLoading(true);
    setLoadError(false);
    try {
      const [v, m] = await Promise.all([listVaccinations(user.uid, currentPet.id), listMedications(user.uid, currentPet.id)]);
      setVaccinations(v);
      setMedications(m);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user, currentPet?.id]);

  if (petsLoading) return <Spinner />;
  if (!currentPet) {
    return (
      <>
        <h1 className="mb-5 text-3xl font-extrabold tracking-tight">{t('health.title')}</h1>
        <EmptyState icon={<Syringe size={26} />} title={t('home.empty.title')} text={t('home.empty.text')}
          action={<Link to="/app/onboarding" className="btn-primary">{t('pet.addAnother')}</Link>} />
      </>
    );
  }

  async function handleAddVaccination(input: VaccinationInput) {
    if (!user || !currentPet) return;
    await addVaccination(user.uid, currentPet.id, input);
    await load();
    setShowForm(false);
  }
  async function handleAddMedication(input: MedicationInput) {
    if (!user || !currentPet) return;
    await addMedication(user.uid, currentPet.id, input);
    await load();
    setShowForm(false);
  }
  async function handleDelete() {
    if (!user || !currentPet || !toDelete) return;
    if (toDelete.kind === 'vaccinations') await deleteVaccination(user.uid, currentPet.id, toDelete.id);
    else await deleteMedication(user.uid, currentPet.id, toDelete.id);
    setToDelete(null);
    await load();
  }

  const today = todayStr();
  const done = vaccinations.filter((v) => v.administered).sort((a, b) => b.date.localeCompare(a.date));
  const upcoming = vaccinations.filter((v) => !v.administered && v.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const overdue = vaccinations.filter((v) => !v.administered && v.date < today).sort((a, b) => a.date.localeCompare(b.date));
  const activeMeds = medications.filter((m) => !m.endDate || m.endDate >= today);
  const finishedMeds = medications.filter((m) => m.endDate && m.endDate < today);

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">{t('health.title')}</h1>
        <div className="flex items-center gap-1">
          <Link to="/app/passport" className="btn-quiet"><ScanLine size={20} aria-hidden="true" /></Link>
          <button type="button" onClick={() => setShowForm(true)} className="btn-quiet"><Plus size={20} aria-hidden="true" />{t('common.add')}</button>
        </div>
      </div>

      <div role="tablist" className="mb-5 grid grid-cols-2 gap-2 rounded-ctl bg-mist p-1">
        <button role="tab" aria-selected={tab === 'vaccinations'} onClick={() => setTab('vaccinations')}
          className={`min-h-[44px] rounded-ctl text-sm font-bold ${tab === 'vaccinations' ? 'bg-white shadow-soft text-lagoon-700' : 'text-ink-soft'}`}>
          {t('vaccination.title')}
        </button>
        <button role="tab" aria-selected={tab === 'medications'} onClick={() => setTab('medications')}
          className={`min-h-[44px] rounded-ctl text-sm font-bold ${tab === 'medications' ? 'bg-white shadow-soft text-lagoon-700' : 'text-ink-soft'}`}>
          {t('medication.title')}
        </button>
      </div>

      {loading ? <Spinner /> : loadError ? (
        <LoadError onRetry={load} />
      ) : tab === 'vaccinations' ? (
        vaccinations.length === 0 ? (
          <EmptyState icon={<Syringe size={26} />} title={t('vaccination.empty')} text=""
            action={<button type="button" onClick={() => setShowForm(true)} className="btn-primary">{t('vaccination.add')}</button>} />
        ) : (
          <div className="flex flex-col gap-6">
            {overdue.length > 0 && <VaccGroup title={t('vaccination.overdue')} items={overdue} onDelete={(id) => setToDelete({ kind: 'vaccinations', id })} tone="berry" />}
            {upcoming.length > 0 && <VaccGroup title={t('vaccination.upcoming')} items={upcoming} onDelete={(id) => setToDelete({ kind: 'vaccinations', id })} tone="honey" />}
            {done.length > 0 && <VaccGroup title={t('vaccination.done')} items={done} onDelete={(id) => setToDelete({ kind: 'vaccinations', id })} tone="lagoon" />}
          </div>
        )
      ) : (
        medications.length === 0 ? (
          <EmptyState icon={<Pill size={26} />} title={t('medication.empty')} text=""
            action={<button type="button" onClick={() => setShowForm(true)} className="btn-primary">{t('medication.add')}</button>} />
        ) : (
          <div className="flex flex-col gap-6">
            {activeMeds.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-bold text-ink-faint">{t('medication.active')}</h2>
                <ul className="surface divide-y divide-line">
                  {activeMeds.map((m) => <MedRow key={m.id} med={m} onDelete={() => setToDelete({ kind: 'medications', id: m.id })} />)}
                </ul>
              </section>
            )}
            {finishedMeds.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-bold text-ink-faint">{t('medication.finished')}</h2>
                <ul className="surface divide-y divide-line opacity-70">
                  {finishedMeds.map((m) => <MedRow key={m.id} med={m} onDelete={() => setToDelete({ kind: 'medications', id: m.id })} />)}
                </ul>
              </section>
            )}
          </div>
        )
      )}

      {showForm && (
        <Modal title={tab === 'vaccinations' ? t('vaccination.add') : t('medication.add')} onClose={() => setShowForm(false)}>
          {tab === 'vaccinations' ? <VaccinationForm onSubmit={handleAddVaccination} /> : <MedicationForm onSubmit={handleAddMedication} />}
        </Modal>
      )}
      {toDelete && (
        <ConfirmDialog
          title={t('common.confirmDeleteTitle')}
          text={toDelete.kind === 'vaccinations' ? t('vaccination.delete.confirm') : t('medication.delete.confirm')}
          confirmLabel={t('common.delete')}
          danger
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
}

function VaccGroup({ title, items, onDelete, tone }: { title: string; items: Vaccination[]; onDelete: (id: string) => void; tone: 'berry' | 'honey' | 'lagoon' }) {
  const dot = tone === 'berry' ? 'bg-berry-600' : tone === 'honey' ? 'bg-honey-500' : 'bg-lagoon-500';
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-faint">
        <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" /> {title}
      </h2>
      <ul className="surface divide-y divide-line">
        {items.map((v) => {
          const diff = daysDiffFromToday(v.date);
          const sub = v.administered
            ? formatDateHuman(v.date)
            : diff < 0 ? `Просрочено на ${Math.abs(diff)} дн.` : diff === 0 ? 'Сегодня' : `Через ${diff} дн. · ${formatDateHuman(v.date)}`;
          return (
            <li key={v.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-bold">{v.name}</p>
                <p className="text-sm text-ink-soft">{sub}</p>
                {(v.clinic || v.vet) && <p className="truncate text-sm text-ink-faint">{[v.clinic, v.vet].filter(Boolean).join(' · ')}</p>}
              </div>
              <button type="button" onClick={() => onDelete(v.id)} aria-label="Удалить" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-ctl text-ink-faint hover:bg-berry-100 hover:text-berry-700">
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function MedRow({ med, onDelete }: { med: Medication; onDelete: () => void }) {
  return (
    <li className="flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="truncate font-bold">{med.name}</p>
        <p className="text-sm text-ink-soft">
          {[med.dosageAmount, med.dosageUnit].filter(Boolean).join(' ')} {med.dosageAmount ? '·' : ''} {med.times.join(', ')}
        </p>
        <p className="text-sm text-ink-faint">
          {formatDateHuman(med.startDate)} {med.endDate ? `— ${formatDateHuman(med.endDate)}` : ''}
        </p>
      </div>
      <button type="button" onClick={onDelete} aria-label="Удалить" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-ctl text-ink-faint hover:bg-berry-100 hover:text-berry-700">
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </li>
  );
}
