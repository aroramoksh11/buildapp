'use client'

import Image from 'next/image'
import { 
  BoltIcon, 
  MapPinIcon,
  UserGroupIcon,
  BriefcaseIcon,
  StarIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/solid'

interface VehicleCardProps {
  id: string
  name: string
  model: string
  type: 'Sedan' | 'SUV' | 'Luxury' | 'Sports'
  transmission: 'Automatic' | 'Manual'
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'
  fuelLevel: number
  location: string
  pricePerDay: number
  image: string
  isAvailable: boolean
  features: string[]
  seats: number
  luggage: number
  rating: number
  reviews: number
  onSelect: (id: string) => void
}

export default function VehicleCard({
  id,
  name,
  model,
  type,
  transmission,
  fuelType,
  fuelLevel,
  location,
  pricePerDay,
  image,
  isAvailable,
  features,
  seats,
  luggage,
  rating,
  reviews,
  onSelect
}: VehicleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-48">
        <Image
          src={image}
          alt={`${name} ${model}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
            isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isAvailable ? 'Available' : 'Rented'}
          </span>
          <span className="px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {type}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-gray-600">{model} • {transmission} • {fuelType}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">${pricePerDay}/day</p>
            <div className="flex items-center text-sm text-gray-600">
              <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
              <span>{rating}</span>
              <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400 ml-1 mr-1" />
              <span>({reviews})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <BoltIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <span>{fuelLevel}% Fuel</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-5 w-5 text-blue-500 mr-2" />
            <span>{location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <UserGroupIcon className="h-5 w-5 text-green-500 mr-2" />
            <span>{seats} Seats</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <BriefcaseIcon className="h-5 w-5 text-purple-500 mr-2" />
            <span>{luggage} Bags</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Key Features:</p>
          <div className="flex flex-wrap gap-2">
            {features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
              >
                {feature}
              </span>
            ))}
            {features.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                +{features.length - 3} more
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onSelect(id)}
          disabled={!isAvailable}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isAvailable
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAvailable ? 'Rent Now' : 'Currently Unavailable'}
        </button>
      </div>
    </div>
  )
} 