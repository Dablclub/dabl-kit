'use client'
import Image from 'next/image'
import Link from 'next/link'

export const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-1 px-0 py-1 text-sm font-normal text-black"
    >
      <div className="relative overflow-hidden rounded-lg bg-white dark:bg-white">
        <Image
          src="/dablclub-192x192.png"
          alt="logo"
          width={32}
          height={32}
          objectFit="contain"
        />
      </div>
      <span className="text-lg font-bold text-black dark:text-white">
        Action Item
      </span>
    </Link>
  )
}

