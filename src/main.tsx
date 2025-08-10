import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from './components/app-provider.tsx'
import { DocumentProvider } from './components/document-provider.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppProvider>
        <DocumentProvider>
          <App />
        </DocumentProvider>
      </AppProvider>
    </ThemeProvider>
  </StrictMode>,
)
