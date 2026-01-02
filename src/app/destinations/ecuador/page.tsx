'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { usePercentageScrollRestoration } from '@/hooks/usePercentageScrollRestoration';
import { useHeroSettings } from '@/hooks/useHeroSettings';
import { HeroImage } from '@/components/ui/HeroImage';

export default function EcuadorDestination() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const heroSettings = useHeroSettings('ecuador', 'https://meridian-travel.s3.us-east-1.amazonaws.com/ecuador-hero.webp');

  // Scroll restoration for refresh and back button navigation
  usePercentageScrollRestoration('destination-ecuador', true);

  const handleRegionClick = (regionId: string) => {
    const newSelection = selectedRegion === regionId ? null : regionId;
    setSelectedRegion(newSelection);
  };

  const regions = [
    {
      id: 'sierra',
      name: 'The Avenue of Volcanoes',
      shortName: 'Sierra',
      description: 'Dramatic volcanic landscapes, colonial Quito, and vibrant indigenous markets',
      highlights: ['Quito UNESCO Historic Center', 'Cotopaxi National Park', 'Otavalo Market', 'Quilotoa Crater Lake', 'Mitad del Mundo'],
      climate: 'Dry season: June-September (ideal for hiking)',
      altitude: '2,800-5,897m (9,186-19,347ft)',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/ecuador-sierra.webp'
    },
    {
      id: 'cloudforest',
      name: 'The Cloud Forest',
      shortName: 'Cloud Forest',
      description: 'Mystical misty forests with extraordinary biodiversity and hummingbirds',
      highlights: ['Mindo Valley', 'Hummingbird Sanctuaries', 'Canopy Zip-lines', 'Chocolate Tours', 'Waterfall Hikes'],
      climate: 'Misty year-round, drier: June-September',
      altitude: '1,200-2,500m (3,937-8,202ft)',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/ecuador-cloudforest.webp'
    },
    {
      id: 'oriente',
      name: 'The Oriente (Amazon)',
      shortName: 'Oriente',
      description: 'Ecuador\'s slice of the Amazon with exceptional wildlife and indigenous cultures',
      highlights: ['Yasuni National Park', 'Cuyabeno Wildlife Reserve', 'Huaorani Communities', 'Pink River Dolphins', 'Jungle Lodges'],
      climate: 'Tropical year-round, less rain: Dec-Feb',
      altitude: '200-500m (656-1,640ft)',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/ecuador-oriente.webp'
    }
  ];

  const culturalHighlights = [
    {
      title: 'Colonial Heritage',
      description: 'Quito\'s historic center is a UNESCO World Heritage Site with stunning colonial architecture',
      icon: '🏛️'
    },
    {
      title: 'Indigenous Culture',
      description: 'Experience vibrant indigenous markets and traditional Andean communities',
      icon: '🧶'
    },
    {
      title: 'Natural Diversity',
      description: 'Four distinct worlds: Galapagos, Coast, Highlands, and Amazon in one small country',
      icon: '🌿'
    },
    {
      title: 'Middle of the World',
      description: 'Stand on the equator line and experience unique geographical phenomena',
      icon: '🌍'
    }
  ];

  const travelTips = [
    {
      category: 'Best Time to Visit',
      details: [
        'Highlands: June-September (dry season)',
        'Amazon: December-February (less rain)',
        'Coast: June-September (whale season)'
      ]
    },
    {
      category: 'Altitude Considerations',
      details: [
        'Quito: 2,850m (9,350ft) - take time to acclimatize',
        'Cotopaxi: 5,897m (19,347ft) summit',
        'Consider altitude sickness medication'
      ]
    },
    {
      category: 'Cultural Etiquette',
      details: [
        'Spanish is the main language',
        'Indigenous communities appreciate respectful visits',
        'Bargaining expected at markets'
      ]
    },
    {
      category: 'What to Pack',
      details: [
        'Layers for varying climates',
        'Rain gear for Amazon visits',
        'Comfortable walking shoes',
        'Sun protection for highlands'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <HeroImage
            desktopSrc={heroSettings.imageUrl}
            mobileSrc={heroSettings.originalImageUrl}
            alt="Ecuador landscape"
            focalX={heroSettings.focalX}
            focalY={heroSettings.focalY}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" style={{ opacity: heroSettings.overlayOpacity }}></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white max-w-4xl">
            <motion.h1
              className="text-5xl sm:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Ecuador
            </motion.h1>
            <motion.p
              className="text-xl sm:text-2xl mb-8 text-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Four worlds in one country - from volcanic highlands to Amazon rainforest
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                href="/packages?destination=Ecuador"
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

      {/* Ecuador Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Why Ecuador?</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Ecuador packs an incredible diversity into one of South America's smallest countries.
              From the colonial splendor of Quito to the wildlife-rich Amazon and the famous Galapagos Islands,
              this is a destination that defies expectations at every turn.
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
            <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Explore Ecuador's Diverse Regions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ecuador's remarkable geography spans four distinct regions, each offering unique landscapes,
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
            <h2 className="text-4xl font-bold text-[#8B4513] mb-6">Planning Your Ecuador Adventure</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Essential information to help you prepare for your journey to Ecuador
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

      {/* Galapagos Connection Section */}
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
                Combine with the Galapagos Islands
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Ecuador is the gateway to the world-famous Galapagos Islands. Many travelers combine
                their Ecuador mainland adventure with a Galapagos cruise for the ultimate South American experience.
              </p>
              <p className="text-gray-600 mb-8">
                Flights depart daily from Quito and Guayaquil to the Galapagos, making it easy to
                explore both destinations on one unforgettable journey.
              </p>
              <Link
                href="/destinations/galapagos"
                className="inline-flex items-center bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                Explore Galapagos Cruises
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
                src="https://meridian-travel.s3.us-east-1.amazonaws.com/galapagos-hero.webp"
                alt="Galapagos Islands"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/destinations/default.jpg';
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#8B4513]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Discover Ecuador?</h2>
          <p className="text-xl mb-8 opacity-90">
            Let our Ecuador specialists create a personalized journey that matches your interests,
            timeline, and travel style. Every trip is uniquely crafted for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/packages?destination=Ecuador"
              className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
            >
              Browse Ecuador Packages
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
