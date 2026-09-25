import { useState } from 'react';
import { LogOut, ExternalLink, Bell, Download, FileText, Trash2, Smartphone } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { usePets } from '@/features/pets/PetsContext';
import { useI18n, LOCALES, type Locale } from '@/i18n';
import { logout, deleteAccount } from '@/services/authService';
import { FormError } from '@/components/FormError';
import { Select } from '@/components/Select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { getGeminiKey, setGeminiKey, clearGeminiKey } from '@/services/geminiKeyStorage';
import { GEMINI_DEFAULT_KEY } from '@/config';
import { remindersSupported, remindersEnabled, enableReminders, disableReminders, notificationPermission } from '@/services/reminders';
import { fetchPetExportData, downloadJson, openReport } from '@/services/exportService';

export default function Profile() {
  const { t, locale, setLocale } = useI18n();
  const { user } = useAuth();
  const { activePets } = usePets();
  const [error, setError] = useState<string | null>(null);

  const [keyInput, setKeyInput] = useState(() => (user ? getGeminiKey(user.uid) ?? '' : ''));
  const [keySaved, setKeySaved] = useState(false);

  const [remOn, setRemOn] = useState(remindersEnabled());
  const [remMsg, setRemMsg] = useState<string | null>(null);

  const [exportPetId, setExportPetId] = useState(activePets[0]?.id ?? '');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function onLogout() {
    try { await logout(); } catch { setError(t('error.generic')); }
  }

  function onSaveKey() {
    if (!user) return;
    if (keyInput.trim()) setGeminiKey(user.uid, keyInput.trim());
    else clearGeminiKey(user.uid);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  }
  function onRemoveKey() {
    if (!user) return;
    clearGeminiKey(user.uid);
    setKeyInput('');
  }

  async function onToggleReminders() {
    setRemMsg(null);
    if (remOn) {
      disableReminders();
      setRemOn(false);
      return;
    }
    const granted = await enableReminders();
    setRemOn(granted);
    if (!granted) {
      const perm = notificationPermission();
      setRemMsg(perm === 'unsupported' ? t('reminders.unsupported') : t('reminders.denied'));
    }
  }

  async function onExportJson() {
    if (!user) return;
    const pet = activePets.find((p) => p.id === exportPetId);
    if (!pet) return;
    setExporting(true);
    setExportError(null);
    try { downloadJson(await fetchPetExportData(user.uid, pet)); }
    catch { setExportError(t('error.load')); }
    finally { setExporting(false); }
  }
  async function onOpenReport() {
    if (!user) return;
    const pet = activePets.find((p) => p.id === exportPetId);
    if (!pet) return;
    setExporting(true);
    setExportError(null);
    try { openReport(await fetchPetExportData(user.uid, pet)); }
    catch { setExportError(t('error.load')); }
    finally { setExporting(false); }
  }

  async function onDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
    } catch {
      setDeleteError(t('export.deleteAccount.error'));
      setDeleting(false);
    }
  }

  return (
    <>
      <h1 className="mb-5 text-3xl font-extrabold tracking-tight">{t('profile.title')}</h1>
      <div className="surface divide-y divide-line">
        <div className="p-5">
          <p className="text-sm text-ink-faint">{t('profile.account')}</p>
          <p className="mt-1 font-bold">{user?.displayName || '—'}</p>
          <p className="text-ink-soft">{user?.email}</p>
        </div>
        <div className="p-5">
          <label htmlFor="locale" className="label">Язык / Тіл / Language</label>
          <select id="locale" className="field" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
            {LOCALES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {/* ИИ-помощник */}
      <div className="surface mt-4 p-5">
        <p className="font-bold">{t('profile.ai.title')}</p>
        <p className="mt-1 text-sm text-ink-soft">
          {GEMINI_DEFAULT_KEY ? t('profile.ai.text.defaultActive') : t('profile.ai.text')}
        </p>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="btn-quiet -ml-3 mt-2">
          {t('profile.ai.getKey')} <ExternalLink size={16} aria-hidden="true" />
        </a>
        <label htmlFor="gemini-key" className="label mt-3">{t('profile.ai.key')}</label>
        <input id="gemini-key" type="password" autoComplete="off" spellCheck={false} className="field"
          placeholder={t('profile.ai.key.placeholder')} value={keyInput} onChange={(e) => setKeyInput(e.target.value)} />
        <p className="mt-1.5 text-sm text-ink-faint">{t('profile.ai.restrict')}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={onSaveKey} className="btn-secondary">{t('profile.ai.save')}</button>
          {keyInput && <button type="button" onClick={onRemoveKey} className="btn-quiet">{t('profile.ai.remove')}</button>}
        </div>
        {keySaved && <p role="status" className="mt-2 text-sm text-lagoon-700">{t('profile.ai.saved')}</p>}
      </div>

      {/* Установка на телефон */}
      <div className="surface mt-4 p-5">
        <p className="flex items-center gap-2 font-bold"><Smartphone size={18} aria-hidden="true" /> {t('install.title')}</p>
        <p className="mt-1 text-sm text-ink-soft">{t('install.text')}</p>
        <div className="mt-3">
          <p className="text-sm font-bold text-ink">{t('install.ios.title')}</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
            <li>{t('install.ios.step1')}</li>
            <li>{t('install.ios.step2')}</li>
            <li>{t('install.ios.step3')}</li>
          </ol>
        </div>
        <div className="mt-4">
          <p className="text-sm font-bold text-ink">{t('install.android.title')}</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
            <li>{t('install.android.step1')}</li>
            <li>{t('install.android.step2')}</li>
            <li>{t('install.android.step3')}</li>
          </ol>
        </div>
      </div>

      {/* Напоминания */}
      {remindersSupported() && (
        <div className="surface mt-4 p-5">
          <p className="flex items-center gap-2 font-bold"><Bell size={18} aria-hidden="true" /> {t('reminders.title')}</p>
          <p className="mt-1 text-sm text-ink-soft">{t('reminders.text')}</p>
          <button type="button" onClick={onToggleReminders} className="btn-secondary mt-3">
            {remOn ? t('reminders.disable') : t('reminders.enable')}
          </button>
          {remOn && <p role="status" className="mt-2 text-sm text-lagoon-700">{t('reminders.enabled')}</p>}
          {remMsg && <p role="alert" className="mt-2 text-sm text-berry-700">{remMsg}</p>}
        </div>
      )}

      {/* Экспорт */}
      {activePets.length > 0 && (
        <div className="surface mt-4 p-5">
          <p className="font-bold">{t('export.title')}</p>
          <p className="mt-1 text-sm text-ink-soft">{t('export.text')}</p>
          <div className="mt-3"><Select label={t('export.selectPet')} value={exportPetId} onChange={(e) => setExportPetId(e.target.value)}>
            {activePets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select></div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={onExportJson} disabled={exporting} className="btn-secondary"><Download size={18} aria-hidden="true" />{t('export.json')}</button>
            <button type="button" onClick={onOpenReport} disabled={exporting} className="btn-secondary"><FileText size={18} aria-hidden="true" />{t('export.report')}</button>
          </div>
          {exportError && <p role="alert" className="mt-2 text-sm text-berry-700">{exportError}</p>}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <FormError message={error} />
        <button type="button" onClick={onLogout} className="btn-secondary"><LogOut size={20} aria-hidden="true" />{t('auth.logout')}</button>
        <button type="button" onClick={() => setConfirmDelete(true)} className="btn bg-berry-100 text-berry-700 hover:bg-berry-100/80">
          <Trash2 size={18} aria-hidden="true" /> {t('export.deleteAccount')}
        </button>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title={t('export.deleteAccount')}
          text={t('export.deleteAccount.confirm')}
          confirmLabel={t('common.delete')}
          danger
          onConfirm={onDeleteAccount}
          onClose={() => !deleting && setConfirmDelete(false)}
        />
      )}
      {deleteError && <p role="alert" className="mt-3 text-sm text-berry-700">{deleteError}</p>}
    </>
  );
}
