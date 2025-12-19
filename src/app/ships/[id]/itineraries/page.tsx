'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Ship, TripPackage } from '@/types/database';
import { usePercentageScrollRestoration } from '@/hooks/usePercentageScrollRestoration';

export default function ShipItineraries() {
  const params = useParams();
  const shipId = params.id as string;

  const [ship, setShip] = useState<Ship | null>(null);
  const [itineraries, setItineraries] = useState<TripPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Scroll restoration for refresh and back button navigation
  usePercentageScrollRestoration(`ship-itineraries-${shipId}`, !loading);

  useEffect(() => {
    fetchShipData();
  }, [shipId]);

  const fetchShipData = async () => {
    try {
      const { data: shipData, error: shipError } = await supabase
        .from('ships')
        .select('*')
        .eq('id', shipId)
        .single();

      if (shipError) throw shipError;
      setShip(shipData);

      const { data: itinerariesData, error: itinerariesError } = await supabase
        .from('trip_packages')
        .select('*')
        .eq('ship_id', shipId)
        .eq('is_active', true)
        .order('duration', { ascending: true });

      if (itinerariesError) throw itinerariesError;
      setItineraries(itinerariesData || []);

    } catch (error) {
      console.error('Error fetching ship data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-800">Loading itineraries...</p>
        </div>
      </div>
    );
  }

  if (!ship) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Ship not found</h2>
          <Link href="/cruises" className="text-[#B8860B] hover:text-[#DAA520]">
            Return to Cruises
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-[#B8860B] hover:text-[#DAA520]">Home</Link>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li>
                <Link href="/cruises" className="text-[#B8860B] hover:text-[#DAA520]">Cruises</Link>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li>
                <Link href={`/ships/${shipId}`} className="text-[#B8860B] hover:text-[#DAA520]">{ship.name}</Link>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li className="text-gray-600">Itineraries</li>
            </ol>
          </nav>

          <div className="flex items-center gap-6">
            {ship.images && ship.images[0] && (
              <div className="hidden sm:block w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={ship.images[0]}
                  alt={ship.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/cruise-default.jpg';
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-[#8B4513] mb-2">{ship.name}</h1>
              <p className="text-gray-600">
                {itineraries.length} {itineraries.length === 1 ? 'Itinerary' : 'Itineraries'} Available
              </p>
            </div>
            <Link
              href={`/ships/${shipId}`}
              className="hidden md:flex items-center gap-2 px-6 py-3 border-2 border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Ship Details
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {itineraries.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">Boat</div>
            <h3 className="text-2xl font-bold text-[#8B4513] mb-4">No Itineraries Available</h3>
            <p className="text-gray-600 text-lg mb-8">
              There are currently no active itineraries for this vessel.
            </p>
            <Link
              href={`/ships/${shipId}`}
              className="inline-flex items-center bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Ship Details
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {itineraries.map((itinerary, index) => (
              <motion.div
                key={itinerary.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="h-56 relative overflow-hidden">
                  {itinerary.images && itinerary.images[0] ? (
                    <img
                      src={itinerary.images[0]}
                      alt={itinerary.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#8B4513] via-[#B8860B] to-[#DAA520]">
                      <span className="text-white text-xl font-semibold">{itinerary.destination}</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#8B4513] text-white px-3 py-1 text-sm font-medium rounded-full shadow-lg">
                      {itinerary.destination}
                    </span>
                  </div>
                  {itinerary.duration && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-black/60 text-white px-3 py-1 text-sm font-medium rounded-full backdrop-blur-sm">
                        {itinerary.duration} days
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#8B4513] mb-3">{itinerary.title}</h3>

                  {itinerary.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-4">{itinerary.description}</p>
                  )}

                  {itinerary.luxury_highlights && itinerary.luxury_highlights.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <h4 className="text-sm font-semibold text-[#8B4513] mb-2">Highlights:</h4>
                      <div className="space-y-1">
                        {itinerary.luxury_highlights.slice(0, 3).map((highlight, hIndex) => (
                          <div key={hIndex} className="flex items-start text-xs text-gray-600">
                            <svg className="w-3 h-3 text-[#B8860B] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="line-clamp-2">{highlight}</span>
                          </div>
                        ))}
                        {itinerary.luxury_highlights.length > 3 && (
                          <p className="text-xs text-[#B8860B] font-medium ml-5">
                            +{itinerary.luxury_highlights.length - 3} more highlights
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link
                      href={`/packages/${itinerary.id}`}
                      className="flex-1 text-center bg-[#B8860B] hover:bg-[#DAA520] text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/packages/${itinerary.id}/book`}
                      className="flex-1 text-center border-2 border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {itineraries.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-[#8B4513] to-[#B8860B] rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Want to Learn More About the {ship.name}?
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Explore detailed information about the vessel, cabin categories, deck plans, and exclusive amenities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/ships/${shipId}`}
                className="inline-flex items-center justify-center bg-white text-[#8B4513] hover:bg-[#F5F5DC] px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                View Ship Details
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-[#8B4513] px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Request Custom Quote
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
