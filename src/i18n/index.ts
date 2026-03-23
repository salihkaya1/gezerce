import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// TR
import trCommon from './locales/tr/common.json'
import trForm from './locales/tr/form.json'
import trSelection from './locales/tr/selection.json'
import trPlan from './locales/tr/plan.json'

// EN
import enCommon from './locales/en/common.json'
import enForm from './locales/en/form.json'
import enSelection from './locales/en/selection.json'
import enPlan from './locales/en/plan.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: {
        common: trCommon,
        form: trForm,
        selection: trSelection,
        plan: trPlan,
      },
      en: {
        common: enCommon,
        form: enForm,
        selection: enSelection,
        plan: enPlan,
      },
    },
    defaultNS: 'common',
    fallbackLng: 'tr',
    lng: 'tr',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
