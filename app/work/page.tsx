import { redirect } from 'next/navigation'

// /work has been consolidated into /case-studies. The redirect is also
// configured at the framework level in next.config.ts, but this server-side
// redirect is a belt-and-braces for direct navigation during dev.
export default function WorkIndexRedirect(): never {
  redirect('/case-studies')
}
