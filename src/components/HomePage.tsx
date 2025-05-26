'use client'

import { useState } from 'react'
import VehicleCard from '@/components/VehicleCard'
import { vehicles, type Vehicle } from '@/data/vehicles'
import { 
  MapPinIcon,
  BoltIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/solid'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import MapSection from '@/components/MapSection'

type FilterType = 'All' | 'Sedan' | 'SUV' | 'Luxury' | 'Sports'
type SortType = 'price-asc' | 'price-desc' | 'rating-desc'

export default function HomePage() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showVehicleList, setShowVehicleList] = useState(true)
  const [filter, setFilter] = useState<FilterType>('All')
  const [sort, setSort] = useState<SortType>('price-asc')
  const [showFilters, setShowFilters] = useState(false)

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    if (vehicle) {
      setSelectedVehicle(vehicle)
      setShowVehicleList(false)
    }
  }

  const filteredAndSortedVehicles = vehicles
    .filter(vehicle => filter === 'All' || vehicle.type === filter)
    .sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.pricePerDay - b.pricePerDay
        case 'price-desc':
          return b.pricePerDay - a.pricePerDay
        case 'rating-desc':
          return b.rating - a.rating
        default:
          return 0
      }
    })

  return (
    <>
      <ServiceWorkerRegister />
      <main className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Car Rental Platform</h1>
            {selectedVehicle && (
              <button
                onClick={() => {
                  setSelectedVehicle(null)
                  setShowVehicleList(true)
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Back to Cars
              </button>
            )}
          </div>

          {showVehicleList ? (
            <>
              <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
                  >
                    <FunnelIcon className="h-5 w-5" />
                    Filters
                  </button>
                  {showFilters && (
                    <div className="flex gap-2">
                      {(['All', 'Sedan', 'SUV', 'Luxury', 'Sports'] as FilterType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilter(type)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            filter === type
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortType)}
                  className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedVehicles.map(vehicle => (
                  <VehicleCard
                    key={vehicle.id}
                    {...vehicle}
                    onSelect={handleVehicleSelect}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Map Section */}
              <div className="bg-white rounded-lg shadow-lg p-4 h-[400px]">
                <MapSection center={selectedVehicle?.coordinates || [37.7749, -122.4194]} zoom={13} />
              </div>

              {/* Vehicle Details Section */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Rental Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <BoltIcon className="h-6 w-6 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600">Fuel Level</p>
                        <p className="text-lg font-semibold">{selectedVehicle?.fuelLevel}%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="h-6 w-6 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Pickup Location</p>
                        <p className="text-lg font-semibold">{selectedVehicle?.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-lg font-semibold">${selectedVehicle?.pricePerDay}/day</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-6 w-6 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600">Mileage</p>
                        <p className="text-lg font-semibold">{selectedVehicle?.mileage} km/l</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Specifications</h3>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <p className="text-gray-600">
                          <span className="font-medium">Type:</span> {selectedVehicle?.type}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Transmission:</span> {selectedVehicle?.transmission}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Fuel Type:</span> {selectedVehicle?.fuelType}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Seats:</span> {selectedVehicle?.seats}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Luggage:</span> {selectedVehicle?.luggage} bags
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900">Features</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedVehicle?.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Proceed to Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
} 