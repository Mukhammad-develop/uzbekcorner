import { DM_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'
import { SessionProviderWrapper } from '@/components/providers/session-provider'
import type { Metadata } from 'next'
import Script from 'next/script'

export const dynamic = 'force-dynamic'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://uzbekcorner.uk'),
  title: {
    default: 'Uzbek Corner London — Authentic Uzbek cuisine in Streatham',
    template: '%s | Uzbek Corner London',
  },
  description:
    'Uzbek Corner London serves Plov, Somsa, Lagman, Shashlik and more — an authentic Uzbek table in the heart of Streatham, SW16.',
  keywords: [
    'Uzbek restaurant London', 'Uzbek Corner', 'Plov London', 'Central Asian food London',
    'Streatham restaurant', 'Somsa London', 'Lagman London', 'Shashlik London',
    'Uzbek food SW16', 'halal restaurant Streatham',
  ],
  authors: [{ name: 'Uzbek Corner London', url: 'https://uzbekcorner.uk' }],
  creator: 'Uzbek Corner London',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: ['/favicon.svg'],
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://uzbekcorner.uk',
    siteName: 'Uzbek Corner London',
    title: 'Uzbek Corner London — Authentic Uzbek cuisine in Streatham',
    description:
      'Homemade Plov, Somsa, Lagman and Shashlik — an authentic taste of Central Asia in Streatham, London SW16.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Uzbek Corner London — Authentic Uzbek restaurant in Streatham',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Uzbek Corner London — Authentic Uzbek cuisine in Streatham',
    description:
      'Homemade Plov, Somsa, Lagman and Shashlik — an authentic taste of Central Asia in Streatham, London SW16.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://uzbekcorner.uk',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans`}>
        <SessionProviderWrapper>
          {children}
          <Toaster richColors closeButton />
          <ChunkLoadErrorHandler />
          <Script src="https://apps.abacus.ai/chatllm/appllm-lib.js" strategy="lazyOnload" />
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
