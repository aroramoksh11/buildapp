import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">404 - Page Not Found</h1>
      <p className="text-lg text-gray-700 mb-8">Sorry, the page you are looking for does not exist.</p>
      <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Go Home</Link>
    </div>
  )
} 