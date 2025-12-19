'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import { usePercentageScrollRestoration } from '@/hooks/usePercentageScrollRestoration';
import ImageUpload from '@/components/admin/ImageUpload';
import { Ship } from '@/types/database';

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

function NewPackageContent() {
  const { loading: authLoading, isAuthenticated, refreshSession } = useSimpleAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [packageType, setPackageType] = useState<'package' | 'cruise'>('package');
  const [ships, setShips] = useState<Ship[]>([]);
  const [shipsLoading, setShipsLoading] = useState(false);

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
    type: 'package' as 'package' | 'cruise',
    // Cruise-specific fields
    ship_id: '',
    ship_name: '',
    cabin_category: '',
    // Pricing fields
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
  usePercentageScrollRestoration(`admin-package-new-${packageType}`, !authLoading);

  // Set the package type from URL params
  useEffect(() => {
    const type = searchParams.get('type') as 'package' | 'cruise' | null;
    if (type && (type === 'package' || type === 'cruise')) {
      setPackageType(type);
      setFormData(prev => ({ ...prev, type }));
    }
  }, [searchParams]);

  // Fetch ships when package type is cruise
  useEffect(() => {
    if (packageType === 'cruise') {
      fetchShips();
    }
  }, [packageType]);

  const fetchShips = async () => {
    setShipsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ships')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setShips(data || []);
    } catch (error) {
      console.error('Error fetching ships:', error);
      setShips([]);
    } finally {
      setShipsLoading(false);
    }
  };

  const handleShipChange = (shipId: string) => {
    const selectedShip = ships.find(ship => ship.id === shipId);
    if (selectedShip) {
      setFormData(prev => ({
        ...prev,
        ship_id: shipId,
        ship_name: selectedShip.name,
        max_participants: selectedShip.capacity || 50
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        ship_id: '',
        ship_name: ''
      }));
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

      // Update the day with new uploaded images and clear pending
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
    setLoading(true);

    // Validate cruise packages require a ship
    if (formData.type === 'cruise' && !formData.ship_id) {
      alert('Please select a ship for cruise packages.');
      setLoading(false);
      return;
    }

    try {
      console.log('Starting form submission...');

      // Refresh session before saving to prevent auth issues
      const sessionValid = await refreshSession();
      if (!sessionValid) {
        alert('Your session has expired. Please log in again.');
        setLoading(false);
        return;
      }

      // Upload all pending images first
      const { packageImages, updatedItinerary } = await uploadAllPendingImages();
      
      const packageData = {
        ...formData,
        includes: formData.includes.filter((item: string) => item.trim() !== ''),
        excludes: formData.excludes.filter((item: string) => item.trim() !== ''),
        luxury_highlights: formData.luxury_highlights.filter((item: string) => item.trim() !== ''),
        images: packageImages,
        itinerary: updatedItinerary.map((day: any) => ({
          ...day,
          activities: day.activities.filter((activity: PackageActivity) => activity.name.trim() !== ''),
          images: day.images || []
        })),
        // Include pricing fields - convert empty strings to null
        price_usd: formData.price_usd || null,
        price_eur: formData.price_eur || null,
        price_gbp: formData.price_gbp || null,
        // Convert empty ship_id to null for land packages
        ship_id: formData.ship_id || null,
        ship_name: formData.ship_name || null,
        cabin_category: formData.cabin_category || null
      };

      console.log('Inserting package data:', packageData);

      const { error } = await supabase
        .from('trip_packages')
        .insert([packageData]);

      if (error) throw error;

      router.push('/admin/packages');
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Failed to create package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-2xl font-bold text-[#8B4513]">
                Create New {packageType === 'cruise' ? 'Cruise' : 'Package'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {authLoading && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {!authLoading && !isAuthenticated && null}

      {!authLoading && isAuthenticated && (
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
                  {packageType === 'cruise' ? 'Cruise' : 'Package'} Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  placeholder={packageType === 'cruise' ? 'e.g., Antarctic Discovery Cruise - 11 Days' : 'e.g., Classic Peru Adventure - 10 Days'}
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
                  placeholder={packageType === 'cruise' ? 'Describe what makes this cruise special...' : 'Describe what makes this package special...'}
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
                  <option value="Ecuador">Ecuador</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="Galapagos">Galapagos Islands</option>
                  <option value="Antarctica">Antarctica</option>
                  <option value="Arctic">Arctic</option>
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
                  Set the base price per person for this {packageType === 'cruise' ? 'cruise' : 'package'}. Leave blank if pricing varies by date.
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
                  {packageType === 'cruise' ? 'Cruise' : 'Package'} is active and bookable
                </label>
              </div>
            </div>
          </motion.div>

          {/* Cruise-specific fields */}
          {packageType === 'cruise' && (
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-6">Cruise Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label htmlFor="ship_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Ship *
                  </label>
                  {shipsLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                      Loading ships...
                    </div>
                  ) : ships.length === 0 ? (
                    <div className="space-y-2">
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                        No ships available
                      </div>
                      <p className="text-sm text-gray-600">
                        You need to{' '}
                        <Link href="/admin/ships/new" className="text-[#B8860B] hover:text-[#DAA520] underline">
                          create ships
                        </Link>{' '}
                        before you can create cruise packages.
                      </p>
                    </div>
                  ) : (
                    <select
                      id="ship_id"
                      name="ship_id"
                      value={formData.ship_id}
                      onChange={(e) => handleShipChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    >
                      <option value="">Select a ship...</option>
                      {ships.map(ship => (
                        <option key={ship.id} value={ship.id}>
                          {ship.name} ({ship.ship_type}, {ship.capacity} passengers)
                        </option>
                      ))}
                    </select>
                  )}

                  {formData.ship_id && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md">
                      <div className="text-sm text-blue-800">
                        <strong>Selected Ship Details:</strong>
                        <div className="mt-1 space-y-1">
                          <div>Name: {formData.ship_name}</div>
                          <div>Type: {ships.find(s => s.id === formData.ship_id)?.ship_type}</div>
                          <div>Capacity: {formData.max_participants} passengers</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="cabin_category" className="block text-sm font-medium text-gray-700 mb-2">
                    Cabin Category
                  </label>
                  <input
                    type="text"
                    id="cabin_category"
                    name="cabin_category"
                    value={formData.cabin_category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="e.g., Suite, Ocean View, Interior"
                  />
                </div>

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
              disabled={loading}
              className="px-6 py-3 bg-[#B8860B] hover:bg-[#DAA520] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : `Create ${packageType === 'cruise' ? 'Cruise' : 'Package'}`}
            </button>
          </motion.div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function NewPackage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <NewPackageContent />
    </Suspense>
  );
}