'use client'

import dynamic from 'next/dynamic'

const DynamicMap = dynamic(() => import('./DynamicMap'), { ssr: false })

interface MapSectionProps {
  center: [number, number]
  zoom: number
}

export default function MapSection({ center, zoom }: MapSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-[400px]">
      <DynamicMap center={center} zoom={zoom} />
    </div>
  )
} 