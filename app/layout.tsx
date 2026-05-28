import { DM_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'
import { SessionProviderWrapper } from '@/components/providers/session-provider'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL) : undefined,
  title: 'Uzbek Corner London — Authentic Uzbek cuisine in Queensway',
  description:
    'Uzbek Corner London serves Plov, Somsa, Lagman, Shashlik and more — an authentic Uzbek table in the heart of Queensway, W2.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: ['/favicon.svg'],
  },
  openGraph: {
    title: 'Uzbek Corner London',
    description: 'Authentic Uzbek cuisine in the heart of London.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" async />
      </head>
      <body className={`${dmSans.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans`}>
        <SessionProviderWrapper>
          {children}
          <Toaster richColors closeButton />
          <ChunkLoadErrorHandler />
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
