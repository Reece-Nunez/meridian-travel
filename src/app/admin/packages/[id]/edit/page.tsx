'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { TripPackage } from '@/types/database';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import { usePercentageScrollRestoration } from '@/hooks/usePercentageScrollRestoration';
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

// Destination options by category
const STANDARD_DESTINATIONS = [
  { value: 'Peru', label: 'Peru' },
  { value: 'Ecuador', label: 'Ecuador' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Chile', label: 'Chile' },
  { value: 'Galapagos', label: 'Galapagos Islands' },
  { value: 'Antarctica', label: 'Antarctica' },
  { value: 'Arctic', label: 'Arctic' },
];

const DIVING_DESTINATIONS = [
  { value: 'Red Sea', label: 'Red Sea' },
  { value: 'Philippines', label: 'Philippines' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'Micronesia', label: 'Micronesia' },
];

export default function EditPackage() {
  const { loading: authLoading, isAuthenticated, refreshSession } = useSimpleAdminAuth();
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  // Create a stable Supabase client instance
  const supabase = useMemo(() => createClient(), []);

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
    images: [] as string[],
    type: 'package' as 'package' | 'cruise' | 'special',
    special_type: null as 'diving' | null,
    price_usd: null as string | null,
    price_eur: null as string | null,
    price_gbp: null as string | null
  });
  const [pendingPackageImages, setPendingPackageImages] = useState<PendingImage[]>([]);
  const [packageImagesToDelete, setPackageImagesToDelete] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<PackageItineraryDay[]>([
    { day: 1, title: '', activities: [{ name: '', description: '' }], accommodation: '', images: [], pendingImages: [], imagesToDelete: [] }
  ]);

  // Restore scroll position on refresh/back button
  usePercentageScrollRestoration(`admin-package-edit-${packageId}`, !loading);

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
          images: data.images || [],
          type: data.type || 'package',
          special_type: data.special_type || null,
          price_usd: data.price_usd || null,
          price_eur: data.price_eur || null,
          price_gbp: data.price_gbp || null
        });

        if (data.itinerary && data.itinerary.length > 0) {
          const processedItinerary = data.itinerary.map((day: any, dayIndex: number) => {
            const processedActivities = day.activities && day.activities.length > 0 
              ? day.activities.map((activity: any) => {
                  // Fix corrupted activity data - if it has numeric keys, it's corrupted
                  if (activity && typeof activity === 'object' && activity.hasOwnProperty('0')) {
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
      [name]: type === 'number' ? (value === '' ? null : Number(value)) :
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

  // Upload a single image file via API route with timeout
  const uploadImageFile = async (file: File, bucketName: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucketName);

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('/api/admin/upload-package-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Upload timed out for ${file.name}. Please try again.`);
      }
      throw error;
    }
  };

  // Delete a single image from Supabase storage
  const deleteImageFromStorage = async (imageUrl: string, bucketName: string) => {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
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

    const totalPendingImages = pendingPackageImages.length +
      itinerary.reduce((acc, day) => acc + (day.pendingImages?.length || 0), 0);
    const totalImagesToDelete = packageImagesToDelete.length +
      itinerary.reduce((acc, day) => acc + (day.imagesToDelete?.length || 0), 0);

    // Create a progress toast
    const toastId = toast.loading('Preparing to save changes...', {
      description: 'Validating your session',
    });

    try {
      const sessionValid = await refreshSession();
      if (!sessionValid) {
        toast.error('Your session has expired. Please log in again.', { id: toastId });
        return;
      }

      // Delete marked images first
      if (totalImagesToDelete > 0) {
        toast.loading('Removing deleted images...', {
          id: toastId,
          description: `Deleting ${totalImagesToDelete} image${totalImagesToDelete > 1 ? 's' : ''}`,
        });
      }
      await deleteAllMarkedImages();

      // Upload all pending images
      if (totalPendingImages > 0) {
        toast.loading(`Uploading ${totalPendingImages} image${totalPendingImages > 1 ? 's' : ''}...`, {
          id: toastId,
          description: 'This may take a moment',
        });
      }
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
        special_type: formData.special_type || null,
        price_usd: formData.price_usd,
        price_eur: formData.price_eur,
        price_gbp: formData.price_gbp,
        updated_at: packageData.updated_at
      };

      toast.loading('Saving to database...', {
        id: toastId,
        description: `Updating "${formData.title}"`,
      });

      const { error: basicError } = await supabase
        .from('trip_packages')
        .update(basicData)
        .eq('id', packageId);

      if (basicError) {
        throw basicError;
      }

      const { error: itineraryError } = await supabase
        .from('trip_packages')
        .update({ itinerary: packageData.itinerary })
        .eq('id', packageId);

      if (itineraryError) {
        toast.warning('Saved with warnings', {
          id: toastId,
          description: 'Basic fields saved but itinerary update failed',
        });
      } else {
        toast.success('Package updated successfully!', {
          id: toastId,
          description: `"${formData.title}" has been saved`,
        });
      }

      setPendingPackageImages([]);
      setPackageImagesToDelete([]);
      setItinerary(prev => prev.map(day => ({ ...day, pendingImages: [], imagesToDelete: [] })));

      router.push('/admin/packages');
    } catch (error) {
      console.error('Package update error:', error);
      toast.error('Failed to update package', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
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
                  {formData.type === 'special' && formData.special_type === 'diving' && (
                    <optgroup label="Diving Destinations">
                      {DIVING_DESTINATIONS.map(dest => (
                        <option key={dest.value} value={dest.value}>{dest.label}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label={formData.type === 'special' && formData.special_type === 'diving' ? 'Standard Destinations' : 'Destinations'}>
                    {STANDARD_DESTINATIONS.map(dest => (
                      <option key={dest.value} value={dest.value}>{dest.label}</option>
                    ))}
                  </optgroup>
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

              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pricing (Per Person)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="price_usd" className="block text-sm font-medium text-gray-700 mb-2">
                      Price (USD)
                    </label>
                    <input
                      type="text"
                      id="price_usd"
                      name="price_usd"
                      value={formData.price_usd || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      placeholder="e.g., Starting at $100"
                    />
                  </div>
                  <div>
                    <label htmlFor="price_eur" className="block text-sm font-medium text-gray-700 mb-2">
                      Price (EUR)
                    </label>
                    <input
                      type="text"
                      id="price_eur"
                      name="price_eur"
                      value={formData.price_eur || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      placeholder="e.g., From €875 per person"
                    />
                  </div>
                  <div>
                    <label htmlFor="price_gbp" className="block text-sm font-medium text-gray-700 mb-2">
                      Price (GBP)
                    </label>
                    <input
                      type="text"
                      id="price_gbp"
                      name="price_gbp"
                      value={formData.price_gbp || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      placeholder="e.g., Starting at £750"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Set the base price per person for this package. Leave blank if pricing varies by date.
                </p>
              </div>

              <div className="flex items-center md:col-span-2">
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

          {/* Special Package fields - only show for special packages */}
          {formData.type === 'special' && (
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-6">Special Package Type</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="special_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Package Type *
                  </label>
                  <select
                    id="special_type"
                    name="special_type"
                    required
                    value={formData.special_type || ''}
                    onChange={(e) => {
                      const value = e.target.value as 'diving' | '';
                      setFormData(prev => ({
                        ...prev,
                        special_type: value || null
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  >
                    <option value="">Select special type...</option>
                    <option value="diving">Diving</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Selecting a special type will show additional destination options specific to that activity.
                  </p>
                </div>

                {formData.special_type === 'diving' && (
                  <div className="p-4 bg-blue-50 rounded-md flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <strong>Diving Package</strong>
                      <p className="mt-1">
                        Diving packages include additional destinations: Red Sea, Philippines, Indonesia, and Micronesia.
                        Standard destinations are also available.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

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