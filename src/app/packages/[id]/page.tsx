'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { TripPackage } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  accommodation: string | null;
}

export default function PackageDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [pkg, setPkg] = useState<TripPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchPackage();
  }, [params.id]);

  const fetchPackage = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_packages')
        .select('*')
        .eq('id', params.id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          router.push('/packages');
          return;
        }
        throw error;
      }

      setPkg(data);
    } catch (error) {
      console.error('Error fetching package:', error);
      router.push('/packages');
    } finally {
      setLoading(false);
    }
  };

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

  const handleBookNow = () => {
    if (!user) {
      router.push(`/auth/signin?redirect=/packages/${params.id}/book`);
      return;
    }
    router.push(`/packages/${params.id}/book`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return null;
  }

  const itinerary: ItineraryDay[] = pkg.itinerary as ItineraryDay[] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          {pkg.images && pkg.images[selectedImageIndex] ? (
            <img
              src={pkg.images[selectedImageIndex]}
              alt={pkg.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#8B4513] to-[#B8860B] flex items-center justify-center">
              <span className="text-white text-3xl font-semibold">{pkg.destination}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>
        
        {/* Image Navigation */}
        {pkg.images && pkg.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {pkg.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  selectedImageIndex === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link
            href="/packages"
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-md hover:bg-white/30 transition-colors duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Packages
          </Link>
        </div>

        {/* Title and Price */}
        <div className="absolute bottom-8 left-8">
          <div className="flex items-center mb-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(pkg.difficulty_level)}`}>
              {pkg.difficulty_level || 'Standard'}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{pkg.title}</h1>
          <div className="flex items-center text-white text-lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {pkg.destination}
            <span className="mx-2">•</span>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {pkg.duration} days
          </div>
        </div>

        {/* Price and Book Button */}
        <div className="absolute bottom-8 right-8 text-right">
          <div className="text-3xl font-bold text-white mb-2">
            {formatPrice(pkg.price_usd)}
          </div>
          <div className="text-white/80 text-sm mb-4">per person</div>
          <button
            onClick={handleBookNow}
            className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-3 rounded-md text-lg font-medium transition-colors duration-200"
          >
            Book This Trip
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-[#8B4513] mb-4">About This Trip</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{pkg.description}</p>
            </section>

            {/* Itinerary */}
            {itinerary && itinerary.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-[#8B4513] mb-6">Detailed Itinerary</h2>
                <div className="space-y-6">
                  {itinerary.map((day, index) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-[#B8860B] text-white rounded-full flex items-center justify-center font-bold">
                            {day.day}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-xl font-semibold text-[#8B4513] mb-2">{day.title}</h3>
                          <ul className="text-gray-600 space-y-1 mb-3">
                            {day.activities.map((activity, actIndex) => (
                              <li key={actIndex} className="flex items-start">
                                <span className="text-[#B8860B] mr-2">•</span>
                                {activity}
                              </li>
                            ))}
                          </ul>
                          {day.accommodation && (
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                              </svg>
                              <strong>Accommodation:</strong> {day.accommodation}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-[#8B4513] mb-4">Trip Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{pkg.duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-medium">{pkg.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Participants:</span>
                  <span className="font-medium">{pkg.max_participants} people</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(pkg.difficulty_level)}`}>
                    {pkg.difficulty_level || 'Standard'}
                  </span>
                </div>
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-600">Price per person:</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#B8860B]">
                        {formatPrice(pkg.price_usd)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleBookNow}
                className="w-full mt-6 bg-[#B8860B] hover:bg-[#DAA520] text-white py-3 rounded-md font-medium transition-colors duration-200"
              >
                Book This Trip
              </button>
            </div>

            {/* What's Included */}
            {pkg.includes && pkg.includes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-4">What's Included</h3>
                <ul className="space-y-2 text-sm">
                  {pkg.includes.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's Not Included */}
            {pkg.excludes && pkg.excludes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-4">What's Not Included</h3>
                <ul className="space-y-2 text-sm">
                  {pkg.excludes.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact */}
            <div className="bg-[#F5F5DC] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#8B4513] mb-3">Have Questions?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our travel specialists are here to help you plan the perfect trip.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-[#B8860B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600">+1 (555) 012-3456</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-[#B8860B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">info@meridianluxurytravel.com</span>
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-block mt-4 text-[#B8860B] hover:text-[#DAA520] font-medium text-sm"
              >
                Contact Us →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}