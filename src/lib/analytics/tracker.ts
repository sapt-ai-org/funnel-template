export function track(name: string, properties?: Record<string, unknown>): void {
  window.sapt?.track(name, properties)
}

export function identify(traits: Record<string, string | undefined | null>): void {
  const cleaned = Object.fromEntries(
    Object.entries(traits).filter(([, value]) => typeof value === 'string' && value.trim() !== '')
  ) as Record<string, string>
  if (Object.keys(cleaned).length > 0) window.sapt?.identify(cleaned)
}

export function getVisitorId(): string | null {
  return window.sapt?.getVisitorId?.() ?? null
}

export function installSaptTracker(projectId: string, scriptUrl: string): void {
  if (!projectId || !scriptUrl) return
  if (document.querySelector('script[data-sapt-tracker="true"]')) return

  const script = document.createElement('script')
  script.src = scriptUrl
  script.async = true
  script.defer = true
  script.dataset.project = projectId
  script.dataset.saptTracker = 'true'
  document.head.appendChild(script)
}
