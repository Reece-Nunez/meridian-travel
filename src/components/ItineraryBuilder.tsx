'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ItineraryDay, ItineraryActivity, ItineraryImage, Ship, CabinCategory } from '@/types/database';
import ImageUpload from '@/components/admin/ImageUpload';

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface ItineraryBuilderProps {
  quoteId: string;
  onSave?: () => void;
}

interface DayData {
  id?: string;
  quote_id: string;
  day_label: string;
  start_date: string;
  end_date?: string | null;
  city: string;
  description: string;
  accommodation?: string | null;
  display_order: number;
  activities: ActivityData[];
  images: string[]; // Current saved image URLs
  pendingImages?: PendingImage[]; // New images to upload
  imagesToDelete?: string[]; // Images marked for deletion
}

interface ActivityData extends Omit<ItineraryActivity, 'id' | 'day_id' | 'created_at' | 'updated_at'> {
  id?: string;
  ship_id?: string;
  cabin_category_id?: string;
  embark_port?: string;
  disembark_port?: string;
}

const ACTIVITY_TYPES = [
  { 
    value: 'flight', 
    label: 'Flight', 
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    ),
    color: 'bg-[#8B4513]' 
  },
  { 
    value: 'tour', 
    label: 'Tour', 
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
    color: 'bg-[#B8860B]' 
  },
  { 
    value: 'excursion', 
    label: 'Excursion', 
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>
      </svg>
    ),
    color: 'bg-[#DAA520]' 
  },
  { 
    value: 'activity', 
    label: 'Activity', 
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    color: 'bg-[#8B4513]' 
  },
  {
    value: 'cruise',
    label: 'Cruise',
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z"/>
      </svg>
    ),
    color: 'bg-blue-600'
  },
  {
    value: 'custom',
    label: 'Custom',
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    color: 'bg-[#B8860B]'
  }
] as const;

export default function ItineraryBuilder({ quoteId, onSave }: ItineraryBuilderProps) {
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [ships, setShips] = useState<Ship[]>([]);
  const [cabinCategoriesByShip, setCabinCategoriesByShip] = useState<{ [shipId: string]: CabinCategory[] }>({});

  useEffect(() => {
    loadItinerary();
    loadShips();
  }, [quoteId]);

  const loadShips = async () => {
    try {
      const { data: shipsData, error } = await supabase
        .from('ships')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setShips(shipsData || []);
    } catch (error) {
      console.error('Error loading ships:', error);
    }
  };

  const loadCabinCategories = async (shipId: string) => {
    if (cabinCategoriesByShip[shipId]) return; // Already loaded

    try {
      const { data: cabinsData, error } = await supabase
        .from('cabin_categories')
        .select('*')
        .eq('ship_id', shipId)
        .order('pricing_per_person', { ascending: true, nullsFirst: false });

      if (error) throw error;

      setCabinCategoriesByShip(prev => ({
        ...prev,
        [shipId]: cabinsData || []
      }));
    } catch (error) {
      console.error('Error loading cabin categories:', error);
    }
  };

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
          .map((activity: any) => {
            // Parse cruise-specific fields from description if stored as JSON
            let cruiseData = {};
            if (activity.activity_type === 'cruise' && activity.description) {
              try {
                const parsed = JSON.parse(activity.description);
                if (parsed.ship_id) cruiseData = parsed;
              } catch (e) {
                // Not JSON, regular description
              }
            }

            return {
              activity_type: activity.activity_type,
              custom_type: activity.custom_type,
              name: activity.name,
              description: typeof cruiseData === 'object' && Object.keys(cruiseData).length > 0 ? '' : activity.description,
              display_order: activity.display_order,
              id: activity.id,
              ...cruiseData
            };
          }),
        images: (day.itinerary_images || [])
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((image: any) => image.image_url),
        pendingImages: [],
        imagesToDelete: []
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
      accommodation: '',
      display_order: days.length,
      activities: [],
      images: [],
      pendingImages: [],
      imagesToDelete: []
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

  // Handle day image changes (deferred upload)
  const handleDayImagesChange = (dayIndex: number, images: string[], pendingImages: PendingImage[], imagesToDelete: string[]) => {
    updateDay(dayIndex, { images, pendingImages, imagesToDelete });
  };

  // Upload a single image file to Supabase storage
  const uploadImageFile = async (file: File): Promise<string> => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('itinerary-images')
      .upload(filePath, file);

    if (error) {
      console.error(`Error uploading ${file.name}:`, error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('itinerary-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  // Delete a single image from Supabase storage
  const deleteImageFromStorage = async (imageUrl: string) => {
    try {
      // Extract the file path from the public URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      console.log(`Deleting ${fileName} from itinerary-images`);
      
      const { error } = await supabase.storage
        .from('itinerary-images')
        .remove([fileName]);

      if (error) {
        console.error(`Error deleting ${fileName}:`, error);
        throw error;
      }

      console.log(`Successfully deleted ${fileName}`);
    } catch (error) {
      console.error('Failed to delete image:', error);
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
        
        // Delete marked images first
        if (day.imagesToDelete && day.imagesToDelete.length > 0) {
          for (const imageUrl of day.imagesToDelete) {
            try {
              await deleteImageFromStorage(imageUrl);
            } catch (error) {
              console.error(`Failed to delete image:`, error);
              // Continue with other operations even if deletion fails
            }
          }
        }
        
        // Upload new images
        const uploadedImageUrls: string[] = [];
        if (day.pendingImages && day.pendingImages.length > 0) {
          for (const pendingImage of day.pendingImages) {
            try {
              const uploadedUrl = await uploadImageFile(pendingImage.file);
              uploadedImageUrls.push(uploadedUrl);
              // Clean up the preview URL
              URL.revokeObjectURL(pendingImage.previewUrl);
            } catch (error) {
              console.error('Failed to upload image:', error);
              throw error;
            }
          }
        }
        
        // Combine existing images with newly uploaded images
        const allImages = [...day.images, ...uploadedImageUrls];
        
        // Create image objects for the API
        const imageObjects = allImages.map((imageUrl, index) => ({
          image_url: imageUrl,
          alt_text: `Image ${index + 1}`,
          display_order: index
        }));
        
        // Process activities - serialize cruise data into description
        const processedActivities = day.activities.map(activity => {
          if (activity.activity_type === 'cruise') {
            // Store cruise-specific data as JSON in description
            const cruiseData = {
              ship_id: activity.ship_id,
              cabin_category_id: activity.cabin_category_id,
              embark_port: activity.embark_port,
              disembark_port: activity.disembark_port,
              description: activity.description
            };
            return {
              ...activity,
              description: JSON.stringify(cruiseData)
            };
          }
          return activity;
        });

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
              activities: processedActivities,
              display_order: dayIndex,
              images: imageObjects
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
                              Accommodation
                            </label>
                            <input
                              type="text"
                              value={day.accommodation || ''}
                              onChange={(e) => updateDay(dayIndex, { accommodation: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                              placeholder="e.g., Hotel Casa Andina Premium, Luxury Resort"
                            />
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
                                              {type.label}
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

                                      <div className={activity.activity_type === 'custom' || activity.activity_type === 'cruise' ? '' : 'md:col-span-2'}>
                                        <label className="block text-sm font-medium text-gray-900 mb-1">
                                          Activity Name
                                        </label>
                                        <input
                                          type="text"
                                          value={activity.name}
                                          onChange={(e) => updateActivity(dayIndex, activityIndex, { name: e.target.value })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                                          placeholder={activity.activity_type === 'cruise' ? "e.g., Galapagos Cruise" : "e.g., International Flight, City Tour"}
                                        />
                                      </div>
                                    </div>

                                    {/* Cruise-specific fields */}
                                    {activity.activity_type === 'cruise' && (
                                      <div className="mb-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h6 className="text-sm font-semibold text-blue-900 mb-3">Cruise Details</h6>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                              Select Ship *
                                            </label>
                                            <select
                                              value={activity.ship_id || ''}
                                              onChange={(e) => {
                                                updateActivity(dayIndex, activityIndex, { ship_id: e.target.value, cabin_category_id: '' });
                                                if (e.target.value) loadCabinCategories(e.target.value);
                                              }}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                            >
                                              <option value="">Choose a ship...</option>
                                              {ships.map(ship => (
                                                <option key={ship.id} value={ship.id}>
                                                  {ship.name} ({ship.capacity} guests)
                                                </option>
                                              ))}
                                            </select>
                                          </div>

                                          {activity.ship_id && cabinCategoriesByShip[activity.ship_id] && (
                                            <div>
                                              <label className="block text-sm font-medium text-gray-900 mb-1">
                                                Cabin Category
                                              </label>
                                              <select
                                                value={activity.cabin_category_id || ''}
                                                onChange={(e) => updateActivity(dayIndex, activityIndex, { cabin_category_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                              >
                                                <option value="">Choose a cabin...</option>
                                                {cabinCategoriesByShip[activity.ship_id].map(cabin => (
                                                  <option key={cabin.id} value={cabin.id}>
                                                    {cabin.name} {cabin.pricing_per_person ? `- $${cabin.pricing_per_person.toLocaleString()}/person` : ''}
                                                  </option>
                                                ))}
                                              </select>
                                            </div>
                                          )}

                                          <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                              Embarkation Port
                                            </label>
                                            <input
                                              type="text"
                                              value={activity.embark_port || ''}
                                              onChange={(e) => updateActivity(dayIndex, activityIndex, { embark_port: e.target.value })}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                              placeholder="e.g., Puerto Ayora"
                                            />
                                          </div>

                                          <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                              Disembarkation Port
                                            </label>
                                            <input
                                              type="text"
                                              value={activity.disembark_port || ''}
                                              onChange={(e) => updateActivity(dayIndex, activityIndex, { disembark_port: e.target.value })}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                              placeholder="e.g., Baltra Airport"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <div className="mb-3">
                                      <label className="block text-sm font-medium text-gray-900 mb-1">
                                        {activity.activity_type === 'cruise' ? 'Additional Notes' : 'Description'}
                                      </label>
                                      <textarea
                                        value={activity.description}
                                        onChange={(e) => updateActivity(dayIndex, activityIndex, { description: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                                        placeholder={activity.activity_type === 'cruise' ? "Any additional details about the cruise..." : "Describe this activity..."}
                                      />
                                    </div>

                                    <div className="flex justify-between items-start">
                                      <div className="flex flex-col gap-2">
                                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${typeConfig.color}`}>
                                          <span className="mr-1">{typeConfig.icon}</span>
                                          {activity.activity_type === 'custom' && activity.custom_type
                                            ? activity.custom_type
                                            : typeConfig.label}
                                        </div>
                                        {activity.activity_type === 'cruise' && activity.ship_id && (
                                          <div className="text-xs text-gray-600 space-y-1">
                                            <div>
                                              <strong>Ship:</strong> {ships.find(s => s.id === activity.ship_id)?.name || 'Unknown'}
                                            </div>
                                            {activity.cabin_category_id && cabinCategoriesByShip[activity.ship_id] && (
                                              <div>
                                                <strong>Cabin:</strong> {cabinCategoriesByShip[activity.ship_id].find(c => c.id === activity.cabin_category_id)?.name || 'Unknown'}
                                              </div>
                                            )}
                                            {(activity.embark_port || activity.disembark_port) && (
                                              <div>
                                                {activity.embark_port && <span><strong>From:</strong> {activity.embark_port}</span>}
                                                {activity.embark_port && activity.disembark_port && <span> → </span>}
                                                {activity.disembark_port && <span><strong>To:</strong> {activity.disembark_port}</span>}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => removeActivity(dayIndex, activityIndex)}
                                        className="text-red-600 hover:text-red-800 text-sm flex-shrink-0"
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
                            <h5 className="font-medium text-gray-900 mb-4">Day Images</h5>
                            <ImageUpload
                              currentImages={day.images || []}
                              pendingImages={day.pendingImages || []}
                              imagesToDelete={day.imagesToDelete || []}
                              maxImages={5}
                              onImagesChange={(images, pendingImages, imagesToDelete) => handleDayImagesChange(dayIndex, images, pendingImages, imagesToDelete)}
                              bucketName="itinerary-images"
                            />
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