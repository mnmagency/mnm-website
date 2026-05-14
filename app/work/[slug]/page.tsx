import { redirect } from 'next/navigation'

// /work/[slug] has been consolidated into /case-studies/[slug].
export default async function WorkDetailRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<never> {
  const { slug } = await params
  redirect(`/case-studies/${slug}`)
}
