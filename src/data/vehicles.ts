export interface Vehicle {
  id: string
  name: string
  model: string
  type: 'Sedan' | 'SUV' | 'Luxury' | 'Sports'
  transmission: 'Automatic' | 'Manual'
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'
  fuelLevel: number
  location: string
  coordinates: [number, number]
  pricePerDay: number
  image: string
  isAvailable: boolean
  features: string[]
  seats: number
  luggage: number // in bags
  mileage: number // in km/l
  rating: number // 1-5
  reviews: number
}

export const vehicles: Vehicle[] = [
  {
    id: 'toyota-camry-1',
    name: 'Toyota Camry',
    model: '2023',
    type: 'Sedan',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    fuelLevel: 85,
    location: 'Downtown Hub',
    coordinates: [37.7749, -122.4194],
    pricePerDay: 45,
    image: '/images/toyota-camry.jpg',
    isAvailable: true,
    features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'Apple CarPlay'],
    seats: 5,
    luggage: 3,
    mileage: 18,
    rating: 4.5,
    reviews: 128
  },
  {
    id: 'honda-crv-1',
    name: 'Honda CR-V',
    model: '2023',
    type: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    fuelLevel: 90,
    location: 'Westside Station',
    coordinates: [37.7833, -122.4167],
    pricePerDay: 55,
    image: '/images/honda-crv.jpg',
    isAvailable: true,
    features: ['Sunroof', 'Parking Sensors', 'Android Auto', 'Lane Assist'],
    seats: 5,
    luggage: 4,
    mileage: 15,
    rating: 4.7,
    reviews: 95
  },
  {
    id: 'bmw-3series-1',
    name: 'BMW 3 Series',
    model: '2023',
    type: 'Luxury',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    fuelLevel: 75,
    location: 'East Bay Terminal',
    coordinates: [37.8044, -122.2712],
    pricePerDay: 85,
    image: '/images/bmw-3series.jpg',
    isAvailable: false,
    features: ['Leather Seats', 'Navigation', 'Premium Sound', 'Parking Assist'],
    seats: 5,
    luggage: 3,
    mileage: 14,
    rating: 4.8,
    reviews: 156
  },
  {
    id: 'toyota-rav4-1',
    name: 'Toyota RAV4',
    model: '2023',
    type: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    fuelLevel: 95,
    location: 'Airport Terminal',
    coordinates: [37.6213, -122.3790],
    pricePerDay: 60,
    image: '/images/toyota-rav4.jpg',
    isAvailable: true,
    features: ['All-Wheel Drive', 'Safety Sense', 'Wireless Charging', 'Smart Key'],
    seats: 5,
    luggage: 4,
    mileage: 16,
    rating: 4.6,
    reviews: 203
  }
] 