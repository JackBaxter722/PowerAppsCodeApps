// Reads the query parameters Power Apps passes to the app (via getContext) once
// on startup and, if they map to a known destination, redirects there. In local
// dev getContext resolves with the browser URL's query params, so the exact same
// links work without the Power Apps host.

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getContext } from '@microsoft/power-apps/app'
import { parseDeepLink } from '@/lib/parseDeepLink'

export function useDeepLink() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    let cancelled = false

    const resolve = async () => {
      let queryParams: Record<string, string> = {}
      try {
        const ctx = await getContext()
        queryParams = ctx?.app?.queryParams ?? {}
      } catch (error) {
        // Outside the Power Apps host getContext can reject; fall back to the
        // browser URL so deep links still work during local development.
        console.warn('getContext unavailable, using URL params for deep link', error)
        queryParams = Object.fromEntries(new URLSearchParams(window.location.search))
      }

      if (cancelled) return

      const target = parseDeepLink(queryParams)
      if (target) {
        navigate(target.path + target.search, { replace: true })
      }
    }

    void resolve()

    return () => {
      cancelled = true
    }
  }, [navigate])
}
