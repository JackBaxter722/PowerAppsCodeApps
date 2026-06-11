// Thin wrapper over Fluent's toast system. A single Toaster (mounted in the
// layout) is targeted by a shared id; useNotify() returns helpers to dispatch
// success / info toasts from anywhere in the app.

import { useCallback } from 'react'
import {
  Toast,
  ToastBody,
  ToastTitle,
  useToastController,
} from '@fluentui/react-components'

export const TOASTER_ID = 'orderhub-toaster'

type Intent = 'success' | 'info' | 'warning' | 'error'

// Module-level error notifier so non-React code (the QueryClient's MutationCache)
// can surface failures as toasts. The layout registers the real implementation.
let errorNotifier: ((title: string, body?: string) => void) | null = null

export function registerErrorNotifier(
  fn: ((title: string, body?: string) => void) | null,
) {
  errorNotifier = fn
}

export function notifyError(title: string, body?: string) {
  errorNotifier?.(title, body)
}

export function useNotify() {
  const { dispatchToast } = useToastController(TOASTER_ID)

  return useCallback(
    (title: string, options?: { body?: string; intent?: Intent }) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{title}</ToastTitle>
          {options?.body && <ToastBody>{options.body}</ToastBody>}
        </Toast>,
        { intent: options?.intent ?? 'success' },
      )
    },
    [dispatchToast],
  )
}
