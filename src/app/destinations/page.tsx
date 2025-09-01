'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface Destination {
  id: string;
  name: string;
  description: string;
  highlights: string[];
  bestTime: string;
  duration: string;
  available: boolean;
  image: string;
  slug: string;
}

const destinations: Destination[] = [
  {
    id: '1',
    name: 'Peru',
    description: 'Discover ancient civilizations, breathtaking landscapes, and rich cultural heritage in the heart of South America.',
    highlights: [
      'Machu Picchu & Sacred Valley',
      'Amazon Rainforest',
      'Colonial Lima & Cusco',
      'Rainbow Mountain',
      'Lake Titicaca',
      'Traditional Markets & Villages'
    ],
    bestTime: 'May - September (Dry Season)',
    duration: '7-14 days',
    available: true,
    image: '/peru-destinations.jpg',
    slug: 'peru'
  },
  {
    id: '2',
    name: 'Galapagos & Ecuador',
    description: 'Experience unique wildlife and pristine nature in one of the world\'s most remarkable ecosystems.',
    highlights: [
      'Unique Wildlife Encounters',
      'Pristine Marine Environment',
      'Volcanic Landscapes',
      'Quito Colonial Architecture',
      'Cloud Forest Adventures',
      'Indigenous Markets'
    ],
    bestTime: 'December - May (Warm Season)',
    duration: '8-12 days',
    available: false,
    image: '/galapagos.jpg',
    slug: 'galapagos-ecuador'
  },
  {
    id: '3',
    name: 'Brazil',
    description: 'From vibrant cities to pristine beaches and the Amazon rainforest, experience Brazil\'s incredible diversity.',
    highlights: [
      'Rio de Janeiro & Christ the Redeemer',
      'Amazon Rainforest & Wildlife',
      'Iguazu Falls',
      'Salvador\'s Historic Center',
      'Pantanal Wetlands',
      'Copacabana & Ipanema Beaches'
    ],
    bestTime: 'April - October (Dry Season)',
    duration: '10-16 days',
    available: false,
    image: '/brazil.jpg',
    slug: 'brazil'
  },
  {
    id: '4',
    name: 'Argentina',
    description: 'Explore dramatic landscapes from cosmopolitan Buenos Aires to the wild beauty of Patagonia.',
    highlights: [
      'Buenos Aires Culture & Tango',
      'Patagonia & Glaciers',
      'Mendoza Wine Region',
      'Ushuaia - End of the World',
      'Salta & Northwestern Highlands',
      'Bariloche Lake District'
    ],
    bestTime: 'October - April (Spring/Summer)',
    duration: '12-18 days',
    available: false,
    image: '/argentina.jpg',
    slug: 'argentina'
  },
  {
    id: '5',
    name: 'Chile',
    description: 'Journey through diverse landscapes from the Atacama Desert to Patagonian fjords and Easter Island.',
    highlights: [
      'Atacama Desert - World\'s Driest',
      'Patagonia & Torres del Paine',
      'Easter Island Mysteries',
      'Santiago & Valparaíso',
      'Wine Valleys',
      'Marble Caves & Glaciers'
    ],
    bestTime: 'October - March (Spring/Summer)',
    duration: '12-16 days',
    available: false,
    image: '/chile.jpg',
    slug: 'chile'
  },
  {
    id: '6',
    name: 'Antarctica',
    description: 'The ultimate wilderness adventure to the most remote and pristine continent on Earth.',
    highlights: [
      'Penguin Colonies',
      'Spectacular Icebergs',
      'Whale Watching',
      'Research Station Visits',
      'Zodiac Explorations',
      'Untouched Wilderness'
    ],
    bestTime: 'November - March (Antarctic Summer)',
    duration: '10-21 days',
    available: false,
    image: '/antarctica.jpg',
    slug: 'antarctica'
  }
];

export default function Destinations() {
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/destinations.jpg" 
            alt="South American destinations" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-[#8B4513] opacity-70"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Destinations
          </motion.h1>
          <motion.p 
            className="text-xl text-[#F5F5DC] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore the diverse landscapes and rich cultures of South America with our expert-guided luxury tours
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Available Now Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#8B4513] mb-4">Available Now</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start your South American adventure with our currently available destinations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            {destinations
              .filter(dest => dest.available)
              .map((destination, index) => (
                <motion.div
                  key={destination.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="md:flex">
                    <div className="md:w-1/2 h-64 md:h-auto relative">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.src = '/destinations/default.jpg';
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-green-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                          Available Now
                        </span>
                      </div>
                    </div>
                    <div className="md:w-1/2 p-8">
                      <h3 className="text-2xl font-bold text-[#8B4513] mb-3">{destination.name}</h3>
                      <p className="text-gray-600 mb-4">{destination.description}</p>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Highlights:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {destination.highlights.map((highlight, idx) => (
                            <div key={idx} className="flex items-start text-sm text-gray-600">
                              <span className="text-[#B8860B] mr-2 font-bold">•</span>
                              {highlight}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Best Time:</span>
                          <p className="text-gray-600">{destination.bestTime}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Duration:</span>
                          <p className="text-gray-600">{destination.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <Link
                          href={`/destinations/${destination.slug}`}
                          className="flex-1 bg-[#B8860B] hover:bg-[#DAA520] text-white text-center px-6 py-3 rounded-md font-medium transition-colors duration-200"
                        >
                          Explore {destination.name}
                        </Link>
                        <Link
                          href="/packages"
                          className="flex-1 border-2 border-[#B8860B] text-[#8B4513] hover:bg-[#F5F5DC] text-center px-6 py-3 rounded-md font-medium transition-colors duration-200"
                        >
                          View Packages
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#8B4513] mb-4">Coming Soon</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're expanding our destinations to bring you even more incredible South American experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations
              .filter(dest => !dest.available)
              .map((destination, index) => (
                <motion.div
                  key={destination.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden relative opacity-90 hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
                >
                  <div className="h-48 relative">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="absolute inset-0 w-full h-full object-cover filter grayscale"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = '/destinations/default.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#8B4513] mb-2">{destination.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{destination.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 text-sm mb-2">Coming Highlights:</h4>
                      <div className="space-y-1">
                        {destination.highlights.slice(0, 3).map((highlight, idx) => (
                          <div key={idx} className="flex items-start text-xs text-gray-600">
                            <span className="text-[#B8860B] mr-2">•</span>
                            {highlight}
                          </div>
                        ))}
                        {destination.highlights.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{destination.highlights.length - 3} more experiences
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-4">
                      <div className="mb-1">
                        <strong>Best Time:</strong> {destination.bestTime}
                      </div>
                      <div>
                        <strong>Duration:</strong> {destination.duration}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedDestination(destination.id)}
                      className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded-md font-medium cursor-not-allowed"
                      disabled
                    >
                      Launching 2025
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-[#F5F5DC] rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-[#8B4513] mb-4">
            Ready to Start Your South American Adventure?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Whether you're interested in our available destinations or excited about our upcoming locations, 
            our travel specialists are here to help you plan the perfect journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/packages"
              className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-3 rounded-md font-medium transition-colors duration-200"
            >
              Browse Trip Packages
            </Link>
            <Link
              href="/quote"
              className="border-2 border-[#B8860B] text-[#8B4513] hover:bg-white px-8 py-3 rounded-md font-medium transition-colors duration-200"
            >
              Request Custom Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}