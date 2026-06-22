export interface LeadAnalyticsPayload {
  emailDomain?: string
  offer?: string
  hasPhone?: boolean
  hasCompany?: boolean
}

export function emailDomain(email: string): string | undefined {
  return email.includes('@') ? email.split('@')[1]?.toLowerCase() : undefined
}
