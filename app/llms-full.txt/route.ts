import { fetchAll, buildLlmsFullTxt } from '@/lib/llms.mjs'

// Rebuilt from Sanity at most once an hour — no redeploy needed.
export const revalidate = 3600

export async function GET() {
  const data = await fetchAll()
  return new Response(buildLlmsFullTxt(data), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
