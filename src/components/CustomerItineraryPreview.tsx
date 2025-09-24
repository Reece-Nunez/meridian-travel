'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CustomQuote, ItineraryDay, ItineraryActivity, ItineraryImage } from '@/types/database';

interface CustomerItineraryPreviewProps {
  quote: CustomQuote;
}

interface ItineraryDayWithDetails extends ItineraryDay {
  activities: ItineraryActivity[];
  images: ItineraryImage[];
}

export default function CustomerItineraryPreview({ quote }: CustomerItineraryPreviewProps) {
  const [itineraryDays, setItineraryDays] = useState<ItineraryDayWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItinerary();
  }, [quote.id]);

  const fetchItinerary = async () => {
    try {
      const response = await fetch(`/api/itinerary/${quote.id}`);
      if (response.ok) {
        const data = await response.json();
        setItineraryDays(data);
      }
    } catch (error) {
      console.error('Error fetching itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0v-.5A1.5 1.5 0 0114.5 6c.526 0 .988-.27 1.256-.679a6.012 6.012 0 011.912 2.706l-1.718.198a.5.5 0 00-.44.456L15 11a1 1 0 102 0l-.51-2.319a.5.5 0 00-.44-.456l-1.718-.198z" />
          </svg>
        );
      case 'tour':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'excursion':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
            <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
          <span className="ml-3 text-gray-600">Loading itinerary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B4513] to-[#D2B48C] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Your {quote.destination} Adventure</h1>
          <p className="text-xl opacity-90">{quote.duration} Days of Luxury Travel</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {quote.travel_dates_start && quote.travel_dates_end && (
                <span>{formatDate(quote.travel_dates_start)} - {formatDate(quote.travel_dates_end)}</span>
              )}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              <span>{quote.participants} Travelers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Days */}
      <div className="max-w-4xl mx-auto p-6">
        {itineraryDays.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Itinerary Coming Soon</h3>
            <p className="text-gray-600">Your detailed day-by-day itinerary is being prepared and will be available shortly.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {itineraryDays.map((day, index) => (
              <motion.div
                key={day.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Day Header */}
                <div className="bg-gradient-to-r from-[#B8860B] to-[#DAA520] text-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{day.day_label}</h3>
                      <p className="text-sm opacity-90">{formatDate(day.start_date)} • {day.city}</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-full p-2">
                      <span className="text-lg font-bold">Day {index + 1}</span>
                    </div>
                  </div>
                </div>

                {/* Day Content */}
                <div className="p-6">
                  <p className="text-gray-700 mb-6 leading-relaxed">{day.description}</p>

                  {/* Activities */}
                  {day.activities.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Today's Activities</h4>
                      <div className="space-y-3">
                        {day.activities.map((activity) => (
                          <div key={activity.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                            <div className="text-[#B8860B] mr-3 mt-1">
                              {getActivityIcon(activity.activity_type)}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{activity.name}</h5>
                              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                              {activity.custom_type && (
                                <span className="inline-block mt-2 px-2 py-1 bg-[#B8860B] bg-opacity-10 text-[#8B4513] text-xs rounded">
                                  {activity.custom_type}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {day.images.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Gallery</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {day.images.map((image) => (
                          <div key={image.id} className="relative overflow-hidden rounded-lg">
                            <img
                              src={image.image_url}
                              alt={image.alt_text || 'Itinerary image'}
                              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-semibold text-[#8B4513] mb-2">Questions About Your Itinerary?</h3>
          <p className="text-gray-600 mb-4">Our travel specialists are here to help customize your perfect adventure.</p>
          <div className="flex justify-center items-center text-[#B8860B]">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="font-medium">chris@meridianluxury.travel</span>
          </div>
        </div>
      </div>
    </div>
  );
}