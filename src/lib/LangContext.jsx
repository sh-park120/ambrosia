import { createContext, useContext, useState } from 'react'
import { translations } from './i18n'

const LangContext = createContext({ lang: 'en', t: translations.en, setLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')
  return (
    <LangContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
