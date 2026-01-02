'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { TripPackage } from '@/types/database';
import { usePercentageScrollRestoration } from '@/hooks/usePercentageScrollRestoration';

export default function Packages() {
  const searchParams = useSearchParams();
  const destinationParam = searchParams.get('destination');

  const [packages, setPackages] = useState<TripPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<string>(destinationParam || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grouped');

  // Scroll restoration for refresh and back button navigation
  usePercentageScrollRestoration('packages-list', !loading);

  useEffect(() => {
    fetchPackages();
  }, []);

  // Sync filter with URL parameter when it changes
  useEffect(() => {
    if (destinationParam) {
      setSelectedDestination(destinationParam);
    }
  }, [destinationParam]);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_packages')
        .select('*')
        .eq('is_active', true)
        .or('type.eq.package,type.is.null') // Only get packages, exclude cruises
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const destinationMatch = selectedDestination === 'all' || pkg.destination === selectedDestination;
    return destinationMatch;
  });

  // Group packages by destination
  const groupedPackages = filteredPackages.reduce((acc, pkg) => {
    const destination = pkg.destination || 'Other';
    if (!acc[destination]) {
      acc[destination] = [];
    }
    acc[destination].push(pkg);
    return acc;
  }, {} as Record<string, TripPackage[]>);

  // Get unique destinations for filter
  const destinations = Array.from(new Set(packages.map(pkg => pkg.destination).filter(Boolean)));

  const destinationInfo = {
    Peru: {
      description: 'Ancient civilizations, dramatic landscapes, and rich cultural heritage',
      highlight: 'Home to Machu Picchu and the Amazon',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/peru-packages.webp'
    },
    Argentina: {
      description: 'From cosmopolitan Buenos Aires to the wild beauty of Patagonia',
      highlight: 'Tango, wine, and glaciers',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/argentina-packages.webp'
    },
    Chile: {
      description: 'Diverse landscapes from Atacama Desert to Patagonian fjords',
      highlight: 'World\'s driest desert and Easter Island',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/chile-packages.webp'
    },
    Brazil: {
      description: 'Vibrant cities, pristine beaches, and Amazon rainforest',
      highlight: 'Rio de Janeiro and Iguazu Falls',
      image: 'https://meridian-travel.s3.us-east-1.amazonaws.com/brazil-packages.webp'
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-800">Loading trip packages...</p>
        </div>
      </div>
    );
  }

  const PackageCard = ({ pkg, index }: { pkg: TripPackage; index: number }) => (
    <motion.div
      key={pkg.id}
      className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="h-42 relative overflow-hidden">
        {pkg.images && pkg.images[0] ? (
          <img
            src={pkg.images[0]}
            alt={pkg.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#8B4513] via-[#B8860B] to-[#DAA520]">
            <span className="text-white text-xl font-semibold">{pkg.destination}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 left-4">
          <span className="bg-[#8B4513] text-[#F5F5DC] px-3 py-1 text-sm font-medium rounded-full shadow-lg">
            {pkg.destination}
          </span>
        </div>
        {pkg.duration && (
          <div className="absolute top-4 right-4">
            <span className="bg-black/60 text-white px-3 py-1 text-sm font-medium rounded-full backdrop-blur-sm">
              {pkg.duration} days
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#8B4513] mb-2 group-hover:text-[#B8860B] transition-colors">
          {pkg.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {pkg.description}
        </p>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Link
            href={`/packages/${pkg.id}`}
            className="text-[#B8860B] hover:text-[#DAA520] font-semibold text-sm flex items-center group/link"
          >
            View Details 
            <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href={`/packages/${pkg.id}/book`}
            className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://meridian-travel.s3.us-east-1.amazonaws.com/travel.webp" 
            alt="Luxury travel experiences" 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load travel.jpg');
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B4513] via-[#8B4513]/80 to-[#B8860B]/70"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Trip Packages
            </h1>
            <p className="text-xl md:text-2xl text-[#F5F5DC] max-w-4xl mx-auto mb-8">
              Expertly crafted luxury travel experiences across South America's most captivating destinations
            </p>
            <div className="flex justify-center">
              <Link
                href="/quote"
                className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                Create Custom Journey
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Enhanced Filters & Controls */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Find Your Perfect Adventure</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Destination</label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="text-[#8B4513] w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-[#B8860B] transition-colors"
                  >
                    <option value="all">All Destinations</option>
                    {destinations.map(dest => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1 lg:col-span-2 flex items-end">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grouped')}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        viewMode === 'grouped' 
                          ? 'bg-[#8B4513] text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      By Destination
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-[#8B4513] text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Grid View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-[#8B4513]">{filteredPackages.length}</span> of {packages.length} packages
            {selectedDestination !== 'all' && (
              <span className="ml-2 text-gray-500">
                in {selectedDestination}
              </span>
            )}
          </p>
          {filteredPackages.length > 0 && (
            <button
              onClick={() => setSelectedDestination('all')}
              className={`text-[#B8860B] hover:text-[#DAA520] font-medium ${
                selectedDestination === 'all' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={selectedDestination === 'all'}
            >
              Show All Destinations
            </button>
          )}
        </div>

        {/* Package Content */}
        {filteredPackages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🧭</div>
            <h3 className="text-2xl font-bold text-[#8B4513] mb-4">No packages found</h3>
            <p className="text-gray-600 text-lg mb-8">
              No packages match your current filters. Try adjusting your search criteria.
            </p>
            <button
              onClick={() => setSelectedDestination('all')}
              className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              View All Packages
            </button>
          </div>
        ) : viewMode === 'grouped' ? (
          // Grouped by Destination View
          <div className="space-y-16">
            {Object.entries(groupedPackages).map(([destination, destPackages]) => (
              <motion.div
                key={destination}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Destination Header */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <h2 className="text-3xl font-bold text-[#8B4513]">{destination}</h2>
                    <div className="ml-4 px-3 py-1 bg-[#F5F5DC] text-[#8B4513] rounded-full text-sm font-medium">
                      {destPackages.length} {destPackages.length === 1 ? 'Package' : 'Packages'}
                    </div>
                  </div>
                  {destinationInfo[destination as keyof typeof destinationInfo] && (
                    <div className="bg-gradient-to-r from-[#F5F5DC] to-white p-6 rounded-xl border-l-4 border-[#B8860B]">
                      <p className="text-gray-700 text-lg mb-2">
                        {destinationInfo[destination as keyof typeof destinationInfo].description}
                      </p>
                      <p className="text-[#B8860B] font-semibold">
                        {destinationInfo[destination as keyof typeof destinationInfo].highlight}
                      </p>
                    </div>
                  )}
                </div>

                {/* Packages Grid for this destination */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {destPackages.map((pkg, index) => (
                    <PackageCard key={pkg.id} pkg={pkg} index={index} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Standard Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPackages.map((pkg, index) => (
              <PackageCard key={pkg.id} pkg={pkg} index={index} />
            ))}
          </div>
        )}

        {/* Call to Action */}
        {filteredPackages.length > 0 && (
          <div className="mt-20 bg-gradient-to-r from-[#8B4513] to-[#B8860B] rounded-xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Don't See Your Perfect Trip?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Every journey is unique. Let our travel specialists create a completely personalized 
              itinerary based on your interests, budget, and travel style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quote"
                className="bg-white text-[#8B4513] hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Request Custom Quote
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-[#8B4513] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
              >
                Speak with Specialist
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}