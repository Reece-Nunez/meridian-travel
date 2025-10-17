'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import ImageUploadWithCaptions, { ImageWithCaption } from '@/components/admin/ImageUploadWithCaptions';
import { Ship } from '@/types/database';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

function EditShipContent() {
  const { loading: authLoading, isAuthenticated } = useSimpleAdminAuth();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [ship, setShip] = useState<Ship | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 50,
    ship_type: 'Expedition vessel',
    operating_regions: [''],
    base_port: '',
    cabin_categories: [''],
    ship_features: [''],
    luxury_highlights: [''],
    is_active: true,
    is_featured: false
  });

  const [shipImages, setShipImages] = useState<ImageWithCaption[]>([]);
  const [deckPlanImages, setDeckPlanImages] = useState<ImageWithCaption[]>([]);

  const shipTypes = [
    'Luxury yacht',
    'Expedition vessel',
    'Cruise ship',
    'River cruise',
    'Sailing yacht',
    'Catamaran',
    'Motor yacht',
    'Diving Ship'
  ];

  const operatingRegions = [
    'Antarctica',
    'Amazon',
    'Galapagos',
    'Chile',
    'Argentina',
    'Peru',
    'Ecuador',
    'Brazil',
    'Arctic',
    'Mediterranean',
    'Caribbean'
  ];

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchShip();
    } else if (!authLoading && !isAuthenticated) {
      // If auth loaded but user is not authenticated, redirect
      setFetchLoading(false);
    }
  }, [isAuthenticated, params.id, authLoading]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (fetchLoading) {
        console.error('Ship edit page loading timeout');
        setFetchLoading(false);
        alert('Loading timed out. Please refresh the page or try again.');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [fetchLoading]);

  // Force refresh data on mount to avoid stale cache
  useEffect(() => {
    router.refresh();
  }, []);

  const fetchShip = async () => {
    try {
      const { data, error } = await supabase
        .from('ships')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      setShip(data);

      // Populate form with ship data
      setFormData({
        name: data.name || '',
        description: data.description || '',
        capacity: data.capacity || 50,
        ship_type: data.ship_type || 'Expedition vessel',
        operating_regions: data.operating_regions || [''],
        base_port: data.base_port || '',
        cabin_categories: data.cabin_categories || [''],
        ship_features: data.ship_features || [''],
        luxury_highlights: data.luxury_highlights || [''],
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false
      });

      // Load image metadata or fallback to old format
      if (data.image_metadata && Array.isArray(data.image_metadata)) {
        setShipImages(data.image_metadata.map((img: any) => ({
          url: img.url,
          caption: img.caption || '',
          isPending: false
        })));
      } else if (data.images && Array.isArray(data.images)) {
        setShipImages(data.images.map((url: string) => ({
          url,
          caption: '',
          isPending: false
        })));
      }

      // Load deck plan metadata or fallback to old format
      if (data.deck_plan_metadata && Array.isArray(data.deck_plan_metadata)) {
        setDeckPlanImages(data.deck_plan_metadata.map((img: any) => ({
          url: img.url,
          caption: img.caption || '',
          isPending: false
        })));
      } else if (data.deck_plans && Array.isArray(data.deck_plans)) {
        setDeckPlanImages(data.deck_plans.map((url: string) => ({
          url,
          caption: '',
          isPending: false
        })));
      }
    } catch (error) {
      console.error('Error fetching ship:', error);
      alert('Failed to load ship data.');
      router.push('/admin/ships');
    } finally {
      setFetchLoading(false);
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

  const handleArrayChange = (field: 'operating_regions' | 'cabin_categories' | 'ship_features' | 'luxury_highlights', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'operating_regions' | 'cabin_categories' | 'ship_features' | 'luxury_highlights') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'operating_regions' | 'cabin_categories' | 'ship_features' | 'luxury_highlights', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleOperatingRegionToggle = (region: string) => {
    setFormData(prev => {
      const regions = prev.operating_regions.filter(r => r !== '');
      const isSelected = regions.includes(region);

      if (isSelected) {
        return {
          ...prev,
          operating_regions: regions.filter(r => r !== region)
        };
      } else {
        return {
          ...prev,
          operating_regions: [...regions, region]
        };
      }
    });
  };

  const uploadImageWithCaption = async (image: ImageWithCaption, folder: string) => {
    if (!image.file) return { url: image.url, caption: image.caption };

    const fileExt = image.file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, image.file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return { url: publicUrl, caption: image.caption };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload ship images with captions
      const uploadedShipImages = await Promise.all(
        shipImages.map(img => uploadImageWithCaption(img, 'ships'))
      );

      // Upload deck plans with captions
      const uploadedDeckPlans = await Promise.all(
        deckPlanImages.map(img => uploadImageWithCaption(img, 'deck-plans'))
      );

      // Prepare metadata for database
      const imageMetadata = uploadedShipImages.length > 0 ? uploadedShipImages : null;
      const deckPlanMetadata = uploadedDeckPlans.length > 0 ? uploadedDeckPlans : null;

      // Also keep the old format for backward compatibility
      const images = uploadedShipImages.map(img => img.url);
      const deck_plans = uploadedDeckPlans.map(img => img.url);

      // Clean array fields
      const cleanedData = {
        ...formData,
        images: images.length > 0 ? images : null as any,
        deck_plans: deck_plans.length > 0 ? deck_plans : null as any,
        image_metadata: imageMetadata,
        deck_plan_metadata: deckPlanMetadata,
        operating_regions: formData.operating_regions.filter(region => region.trim() !== ''),
        cabin_categories: formData.cabin_categories.filter(category => category.trim() !== ''),
        ship_features: formData.ship_features.filter(feature => feature.trim() !== ''),
        luxury_highlights: formData.luxury_highlights.filter(highlight => highlight.trim() !== '')
      };

      // Remove empty arrays to prevent database issues
      if (!cleanedData.operating_regions || cleanedData.operating_regions.length === 0) cleanedData.operating_regions = null as any;
      if (!cleanedData.cabin_categories || cleanedData.cabin_categories.length === 0) cleanedData.cabin_categories = null as any;
      if (!cleanedData.ship_features || cleanedData.ship_features.length === 0) cleanedData.ship_features = null as any;
      if (!cleanedData.luxury_highlights || cleanedData.luxury_highlights.length === 0) cleanedData.luxury_highlights = null as any;
      if (!cleanedData.images || cleanedData.images.length === 0) cleanedData.images = null as any;
      if (!cleanedData.deck_plans || cleanedData.deck_plans.length === 0) cleanedData.deck_plans = null as any;

      console.log('📝 Updating ship:', params.id);
      console.log('📝 Update data:', cleanedData);

      const { error } = await supabase
        .from('ships')
        .update(cleanedData)
        .eq('id', params.id);

      if (error) {
        console.error('❌ Ship update error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Ship updated successfully');
      router.push('/admin/ships');
    } catch (error: any) {
      console.error('Error updating ship:', error);
      const errorMessage = error?.message || error?.details || JSON.stringify(error);
      alert(`Failed to update ship: ${errorMessage}\n\nCheck the console for more details.`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated || fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8860B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!ship) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ship Not Found</h1>
          <Link href="/admin/ships" className="text-[#B8860B] hover:text-[#DAA520]">
            Back to Ships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Ship: {ship.name}</h1>
              <p className="text-gray-600 mt-2">Update ship information and settings</p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/admin/ships/${params.id}/cabins`}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Manage Cabins
              </Link>
              <Link
                href="/admin/ships"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Back to Ships
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            <Link href="/admin" className="text-gray-600 hover:text-[#B8860B] transition-colors">
              Dashboard
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/admin/ships" className="text-gray-600 hover:text-[#B8860B] transition-colors">
              Ships
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#B8860B] font-medium">Edit {ship.name}</span>
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ship Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  placeholder="e.g., Ocean Explorer"
                />
              </div>


              <div>
                <label htmlFor="ship_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Ship Type *
                </label>
                <select
                  id="ship_type"
                  name="ship_type"
                  value={formData.ship_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                >
                  {shipTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Passenger Capacity *
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="base_port" className="block text-sm font-medium text-gray-700 mb-2">
                  Base Port
                </label>
                <input
                  type="text"
                  id="base_port"
                  name="base_port"
                  value={formData.base_port}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  placeholder="e.g., Ushuaia, Argentina"
                />
              </div>

            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                placeholder="Describe the ship's features, amenities, and unique characteristics..."
              />
            </div>
          </motion.div>


          {/* Operating Regions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Operating Regions</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {operatingRegions.map(region => (
                <label key={region} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.operating_regions.includes(region)}
                    onChange={() => handleOperatingRegionToggle(region)}
                    className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                  />
                  <span className="text-sm text-gray-700">{region}</span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Cabin Categories - Now managed separately */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Cabin Categories</h3>
                <p className="text-sm text-gray-600 mt-1">Manage detailed cabin information with pricing and images</p>
              </div>
              <Link
                href={`/admin/ships/${params.id}/cabins`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
              >
                Manage Cabins
              </Link>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Cabin categories are now managed in the dedicated Cabin Management section where you can add pricing, images, amenities, and detailed specifications for each cabin type.
              </p>
            </div>
          </motion.div>

          {/* Ship Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Ship Features</h3>

            {formData.ship_features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleArrayChange('ship_features', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  placeholder="e.g., All-suite accommodations"
                />
                {formData.ship_features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('ship_features', index)}
                    className="text-red-600 hover:text-red-800 !ml-2 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('ship_features')}
              className="text-[#B8860B] hover:text-[#DAA520] transition-colors text-sm font-medium"
            >
              + Add Feature
            </button>
          </motion.div>

          {/* Luxury Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Luxury Highlights</h3>

            {formData.luxury_highlights.map((highlight, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => handleArrayChange('luxury_highlights', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  placeholder="e.g., Butler service in all suites"
                />
                {formData.luxury_highlights.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('luxury_highlights', index)}
                    className="text-red-600 hover:text-red-800 !ml-2 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('luxury_highlights')}
              className="text-[#B8860B] hover:text-[#DAA520] transition-colors text-sm font-medium"
            >
              + Add Highlight
            </button>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Ship Images</h3>
            <ImageUploadWithCaptions
              images={shipImages}
              onChange={setShipImages}
              maxImages={10}
              title="Ship Images"
            />
          </motion.div>

          {/* Deck Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Deck Plans</h3>
            <ImageUploadWithCaptions
              images={deckPlanImages}
              onChange={setDeckPlanImages}
              maxImages={5}
              title="Deck Plans"
            />
          </motion.div>

          {/* Status Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Status Settings</h3>

            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                />
                <span className="text-sm text-gray-700">Ship is active and available for bookings</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                />
                <span className="text-sm text-gray-700">Feature this ship prominently</span>
              </label>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex justify-end space-x-4"
          >
            <Link
              href="/admin/ships"
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Ship...' : 'Update Ship'}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

export default function EditShip() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8860B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <EditShipContent />
    </Suspense>
  );
}