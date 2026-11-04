import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { loadLanguage } from './i18n/useTranslation'
import { useLanguageStore } from './i18n/languageStore'

// Keep the localized static content visible until its client translations are ready.
await loadLanguage(useLanguageStore.getState().language)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
