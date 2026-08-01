import { TEMPLATES } from '@/templates/registry'
import { NextResponse } from 'next/server'

/**
 * The template catalog the admin picker reads, so the list can never drift from
 * the code that renders it. Deleted by `init-project.ts`.
 */
export function GET() {
  return NextResponse.json(
    {
      templates: Object.values(TEMPLATES).map(({ id, name, description, tags }) => ({
        id,
        name,
        description,
        tags: tags ?? [],
      })),
    },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  )
}
