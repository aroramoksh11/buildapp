# Self-Driving PWA

A Progressive Web App (PWA) that simulates a self-driving car interface using Next.js, React, and modern web technologies.

## Features

- 🚗 Real-time vehicle status monitoring
- 🗺️ Interactive map with live location tracking
- 🔋 Battery level simulation
- 🎮 Autonomous mode controls
- 📱 PWA support for offline access
- 🎨 Modern, responsive UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd self-driving-pwa
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## PWA Features

- Offline support
- Installable on supported devices
- Responsive design for all screen sizes
- Fast loading with service workers

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Leaflet (for maps)
- Heroicons
- next-pwa

## Development

The project structure is organized as follows:

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── public/          # Static assets
└── styles/          # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
