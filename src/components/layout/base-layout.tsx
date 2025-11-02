'use client'
import { ThemeProvider } from 'next-themes'
import { Navbar } from './navbar'
import { useEffect, useState } from 'react'
import { Footer } from './footer'

interface Props {
  children: React.ReactNode
}
const BaseLayout = ({ children }: Props) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // Only render the ThemeProvider after mounting
  }, [])

  if (!mounted) {
    return <>{children}</> // Render without theme provider initially (avoids mismatch)
  }
  return (
    <ThemeProvider attribute="class" enableSystem={false}>
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </ThemeProvider>
  )
}

export default BaseLayout

