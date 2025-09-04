'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { TripPackage } from '@/types/database';

export default function Packages() {
  const [packages, setPackages] = useState<TripPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_packages')
        .select('*')
        .eq('is_active', true)
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
    const difficultyMatch = selectedDifficulty === 'all' || pkg.difficulty_level === selectedDifficulty;
    
    let priceMatch = true;
    if (priceRange !== 'all') {
      const price = pkg.price_usd;
      switch (priceRange) {
        case 'under-2000':
          priceMatch = price < 2000;
          break;
        case '2000-3500':
          priceMatch = price >= 2000 && price <= 3500;
          break;
        case 'over-3500':
          priceMatch = price > 3500;
          break;
      }
    }

    return destinationMatch && difficultyMatch && priceMatch;
  });

  const getDifficultyColor = (level: string | null) => {
    switch (level) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'challenging':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/travel.jpg" 
            alt="Luxury travel experiences" 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load travel.jpg');
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
            Trip Packages
          </motion.h1>
          <motion.p 
            className="text-xl text-[#F5F5DC] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover our carefully curated luxury travel experiences across South America
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#8B4513] mb-4">Filter Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
              >
                <option value="all">All Destinations</option>
                <option value="Peru">Peru</option>
                <option value="Argentina">Argentina</option>
                <option value="Chile">Chile</option>
                <option value="Brazil">Brazil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
              >
                <option value="all">All Prices</option>
                <option value="under-2000">Under $2,000</option>
                <option value="2000-3500">$2,000 - $3,500</option>
                <option value="over-3500">Over $3,500</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-800">
            Showing {filteredPackages.length} of {packages.length} packages
          </p>
          <Link
            href="/quote"
            className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Request Custom Quote
          </Link>
        </div>

        {/* Package Grid */}
        {filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No packages match your filters.</p>
            <button
              onClick={() => {
                setSelectedDestination('all');
                setSelectedDifficulty('all');
                setPriceRange('all');
              }}
              className="text-[#B8860B] hover:text-[#DAA520] font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="h-48 relative overflow-hidden bg-gray-200">
                  {pkg.images && pkg.images[0] ? (
                    <img
                      src={pkg.images[0]}
                      alt={pkg.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#8B4513] to-[#B8860B]">
                      <span className="text-white text-lg font-semibold">{pkg.destination}</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(pkg.difficulty_level)}`}>
                      {pkg.difficulty_level || 'Standard'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-[#8B4513]">{pkg.title}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#B8860B]">
                        {formatPrice(pkg.price_usd)}
                      </div>
                      <div className="text-sm text-gray-500">per person</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-800 mb-3">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {pkg.destination}
                    <span className="mx-2">•</span>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {pkg.duration} days
                  </div>
                  
                  <p className="text-gray-800 text-sm mb-4 line-clamp-3">
                    {pkg.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/packages/${pkg.id}`}
                      className="text-[#B8860B] hover:text-[#DAA520] font-medium text-sm"
                    >
                      View Details →
                    </Link>
                    <Link
                      href={`/packages/${pkg.id}/book`}
                      className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}