'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
}

export function Section({ children, className }: SectionProps) {
  return (
    <section
      className={cn(
        'flex w-full flex-col items-center',
        '[&:not(:first-child):not(:last-child)]:py-8 [&:not(:first-child):not(:last-child)]:md:py-12 [&:not(:first-child):not(:last-child)]:lg:py-16',
        'px-4 md:px-8 lg:px-16 xl:px-24',
        className,
      )}
    >
      {children}
    </section>
  )
}

