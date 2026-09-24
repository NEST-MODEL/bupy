import type { CalendarEvent, Medication, Pet, Vaccination } from '@/types';
import { listVaccinations, listMedications, listEvents } from '@/services/recordsService';
import { formatDateHuman } from '@/utils/date';

export interface PetExportData {
  pet: Pet;
  vaccinations: Vaccination[];
  medications: Medication[];
  events: CalendarEvent[];
}

export async function fetchPetExportData(uid: string, pet: Pet): Promise<PetExportData> {
  const [vaccinations, medications, events] = await Promise.all([
    listVaccinations(uid, pet.id),
    listMedications(uid, pet.id),
    listEvents(uid, pet.id),
  ]);
  return { pet, vaccinations, medications, events };
}

export function downloadJson(data: PetExportData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bupy-${data.pet.name.toLowerCase().replace(/\s+/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function buildReportHtml(data: PetExportData): string {
  const { pet, vaccinations, medications, events } = data;
  const rows = (label: string, value?: string) => (value ? `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>` : '');

  const vaccHtml = vaccinations.length
    ? `<table><thead><tr><th>Вакцина</th><th>Дата</th><th>Статус</th><th>Клиника / врач</th></tr></thead><tbody>${vaccinations
        .map((v) => `<tr><td>${esc(v.name)}</td><td>${formatDateHuman(v.date)}</td><td>${v.administered ? 'Выполнена' : 'Запланирована'}</td><td>${esc([v.clinic, v.vet].filter(Boolean).join(' · '))}</td></tr>`)
        .join('')}</tbody></table>`
    : `<p class="muted">Нет данных</p>`;

  const medHtml = medications.length
    ? `<table><thead><tr><th>Препарат</th><th>Дозировка</th><th>Время</th><th>Период</th></tr></thead><tbody>${medications
        .map((m) => `<tr><td>${esc(m.name)}</td><td>${esc([m.dosageAmount, m.dosageUnit].filter(Boolean).join(' '))}</td><td>${esc(m.times.join(', '))}</td><td>${formatDateHuman(m.startDate)}${m.endDate ? ` — ${formatDateHuman(m.endDate)}` : ''}</td></tr>`)
        .join('')}</tbody></table>`
    : `<p class="muted">Нет данных</p>`;

  const eventsHtml = events.length
    ? `<table><thead><tr><th>Событие</th><th>Дата</th><th>Комментарий</th></tr></thead><tbody>${events
        .map((e) => `<tr><td>${esc(e.title)}</td><td>${formatDateHuman(e.date)}${e.time ? ` ${esc(e.time)}` : ''}</td><td>${esc(e.notes ?? '')}</td></tr>`)
        .join('')}</tbody></table>`
    : `<p class="muted">Нет данных</p>`;

  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>Bupy — медицинская история ${esc(pet.name)}</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; color: #15201F; max-width: 800px; margin: 0 auto; padding: 32px 24px 60px; }
  h1 { font-size: 26px; margin-bottom: 4px; }
  h2 { font-size: 18px; margin-top: 32px; border-bottom: 2px solid #1E6F6A; padding-bottom: 6px; }
  .muted { color: #7B8B89; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #DCE5E3; font-size: 14px; }
  th.label-col, table.profile th { width: 200px; color: #7B8B89; font-weight: 600; }
  .meta { color: #7B8B89; font-size: 13px; margin-bottom: 20px; }
  .print-bar { margin: 20px 0; }
  .print-bar button { font: inherit; padding: 10px 18px; border-radius: 10px; border: none; background: #1E6F6A; color: #fff; cursor: pointer; }
  @media print { .print-bar { display: none; } body { padding: 0; } }
</style></head>
<body>
  <h1>Bupy — медицинская история ${esc(pet.name)}</h1>
  <p class="meta">Отчёт сформирован: ${new Date().toLocaleString('ru-RU')}</p>
  <div class="print-bar"><button onclick="window.print()">Сохранить как PDF / Печать</button></div>

  <h2>Профиль</h2>
  <table class="profile">
    <tbody>
      ${rows('Вид', pet.species === 'dog' ? 'Собака' : 'Кошка')}
      ${rows('Порода', pet.breed)}
      ${rows('Пол', pet.sex === 'male' ? 'Мальчик' : pet.sex === 'female' ? 'Девочка' : undefined)}
      ${rows('Дата рождения', pet.birthDate ? formatDateHuman(pet.birthDate) : undefined)}
      ${rows('Вес', pet.weight != null ? `${pet.weight} ${pet.weightUnit ?? 'kg'}` : undefined)}
      ${rows('Цвет', pet.color)}
      ${rows('Микрочип', pet.microchipNumber)}
      ${rows('Город', pet.city)}
    </tbody>
  </table>

  <h2>Вакцинации</h2>
  ${vaccHtml}

  <h2>Лекарства</h2>
  ${medHtml}

  <h2>События</h2>
  ${eventsHtml}
</body></html>`;
}

export function openReport(data: PetExportData): void {
  const html = buildReportHtml(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
