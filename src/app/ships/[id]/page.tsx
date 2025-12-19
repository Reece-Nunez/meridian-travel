'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Ship, TripPackage, CabinCategory, CabinImage } from '@/types/database';
import { usePercentageScrollRestoration } from '@/hooks/usePercentageScrollRestoration';

export default function ShipDetail() {
  const params = useParams();
  const shipId = params.id as string;

  const [ship, setShip] = useState<Ship | null>(null);
  const [itineraries, setItineraries] = useState<TripPackage[]>([]);
  const [cabinCategories, setCabinCategories] = useState<CabinCategory[]>([]);
  const [cabinImagesMap, setCabinImagesMap] = useState<Record<string, CabinImage[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Scroll restoration for refresh and back button navigation
  usePercentageScrollRestoration(`ship-detail-${shipId}`, !loading);

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

      // Fetch cabin categories from the database
      const { data: cabinData, error: cabinError } = await supabase
        .from('cabin_categories')
        .select('*')
        .eq('ship_id', shipId)
        .order('pricing_per_person', { ascending: true, nullsFirst: false });

      if (cabinError) {
        console.error('Error fetching cabin categories:', cabinError);
        // If no cabin categories in DB, we'll fallback to the ship's cabin_categories array
        setCabinCategories([]);
      } else {
        setCabinCategories(cabinData || []);

        // Fetch the first image for each cabin category
        if (cabinData && cabinData.length > 0) {
          const imagesMap: Record<string, CabinImage[]> = {};

          for (const cabin of cabinData) {
            const { data: imagesData, error: imagesError } = await supabase
              .from('cabin_images')
              .select('*')
              .eq('cabin_id', cabin.id)
              .order('display_order', { ascending: true })
              .limit(1);

            if (!imagesError && imagesData && imagesData.length > 0) {
              imagesMap[cabin.id] = imagesData;
            }
          }

          setCabinImagesMap(imagesMap);
        }
      }

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
          <p className="text-gray-800">Loading ship details...</p>
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

  const images = ship.images || [];
  const deckPlans = ship.deck_plans || [];

  // Helper function to parse and format cabin categories
  const formatCabinCategory = (category: string): { name: string; quantity: string; icon: string; description: string } => {
    const lower = category.toLowerCase();

    // Extract quantity from parentheses (e.g., "Legend Suite (four)" -> "four")
    const quantityMatch = category.match(/\(([^)]+)\)/);
    const quantity = quantityMatch ? quantityMatch[1] : '';

    // Remove quantity from name for cleaner display
    const cleanName = category.replace(/\s*\([^)]+\)/, '').trim();

    // Determine icon and description based on cabin type
    if (lower.includes('legend') && lower.includes('balcony')) {
      return {
        name: cleanName,
        quantity,
        icon: '⭐',
        description: 'Premium balcony suite with exclusive amenities'
      };
    }
    if (lower.includes('balcony suite plus')) {
      return {
        name: cleanName,
        quantity,
        icon: '🌟',
        description: 'Enhanced balcony suite with extra space'
      };
    }
    if (lower.includes('balcony')) {
      return {
        name: cleanName,
        quantity,
        icon: '🌊',
        description: 'Private balcony with ocean views'
      };
    }
    if (lower.includes('legend suite')) {
      return {
        name: cleanName,
        quantity,
        icon: '👑',
        description: 'Signature suite with premium features'
      };
    }
    if (lower.includes('junior suite')) {
      return {
        name: cleanName,
        quantity,
        icon: '✨',
        description: 'Comfortable suite with quality amenities'
      };
    }
    if (lower.includes('plus')) {
      return {
        name: cleanName,
        quantity,
        icon: '➕',
        description: 'Enhanced cabin with additional space'
      };
    }
    if (lower.includes('standard') || lower.includes('interior')) {
      return {
        name: cleanName,
        quantity,
        icon: '🛏️',
        description: 'Comfortable interior accommodation'
      };
    }
    if (lower.includes('suite')) {
      return {
        name: cleanName,
        quantity,
        icon: '👑',
        description: 'Spacious suite accommodation'
      };
    }

    // Default
    return {
      name: cleanName,
      quantity,
      icon: '🚢',
      description: 'Quality cabin accommodation'
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-white">
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
              <li className="text-gray-600">{ship.name}</li>
            </ol>
          </nav>

          {/* Enhanced Gallery Layout */}
          <div className="mb-8">
            {/* Main Large Image */}
            <motion.div
              className="relative w-full bg-gray-100 rounded-xl overflow-hidden mb-4 shadow-2xl flex items-center justify-center min-h-[450px] lg:min-h-[600px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={images[selectedImage] || '/cruise-default.jpg'}
                alt={ship.name}
                className="w-full h-auto object-contain max-h-[450px] lg:max-h-[600px]"
                onError={(e) => {
                  e.currentTarget.src = '/cruise-default.jpg';
                }}
              />
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                {selectedImage + 1} / {images.length}
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbnail Grid - All Same Size */}
            {images.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square w-full rounded-lg overflow-hidden transition-all ${
                      selectedImage === index
                        ? 'ring-4 ring-[#B8860B] shadow-lg'
                        : 'ring-2 ring-gray-200 hover:ring-[#B8860B]/50 hover:shadow-md'
                    }`}
                    aria-label={`Select image ${index + 1}`}
                  >
                    {/* Background for loading state */}
                    <div className="absolute inset-0 bg-gray-100" />

                    <img
                      src={image || '/cruise-default.jpg'}
                      alt={`${ship.name} - Thumbnail ${index + 1}`}
                      className="absolute inset-0 w-full h-full block"
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        width: '100%',
                        height: '100%',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/cruise-default.jpg';
                      }}
                      draggable={false}
                    />

                    {selectedImage === index && (
                      <div className="absolute inset-0 bg-[#B8860B]/20 flex items-center justify-center">
                        <div className="bg-white rounded-full p-1">
                          <svg
                            className="w-4 h-4 text-[#B8860B]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-[#8B4513] mb-3">{ship.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {ship.capacity} Guests
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {ship.ship_type}
                </span>
                {ship.base_port && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Base Port: {ship.base_port}
                  </span>
                )}
              </div>
            </motion.div>

            {ship.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-xl p-6 mb-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-[#8B4513] mb-4">About the Vessel</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{ship.description}</p>
              </motion.div>
            )}

            {ship.operating_regions && ship.operating_regions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-xl p-6 mb-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Operating Regions</h2>
                <div className="flex flex-wrap gap-3">
                  {ship.operating_regions.map((region, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-[#F5F5DC] text-[#8B4513] rounded-full font-medium"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {ship.luxury_highlights && ship.luxury_highlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-xl p-6 mb-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Luxury Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ship.luxury_highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-[#B8860B] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {ship.ship_features && ship.ship_features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-xl p-6 mb-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Ship Features & Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ship.ship_features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-[#B8860B] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {(cabinCategories.length > 0 || (ship.cabin_categories && ship.cabin_categories.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white rounded-xl p-6 mb-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Cabin Categories</h2>
                <p className="text-gray-600 mb-6">
                  Choose from {cabinCategories.length > 0 ? cabinCategories.length : ship.cabin_categories?.length || 0} different cabin types, each designed for comfort and relaxation during your voyage.
                </p>
                <div className="space-y-4">
                  {cabinCategories.length > 0 ? (
                    // Show cabin categories from database with full details
                    cabinCategories.map((cabin, index) => {
                      const cabinImage = cabinImagesMap[cabin.id]?.[0];
                      const imageUrl = cabinImage?.image_url || cabin.images?.[0];

                      return (
                        <Link
                          key={cabin.id}
                          href={`/ships/${shipId}/cabins/${encodeURIComponent(cabin.name)}`}
                          className="block"
                        >
                          <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-[#F5F5DC] to-white border-2 border-[#B8860B]/20 rounded-lg hover:border-[#B8860B] hover:shadow-lg transition-all cursor-pointer group">
                            {imageUrl ? (
                              <div className="relative aspect-square w-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                <img
                                  src={imageUrl}
                                  alt={cabin.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  style={{
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    width: '100%',
                                    height: '100%'
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="text-4xl flex-shrink-0 mt-1">🛏️</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="text-[#8B4513] font-bold text-lg leading-tight group-hover:text-[#B8860B] transition-colors">{cabin.name}</h3>
                                {cabin.pricing_per_person && (
                                  <span className="px-3 py-1 bg-[#B8860B] text-white text-sm font-semibold rounded-full whitespace-nowrap flex-shrink-0">
                                    {cabin.pricing_per_person}
                                  </span>
                                )}
                              </div>
                              {cabin.description && (
                                <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">{cabin.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {(cabin.size_sqft || cabin.size_sqm) && (
                                  <span>📐 {cabin.size_sqft || cabin.size_sqm} sq ft</span>
                                )}
                                {cabin.max_occupancy && <span>👥 Max {cabin.max_occupancy} guests</span>}
                                {cabin.quantity && <span>✓ {cabin.quantity} available</span>}
                              </div>
                              <div className="mt-3 text-[#B8860B] text-sm font-medium group-hover:underline">
                                Click for pricing and more info →
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    // Fallback to old format with ship's cabin_categories array
                    ship.cabin_categories?.map((category, index) => {
                      const formatted = formatCabinCategory(category);
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-5 bg-gradient-to-r from-[#F5F5DC] to-white border-2 border-[#B8860B]/20 rounded-lg hover:border-[#B8860B]/40 hover:shadow-md transition-all"
                        >
                          <div className="text-4xl flex-shrink-0 mt-1">{formatted.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h3 className="text-[#8B4513] font-bold text-lg leading-tight">{formatted.name}</h3>
                              {formatted.quantity && (
                                <span className="px-3 py-1 bg-[#B8860B] text-white text-sm font-semibold rounded-full whitespace-nowrap flex-shrink-0">
                                  {formatted.quantity} available
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{formatted.description}</p>
                            <p className="mt-3 text-[#B8860B] text-sm">Contact us for pricing and more details</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {deckPlans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white rounded-xl p-6 mb-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Deck Plans</h2>
                <div className="space-y-4">
                  {deckPlans.map((plan, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={plan}
                        alt={`Deck Plan ${index + 1}`}
                        className="w-full h-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {itineraries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-[#8B4513] mb-6">Available Itineraries</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {itineraries.map((itinerary) => (
                    <div
                      key={itinerary.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-xl font-bold text-[#8B4513] mb-2">{itinerary.title}</h3>
                      <p className="text-[#B8860B] font-semibold mb-3">{itinerary.duration} days</p>
                      {itinerary.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{itinerary.description}</p>
                      )}
                      <div className="flex gap-3">
                        <Link
                          href={`/packages/${itinerary.id}`}
                          className="flex-1 text-center bg-[#B8860B] hover:bg-[#DAA520] text-white py-2 rounded-lg font-medium transition-colors"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/packages/${itinerary.id}/book`}
                          className="flex-1 text-center border-2 border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white py-2 rounded-lg font-medium transition-colors"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#8B4513] to-[#B8860B] rounded-xl p-6 text-white mb-6"
              >
                <h3 className="text-2xl font-bold mb-4">Ready to Book?</h3>
                <p className="mb-6 text-[#F5F5DC]">
                  Contact our cruise specialists to plan your perfect voyage aboard the {ship.name}.
                </p>
                <Link
                  href="/quote"
                  className="block w-full bg-white text-[#8B4513] hover:bg-[#F5F5DC] text-center py-3 rounded-lg font-semibold transition-colors mb-3"
                >
                  Request Custom Quote
                </Link>
                <Link
                  href="/contact"
                  className="block w-full border-2 border-white text-white hover:bg-white hover:text-[#8B4513] text-center py-3 rounded-lg font-semibold transition-colors"
                >
                  Contact Specialist
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-[#8B4513] mb-4">Quick Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Vessel Type</span>
                    <span className="font-semibold text-[#8B4513]">{ship.ship_type}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Capacity</span>
                    <span className="font-semibold text-[#8B4513]">{ship.capacity} guests</span>
                  </div>
                  {ship.base_port && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Base Port</span>
                      <span className="font-semibold text-[#8B4513]">{ship.base_port}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Itineraries</span>
                    <span className="font-semibold text-[#8B4513]">{itineraries.length} available</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F5F5DC] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#8B4513] mb-4">
            Explore More Vessels
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Discover our full fleet of luxury expedition vessels operating across South America's most spectacular regions.
          </p>
          <Link
            href="/cruises"
            className="inline-flex items-center bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            View All Ships
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
