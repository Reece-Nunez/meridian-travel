'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import ImageUploadWithCaptions, { ImageWithCaption } from '@/components/admin/ImageUploadWithCaptions';
import { Ship, CabinCategory } from '@/types/database';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

interface CabinFormData {
  name: string;
  description: string;
  pricing_per_person: string | null;
  quantity: string;
  size_sqm: number | null;
  max_occupancy: number | null;
  amenities: string[];
}

function CabinCategoriesContent() {
  const { loading: authLoading, isAuthenticated } = useSimpleAdminAuth();
  const router = useRouter();
  const params = useParams();
  const shipId = params.id as string;

  const [ship, setShip] = useState<Ship | null>(null);
  const [cabins, setCabins] = useState<CabinCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editingCabin, setEditingCabin] = useState<CabinCategory | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<CabinFormData>({
    name: '',
    description: '',
    pricing_per_person: null,
    quantity: '',
    size_sqm: null,
    max_occupancy: null,
    amenities: ['']
  });

  const [cabinImages, setCabinImages] = useState<ImageWithCaption[]>([]);

  useEffect(() => {
    if (isAuthenticated && shipId) {
      fetchData();
    } else if (!authLoading && !isAuthenticated) {
      // If auth loaded but user is not authenticated, stop loading
      setFetchLoading(false);
    }
  }, [isAuthenticated, shipId, authLoading]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (fetchLoading) {
        console.error('Cabin categories page loading timeout');
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

  const fetchData = async () => {
    try {
      // Fetch ship details
      const { data: shipData, error: shipError } = await supabase
        .from('ships')
        .select('*')
        .eq('id', shipId)
        .single();

      if (shipError) throw shipError;
      setShip(shipData);

      // Fetch cabin categories
      const { data: cabinData, error: cabinError } = await supabase
        .from('cabin_categories')
        .select('*')
        .eq('ship_id', shipId)
        .order('pricing_per_person', { ascending: true, nullsFirst: false });

      if (cabinError) throw cabinError;
      setCabins(cabinData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data.');
    } finally {
      setFetchLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pricing_per_person: null,
      quantity: '',
      size_sqm: null,
      max_occupancy: null,
      amenities: ['']
    });
    setCabinImages([]);
    setEditingCabin(null);
    setShowForm(false);
  };

  const handleEdit = (cabin: CabinCategory) => {
    setEditingCabin(cabin);
    setFormData({
      name: cabin.name,
      description: cabin.description || '',
      pricing_per_person: cabin.pricing_per_person,
      quantity: cabin.quantity || '',
      size_sqm: cabin.size_sqm,
      max_occupancy: cabin.max_occupancy,
      amenities: cabin.amenities && cabin.amenities.length > 0 ? cabin.amenities : ['']
    });

    // Load existing images
    if (cabin.images && cabin.images.length > 0) {
      setCabinImages(cabin.images.map(url => ({
        url,
        caption: '',
        isPending: false
      })));
    }

    setShowForm(true);
  };

  const handleDelete = async (cabinId: string) => {
    if (!confirm('Are you sure you want to delete this cabin category?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cabin_categories')
        .delete()
        .eq('id', cabinId);

      if (error) throw error;

      alert('Cabin category deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting cabin:', error);
      alert('Failed to delete cabin category.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : Number(value)) : value
    }));
  };

  const handleAmenityChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.map((item, i) => i === index ? value : item)
    }));
  };

  const addAmenity = () => {
    setFormData(prev => ({
      ...prev,
      amenities: [...prev.amenities, '']
    }));
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const uploadImage = async (image: ImageWithCaption) => {
    if (!image.file) return image.url;

    const fileExt = image.file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `cabins/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, image.file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images
      const uploadedImages = await Promise.all(
        cabinImages.map(img => uploadImage(img))
      );

      // Clean amenities
      const cleanedAmenities = formData.amenities.filter(a => a.trim() !== '');

      const cabinData = {
        ship_id: shipId,
        name: formData.name,
        description: formData.description || null,
        pricing_per_person: formData.pricing_per_person,
        quantity: formData.quantity || null,
        size_sqm: formData.size_sqm,
        max_occupancy: formData.max_occupancy,
        amenities: cleanedAmenities.length > 0 ? cleanedAmenities : null,
        images: uploadedImages.length > 0 ? uploadedImages : null
      };

      if (editingCabin) {
        // Update existing cabin
        const { error } = await supabase
          .from('cabin_categories')
          .update(cabinData)
          .eq('id', editingCabin.id);

        if (error) throw error;
        alert('Cabin category updated successfully!');
      } else {
        // Create new cabin
        const { error } = await supabase
          .from('cabin_categories')
          .insert([cabinData]);

        if (error) throw error;
        alert('Cabin category created successfully!');
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving cabin:', error);
      alert(`Failed to save cabin category: ${error.message}`);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cabin Categories</h1>
              <p className="text-gray-600 mt-2">Manage cabin categories for {ship.name}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/admin/ships/${shipId}/edit`}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Back to Ship
              </Link>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Add Cabin Category
                </button>
              )}
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
            <Link href={`/admin/ships/${shipId}/edit`} className="text-gray-600 hover:text-[#B8860B] transition-colors">
              {ship.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#B8860B] font-medium">Cabin Categories</span>
          </nav>
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCabin ? 'Edit Cabin Category' : 'Add New Cabin Category'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Cabin Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="e.g., Deluxe Suite"
                  />
                </div>

                <div>
                  <label htmlFor="pricing_per_person" className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Person
                  </label>
                  <input
                    type="text"
                    id="pricing_per_person"
                    name="pricing_per_person"
                    value={formData.pricing_per_person || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="e.g., Starting at $1500 or From $2000 per person"
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Available
                  </label>
                  <input
                    type="text"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="e.g., 4 or four"
                  />
                </div>

                <div>
                  <label htmlFor="size_sqm" className="block text-sm font-medium text-gray-700 mb-2">
                    Size (Ft²)
                  </label>
                  <input
                    type="number"
                    id="size_sqm"
                    name="size_sqm"
                    value={formData.size_sqm || ''}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="e.g., 275"
                  />
                </div>

                <div>
                  <label htmlFor="max_occupancy" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Occupancy
                  </label>
                  <input
                    type="number"
                    id="max_occupancy"
                    name="max_occupancy"
                    value={formData.max_occupancy || ''}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="e.g., 2"
                  />
                </div>
              </div>

              <div>
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
                  placeholder="Describe this cabin category..."
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={amenity}
                      onChange={(e) => handleAmenityChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      placeholder="e.g., Private balcony"
                    />
                    {formData.amenities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAmenity}
                  className="text-[#B8860B] hover:text-[#DAA520] transition-colors text-sm font-medium"
                >
                  + Add Amenity
                </button>
              </div>

              {/* Images */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Cabin Images</h3>
                <ImageUploadWithCaptions
                  images={cabinImages}
                  onChange={setCabinImages}
                  maxImages={10}
                  title="Cabin Images"
                />
              </div>

              <div className="flex justify-end space-x-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-4 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingCabin ? 'Update Cabin' : 'Create Cabin'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Cabin Categories List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Cabin Categories ({cabins.length})</h3>
          </div>

          {cabins.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cabin categories yet</h3>
              <p className="text-gray-600 mb-4">Add cabin categories with pricing to help customers choose the right accommodation.</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Add First Cabin Category
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cabins.map((cabin) => (
                <motion.div
                  key={cabin.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {cabin.images && cabin.images[0] && (
                          <img
                            src={cabin.images[0]}
                            alt={cabin.name}
                            className="w-24 h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900">{cabin.name}</h4>
                          {cabin.pricing_per_person && (
                            <p className="text-[#B8860B] font-semibold text-xl mt-1">
                              {cabin.pricing_per_person}
                            </p>
                          )}
                          {cabin.description && (
                            <p className="text-gray-600 mt-2 text-sm">{cabin.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                            {cabin.size_sqm && <span>📐 {cabin.size_sqm} Ft²</span>}
                            {cabin.max_occupancy && <span>👥 Max {cabin.max_occupancy} guests</span>}
                            {cabin.quantity && <span>✓ {cabin.quantity} available</span>}
                          </div>
                          {cabin.amenities && cabin.amenities.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Amenities:</p>
                              <div className="flex flex-wrap gap-2">
                                {cabin.amenities.map((amenity, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-[#F5F5DC] text-[#8B4513] rounded text-xs">
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <button
                        onClick={() => handleEdit(cabin)}
                        className="text-[#B8860B] hover:text-[#DAA520] transition-colors font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cabin.id)}
                        className="text-red-600 hover:text-red-800 transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CabinCategories() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8860B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CabinCategoriesContent />
    </Suspense>
  );
}
