'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ItineraryDay, ItineraryActivity, ItineraryImage } from '@/types/database';

interface ItineraryBuilderProps {
  quoteId: string;
  onSave?: () => void;
}

interface DayData extends Omit<ItineraryDay, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
  activities: ActivityData[];
  images: ImageData[];
}

interface ActivityData extends Omit<ItineraryActivity, 'id' | 'day_id' | 'created_at' | 'updated_at'> {
  id?: string;
}

interface ImageData extends Omit<ItineraryImage, 'id' | 'day_id' | 'created_at' | 'updated_at'> {
  id?: string;
  file?: File; // For new uploads
}

const ACTIVITY_TYPES = [
  { value: 'flight', label: 'Flight', icon: '✈️', color: 'bg-[#8B4513]' },
  { value: 'tour', label: 'Tour', icon: '🗺️', color: 'bg-[#B8860B]' },
  { value: 'excursion', label: 'Excursion', icon: '🏔️', color: 'bg-[#DAA520]' },
  { value: 'activity', label: 'Activity', icon: '🎯', color: 'bg-[#8B4513]' },
  { value: 'custom', label: 'Custom', icon: '✨', color: 'bg-[#B8860B]' }
] as const;

export default function ItineraryBuilder({ quoteId, onSave }: ItineraryBuilderProps) {
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadItinerary();
  }, [quoteId]);

  const loadItinerary = async () => {
    try {
      setLoading(true);
      
      // Get admin email from session
      const session = localStorage.getItem('admin_session');
      const adminEmail = session ? JSON.parse(session).email : '';
      
      // Load existing itinerary data via API
      const response = await fetch(`/api/admin/itinerary?quote_id=${quoteId}&admin_email=${encodeURIComponent(adminEmail)}`);
      
      if (!response.ok) {
        console.error('Error loading itinerary:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      const daysData = data.itinerary || [];

      console.log('ItineraryBuilder: Loaded itinerary data:', daysData);

      // Transform data for component state
      const transformedDays: DayData[] = daysData.map((day: any) => ({
        ...day,
        activities: (day.itinerary_activities || [])
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((activity: any) => ({
            activity_type: activity.activity_type,
            custom_type: activity.custom_type,
            name: activity.name,
            description: activity.description,
            display_order: activity.display_order,
            id: activity.id
          })),
        images: (day.itinerary_images || [])
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((image: any) => ({
            image_url: image.image_url,
            alt_text: image.alt_text,
            display_order: image.display_order,
            id: image.id
          }))
      }));

      setDays(transformedDays);
      console.log('ItineraryBuilder: Set days state:', transformedDays);
    } catch (error) {
      console.error('Error loading itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDay = () => {
    const newDay: DayData = {
      quote_id: quoteId,
      day_label: `Day ${days.length + 1}`,
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      city: '',
      description: '',
      display_order: days.length,
      activities: [],
      images: []
    };
    setDays([...days, newDay]);
    setExpandedDays(prev => new Set([...prev, days.length]));
  };

  const updateDay = (dayIndex: number, updates: Partial<DayData>) => {
    setDays(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, ...updates } : day
    ));
  };

  const removeDay = (dayIndex: number) => {
    setDays(prev => prev.filter((_, index) => index !== dayIndex));
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      newSet.delete(dayIndex);
      return newSet;
    });
  };

  const addActivity = (dayIndex: number) => {
    const newActivity: ActivityData = {
      activity_type: 'activity',
      custom_type: null,
      name: '',
      description: '',
      display_order: days[dayIndex].activities.length
    };
    
    updateDay(dayIndex, {
      activities: [...days[dayIndex].activities, newActivity]
    });
  };

  const updateActivity = (dayIndex: number, activityIndex: number, updates: Partial<ActivityData>) => {
    const updatedActivities = days[dayIndex].activities.map((activity, index) =>
      index === activityIndex ? { ...activity, ...updates } : activity
    );
    updateDay(dayIndex, { activities: updatedActivities });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const updatedActivities = days[dayIndex].activities.filter((_, index) => index !== activityIndex);
    updateDay(dayIndex, { activities: updatedActivities });
  };

  const addImages = (dayIndex: number, files: FileList) => {
    const newImages: ImageData[] = Array.from(files).map((file, index) => ({
      image_url: '', // Will be set after upload
      alt_text: file.name,
      display_order: days[dayIndex].images.length + index,
      file
    }));
    
    updateDay(dayIndex, {
      images: [...days[dayIndex].images, ...newImages]
    });
  };

  const removeImage = (dayIndex: number, imageIndex: number) => {
    const updatedImages = days[dayIndex].images.filter((_, index) => index !== imageIndex);
    updateDay(dayIndex, { images: updatedImages });
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Get admin email from session
      const session = localStorage.getItem('admin_session');
      const adminEmail = session ? JSON.parse(session).email : '';
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('adminEmail', adminEmail);
      formData.append('quoteId', quoteId);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response error:', errorText);
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const saveItinerary = async () => {
    try {
      setSaving(true);
      
      // Get admin email from session
      const session = localStorage.getItem('admin_session');
      const adminEmail = session ? JSON.parse(session).email : '';

      for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
        const day = days[dayIndex];
        
        // Upload new images first
        const uploadedImages = await Promise.all(
          day.images.map(async (image) => {
            if (image.file) {
              const imageUrl = await uploadImage(image.file);
              return { ...image, image_url: imageUrl, file: undefined };
            }
            return image;
          })
        );
        
        // Save day data
        const response = await fetch('/api/admin/itinerary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adminEmail,
            day: {
              ...day,
              display_order: dayIndex,
              images: uploadedImages
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save day');
        }
      }

      alert('Itinerary saved successfully!');
      loadItinerary(); // Reload to get fresh data with IDs
      onSave?.();
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert('Failed to save itinerary. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDayExpansion = (dayIndex: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayIndex)) {
        newSet.delete(dayIndex);
      } else {
        newSet.add(dayIndex);
      }
      return newSet;
    });
  };

  const getActivityTypeConfig = (type: string) => {
    return ACTIVITY_TYPES.find(t => t.value === type) || ACTIVITY_TYPES[3]; // Default to 'activity'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
        <span className="ml-2 text-gray-800">Loading itinerary...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#8B4513]">Itinerary Builder</h3>
        <div className="flex space-x-3">
          <button
            onClick={addDay}
            className="px-4 py-2 bg-[#B8860B] hover:bg-[#DAA520] text-white rounded-md text-sm font-medium transition-colors"
          >
            + Add Day
          </button>
          <button
            onClick={saveItinerary}
            disabled={saving}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Itinerary'}
          </button>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-800 mb-4">No itinerary created yet</p>
          <button
            onClick={addDay}
            className="px-6 py-3 bg-[#B8860B] hover:bg-[#DAA520] text-white rounded-md font-medium transition-colors"
          >
            Create First Day
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {days.map((day, dayIndex) => {
              const isExpanded = expandedDays.has(dayIndex);
              
              return (
                <motion.div
                  key={dayIndex}
                  className="bg-white rounded-lg shadow-sm border border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Day Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleDayExpansion(dayIndex)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-[#B8860B] rounded-full"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{day.day_label}</h4>
                        <p className="text-sm text-gray-800">{day.city}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDay(dayIndex);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                      <svg 
                        className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Day Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200"
                      >
                        <div className="p-6 space-y-6">
                          {/* Basic Day Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Day Label *
                              </label>
                              <input
                                type="text"
                                value={day.day_label}
                                onChange={(e) => updateDay(dayIndex, { day_label: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                                placeholder="e.g., Days 1 & 2, Day 3, Days 5-7"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Start Date *
                              </label>
                              <input
                                type="date"
                                value={day.start_date}
                                onChange={(e) => updateDay(dayIndex, { start_date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                End Date (for ranges)
                              </label>
                              <input
                                type="date"
                                value={day.end_date || ''}
                                onChange={(e) => updateDay(dayIndex, { end_date: e.target.value || null })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                              />
                            </div>

                            <div className="md:col-span-2 lg:col-span-1">
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                City *
                              </label>
                              <input
                                type="text"
                                value={day.city}
                                onChange={(e) => updateDay(dayIndex, { city: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                                placeholder="e.g., Lima, La Paz"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Description *
                            </label>
                            <textarea
                              value={day.description}
                              onChange={(e) => updateDay(dayIndex, { description: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                              placeholder="Describe what the customer will be doing on this day..."
                            />
                          </div>

                          {/* Activities Section */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="font-medium text-gray-900">Activities</h5>
                              <button
                                onClick={() => addActivity(dayIndex)}
                                className="px-3 py-1 bg-[#B8860B] hover:bg-[#DAA520] text-white rounded text-sm transition-colors"
                              >
                                + Add Activity
                              </button>
                            </div>

                            <div className="space-y-3">
                              {day.activities.map((activity, activityIndex) => {
                                const typeConfig = getActivityTypeConfig(activity.activity_type);
                                
                                return (
                                  <div key={activityIndex} className="border border-gray-200 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-1">
                                          Activity Type
                                        </label>
                                        <select
                                          value={activity.activity_type}
                                          onChange={(e) => updateActivity(dayIndex, activityIndex, { 
                                            activity_type: e.target.value as any,
                                            custom_type: e.target.value === 'custom' ? '' : null
                                          })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                                        >
                                          {ACTIVITY_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>
                                              {type.icon} {type.label}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {activity.activity_type === 'custom' && (
                                        <div>
                                          <label className="block text-sm font-medium text-gray-900 mb-1">
                                            Custom Type Name
                                          </label>
                                          <input
                                            type="text"
                                            value={activity.custom_type || ''}
                                            onChange={(e) => updateActivity(dayIndex, activityIndex, { custom_type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                                            placeholder="e.g., Transfer, Accommodation"
                                          />
                                        </div>
                                      )}

                                      <div className={activity.activity_type === 'custom' ? '' : 'md:col-span-2'}>
                                        <label className="block text-sm font-medium text-gray-900 mb-1">
                                          Activity Name
                                        </label>
                                        <input
                                          type="text"
                                          value={activity.name}
                                          onChange={(e) => updateActivity(dayIndex, activityIndex, { name: e.target.value })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                                          placeholder="e.g., International Flight, City Tour"
                                        />
                                      </div>
                                    </div>

                                    <div className="mb-3">
                                      <label className="block text-sm font-medium text-gray-900 mb-1">
                                        Description
                                      </label>
                                      <textarea
                                        value={activity.description}
                                        onChange={(e) => updateActivity(dayIndex, activityIndex, { description: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                                        placeholder="Describe this activity..."
                                      />
                                    </div>

                                    <div className="flex justify-between items-center">
                                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${typeConfig.color}`}>
                                        <span className="mr-1">{typeConfig.icon}</span>
                                        {activity.activity_type === 'custom' && activity.custom_type 
                                          ? activity.custom_type 
                                          : typeConfig.label}
                                      </div>
                                      <button
                                        onClick={() => removeActivity(dayIndex, activityIndex)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                      >
                                        Remove Activity
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Images Section */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="font-medium text-gray-900">Images</h5>
                              <label className="px-3 py-1 bg-[#B8860B] hover:bg-[#DAA520] text-white rounded text-sm cursor-pointer transition-colors">
                                + Add Images
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => e.target.files && addImages(dayIndex, e.target.files)}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {day.images.map((image, imageIndex) => (
                                <div key={imageIndex} className="relative group">
                                  <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                                    {image.file ? (
                                      <img 
                                        src={URL.createObjectURL(image.file)}
                                        alt={image.alt_text || ''}
                                        className="w-full h-32 object-cover"
                                      />
                                    ) : (
                                      <img 
                                        src={image.image_url}
                                        alt={image.alt_text || ''}
                                        className="w-full h-32 object-cover"
                                      />
                                    )}
                                    <button
                                      onClick={() => removeImage(dayIndex, imageIndex)}
                                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}