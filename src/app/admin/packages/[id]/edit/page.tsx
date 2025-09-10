'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { TripPackage } from '@/types/database';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import ImageUpload from '@/components/admin/ImageUpload';

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface PackageActivity {
  name: string;
  description: string;
}

interface PackageItineraryDay {
  day: number;
  title: string;
  activities: PackageActivity[];
  accommodation?: string | null;
  images?: string[];
  pendingImages?: PendingImage[];
  imagesToDelete?: string[];
}

export default function EditPackage() {
  const { loading: authLoading, isAuthenticated } = useSimpleAdminAuth();
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    duration: 7,
    max_participants: 12,
    is_active: true,
    includes: [''],
    excludes: [''],
    luxury_highlights: [''],
    images: [] as string[]
  });
  const [pendingPackageImages, setPendingPackageImages] = useState<PendingImage[]>([]);
  const [packageImagesToDelete, setPackageImagesToDelete] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<PackageItineraryDay[]>([
    { day: 1, title: '', activities: [{ name: '', description: '' }], accommodation: '', images: [], pendingImages: [], imagesToDelete: [] }
  ]);

  useEffect(() => {
    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  // Fallback to ensure data loading doesn't hang
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Package loading timeout');
        setLoading(false);
        setError('Loading timeout - please refresh the page');
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  const fetchPackage = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trip_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (error) throw error;

      if (data) {
        
        setFormData({
          title: data.title || '',
          description: data.description || '',
          destination: data.destination || '',
          duration: data.duration || 7,
          max_participants: data.max_participants || 12,
          is_active: data.is_active ?? true,
          includes: data.includes && data.includes.length > 0 ? data.includes : [''],
          excludes: data.excludes && data.excludes.length > 0 ? data.excludes : [''],
          luxury_highlights: data.luxury_highlights && data.luxury_highlights.length > 0 ? data.luxury_highlights : [''],
          images: data.images || []
        });

        if (data.itinerary && data.itinerary.length > 0) {
          const processedItinerary = data.itinerary.map((day: any, dayIndex: number) => {
            const processedActivities = day.activities && day.activities.length > 0 
              ? day.activities.map((activity: any, actIndex: number) => {
                  // Fix corrupted activity data - if it has numeric keys, it's corrupted
                  if (activity && typeof activity === 'object' && activity.hasOwnProperty('0')) {
                    console.log(`🔧 Fixed corrupted activity data for day ${dayIndex + 1}, activity ${actIndex + 1}`);
                    return {
                      name: activity.name || '',
                      description: activity.description || ''
                    };
                  }
                  
                  const processed = typeof activity === 'string' 
                    ? { name: activity, description: '' }
                    : (activity && typeof activity === 'object') 
                      ? { name: activity.name || '', description: activity.description || '' }
                      : { name: '', description: '' };
                  
                  return processed;
                })
              : [{ name: '', description: '' }];
            
            return {
              day: day.day,
              title: day.title,
              accommodation: day.accommodation,
              activities: processedActivities,
              images: day.images || [],
              pendingImages: [],
              imagesToDelete: []
            };
          });
          
          setItinerary(processedItinerary);
        }
      }
    } catch (err) {
      console.error('Error fetching package:', err);
      setError('Failed to load package');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleArrayChange = (field: 'includes' | 'excludes' | 'luxury_highlights', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'includes' | 'excludes' | 'luxury_highlights') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'includes' | 'excludes' | 'luxury_highlights', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleItineraryChange = (dayIndex: number, field: keyof PackageItineraryDay, value: string | string[]) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex ? { ...day, [field]: value } : day
    ));
  };

  const handleActivityChange = (dayIndex: number, activityIndex: number, field: 'name' | 'description', value: string) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex 
        ? { ...day, activities: day.activities.map((activity, j) => j === activityIndex ? { ...activity, [field]: value } : activity) }
        : day
    ));
  };

  const addItineraryDay = () => {
    setItinerary(prev => [...prev, {
      day: prev.length + 1,
      title: '',
      activities: [{ name: '', description: '' }],
      accommodation: '',
      images: [],
      pendingImages: [],
      imagesToDelete: []
    }]);
  };

  const addActivity = (dayIndex: number) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex ? { ...day, activities: [...day.activities, { name: '', description: '' }] } : day
    ));
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex 
        ? { ...day, activities: day.activities.filter((_, j) => j !== activityIndex) }
        : day
    ));
  };

  // Handle package image changes (deferred upload)
  const handlePackageImagesChange = (images: string[], pendingImages: PendingImage[], imagesToDelete: string[]) => {
    setFormData(prev => ({ ...prev, images }));
    setPendingPackageImages(pendingImages);
    setPackageImagesToDelete(imagesToDelete);
  };

  // Handle day image changes (deferred upload)
  const handleDayImagesChange = (dayIndex: number, images: string[], pendingImages: PendingImage[], imagesToDelete: string[]) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex 
        ? { ...day, images, pendingImages, imagesToDelete }
        : day
    ));
  };

  // Upload a single image file to Supabase storage
  const uploadImageFile = async (file: File, bucketName: string): Promise<string> => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) {
      console.error(`Error uploading ${file.name}:`, error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  // Delete a single image from Supabase storage
  const deleteImageFromStorage = async (imageUrl: string, bucketName: string) => {
    try {
      // Extract the file path from the public URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      console.log(`Deleting ${fileName} from ${bucketName}`);
      
      const { error } = await supabase.storage
        .from(bucketName)
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

  // Delete all images marked for deletion
  const deleteAllMarkedImages = async () => {
    // Delete package images
    for (const imageUrl of packageImagesToDelete) {
      try {
        await deleteImageFromStorage(imageUrl, 'package-images');
      } catch (error) {
        console.error('Failed to delete package image:', error);
        // Continue with other deletions even if one fails
      }
    }

    // Delete itinerary day images
    for (let dayIndex = 0; dayIndex < itinerary.length; dayIndex++) {
      const day = itinerary[dayIndex];
      if (day.imagesToDelete && day.imagesToDelete.length > 0) {
        for (const imageUrl of day.imagesToDelete) {
          try {
            await deleteImageFromStorage(imageUrl, 'itinerary-images');
          } catch (error) {
            console.error(`Failed to delete day ${dayIndex + 1} image:`, error);
            // Continue with other deletions even if one fails
          }
        }
      }
    }
  };

  // Upload all pending images and return updated image arrays
  const uploadAllPendingImages = async () => {
    const uploadedPackageImages: string[] = [];
    const updatedItinerary = [...itinerary];

    // Upload package images
    for (const pendingImage of pendingPackageImages) {
      try {
        const uploadedUrl = await uploadImageFile(pendingImage.file, 'package-images');
        uploadedPackageImages.push(uploadedUrl);
        // Clean up the preview URL
        URL.revokeObjectURL(pendingImage.previewUrl);
      } catch (error) {
        console.error('Failed to upload package image:', error);
        throw error;
      }
    }

    // Upload itinerary day images
    for (let dayIndex = 0; dayIndex < updatedItinerary.length; dayIndex++) {
      const day = updatedItinerary[dayIndex];
      const uploadedDayImages: string[] = [];
      
      if (day.pendingImages && day.pendingImages.length > 0) {
        for (const pendingImage of day.pendingImages) {
          try {
            const uploadedUrl = await uploadImageFile(pendingImage.file, 'itinerary-images');
            uploadedDayImages.push(uploadedUrl);
            // Clean up the preview URL
            URL.revokeObjectURL(pendingImage.previewUrl);
          } catch (error) {
            console.error(`Failed to upload day ${dayIndex + 1} image:`, error);
            throw error;
          }
        }
      }

      // Update the day with new uploaded images and clear pending/delete arrays
      updatedItinerary[dayIndex] = {
        ...day,
        images: [...(day.images || []), ...uploadedDayImages],
        pendingImages: [],
        imagesToDelete: []
      };
    }

    return {
      packageImages: [...formData.images, ...uploadedPackageImages],
      updatedItinerary
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('Starting form submission...');
      
      // Delete marked images first
      await deleteAllMarkedImages();
      console.log('Marked images deleted successfully');
      
      // Upload all pending images
      const { packageImages, updatedItinerary } = await uploadAllPendingImages();
      
      // Prepare package data - be defensive about new fields
      const packageData: any = {
        title: formData.title,
        description: formData.description,
        destination: formData.destination,
        duration: formData.duration,
        max_participants: formData.max_participants,
        is_active: formData.is_active,
        includes: formData.includes.filter((item: string) => item.trim() !== ''),
        excludes: formData.excludes.filter((item: string) => item.trim() !== ''),
        images: packageImages,
        itinerary: updatedItinerary.map((day: any, dayIndex: number) => {
          // Ensure activities are clean objects without character indices
          const cleanActivities = day.activities
            .filter((activity: PackageActivity) => activity.name && activity.name.trim() !== '')
            .map((activity: PackageActivity) => ({
              name: String(activity.name || '').trim(),
              description: String(activity.description || '').trim()
            }));
          
          return {
            day: Number(day.day),
            title: String(day.title || ''),
            accommodation: day.accommodation ? String(day.accommodation) : null,
            activities: cleanActivities,
            // Only include images if they exist (for backward compatibility)
            ...(day.images && day.images.length > 0 && { images: day.images.map((img: string) => String(img)) })
          };
        }),
        updated_at: new Date().toISOString()
      };

      // Only add luxury_highlights if it exists and has content
      if (formData.luxury_highlights && formData.luxury_highlights.some((item: string) => item.trim() !== '')) {
        packageData.luxury_highlights = formData.luxury_highlights.filter((item: string) => item.trim() !== '');
      }

      // Split the update - do basic fields first, then itinerary separately
      
      // First update: Basic fields only (fast)
      const basicData = {
        title: packageData.title,
        description: packageData.description,
        destination: packageData.destination,
        duration: packageData.duration,
        max_participants: packageData.max_participants,
        is_active: packageData.is_active,
        includes: packageData.includes,
        excludes: packageData.excludes,
        images: packageData.images,
        luxury_highlights: packageData.luxury_highlights,
        updated_at: packageData.updated_at
      };
      
      // Add timeout back for basic fields
      const basicUpdatePromise = supabase
        .from('trip_packages')
        .update(basicData)
        .eq('id', packageId);

      const basicTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Basic update timed out after 15 seconds')), 15000)
      );

      const { data: basicUpdateData, error: basicError } = await Promise.race([
        basicUpdatePromise, 
        basicTimeoutPromise
      ]) as any;

      if (basicError) {
        console.error('Basic update error:', basicError);
        throw basicError;
      }

      // Now update the itinerary with a reasonable timeout
      
      const itineraryUpdatePromise = supabase
        .from('trip_packages')
        .update({ itinerary: packageData.itinerary })
        .eq('id', packageId);

      const itineraryTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Itinerary update timed out after 20 seconds')), 20000)
      );

      try {
        const { data: itineraryData, error: itineraryError } = await Promise.race([
          itineraryUpdatePromise, 
          itineraryTimeoutPromise
        ]) as any;

        if (itineraryError) {
          console.error('Itinerary update error:', itineraryError);
          // Don't throw - basic fields are already saved
          console.log('Itinerary update failed, but basic changes are saved');
        }
      } catch (timeoutError) {
        console.log('Itinerary update timed out, but basic changes are saved');
      }

      console.log('Save successful, redirecting...');
      
      // Clear pending images and deletion state since everything is now saved
      setPendingPackageImages([]);
      setPackageImagesToDelete([]);
      setItinerary(prev => prev.map(day => ({ ...day, pendingImages: [], imagesToDelete: [] })));
      
      router.push('/admin/packages');
    } catch (error) {
      console.error('Error updating package:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      alert(`Failed to update package: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    } finally {
      console.log('🏁 Setting saving to false');
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useSimpleAdminAuth hook
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading package...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/admin/packages"
            className="text-[#B8860B] hover:text-[#DAA520] font-medium"
          >
            Back to Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/admin/packages"
                className="text-gray-500 hover:text-[#8B4513] mr-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-[#8B4513]">Edit Package</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Package Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  placeholder="e.g., Classic Peru Adventure - 10 Days"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  placeholder="Describe what makes this package special..."
                />
              </div>

              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  Destination *
                </label>
                <select
                  id="destination"
                  name="destination"
                  required
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                >
                  <option value="">Select destination</option>
                  <option value="Peru">Peru</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Galapagos">Galapagos Islands</option>
                  <option value="Antarctica">Antarctica</option>
                </select>
              </div>


              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                />
              </div>


              <div>
                <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  id="max_participants"
                  name="max_participants"
                  min="1"
                  value={formData.max_participants}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#B8860B] focus:ring-[#B8860B] border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Package is active and bookable
                </label>
              </div>
            </div>
          </motion.div>

          {/* Package Images */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Package Images</h3>
            <ImageUpload
              currentImages={formData.images}
              pendingImages={pendingPackageImages}
              imagesToDelete={packageImagesToDelete}
              maxImages={10}
              onImagesChange={handlePackageImagesChange}
              bucketName="package-images"
            />
          </motion.div>

          {/* Package Details */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Package Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">Luxury Highlights</h4>
                {formData.luxury_highlights.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('luxury_highlights', index, e.target.value)}
                      placeholder="e.g., Private chef experiences"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    />
                    {formData.luxury_highlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('luxury_highlights', index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('luxury_highlights')}
                  className="text-[#B8860B] hover:text-[#DAA520] font-medium"
                >
                  + Add Highlight
                </button>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">What's Included</h4>
                {formData.includes.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('includes', index, e.target.value)}
                      placeholder="e.g., All accommodations"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    />
                    {formData.includes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('includes', index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('includes')}
                  className="text-[#B8860B] hover:text-[#DAA520] font-medium"
                >
                  + Add Item
                </button>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">What's Not Included</h4>
                {formData.excludes.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('excludes', index, e.target.value)}
                      placeholder="e.g., International flights"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    />
                    {formData.excludes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('excludes', index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('excludes')}
                  className="text-[#B8860B] hover:text-[#DAA520] font-medium"
                >
                  + Add Item
                </button>
              </div>
            </div>
          </motion.div>

          {/* Itinerary */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Itinerary</h3>
              <button
                type="button"
                onClick={addItineraryDay}
                className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Add Day
              </button>
            </div>

            <div className="space-y-6">
              {itinerary.map((day, dayIndex) => (
                <div key={dayIndex} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-800">Day {day.day}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day Title
                      </label>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => handleItineraryChange(dayIndex, 'title', e.target.value)}
                        placeholder="e.g., Arrival in Lima"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Accommodation
                      </label>
                      <input
                        type="text"
                        value={day.accommodation || ''}
                        onChange={(e) => handleItineraryChange(dayIndex, 'accommodation', e.target.value)}
                        placeholder="e.g., Hotel Casa Andina"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activities
                    </label>
                    {day.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="border border-gray-200 rounded-md p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <input
                            type="text"
                            value={activity.name}
                            onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'name', e.target.value)}
                            placeholder="e.g., City tour of historic Lima"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                          />
                          {day.activities.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeActivity(dayIndex, activityIndex)}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <textarea
                          value={activity.description}
                          onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'description', e.target.value)}
                          placeholder="Describe this activity in detail..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addActivity(dayIndex)}
                      className="text-[#B8860B] hover:text-[#DAA520] font-medium text-sm"
                    >
                      + Add Activity
                    </button>
                  </div>

                  {/* Day Images */}
                  <div className="mt-6">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Day Images</h5>
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
              ))}
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            className="flex justify-end space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              href="/admin/packages"
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#B8860B] hover:bg-[#DAA520] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}