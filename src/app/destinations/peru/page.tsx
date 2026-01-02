'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { usePercentageScrollRestoration } from '@/hooks/usePercentageScrollRestoration';

export default function PeruDestination() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Scroll restoration for refresh and back button navigation
  usePercentageScrollRestoration('destination-peru', true);

  const handleRegionClick = (regionId: string) => {
    console.log('🎯 Region clicked:', regionId);
    console.log('📋 Current selectedRegion:', selectedRegion);
    
    const newSelection = selectedRegion === regionId ? null : regionId;
    console.log('✨ Setting selectedRegion to:', newSelection);
    
    setSelectedRegion(newSelection);
  };

  const regions = [
    {
      id: 'highlands',
      name: 'The Andes Highlands',
      shortName: 'Highlands',
      description: 'Ancient civilizations, dramatic peaks, and sacred valleys',
      highlights: ['Machu Picchu', 'Cusco', 'Sacred Valley', 'Rainbow Mountain', 'Lake Titicaca'],
      climate: 'Dry season: May-September (ideal for trekking)',
      altitude: 'Up to 4,200m (13,780ft)',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/peru-highlands.webp'
    },
    {
      id: 'amazon',
      name: 'The Amazon Rainforest',
      shortName: 'Amazon',
      description: 'Biodiversity capital with pristine wilderness and indigenous culture',
      highlights: ['Manu National Park', 'Iquitos', 'Tambopata Reserve', 'Indigenous communities'],
      climate: 'Wet season: Nov-Apr, Dry season: May-Oct',
      altitude: '80-500m (260-1,640ft)',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/peru-amazon.webp'
    },
    {
      id: 'coast',
      name: 'The Pacific Coast',
      shortName: 'Coast',
      description: 'Desert landscapes, colonial cities, and world-renowned cuisine',
      highlights: ['Lima', 'Nazca Lines', 'Huacachina Oasis', 'Paracas Peninsula'],
      climate: 'Mild year-round, very little rain',
      altitude: 'Sea level to 500m (1,640ft)',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/peru-coast.webp'
    }
  ];

  const culturalHighlights = [
    {
      title: 'Ancient Civilizations',
      description: 'From the mysterious Inca empire to lesser-known cultures like the Moche and Nazca',
      icon: '🏛️'
    },
    {
      title: 'Living Traditions',
      description: 'Experience authentic Quechua communities and traditional textile weaving',
      icon: '🧶'
    },
    {
      title: 'Culinary Heritage',
      description: 'Peru\'s cuisine blends indigenous, Spanish, Chinese, and Japanese influences',
      icon: '🍽️'
    },
    {
      title: 'Natural Wonders',
      description: 'From Amazon biodiversity to dramatic Andean landscapes',
      icon: '🦋'
    }
  ];

  const travelTips = [
    {
      category: 'Best Time to Visit',
      details: [
        'Highlands: May-September (dry season)',
        'Amazon: May-October (less rain)',
        'Coast: Year-round (mild climate)'
      ]
    },
    {
      category: 'Altitude Considerations',
      details: [
        'Cusco: 3,400m (11,150ft) - arrive early to acclimatize',
        'Machu Picchu: 2,400m (7,875ft)',
        'Consider altitude sickness medication'
      ]
    },
    {
      category: 'Cultural Etiquette',
      details: [
        'Learn basic Spanish phrases',
        'Respect indigenous customs and photography preferences',
        'Bargaining expected in markets'
      ]
    },
    {
      category: 'What to Pack',
      details: [
        'Layers for varying climates',
        'Comfortable hiking boots',
        'Sun protection and insect repellent'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://meridian-travel.s3.us-east-1.amazonaws.com/peru-header.webp" 
            alt="Peru landscape"
            className="w-full h-full object-cover"
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
              Peru
            </motion.h1>
            <motion.p 
              className="text-xl sm:text-2xl mb-8 text-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Where ancient civilizations meet pristine nature in the heart of South America
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                href="/packages?destination=Peru"
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

      {/* Peru Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Why Peru?</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Peru offers an unparalleled combination of ancient history, diverse ecosystems, and vibrant culture. 
              From the mystical ruins of Machu Picchu to the pristine Amazon rainforest, every corner tells a story 
              waiting to be discovered.
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
            <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Explore Peru's Diverse Regions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Peru's incredible diversity spans three distinct regions, each offering unique landscapes, 
              wildlife, and cultural experiences.
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
                    style={{ objectPosition: 'center center' }}
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

      {/* Travel Planning Section */}
      <section className="py-20 bg-[#F5F5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Planning Your Peru Adventure</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Essential information to help you prepare for your journey to Peru
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
          <h2 className="text-4xl font-bold mb-6">Ready to Discover Peru?</h2>
          <p className="text-xl mb-8 opacity-90">
            Let our Peru specialists create a personalized journey that matches your interests, 
            timeline, and travel style. Every trip is uniquely crafted for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/packages?destination=Peru"
              className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
            >
              Browse Peru Packages
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