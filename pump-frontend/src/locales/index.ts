import { Locale } from 'vant';
import { createI18n } from 'vue-i18n';

import zhCN from './zh-CN';

import storage from '@/utils/storage';

const DEFAULT_LANG = 'zh-CN';

// https://github.com/lokalise/i18n-ally/tree/main/locales
export const LANGUAGE_LIST = [
  { name: '简体中文', value: 'zh-CN' },
  { name: 'English', value: 'en' },
];

function setupLocale() {
  const locale = storage.getItem('locale') || DEFAULT_LANG;

  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: DEFAULT_LANG,
    messages: {
      'zh-CN': { ...zhCN },
    },
  });

  setLocale(locale);

  return i18n;
}

export const i18n = setupLocale();

async function loadLocaleMessages(locale) {
  const supported = LANGUAGE_LIST.map(({ value }) => value);
  if (!supported.includes(locale)) {
    locale = DEFAULT_LANG;
  }

  return await import(`./${locale}.ts`);
}

export async function setLocale(locale) {
  const messages = await loadLocaleMessages(locale);

  document.querySelector('html').setAttribute('lang', locale);

  i18n.global.setLocaleMessage(locale, messages.default);
  i18n.global.locale.value = locale;

  setVantLocale(locale);
  storage.setItem('locale', locale);
}

export function setVantLocale(locale) {
  const vantLocales = {
    'zh-CN': require('vant/es/locale/lang/zh-CN').default,
    en: require('vant/es/locale/lang/en-US').default,
  };

  Locale.use(locale, vantLocales[locale] || vantLocales['en']);
}
