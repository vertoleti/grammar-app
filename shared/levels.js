/* CEFR levels with their English, Russian and German names (Russian names follow the ТРКИ test levels, German ones the Goethe-Institut descriptions). */
window.CEFR = [
  { code: 'A1', en: 'Beginner', ru: 'Элементарный', test: 'ТЭУ', de: 'Anfänger', testDe: 'Goethe-Zertifikat A1' },
  { code: 'A2', en: 'Elementary', ru: 'Базовый', test: 'ТБУ', de: 'Grundlegende Kenntnisse', testDe: 'Goethe-Zertifikat A2' },
  { code: 'B1', en: 'Intermediate', ru: 'Первый', test: 'ТРКИ-1', de: 'Fortgeschrittene Sprachverwendung', testDe: 'Goethe-Zertifikat B1' },
  { code: 'B2', en: 'Upper intermediate', ru: 'Второй', test: 'ТРКИ-2', de: 'Selbstständige Sprachverwendung', testDe: 'Goethe-Zertifikat B2' },
  { code: 'C1', en: 'Advanced', ru: 'Третий', test: 'ТРКИ-3', de: 'Fachkundige Sprachkenntnisse', testDe: 'Goethe-Zertifikat C1' },
  { code: 'C2', en: 'Proficient', ru: 'Четвёртый', test: 'ТРКИ-4', de: 'Annähernd muttersprachlich', testDe: 'Goethe-Zertifikat C2' }
];
// On German pages the native-language name fields show the German names.
if (window.GR_LANG === 'de') window.CEFR.forEach(l => { l.ru = l.de; l.test = l.testDe; });
