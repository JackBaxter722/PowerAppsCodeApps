import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Keytips } from '@fluentui-contrib/react-keytips'
import { ThemeProvider } from '@/lib/theme'
import PowerProvider from '@/PowerProvider'
import { router } from '@/router'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PowerProvider>
        <QueryClientProvider client={queryClient}>
          <Keytips />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </PowerProvider>
    </ThemeProvider>
  </StrictMode>,
)
