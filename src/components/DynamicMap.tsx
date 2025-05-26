'use client'

import dynamic from 'next/dynamic'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
import L from 'leaflet'

const DefaultIcon = L.icon({
  iconUrl: '/images/car-marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

L.Marker.prototype.options.icon = DefaultIcon

interface DynamicMapProps {
  center: [number, number]
  zoom: number
}

const DynamicMap = ({ center, zoom }: DynamicMapProps) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={center}>
        <Popup>
          Current Location
        </Popup>
      </Marker>
    </MapContainer>
  )
}

export default dynamic(() => Promise.resolve(DynamicMap), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
}) 