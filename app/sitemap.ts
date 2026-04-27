import { client } from '@/lib/sanity'

export default async function sitemap() {
  const baseUrl = 'https://mnmagency.com'

  const services = await client.fetch(`*[_type == "service"]{ slug }`)
  const blogs = await client.fetch(`*[_type == "blog"]{ slug }`)
  const caseStudies = await client.fetch(`*[_type == "caseStudy"]{ slug }`)

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
    },
    {
      url: `${baseUrl}/contact`,
    },
    {
      url: `${baseUrl}/faqs`,
    },
    {
      url: `${baseUrl}/work`,
    },
    {
      url: `${baseUrl}/case-studies`,
    },

    ...services.map((item: any) => ({
      url: `${baseUrl}/services/${item.slug.current}`,
    })),

    ...blogs.map((item: any) => ({
      url: `${baseUrl}/blog/${item.slug.current}`,
    })),

    ...caseStudies.map((item: any) => ({
      url: `${baseUrl}/case-studies/${item.slug.current}`,
    })),
  ]
}