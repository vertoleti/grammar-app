/* Which language a page practises. German pages set window.GR_LANG = 'de' before loading this file.
   Everything language-specific in the shared engine reads from window.GR_L. */
window.GR_L = (function () {
  const code = window.GR_LANG || 'ru';
  const C = {
    ru: {
      name: 'Русский', en: 'Russian', tts: 'ru-RU', root: '../',
      levelKey: 'gr-level', levelsKey: 'gr-levels', placedKey: 'gr-placed', vocPrefix: 'voc-',
      smart: 'Рекомендуем · Recommended', all: 'Все темы · All topics', miss: 'Мои ошибки · My mistakes',
      how: 'How you’re doing · Ваш уровень', listen: 'Listen · Слушать', settings: 'Settings · Настройки',
      mix: 'Ежедневно · Daily mix', place: 'Тест на уровень · Placement test',
      typeHint: 'Type the form in Cyrillic', typeNote: 'You can type е instead of ё.',
      norm: s => String(s).toLowerCase().replace(/ё/g, 'е')
    },
    de: {
      name: 'Deutsch', en: 'German', tts: 'de-DE', root: '../../',
      levelKey: 'de-level', levelsKey: 'de-levels', placedKey: 'de-placed', vocPrefix: 'de-voc-',
      smart: 'Empfohlen · Recommended', all: 'Alle Themen · All topics', miss: 'Meine Fehler · My mistakes',
      how: 'How you’re doing · Dein Stand', listen: 'Listen · Anhören', settings: 'Settings · Einstellungen',
      mix: 'Täglicher Mix · Daily mix', place: 'Einstufungstest · Placement test',
      typeHint: 'Type the answer', typeNote: 'You can type ss for ß, and ae, oe, ue for ä, ö, ü.',
      norm: s => String(s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    }
  };
  return Object.assign({ code }, C[code] || C.ru);
})();
