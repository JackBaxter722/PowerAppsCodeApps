// App-level event tracking. The Power Apps SDK exposes metric logging
// (`@microsoft/power-apps/telemetry`), but app-defined custom events are best
// funnelled through one helper so they can later be forwarded to Application
// Insights or another sink. For the sample we log to the console.

export interface TelemetryEvent {
  name: string
  props?: Record<string, string | number | boolean | undefined>
}

export function track(name: string, props?: TelemetryEvent['props']): void {
  // Single choke point: swap this for a real sink (App Insights, custom API, …).
  console.info('[telemetry]', name, props ?? {})
}

export function trackPageView(path: string): void {
  track('page_view', { path })
}
