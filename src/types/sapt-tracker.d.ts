export interface SaptTracker {
  getVisitorId(): string | null
  track(name: string, properties?: Record<string, unknown>): void
  identify(traits: Record<string, string>): void
}

declare global {
  interface Window {
    sapt?: SaptTracker
  }
}

export {}
