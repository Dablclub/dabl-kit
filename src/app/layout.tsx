import type { Metadata } from 'next'
import { cn } from '@/lib/utils'

import { Inter } from 'next/font/google'
import '@/styles/globals.css'

import BaseLayout from '@/components/layout/base-layout'

export const metadata: Metadata = {
  title: 'burrito.gg',
  description: 'play, learn and earn with burrito and frens',
}

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={cn('bg-white antialiased dark:bg-black', fontSans.variable)}
      >
        <BaseLayout>{children}</BaseLayout>
      </body>
    </html>
  )
}
