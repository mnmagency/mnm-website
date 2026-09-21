import { NextResponse } from 'next/server'
import { issueHumanChallenge } from '@/lib/security'

// Always generate a fresh challenge — never cache.
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(issueHumanChallenge(), {
    headers: { 'Cache-Control': 'no-store' },
  })
}
