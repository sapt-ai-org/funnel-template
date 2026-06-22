import { z } from 'zod'

export const LeadInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Valid email is required').max(200),
  phone: z.string().trim().max(60).optional().or(z.literal('')),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  message: z.string().trim().max(5000).optional().or(z.literal('')),
  answers: z.record(z.string(), z.unknown()).optional(),
  visitorId: z.string().trim().max(200).nullable().optional(),
  landingPage: z.string().trim().max(2000).optional().or(z.literal('')),
  referrer: z.string().trim().max(2000).optional().or(z.literal('')),
  utm: z
    .object({
      source: z.string().trim().max(200).optional(),
      medium: z.string().trim().max(200).optional(),
      campaign: z.string().trim().max(200).optional(),
      term: z.string().trim().max(200).optional(),
      content: z.string().trim().max(200).optional(),
    })
    .optional(),
  // Honeypot. Humans never fill this. Bots often do.
  website: z.string().max(0).optional().or(z.literal('')),
})

export type LeadInput = z.infer<typeof LeadInputSchema>
