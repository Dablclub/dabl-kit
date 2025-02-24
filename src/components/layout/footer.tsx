import { cn } from '@/lib/utils'
import { Github, Instagram, Linkedin, Twitter } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Logo } from './logo'

export function Footer() {
  const pages = [
    {
      title: 'Builds',
      href: '/builds',
    },
    {
      title: 'Members',
      href: '/members',
    },
    {
      title: 'Quests',
      href: '/quests',
    },
    {
      title: 'Blog',
      href: '/blog',
    },
  ]

  return (
    <div className="relative w-full overflow-hidden border-t border-neutral-100 bg-white px-8 py-12 dark:border-white/[0.1] dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl items-start justify-between text-base text-neutral-500 md:px-8">
        <div className="relative flex w-full flex-col items-center justify-center">
          <div className="mb-4 mr-0 md:mr-4 md:flex">
            <Logo />
          </div>

          <ul className="hover:text-text-neutral-800 flex list-none flex-col gap-4 text-neutral-600 transition-colors dark:text-neutral-300 sm:flex-row">
            {pages.map((page, idx) => (
              <li key={'pages' + idx} className="list-none">
                <Link
                  className="hover:text-text-neutral-800 transition-colors"
                  href={page.href}
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>

          <GridLineHorizontal className="mx-auto mt-8 max-w-7xl" />
        </div>
        <div className="mt-8 flex w-full flex-col items-center justify-between sm:flex-row">
          <p className="mb-8 text-neutral-500 dark:text-neutral-400 sm:mb-0">
            &copy; dabl club 2025
          </p>
          <div className="flex gap-4">
            <Link href="https://x.com/dablclub">
              <Twitter className="h-6 w-6 text-neutral-500 dark:text-neutral-300" />
            </Link>
            <Link href="https://www.linkedin.com/company/dablclub">
              <Linkedin className="h-6 w-6 text-neutral-500 dark:text-neutral-300" />
            </Link>
            <Link href="https://github.com/dablclub">
              <Github className="h-6 w-6 text-neutral-500 dark:text-neutral-300" />
            </Link>
            <Link href="https://www.instagram.com/dablclub">
              <Instagram className="h-6 w-6 text-neutral-500 dark:text-neutral-300" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const GridLineHorizontal = ({
  className,
  offset,
}: {
  className?: string
  offset?: string
}) => {
  return (
    <div
      style={
        {
          '--background': '#ffffff',
          '--color': 'rgba(0, 0, 0, 0.2)',
          '--height': '1px',
          '--width': '5px',
          '--fade-stop': '90%',
          '--offset': offset || '200px', //-100px if you want to keep the line inside
          '--color-dark': 'rgba(255, 255, 255, 0.2)',
          maskComposite: 'exclude',
        } as React.CSSProperties
      }
      className={cn(
        'h-[var(--height)] w-[calc(100%+var(--offset))]',
        'bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]',
        '[background-size:var(--width)_var(--height)]',
        '[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]',
        '[mask-composite:exclude]',
        'z-30',
        'dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]',
        className,
      )}
    ></div>
  )
}

// const Logo = () => {
//   return (
//     <Link
//       href="/"
//       className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-xl font-normal text-black"
//     >
//       <Image
//         src="https://assets.aceternity.com/logo-dark.png"
//         alt="logo"
//         width={30}
//         height={30}
//       />
//       <span className="font-bold text-black dark:text-white">dabl_kit</span>
//     </Link>
//   )
// }
