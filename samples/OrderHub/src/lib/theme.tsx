// Renders the FluentProvider and supplies the light/dark toggle via context.

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  FluentProvider,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components'
import {
  ThemeContext,
  type ThemeContextValue,
  type ThemeMode,
} from '@/lib/theme-context'

const STORAGE_KEY = 'orderhub-theme'

function initialMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  )

  return (
    <ThemeContext.Provider value={value}>
      <FluentProvider
        theme={mode === 'light' ? webLightTheme : webDarkTheme}
        style={{ minHeight: '100vh' }}
      >
        {children}
      </FluentProvider>
    </ThemeContext.Provider>
  )
}
