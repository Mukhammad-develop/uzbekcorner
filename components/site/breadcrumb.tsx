import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export type BreadcrumbItem = {
  label: string
  url?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const schemaList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      item: item.url ? `https://uzbekcorner.uk${item.url}` : undefined,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaList) }}
      />
      <nav aria-label="Breadcrumb" className="py-4 text-xs font-medium tracking-wide uppercase text-navy/60">
        <ol className="flex items-center flex-wrap gap-2">
          <li>
            <Link href="/" className="hover:text-gold transition-colors">
              Home
            </Link>
          </li>
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1
            return (
              <li key={idx} className="flex items-center gap-2">
                <ChevronRight size={10} className="text-navy/30 shrink-0" />
                {isLast || !item.url ? (
                  <span className="text-navy font-semibold truncate max-w-[200px] md:max-w-xs">{item.label}</span>
                ) : (
                  <Link href={item.url} className="hover:text-gold transition-colors truncate max-w-[200px] md:max-w-xs">
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
