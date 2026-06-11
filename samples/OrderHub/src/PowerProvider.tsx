import { getContext } from '@microsoft/power-apps/app'
import { useEffect, type ReactNode } from 'react'

interface PowerProviderProps {
  children: ReactNode
}

// The Power Apps SDK (v1.1+) initializes implicitly; there is no separate
// initialize() call. This provider warms up the connection to the host by
// requesting the app context once on mount and logs readiness so issues are
// easy to spot during the "fetching your app" startup phase.
export default function PowerProvider({ children }: PowerProviderProps) {
  useEffect(() => {
    const warmUp = async () => {
      try {
        await getContext()
        console.log('Power Platform SDK initialized successfully')
      } catch (error) {
        console.error('Failed to initialize Power Platform SDK:', error)
      }
    }

    void warmUp()
  }, [])

  return <>{children}</>
}
