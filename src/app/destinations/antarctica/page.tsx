'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Ship } from '@/types/database';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

interface ProcessedCruise {
  id: string;
  name: string;
  capacity: number;
  itineraryCount: number;
  image: string;
  lowestCabinPrice: number | null;
  boatType: string;
  features: string[];
  ship: Ship;
}

export default function AntarcticaDestination() {
  const [cruises, setCruises] = useState<ProcessedCruise[]>([]);
  const [loading, setLoading] = useState(true);

  // Scroll restoration for back button navigation
  useScrollRestoration('destinationAntarctica', !loading);

  useEffect(() => {
    fetchCruises();
  }, []);

  const fetchCruises = async () => {
    try {
      setLoading(true);

      // Fetch all active ships
      const { data: ships, error: shipsError } = await supabase
        .from('ships')
        .select('*')
        .eq('is_active', true);

      if (shipsError) throw shipsError;

      // Fetch cruise packages for Antarctica
      const { data: packages, error: packagesError } = await supabase
        .from('trip_packages')
        .select('*')
        .eq('type', 'cruise')
        .eq('is_active', true)
        .not('ship_id', 'is', null);

      if (packagesError) throw packagesError;

      // Fetch cabin categories for pricing
      const { data: cabins, error: cabinsError } = await supabase
        .from('cabin_categories')
        .select('ship_id, pricing_per_person');

      if (cabinsError) throw cabinsError;

      // Build cabin pricing map
      const cabinPricesByShip = new Map<string, number>();
      if (cabins) {
        const cabinsByShip = new Map<string, any[]>();
        cabins.forEach((cabin: any) => {
          if (!cabin.ship_id || !cabin.pricing_per_person) return;
          const existing = cabinsByShip.get(cabin.ship_id) || [];
          existing.push(cabin);
          cabinsByShip.set(cabin.ship_id, existing);
        });

        cabinsByShip.forEach((shipCabins, shipId) => {
          const prices: number[] = [];
          shipCabins.forEach(cabin => {
            const matches = cabin.pricing_per_person.match(/\$?\s*([\d,]+(?:\.\d{2})?)/);
            if (matches && matches[1]) {
              const price = parseFloat(matches[1].replace(/,/g, ''));
              if (!isNaN(price)) prices.push(price);
            }
          });
          if (prices.length > 0) {
            cabinPricesByShip.set(shipId, Math.min(...prices));
          }
        });
      }

      // Count itineraries per ship
      const itinerariesByShip = new Map<string, number>();
      packages?.forEach((pkg: any) => {
        if (pkg.ship_id) {
          itinerariesByShip.set(pkg.ship_id, (itinerariesByShip.get(pkg.ship_id) || 0) + 1);
        }
      });

      // Filter ships that operate in Antarctica
      const antarcticShips = ships?.filter((ship: any) =>
        ship.operating_regions?.some((region: string) =>
          region.toLowerCase().includes('antarctica') || region.toLowerCase().includes('antarctic')
        )
      ) || [];

      // Process ships into cruises
      const processedCruises: ProcessedCruise[] = antarcticShips.map((ship: any) => ({
        id: ship.id,
        name: ship.name,
        capacity: ship.capacity,
        itineraryCount: itinerariesByShip.get(ship.id) || 0,
        image: ship.images && ship.images[0] ? ship.images[0] : '',
        lowestCabinPrice: cabinPricesByShip.get(ship.id) || null,
        boatType: ship.ship_type || 'Expedition',
        features: ship.luxury_highlights?.slice(0, 3) || ship.ship_features?.slice(0, 3) || [],
        ship: ship
      }));

      setCruises(processedCruises);
    } catch (error) {
      console.error('Error fetching Antarctica cruises:', error);
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    {
      title: 'Wildlife Encounters',
      description: 'Observe emperor penguins, Weddell seals, orcas, and humpback whales in their natural habitat',
      icon: '🐧'
    },
    {
      title: 'Dramatic Landscapes',
      description: 'Towering icebergs, glacial formations, and pristine white wilderness stretching endlessly',
      icon: '🏔️'
    },
    {
      title: 'Scientific Heritage',
      description: 'Visit historic research stations and learn about Antarctic exploration and climate research',
      icon: '🔬'
    },
    {
      title: 'Zodiac Expeditions',
      description: 'Navigate between ice floes and land at remote locations inaccessible to larger vessels',
      icon: '⛵'
    }
  ];

  const travelInfo = [
    {
      category: 'Best Time to Visit',
      details: [
        'November-March: Antarctic summer season',
        'December-January: Peak season, longest days',
        'February-March: Best for whale watching'
      ]
    },
    {
      category: 'What to Expect',
      details: [
        'Temperatures: -2°C to 8°C (28°F to 46°F)',
        '20+ hours of daylight during peak season',
        'Drake Passage crossing (can be rough)'
      ]
    },
    {
      category: 'What to Pack',
      details: [
        'Waterproof expedition jacket and pants',
        'Warm layers (thermal underwear, fleece)',
        'Waterproof gloves and warm hat',
        'Seasickness medication recommended'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://meridian-travel.s3.us-east-1.amazonaws.com/antarctica.webp"
            alt="Antarctica landscape"
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
              Antarctica
            </motion.h1>
            <motion.p
              className="text-xl sm:text-2xl mb-8 text-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Earth's last pristine wilderness - a frozen continent of extraordinary beauty and wildlife
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                href="/cruises"
                className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
              >
                View All Expeditions
              </Link>
              <Link
                href="/quote"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200 border border-white/30"
              >
                Plan Your Journey
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Why Antarctica Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#8B4513] mb-4">
              Experience the White Continent
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Antarctica offers an unparalleled adventure to the world's most remote and pristine environment,
              where towering icebergs, majestic wildlife, and endless horizons create memories of a lifetime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-6xl mb-4">{highlight.icon}</div>
                <h3 className="text-xl font-bold text-[#8B4513] mb-2">{highlight.title}</h3>
                <p className="text-gray-600">{highlight.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Expeditions Section */}
      <section className="py-20 bg-[#F5F5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#8B4513] mb-4">
              Antarctic Expeditions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our carefully selected fleet of expedition vessels designed for polar exploration
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8860B]"></div>
              <p className="mt-4 text-gray-600">Loading expeditions...</p>
            </div>
          ) : cruises.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-xl text-gray-600 mb-6">
                New Antarctic expeditions coming soon!
              </p>
              <Link
                href="/contact"
                className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 inline-block"
              >
                Contact Us for Information
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cruises.map((cruise, index) => (
                <motion.div
                  key={cruise.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {cruise.image && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                      <img
                        src={cruise.image}
                        alt={cruise.name}
                        className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 bg-[#B8860B] text-white px-3 py-1 rounded-full text-sm font-medium">
                        {cruise.capacity} guests
                      </div>
                      <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {cruise.boatType}
                      </div>
                      {cruise.itineraryCount > 0 && (
                        <div className="absolute bottom-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          {cruise.itineraryCount} {cruise.itineraryCount > 1 ? 'itineraries' : 'itinerary'}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#8B4513] mb-2">{cruise.name}</h3>
                    <p className="text-2xl font-bold text-[#B8860B] mb-4">
                      {cruise.lowestCabinPrice ? `Starting from: $${cruise.lowestCabinPrice.toLocaleString()}` : 'Price on Request'}
                    </p>

                    {cruise.features.length > 0 && (
                      <div className="space-y-2 mb-6">
                        <h4 className="font-semibold text-gray-900">Features:</h4>
                        {cruise.features.map((feature: string, fIndex: number) => (
                          <div key={fIndex} className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 text-[#B8860B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Link
                        href={`/ships/${cruise.ship.id}`}
                        className="flex-1 text-center border-2 border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white py-3 rounded-md font-medium transition-colors"
                      >
                        Ship Details
                      </Link>
                      {cruise.itineraryCount > 0 && (
                        <Link
                          href={`/ships/${cruise.ship.id}/itineraries`}
                          className="flex-1 text-center bg-[#B8860B] hover:bg-[#DAA520] text-white py-3 rounded-md font-medium transition-colors"
                        >
                          Itineraries ({cruise.itineraryCount})
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Travel Information Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#8B4513] mb-4">
              Plan Your Antarctic Expedition
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {travelInfo.map((info, index) => (
              <motion.div
                key={info.category}
                className="bg-[#F5F5DC] p-6 rounded-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-bold text-[#8B4513] mb-4">{info.category}</h3>
                <ul className="space-y-2">
                  {info.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start text-gray-700">
                      <svg className="w-5 h-5 text-[#B8860B] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#2D5016]">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Explore Antarctica?
          </h3>
          <p className="text-xl text-[#F5F5DC] mb-8">
            Let our expedition specialists help you plan your once-in-a-lifetime Antarctic adventure.
          </p>
          <Link
            href="/quote"
            className="bg-[#B8860B] text-[#F5F5DC] px-8 py-4 rounded-md text-lg font-medium hover:bg-[#DAA520] transition-colors duration-200 inline-block"
          >
            Request Your Custom Quote
          </Link>
        </div>
      </section>
    </div>
  );
}
