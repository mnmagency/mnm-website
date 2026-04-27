import { client } from '@/lib/sanity'

export default async function Footer() {
  const nav = await client.fetch(`
    *[_type == "navigation"][0]{
      logo{
        asset->{url}
      },
      footerColumns[]{
        columnTitle,
        links[]{
          label,
          link
        }
      },
      items[]{
        label,
        link
      },
      ctaText,
      ctaLink,
      footerDescription,
      address,
      phone,
      email
    }
  `)

  const footerColumns = nav?.footerColumns?.length
    ? nav.footerColumns
    : [
        {
          columnTitle: 'Navigation',
          links: nav?.items || [],
        },
      ]

  return (
    <footer className="bg-[#25243A] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-4 gap-10">

          {/* BRAND */}
          <div className="lg:col-span-2">
            {nav?.logo?.asset?.url ? (
              <img
                src={nav.logo.asset.url}
                alt="M&M Marketing"
                className="h-14 w-auto mb-6"
              />
            ) : (
              <h3 className="text-[#DFBA67] text-2xl font-bold mb-4">
                M&M Marketing
              </h3>
            )}

            <p className="text-white/60 max-w-md leading-relaxed text-sm">
              {nav?.footerDescription}
            </p>

            <div className="mt-6 flex gap-4">
              {nav?.phone && (
                <a href={`tel:${nav.phone}`} className="text-[#DFBA67] text-sm hover:opacity-80">
                  Call
                </a>
              )}

              {nav?.email && (
                <a href={`mailto:${nav.email}`} className="text-[#DFBA67] text-sm hover:opacity-80">
                  Email
                </a>
              )}
            </div>
          </div>

{/* CMS FOOTER COLUMNS */}
<div className="lg:col-span-1">
  <div className="grid grid-cols-2 gap-10">
    {footerColumns.map((column: any, index: number) => (
      <div key={index}>
        <h4 className="text-[#DFBA67] font-bold mb-5">
          {column.columnTitle}
        </h4>

        <div className="flex flex-col gap-3 text-white/60">
          {column?.links?.map((item: any, itemIndex: number) => (
            <a
              key={itemIndex}
              href={item.link}
              className="hover:text-[#DFBA67] transition"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>

          {/* CONTACT ALWAYS VISIBLE */}
          <div>
            <h4 className="text-[#DFBA67] font-bold mb-5">
              Contact
            </h4>

            <div className="flex flex-col gap-3 text-white/60">
              {nav?.address && <p>{nav.address}</p>}

              {nav?.phone && (
                <a href={`tel:${nav.phone}`} className="hover:text-[#DFBA67] transition">
                  {nav.phone}
                </a>
              )}

              {nav?.email && (
                <a href={`mailto:${nav.email}`} className="hover:text-[#DFBA67] transition">
                  {nav.email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-4 text-white/40 text-sm">
          <p>
            © {new Date().getFullYear()} M&M Marketing. All rights reserved.
          </p>

          <a
            href={nav?.ctaLink || '/get-strategy'}
            className="text-[#DFBA67] font-bold"
          >
            {nav?.ctaText || 'Get Strategy'}
          </a>
        </div>
      </div>
    </footer>
  )
}