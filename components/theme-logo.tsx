'use client'

import Image from 'next/image'
import { useTheme } from '@/lib/theme-context'
import { useEffect, useState } from 'react'

export function ThemeLogo({
  width = 300,
  height = 80,
  className = '',
}: {
  width?: number
  height?: number
  className?: string
}) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Image
        src="/logo-black.svg"
        alt="SoloPack"
        width={width}
        height={height}
        className={className}
      />
    )
  }

  return (
    <Image
      src={theme === 'dark' ? '/logo-white.svg' : '/logo-black.svg'}
      alt="SoloPack"
      width={width}
      height={height}
      className={className}
    />
  )
}
