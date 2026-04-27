import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import StrategyForm from '@/app/components/StrategyForm'

export default async function GetStrategy() {
  const form = await client.fetch(`
    *[_type == "strategyForm"][0]{
      title,
      subtitle,
      countries[]{
        flag,
        countryName,
        dialCode,
        phoneLength
      },
      humanQuestion,
      humanAnswer
    }
  `)

  return (
    <PageLayout>
      <section className="min-h-screen flex items-center justify-center px-6 pt-40 pb-24">
        <div className="max-w-2xl w-full">
          <h1 className="text-4xl font-bold mb-6 text-[#DFBA67]">
            {form?.title || 'Get Your AI Growth Strategy'}
          </h1>

          <p className="mb-8 text-[#8A95A5]">
            {form?.subtitle || 'Tell us about your business and we will get back to you.'}
          </p>

          <StrategyForm
            countries={form?.countries || []}
            humanQuestion={form?.humanQuestion || ''}
            humanAnswer={form?.humanAnswer || ''}
          />
        </div>
      </section>
    </PageLayout>
  )
}