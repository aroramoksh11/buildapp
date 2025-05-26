'use client'

import dynamic from 'next/dynamic'

const HomePage = dynamic(() => import('@/components/HomePage'))

export default function Page() {
  return <HomePage />
}
