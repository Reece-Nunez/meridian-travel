'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Ship, CabinCategory } from '@/types/database';

export default function CabinCategoryDetail() {
  const params = useParams();
  const shipId = params.id as string;
  const categoryName = decodeURIComponent(params.category as string);

  const [ship, setShip] = useState<Ship | null>(null);
  const [cabin, setCabin] = useState<CabinCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchData();
  }, [shipId, categoryName]);

  const fetchData = async () => {
    try {
      // Fetch ship data
      const { data: shipData, error: shipError } = await supabase
        .from('ships')
        .select('*')
        .eq('id', shipId)
        .single();

      if (shipError) throw shipError;
      setShip(shipData);

      // Fetch cabin category data
      const { data: cabinData, error: cabinError } = await supabase
        .from('cabin_categories')
        .select('*')
        .eq('ship_id', shipId)
        .eq('name', categoryName)
        .single();

      if (cabinError) throw cabinError;
      setCabin(cabinData);

    } catch (error) {
      console.error('Error fetching cabin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-800">Loading cabin details...</p>
        </div>
      </div>
    );
  }

  if (!ship || !cabin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Cabin not found</h2>
          <Link href={`/ships/${shipId}`} className="text-[#B8860B] hover:text-[#DAA520]">
            Return to Ship Details
          </Link>
        </div>
      </div>
    );
  }

  const images = cabin.images && cabin.images.length > 0 ? cabin.images : ship.images || [];

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
              <li>
                <Link href={`/ships/${shipId}`} className="text-[#B8860B] hover:text-[#DAA520]">{ship.name}</Link>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li className="text-gray-600">{cabin.name}</li>
            </ol>
          </nav>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Main Image */}
            <div className="relative h-[400px] lg:h-[500px] rounded-xl overflow-hidden">
              <img
                src={images[selectedImage] || '/cruise-default.jpg'}
                alt={`${cabin.name} - View ${selectedImage + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/cruise-default.jpg';
                }}
              />
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 gap-4">
              {images.slice(0, 4).map((image, index) => (
                <motion.div
                  key={index}
                  className={`relative h-[190px] lg:h-[240px] rounded-lg overflow-hidden cursor-pointer ${
                    selectedImage === index ? 'ring-4 ring-[#B8860B]' : ''
                  }`}
                  onClick={() => setSelectedImage(index)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={image}
                    alt={`${cabin.name} - View ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/cruise-default.jpg';
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cabin Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-[#8B4513] mb-3">{cabin.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  On {ship.name}
                </span>
                {cabin.quantity && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {cabin.quantity} available
                  </span>
                )}
                {cabin.max_occupancy && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Max {cabin.max_occupancy} guests
                  </span>
                )}
                {cabin.size_sqm && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    {cabin.size_sqm} m²
                  </span>
                )}
              </div>
            </motion.div>

            {cabin.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-xl p-6 mb-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-[#8B4513] mb-4">About This Cabin</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{cabin.description}</p>
              </motion.div>
            )}

            {cabin.amenities && cabin.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-xl p-6 mb-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cabin.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-[#B8860B] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* All Cabin Images */}
            {images.length > 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Photo Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <motion.div
                      key={index}
                      className={`relative h-48 rounded-lg overflow-hidden cursor-pointer ${
                        selectedImage === index ? 'ring-4 ring-[#B8860B]' : ''
                      }`}
                      onClick={() => setSelectedImage(index)}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src={image}
                        alt={`${cabin.name} - View ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/cruise-default.jpg';
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#8B4513] to-[#B8860B] rounded-xl p-6 text-white mb-6"
              >
                <h3 className="text-2xl font-bold mb-2">Pricing</h3>
                {cabin.pricing_per_person ? (
                  <div className="mb-6">
                    <p className="text-4xl font-bold mb-2">${cabin.pricing_per_person.toLocaleString()}</p>
                    <p className="text-[#F5F5DC]">Per person</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="text-[#F5F5DC]">Contact us for pricing</p>
                  </div>
                )}
                <Link
                  href="/quote"
                  className="block w-full bg-white text-[#8B4513] hover:bg-[#F5F5DC] text-center py-3 rounded-lg font-semibold transition-colors mb-3"
                >
                  Request Quote
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
                <h3 className="text-lg font-bold text-[#8B4513] mb-4">Cabin Details</h3>
                <div className="space-y-3 text-sm">
                  {cabin.size_sqm && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Size</span>
                      <span className="font-semibold text-[#8B4513]">{cabin.size_sqm} m²</span>
                    </div>
                  )}
                  {cabin.max_occupancy && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Max Occupancy</span>
                      <span className="font-semibold text-[#8B4513]">{cabin.max_occupancy} guests</span>
                    </div>
                  )}
                  {cabin.quantity && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Available</span>
                      <span className="font-semibold text-[#8B4513]">{cabin.quantity}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ship</span>
                    <Link
                      href={`/ships/${shipId}`}
                      className="font-semibold text-[#B8860B] hover:text-[#DAA520]"
                    >
                      {ship.name}
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#F5F5DC] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#8B4513] mb-4">
            Explore More Cabins on {ship.name}
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Discover other cabin options available on this vessel for your perfect voyage.
          </p>
          <Link
            href={`/ships/${shipId}`}
            className="inline-flex items-center bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            View All Cabins
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
