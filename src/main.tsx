import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from '@/components/app-provider.tsx'
import { DocumentProvider } from '@/components/document-provider.tsx'
import { StateProvider } from '@/components/state-provider.tsx'
import { DiagramProvider } from '@/components/diagram-provider'

import '@/index.css'
import App from '@/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <StateProvider>
        <DiagramProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <DocumentProvider>
              <App />
            </DocumentProvider>
          </ThemeProvider>
        </DiagramProvider>
      </StateProvider>
    </AppProvider>
  </StrictMode>,
)
