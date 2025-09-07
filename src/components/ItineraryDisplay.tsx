'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ItineraryDay, ItineraryActivity, ItineraryImage } from '@/types/database';

interface ItineraryDisplayProps {
  quoteId: string;
  title?: string;
  className?: string;
}

interface DayWithDetails {
  id: string;
  quote_id: string;
  day_label: string;
  start_date: string;
  end_date?: string | null;
  city: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  activities: ItineraryActivity[];
  images: ItineraryImage[];
}

const ACTIVITY_TYPE_CONFIGS = {
  flight: { 
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    ), 
    label: 'Flight', 
    color: 'bg-[#8B4513]' 
  },
  tour: { 
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ), 
    label: 'Tour', 
    color: 'bg-[#B8860B]' 
  },
  excursion: { 
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>
      </svg>
    ), 
    label: 'Excursion', 
    color: 'bg-[#DAA520]' 
  },
  activity: { 
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ), 
    label: 'Activity', 
    color: 'bg-[#8B4513]' 
  },
  custom: { 
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ), 
    label: 'Custom', 
    color: 'bg-[#B8860B]' 
  }
} as const;

export default function ItineraryDisplay({ quoteId, title, className = '' }: ItineraryDisplayProps) {
  const [days, setDays] = useState<DayWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadItinerary();
  }, [quoteId]);

  const loadItinerary = async () => {
    try {
      setLoading(true);
      
      const { data: itineraryData, error } = await supabase
        .from('itinerary_days')
        .select(`
          *,
          itinerary_activities(*),
          itinerary_images(*)
        `)
        .eq('quote_id', quoteId)
        .order('display_order');

      if (error) {
        console.error('Error loading itinerary:', error);
        return;
      }

      // Transform data with proper sorting
      const transformedDays: DayWithDetails[] = (itineraryData || []).map(day => ({
        ...day,
        activities: (day.itinerary_activities || [])
          .sort((a, b) => a.display_order - b.display_order),
        images: (day.itinerary_images || [])
          .sort((a, b) => a.display_order - b.display_order)
      }));

      setDays(transformedDays);
      
      // Auto-expand first day
      if (transformedDays.length > 0) {
        setExpandedDays(new Set([transformedDays[0].id]));
      }
    } catch (error) {
      console.error('Error loading itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDayExpansion = (dayId: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayId)) {
        newSet.delete(dayId);
      } else {
        newSet.add(dayId);
      }
      return newSet;
    });
  };

  const getActivityConfig = (activity: ItineraryActivity) => {
    const baseConfig = ACTIVITY_TYPE_CONFIGS[activity.activity_type] || ACTIVITY_TYPE_CONFIGS.activity;
    
    if (activity.activity_type === 'custom' && activity.custom_type) {
      return {
        ...baseConfig,
        label: activity.custom_type
      };
    }
    
    return baseConfig;
  };

  const formatDateRange = (day: DayWithDetails) => {
    const startDate = new Date(day.start_date);
    
    if (day.end_date) {
      const endDate = new Date(day.end_date);
      if (startDate.getTime() === endDate.getTime()) {
        return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    
    return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
        <span className="ml-3 text-gray-600">Loading itinerary...</span>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">No itinerary available yet</p>
        <p className="text-gray-400 text-sm mt-2">Your detailed itinerary will appear here once created</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-[#8B4513] mb-2 uppercase tracking-wider">{title}</h2>
          <div className="w-16 h-0.5 bg-[#DAA520] mx-auto"></div>
        </div>
      )}

      <div className="space-y-6">
        {days.map((day, index) => {
          const isExpanded = expandedDays.has(day.id);
          const isLast = index === days.length - 1;
          
          return (
            <motion.div
              key={day.id}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Timeline Line */}
              {!isLast && (
                <div className="absolute left-3 top-16 w-px h-full bg-gray-300 -z-10"></div>
              )}
              
              {/* Day Header */}
              <div 
                className="flex items-start space-x-4 cursor-pointer group"
                onClick={() => toggleDayExpansion(day.id)}
              >
                {/* Timeline Dot - Made more like Bolivia style */}
                <div className="flex-shrink-0 w-6 h-6 bg-[#DAA520] rounded-full mt-3 relative z-10 border-2 border-white shadow-sm">
                </div>
                
                {/* Day Info */}
                <div className="flex-1">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group-hover:shadow-md transition-all duration-200">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-[#8B4513] mb-1">
                            {day.day_label}
                          </h3>
                          <p className="text-[#DAA520] font-medium text-lg">{day.city}</p>
                          <p className="text-sm text-gray-600 mt-1">{formatDateRange(day)}</p>
                        </div>
                        <svg 
                          className={`w-5 h-5 text-[#DAA520] transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {day.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content - More like Bolivia style */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-10 mt-6"
                  >
                    {/* Activities - Full width cards like Bolivia */}
                    {day.activities.length > 0 && (
                      <div className="space-y-3 mb-6">
                        {day.activities.map((activity, actIndex) => {
                          const config = getActivityConfig(activity);
                          
                          return (
                            <motion.div
                              key={actIndex}
                              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: actIndex * 0.1 }}
                            >
                              <div className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                                      {config.icon}
                                    </div>
                                    <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                                  </div>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
                                    {config.label}
                                  </span>
                                </div>
                                {activity.description && (
                                  <p className="text-gray-600 text-sm mt-3 ml-11 leading-relaxed">
                                    {activity.description}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {/* Images - Two per row like Bolivia */}
                    {day.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {day.images.map((image, imgIndex) => (
                          <motion.div
                            key={imgIndex}
                            className="rounded-lg overflow-hidden shadow-md border border-gray-200"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: imgIndex * 0.1 }}
                          >
                            <img 
                              src={image.image_url}
                              alt={image.alt_text || `${day.city} - Image ${imgIndex + 1}`}
                              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}