'use client'
import { cn } from '@/lib/utils'
import { Github, Menu, X } from 'lucide-react'
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Logo } from './logo'
import { ModeToggle } from './mode-toggle'
import AuthButton from '../buttons/authButton'

interface NavbarProps {
  navItems: {
    name: string
    link: string
  }[]
  visible: boolean
}

export const Navbar = () => {
  const navItems = [
    {
      name: 'Builds',
      link: '/builds',
    },
    {
      name: 'Leaderboard',
      link: '/leaderboard',
    },
    {
      name: 'Quests',
      link: '/quests',
    },
  ]

  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const [visible, setVisible] = useState<boolean>(false)

  useMotionValueEvent(scrollY, 'change', (latest: number) => {
    if (latest > 100) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  })

  return (
    <motion.div
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-center"
    >
      <DesktopNav visible={visible} navItems={navItems} />
      <MobileNav visible={visible} navItems={navItems} />
    </motion.div>
  )
}

const DesktopNav = ({ navItems, visible }: NavbarProps) => {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <motion.div
      onMouseLeave={() => {
        setHovered(null)
      }}
      animate={{
        backdropFilter: visible ? 'blur(10px)' : 'none',
        boxShadow: visible
          ? '0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset'
          : 'none',
        paddingRight: visible ? '24px' : '0px',
        paddingLeft: visible ? '24px' : '0px',
        width: visible ? '40%' : '100%',
        y: visible ? 20 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: '800px',
      }}
      className={cn(
        'relative z-10 hidden h-full w-full flex-row items-center justify-between self-start rounded-full bg-transparent p-2 dark:bg-transparent md:max-w-2xl lg:flex lg:max-w-4xl xl:max-w-6xl',
        visible && 'bg-white/80 dark:bg-neutral-950/80',
      )}
    >
      <Logo />
      <motion.div className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2">
        {navItems.map(
          (
            navItem: {
              name: string
              link: string
            },
            idx: number,
          ) => (
            <Link
              onMouseEnter={() => setHovered(idx)}
              className="relative px-4 py-2 text-neutral-600 dark:text-neutral-300"
              key={`link=${idx}`}
              href={navItem.link}
            >
              {hovered === idx && (
                <motion.div
                  layoutId="hovered"
                  className="absolute inset-0 h-full w-full rounded-full bg-gray-100 dark:bg-neutral-800"
                />
              )}
              <span className="relative z-20">{navItem.name}</span>
            </Link>
          ),
        )}
      </motion.div>
      <div className="flex items-center gap-4">
        <ModeToggle />

        <AnimatePresence mode="popLayout" initial={false}>
          {!visible && (
            <motion.div
              className="md:z-20"
              initial={{
                x: 100,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: [0, 0, 1],
              }}
              exit={{
                x: 100,
                opacity: [0, 0, 0],
              }}
              transition={{
                duration: 0.5,
                ease: 'easeOut',
              }}
            >
              <Link
                href="https://github.com/Dablclub/dabl-kit"
                target="_blank"
                className="hidden md:block"
              >
                <Button size="sm" variant="secondary">
                  <Github /> Clone
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="hidden md:z-20 md:block">
          <AuthButton size="sm" className="px-4" />
        </div>
        {/* <Button size="sm" className="hidden px-4 md:z-20 md:block">
          Login
        </Button> */}
      </div>
    </motion.div>
  )
}

const MobileNav = ({ navItems, visible }: NavbarProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.div
        animate={{
          backdropFilter: visible ? 'blur(10px)' : 'none',
          boxShadow: visible
            ? '0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset'
            : 'none',
          width: visible ? '90%' : '100%',
          y: visible ? 20 : 0,
          borderRadius: open ? '4px' : '2rem',
          paddingRight: visible ? '12px' : '0px',
          paddingLeft: visible ? '12px' : '0px',
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 50,
        }}
        className={cn(
          'relative z-50 flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden',
          visible && 'bg-white/80 dark:bg-neutral-950/80',
        )}
      >
        <div className="flex w-full flex-row items-center justify-between">
          <Logo />
          {open ? (
            <X
              className="text-black dark:text-white"
              onClick={() => setOpen(!open)}
            />
          ) : (
            <Menu
              className="text-black dark:text-white"
              onClick={() => setOpen(!open)}
            />
          )}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white p-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] dark:bg-neutral-950"
            >
              {navItems.map(
                (
                  navItem: {
                    name: string
                    link: string
                  },
                  idx: number,
                ) => (
                  <Link
                    key={`link=${idx}`}
                    href={navItem.link}
                    onClick={() => setOpen(false)}
                    className="relative text-lg text-neutral-600 dark:text-neutral-300"
                  >
                    <motion.span className="block">{navItem.name}</motion.span>
                  </Link>
                ),
              )}
              <div className="flex w-full flex-col items-center justify-center gap-4">
                <Link
                  href="https://github.com/Dablclub/dabl-kit"
                  target="_blank"
                  className="w-1/2 md:hidden"
                >
                  <Button variant="secondary" className="w-full text-lg">
                    <Github /> Clone
                  </Button>
                </Link>

                <AuthButton className="block w-1/2 px-4 text-lg md:hidden" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
