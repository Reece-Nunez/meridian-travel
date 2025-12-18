'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

export default function ArgentinaDestination() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Scroll restoration for back button navigation
  useScrollRestoration('destinationArgentina');

  const handleRegionClick = (regionId: string) => {
    const newSelection = selectedRegion === regionId ? null : regionId;
    setSelectedRegion(newSelection);
  };

  const regions = [
    {
      id: 'patagonia',
      name: 'Patagonia',
      shortName: 'Patagonia',
      description: 'Dramatic glaciers, pristine wilderness, and the end of the world',
      highlights: ['Perito Moreno Glacier', 'Torres del Paine', 'Ushuaia', 'El Chalten', 'Tierra del Fuego'],
      climate: 'Best: November-March (austral summer)',
      altitude: 'Sea level to 3,400m (11,154ft)',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/argentina-patagonia.webp'
    },
    {
      id: 'buenosaires',
      name: 'Buenos Aires & Pampas',
      shortName: 'Buenos Aires',
      description: 'The Paris of South America with tango, gastronomy, and gaucho culture',
      highlights: ['Tango Shows', 'La Boca & San Telmo', 'Estancia Visits', 'World-class Cuisine', 'Wine Tasting'],
      climate: 'Best: March-May, Sept-Nov (mild)',
      altitude: '25m (82ft)',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/argentina-buenosaires.webp'
    },
    {
      id: 'northwest',
      name: 'Northwest Argentina',
      shortName: 'Northwest',
      description: 'Ancient cultures, colorful mountains, and high-altitude deserts',
      highlights: ['Salta', 'Quebrada de Humahuaca', 'Cafayate Vineyards', 'Purmamarca', 'Tilcara'],
      climate: 'Best: April-November (dry season)',
      altitude: 'Up to 4,000m (13,123ft)',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/argentina-northwest.webp'
    }
  ];

  const culturalHighlights = [
    {
      title: 'Tango & Culture',
      description: 'Experience the passionate birthplace of tango in the milongas of Buenos Aires',
      icon: '💃'
    },
    {
      title: 'World-Class Wine',
      description: 'Mendoza produces some of the world\'s finest Malbec in stunning Andean settings',
      icon: '🍷'
    },
    {
      title: 'Natural Wonders',
      description: 'From the thundering Iguazu Falls to the blue ice of Patagonian glaciers',
      icon: '🏔️'
    },
    {
      title: 'Gaucho Traditions',
      description: 'Discover the cowboy culture of the Pampas at traditional estancias',
      icon: '🐎'
    }
  ];

  const travelTips = [
    {
      category: 'Best Time to Visit',
      details: [
        'Patagonia: November-March (summer)',
        'Buenos Aires: March-May, Sept-Nov',
        'Iguazu: Year-round (less rain May-Sept)'
      ]
    },
    {
      category: 'Getting Around',
      details: [
        'Argentina is vast - domestic flights save time',
        'Excellent long-distance buses available',
        'Renting cars ideal for Patagonia road trips'
      ]
    },
    {
      category: 'Cultural Tips',
      details: [
        'Dinner typically starts at 9-10pm',
        'Tipping 10% is customary',
        'Learn a few Spanish phrases'
      ]
    },
    {
      category: 'What to Pack',
      details: [
        'Layers for Patagonia\'s changing weather',
        'Comfortable walking shoes',
        'Wind and waterproof jacket',
        'Formal attire for tango shows'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://meridian-travel.s3.us-east-1.amazonaws.com/argentina.webp"
            alt="Argentina landscape"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/destinations/default.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white max-w-4xl">
            <motion.h1
              className="text-5xl sm:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Argentina
            </motion.h1>
            <motion.p
              className="text-xl sm:text-2xl mb-8 text-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              From cosmopolitan Buenos Aires to the wild beauty of Patagonia
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                href="/packages"
                className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
              >
                View Trip Packages
              </Link>
              <Link
                href="/quote"
                className="border-2 border-white text-white hover:bg-white hover:text-[#8B4513] px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
              >
                Plan Custom Journey
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Argentina Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Why Argentina?</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Argentina captivates with its dramatic contrasts: the sophisticated elegance of Buenos Aires,
              the rugged wilderness of Patagonia, world-renowned wine regions, and the thundering power
              of Iguazu Falls. This is South America at its most diverse and passionate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {culturalHighlights.map((highlight, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4">{highlight.icon}</div>
                <h3 className="text-xl font-bold text-[#8B4513] mb-3">{highlight.title}</h3>
                <p className="text-gray-600">{highlight.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Regions Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Explore Argentina's Diverse Regions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Argentina stretches from subtropical north to sub-Antarctic south, offering incredible
              diversity of landscapes, climates, and experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {regions.map((region, index) => (
              <div key={region.id} className="relative">
                <motion.div
                  className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => handleRegionClick(region.id)}
                >
                <div className="h-64 relative overflow-hidden">
                  <img
                    src={region.image}
                    alt={region.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = '/destinations/default.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">{region.shortName}</h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-xl font-bold text-[#8B4513] mb-2">{region.name}</h4>
                  <p className="text-gray-600 mb-4">{region.description}</p>

                  <AnimatePresence>
                    {selectedRegion === region.id && (
                      <motion.div
                        key={`dropdown-${region.id}`}
                        initial={{ opacity: 0, height: 0, paddingTop: 0 }}
                        animate={{
                          opacity: 1,
                          height: 'auto',
                          paddingTop: 16,
                          transition: {
                            height: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] },
                            opacity: { duration: 0.3, delay: 0.1 },
                            paddingTop: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }
                          }
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          paddingTop: 0,
                          transition: {
                            height: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] },
                            opacity: { duration: 0.2 },
                            paddingTop: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
                          }
                        }}
                        className="border-t overflow-hidden"
                        style={{ borderTopWidth: 1 }}
                      >
                        <div className="mb-4">
                          <h5 className="font-semibold text-[#8B4513] mb-2">Highlights:</h5>
                          <div className="flex flex-wrap gap-2">
                            {region.highlights.map((highlight, idx) => (
                              <span key={idx} className="bg-[#F5F5DC] text-[#8B4513] px-2 py-1 rounded-md text-sm">
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong className="text-[#8B4513]">Climate:</strong>
                            <p className="text-gray-600">{region.climate}</p>
                          </div>
                          <div>
                            <strong className="text-[#8B4513]">Altitude:</strong>
                            <p className="text-gray-600">{region.altitude}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mendoza Wine Feature */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-[#8B4513] mb-6">
                Mendoza Wine Country
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Nestled at the foot of the Andes, Mendoza is the heart of Argentina's wine country
                and one of the great wine capitals of the world. The region's high altitude, abundant
                sunshine, and snowmelt irrigation create perfect conditions for Malbec.
              </p>
              <p className="text-gray-600 mb-8">
                Beyond wine, Mendoza offers adventure: white-water rafting, horseback riding through
                the foothills, and spectacular views of Aconcagua, the highest peak in the Americas.
              </p>
              <Link
                href="/quote"
                className="inline-flex items-center bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                Plan Your Wine Journey
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
            <motion.div
              className="relative h-[400px] rounded-lg overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://meridian-travel.s3.us-east-1.amazonaws.com/argentina-mendoza.webp"
                alt="Mendoza Wine Country"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/destinations/default.jpg';
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Travel Planning Section */}
      <section className="py-20 bg-[#F5F5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Planning Your Argentina Adventure</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Essential information to help you prepare for your journey to Argentina
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {travelTips.map((tip, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h3 className="text-lg font-bold text-[#8B4513] mb-4">{tip.category}</h3>
                <ul className="space-y-2">
                  {tip.details.map((detail, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                      <span className="text-[#B8860B] mr-2 mt-1">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#8B4513]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Discover Argentina?</h2>
          <p className="text-xl mb-8 opacity-90">
            Let our Argentina specialists create a personalized journey that matches your interests,
            timeline, and travel style. Every trip is uniquely crafted for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/packages"
              className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
            >
              Browse Argentina Packages
            </Link>
            <Link
              href="/quote"
              className="border-2 border-white text-white hover:bg-white hover:text-[#8B4513] px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
            >
              Request Custom Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
