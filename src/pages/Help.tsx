import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { TriangleAlert, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { usePets } from '@/features/pets/PetsContext';
import { Modal } from '@/components/Modal';
import { HelpTopicIcon } from '@/components/HelpTopicIcon';
import { useI18n } from '@/i18n';
import { HELP_TOPICS, type HelpTopic } from '@/data/bupyHelp';
import { getGeminiKey } from '@/services/geminiKeyStorage';
import { askBupyHelp, GeminiError, type PetContext } from '@/services/geminiService';
import { GEMINI_DEFAULT_KEY } from '@/config';
import { ageFromBirthDate } from '@/utils/date';

export default function Help() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { currentPet } = usePets();
  const [openTopic, setOpenTopic] = useState<HelpTopic | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const apiKey = (user ? getGeminiKey(user.uid) : null) ?? GEMINI_DEFAULT_KEY ?? null;

  async function handleAsk(e: FormEvent) {
    e.preventDefault();
    if (!apiKey || !question.trim() || asking) return;
    setAsking(true);
    setAiError(null);
    setAnswer(null);
    try {
      const petContext: PetContext | undefined = currentPet ? {
        species: currentPet.species,
        name: currentPet.name,
        ...(currentPet.breed ? { breed: currentPet.breed } : {}),
        ...(currentPet.sex ? { sex: currentPet.sex } : {}),
        ...(ageFromBirthDate(currentPet.birthDate) ? { ageText: ageFromBirthDate(currentPet.birthDate)! } : {}),
        ...(currentPet.weight != null ? { weightText: `${currentPet.weight} ${currentPet.weightUnit ?? 'kg'}` } : {}),
        ...(currentPet.neutered ? { neutered: true } : {}),
        ...(currentPet.features ? { features: currentPet.features } : {}),
      } : undefined;
      const res = await askBupyHelp(apiKey, question.trim(), petContext);
      setAnswer(res);
    } catch (err) {
      if (err instanceof GeminiError && err.kind === 'key') setAiError(t('help.ai.error.key'));
      else if (err instanceof GeminiError && err.kind === 'rate') setAiError(t('help.ai.error.rate'));
      else setAiError(t('help.ai.error'));
    } finally {
      setAsking(false);
    }
  }

  return (
    <>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight">{t('help.title')}</h1>

      <div role="note" className="mb-6 flex gap-3 rounded-card border border-honey-500/40 bg-honey-100 p-4 text-sm text-honey-700">
        <TriangleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-bold">{t('help.disclaimer')}</p>
          <p className="mt-1">{t('help.urgent')}</p>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-faint"><Sparkles size={16} aria-hidden="true" /> {t('help.ai.title')}</h2>
        {!apiKey ? (
          <div className="surface p-4">
            <p className="font-bold">{t('help.ai.needKey.title')}</p>
            <p className="mt-1 text-sm text-ink-soft">{t('help.ai.needKey.text')}</p>
            <Link to="/app/profile" className="btn-secondary mt-3">{t('help.ai.needKey.cta')}</Link>
          </div>
        ) : (
          <div className="surface p-4">
            <p className="mb-3 text-sm text-ink-soft">{t('help.ai.subtitle')}</p>
            <form onSubmit={handleAsk} className="flex flex-col gap-3">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('help.ai.placeholder')}
                rows={3}
                className="field resize-none py-3"
              />
              <button type="submit" className="btn-primary" disabled={asking || !question.trim()}>
                {asking ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : null}
                {asking ? t('help.ai.thinking') : t('help.ai.ask')}
              </button>
            </form>
            {aiError && <p role="alert" className="mt-3 text-sm text-berry-700">{aiError}</p>}
            {answer && (
              <div className="mt-4 rounded-ctl bg-lagoon-50 p-4">
                <p className="whitespace-pre-wrap text-ink">{answer}</p>
                <p className="mt-2 text-xs text-ink-faint">{t('help.ai.disclaimerShort')}</p>
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-ink-faint">{t('help.topics.title')}</h2>
        <ul className="surface divide-y divide-line">
          {HELP_TOPICS.map((topic) => (
            <li key={topic.id}>
              <button type="button" onClick={() => setOpenTopic(topic)} className="flex w-full items-center gap-4 p-4 text-left hover:bg-mist">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lagoon-50 text-lagoon-600"><HelpTopicIcon icon={topic.icon} /></span>
                <span className="font-bold">{topic.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {openTopic && (
        <Modal title={openTopic.title} onClose={() => setOpenTopic(null)}>
          <div className="mb-4 flex gap-3 rounded-ctl border border-honey-500/40 bg-honey-100 p-3 text-sm text-honey-700">
            <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            {t('help.disclaimer')}
          </div>
          <TopicSection title={t('help.now')} items={openTopic.now} icon={<Check size={16} className="text-lagoon-600" aria-hidden="true" />} />
          <TopicSection title={t('help.avoid')} items={openTopic.avoid} icon={<X size={16} className="text-berry-600" aria-hidden="true" />} />
          <div className="mt-4 rounded-ctl bg-berry-100 p-4">
            <p className="mb-2 flex items-center gap-2 font-bold text-berry-700"><TriangleAlert size={18} aria-hidden="true" /> {t('help.urgentTitle')}</p>
            <ul className="space-y-1.5 text-sm text-berry-700">
              {openTopic.urgent.map((line, i) => <li key={i}>• {line}</li>)}
            </ul>
          </div>
        </Modal>
      )}
    </>
  );
}

function TopicSection({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-2 font-bold">{title}</p>
      <ul className="space-y-2 text-sm text-ink-soft">
        {items.map((line, i) => (
          <li key={i} className="flex gap-2"><span className="mt-0.5 shrink-0">{icon}</span>{line}</li>
        ))}
      </ul>
    </div>
  );
}
