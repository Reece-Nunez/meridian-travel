'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { usePercentageScrollRestoration } from '@/hooks/usePercentageScrollRestoration';

export default function ChileDestination() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Scroll restoration for refresh and back button navigation
  usePercentageScrollRestoration('destination-chile', true);

  const handleRegionClick = (regionId: string) => {
    const newSelection = selectedRegion === regionId ? null : regionId;
    setSelectedRegion(newSelection);
  };

  const regions = [
    {
      id: 'atacama',
      name: 'Atacama Desert',
      shortName: 'Atacama',
      description: 'The driest desert on Earth with otherworldly landscapes and pristine stargazing',
      highlights: ['Valle de la Luna', 'El Tatio Geysers', 'Salt Flats', 'Stargazing Tours', 'High-altitude Lagoons'],
      climate: 'Year-round (minimal rainfall)',
      altitude: '2,400m (7,874ft)',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/chile-atacama.webp'
    },
    {
      id: 'patagonia',
      name: 'Patagonia & Torres del Paine',
      shortName: 'Patagonia',
      description: 'Legendary wilderness with iconic granite peaks and pristine glacial landscapes',
      highlights: ['Torres del Paine', 'Grey Glacier', 'Marble Caves', 'Carretera Austral', 'Wildlife Watching'],
      climate: 'Best: November-March (summer)',
      altitude: 'Sea level to 2,800m (9,186ft)',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/chile-patagonia.webp'
    },
    {
      id: 'central',
      name: 'Santiago & Wine Country',
      shortName: 'Central Chile',
      description: 'Vibrant capital city, world-class vineyards, and charming coastal towns',
      highlights: ['Santiago', 'Valparaiso', 'Wine Valleys', 'Ski Resorts', 'Coastal Towns'],
      climate: 'Mediterranean climate, best March-May',
      altitude: '500-1,500m (1,640-4,921ft)',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/chile-central.webp'
    }
  ];

  const culturalHighlights = [
    {
      title: 'Extreme Geography',
      description: 'From the driest desert to ancient glaciers, Chile spans extreme landscapes in one narrow country',
      icon: '🏔️'
    },
    {
      title: 'World-Class Wine',
      description: 'Discover excellent Carmenere and Cabernet in stunning valley vineyards',
      icon: '🍷'
    },
    {
      title: 'Stargazing Paradise',
      description: 'The Atacama\'s clear skies make it one of the best places on Earth for astronomy',
      icon: '🔭'
    },
    {
      title: 'Easter Island',
      description: 'The mysterious Moai statues await on the world\'s most remote inhabited island',
      icon: '🗿'
    }
  ];

  const travelTips = [
    {
      category: 'Best Time to Visit',
      details: [
        'Atacama: Year-round destination',
        'Patagonia: November-March (summer)',
        'Central Chile: Sept-Nov, March-May'
      ]
    },
    {
      category: 'Getting Around',
      details: [
        'Chile is very long - domestic flights recommended',
        'Well-maintained highways for road trips',
        'Ferries connect Patagonian regions'
      ]
    },
    {
      category: 'Cultural Tips',
      details: [
        'Spanish is the primary language',
        'Chileans are welcoming and proud',
        'Tipping 10% is customary in restaurants'
      ]
    },
    {
      category: 'What to Pack',
      details: [
        'Extreme layers for temperature variations',
        'High SPF sunscreen for Atacama',
        'Wind/waterproof gear for Patagonia',
        'Binoculars for wildlife'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://meridian-travel.s3.us-east-1.amazonaws.com/chile.webp"
            alt="Chile landscape"
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
              Chile
            </motion.h1>
            <motion.p
              className="text-xl sm:text-2xl mb-8 text-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              A ribbon of extremes - from the world's driest desert to pristine Patagonian glaciers
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                href="/packages?destination=Chile"
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

      {/* Chile Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Why Chile?</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Chile stretches over 4,300km along South America's Pacific coast, offering an extraordinary
              variety of landscapes: the Moon Valley of Atacama, the vineyards of the Central Valley,
              the fjords of Patagonia, and the mysteries of Easter Island.
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
            <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Explore Chile's Diverse Regions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chile's extreme length creates dramatically different regions, from bone-dry deserts
              in the north to glacial wilderness in the south.
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

      {/* Easter Island Feature */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="relative h-[400px] rounded-lg overflow-hidden"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://meridian-travel.s3.us-east-1.amazonaws.com/chile-rapanui.webp"
                alt="Easter Island Moai"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/destinations/default.jpg';
                }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-[#8B4513] mb-6">
                Easter Island - Rapa Nui
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                One of the world's most remote inhabited islands, Easter Island (Rapa Nui) is home
                to the mysterious Moai statues. These massive stone figures, carved between 1250
                and 1500 AD, remain one of humanity's greatest archaeological puzzles.
              </p>
              <p className="text-gray-600 mb-8">
                Beyond the iconic statues, discover volcanic craters, pristine beaches, and the
                fascinating Polynesian culture that thrives on this isolated Pacific outpost.
              </p>
              <Link
                href="/quote"
                className="inline-flex items-center bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                Plan Your Easter Island Visit
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Travel Planning Section */}
      <section className="py-20 bg-[#F5F5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Planning Your Chile Adventure</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Essential information to help you prepare for your journey to Chile
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
          <h2 className="text-4xl font-bold mb-6">Ready to Discover Chile?</h2>
          <p className="text-xl mb-8 opacity-90">
            Let our Chile specialists create a personalized journey that matches your interests,
            timeline, and travel style. Every trip is uniquely crafted for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/packages?destination=Chile"
              className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
            >
              Browse Chile Packages
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
