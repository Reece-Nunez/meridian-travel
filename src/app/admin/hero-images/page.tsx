'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import ImageCropper from '@/components/admin/ImageCropper';

interface PageHeroSetting {
  id: string;
  page_slug: string;
  page_name: string;
  hero_image_url: string | null;
  original_image_url: string | null;
  focal_point_x: number;
  focal_point_y: number;
  hero_height_mobile: string;
  hero_height_desktop: string;
  overlay_opacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ImageToCrop {
  file: File;
  originalFile: File; // Store original file for uploading
  previewUrl: string;
  pageSlug: string;
  settingId: string;
  cropStep: 'desktop' | 'mobile'; // Track which crop we're doing
  desktopCroppedFile?: File; // Store desktop crop while doing mobile crop
}

// Helper to fetch an image from URL and convert to File for cropping
async function fetchImageAsFile(url: string, filename: string = 'image.jpg'): Promise<File> {
  // Use our proxy API to avoid CORS issues
  const proxyUrl = `/api/admin/proxy-image?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);

  if (!response.ok) {
    throw new Error('Failed to fetch image');
  }

  const blob = await response.blob();
  const extension = url.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
  const mimeType = blob.type || `image/${extension === 'jpg' ? 'jpeg' : extension}`;

  return new File([blob], `cropped-image.${extension}`, { type: mimeType });
}

export default function AdminHeroImages() {
  const { loading: authLoading, isAuthenticated } = useSimpleAdminAuth();
  const [heroSettings, setHeroSettings] = useState<PageHeroSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<ImageToCrop | null>(null);
  const [uploading, setUploading] = useState<string | null>(null); // Track which setting is uploading
  const [loadingUrlCrop, setLoadingUrlCrop] = useState<string | null>(null); // Track which setting is loading URL for crop
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHeroSettings();
    }
  }, [isAuthenticated]);

  const fetchHeroSettings = async () => {
    console.log('[HeroImages] Fetching hero settings...');

    // Add timeout to prevent hanging forever
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Fetch timed out after 10 seconds') }), 10000)
    );

    try {
      setLoading(true);

      const fetchPromise = supabase
        .from('page_hero_settings')
        .select('*')
        .order('page_name');

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error('[HeroImages] Error fetching hero settings:', error);
        toast.error('Failed to load hero settings', { description: error.message });
        return;
      }

      console.log('[HeroImages] Fetched', data?.length || 0, 'settings');
      setHeroSettings(data || []);
    } catch (err) {
      console.error('[HeroImages] Error:', err);
      toast.error('Failed to load hero settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (setting: PageHeroSetting) => {
    setSaving(true);
    const toastId = toast.loading('Saving hero settings...', {
      description: setting.page_name
    });

    try {
      console.log('[HeroImages] Saving settings for:', setting.page_slug);

      // Use API route to bypass RLS
      const response = await fetch('/api/admin/hero-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: setting.id,
          hero_image_url: setting.hero_image_url,
          focal_point_x: setting.focal_point_x,
          focal_point_y: setting.focal_point_y,
          hero_height_mobile: setting.hero_height_mobile,
          hero_height_desktop: setting.hero_height_desktop,
          overlay_opacity: setting.overlay_opacity
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      console.log('[HeroImages] Save successful');
      setHeroSettings(prev =>
        prev.map(s => s.id === setting.id ? setting : s)
      );
      toast.success('Hero settings saved!', {
        id: toastId,
        description: `${setting.page_name} updated successfully`
      });
    } catch (error) {
      console.error('[HeroImages] Error saving:', error);
      toast.error('Failed to save settings', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewPage = async () => {
    const pageName = prompt('Enter page name (e.g., "About Us"):');
    if (!pageName) return;

    const pageSlug = prompt('Enter page slug (e.g., "about"):');
    if (!pageSlug) return;

    const toastId = toast.loading('Adding page...');

    try {
      const { data, error } = await supabase
        .from('page_hero_settings')
        .insert({
          page_slug: pageSlug,
          page_name: pageName,
          hero_image_url: null,
          focal_point_x: 50,
          focal_point_y: 50
        })
        .select()
        .single();

      if (error) throw error;

      setHeroSettings(prev => [...prev, data]);
      toast.success('Page added!', {
        id: toastId,
        description: pageName
      });
    } catch (error) {
      console.error('Error adding page:', error);
      toast.error('Failed to add page', {
        id: toastId,
        description: 'Make sure the slug is unique'
      });
    }
  };

  // Handle file selection for upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, setting: PageHeroSetting) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', { description: 'Please select an image file' });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 10MB' });
      return;
    }

    // Create preview URL and open cropper - start with DESKTOP crop
    const previewUrl = URL.createObjectURL(file);
    setImageToCrop({
      file,
      originalFile: file, // Store original for both crops
      previewUrl,
      pageSlug: setting.page_slug,
      settingId: setting.id,
      cropStep: 'desktop' // Start with desktop crop
    });

    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Handle crop completion - two-step process: desktop first, then mobile
  const handleCropComplete = async (croppedFile: File) => {
    if (!imageToCrop) return;

    const { pageSlug, settingId, originalFile, cropStep, desktopCroppedFile } = imageToCrop;

    if (cropStep === 'desktop') {
      // Desktop crop done - now open mobile crop
      // Don't clean up preview URL yet, we need it for mobile crop

      // Create a new preview URL from the original file for mobile crop
      const mobilePreviewUrl = URL.createObjectURL(originalFile);

      // Clean up the old preview URL
      URL.revokeObjectURL(imageToCrop.previewUrl);

      setImageToCrop({
        file: originalFile,
        originalFile: originalFile,
        previewUrl: mobilePreviewUrl,
        pageSlug,
        settingId,
        cropStep: 'mobile',
        desktopCroppedFile: croppedFile // Store desktop crop for later upload
      });

      toast.info('Now crop for mobile view', {
        description: 'Select the portrait area for mobile devices'
      });
      return;
    }

    // Mobile crop done - upload both images
    const mobileCroppedFile = croppedFile;
    const desktopFile = desktopCroppedFile!;

    // Clean up preview URL
    URL.revokeObjectURL(imageToCrop.previewUrl);
    setImageToCrop(null);
    setUploading(settingId);

    const toastId = toast.loading('Uploading images...', {
      description: 'Uploading desktop and mobile versions'
    });

    try {
      // Upload the desktop cropped image
      const desktopFormData = new FormData();
      desktopFormData.append('file', desktopFile);
      desktopFormData.append('pageSlug', pageSlug);

      const desktopResponse = await fetch('/api/admin/upload-hero-image', {
        method: 'POST',
        body: desktopFormData
      });

      if (!desktopResponse.ok) {
        const error = await desktopResponse.json();
        throw new Error(error.error || 'Desktop upload failed');
      }

      const { url: desktopUrl } = await desktopResponse.json();

      // Upload the mobile cropped image
      const mobileFormData = new FormData();
      mobileFormData.append('file', mobileCroppedFile);
      mobileFormData.append('pageSlug', `${pageSlug}-mobile`);

      const mobileResponse = await fetch('/api/admin/upload-hero-image', {
        method: 'POST',
        body: mobileFormData
      });

      if (!mobileResponse.ok) {
        const error = await mobileResponse.json();
        throw new Error(error.error || 'Mobile upload failed');
      }

      const { url: mobileUrl } = await mobileResponse.json();

      // Update the database with both URLs using API route
      const updateResponse = await fetch('/api/admin/hero-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: settingId,
          hero_image_url: desktopUrl,
          original_image_url: mobileUrl, // Now stores mobile crop, not original
          focal_point_x: 50,
          focal_point_y: 50
        })
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      // Update local state
      setHeroSettings(prev =>
        prev.map(s => s.id === settingId
          ? { ...s, hero_image_url: desktopUrl, original_image_url: mobileUrl, focal_point_x: 50, focal_point_y: 50 }
          : s
        )
      );

      toast.success('Images uploaded!', {
        id: toastId,
        description: 'Desktop and mobile versions saved'
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Upload failed', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setUploading(null);
    }
  };

  // Handle crop cancel
  const handleCropCancel = () => {
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop.previewUrl);
    }
    setImageToCrop(null);
  };

  // Handle cropping from an existing URL
  const handleCropFromUrl = async (setting: PageHeroSetting) => {
    if (!setting.hero_image_url) {
      toast.error('No URL entered', { description: 'Please enter an image URL first' });
      return;
    }

    setLoadingUrlCrop(setting.id);
    const toastId = toast.loading('Loading image...', { description: 'Fetching image from URL' });

    try {
      const file = await fetchImageAsFile(setting.hero_image_url);
      const previewUrl = URL.createObjectURL(file);

      setImageToCrop({
        file,
        originalFile: file, // Store original for both crops
        previewUrl,
        pageSlug: setting.page_slug,
        settingId: setting.id,
        cropStep: 'desktop' // Start with desktop crop
      });

      toast.dismiss(toastId);
    } catch (error) {
      console.error('Error loading image from URL:', error);
      toast.error('Failed to load image', {
        id: toastId,
        description: 'Could not fetch the image. Check the URL and try again.'
      });
    } finally {
      setLoadingUrlCrop(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Calculate aspect ratios
  const desktopAspectRatio = 21 / 9; // Wide banner ratio for desktop
  const mobileAspectRatio = 9 / 16; // Portrait ratio for mobile

  // Get current aspect ratio based on crop step
  const currentAspectRatio = imageToCrop?.cropStep === 'mobile' ? mobileAspectRatio : desktopAspectRatio;
  const cropTitle = imageToCrop?.cropStep === 'mobile' ? 'Crop for Mobile (Portrait)' : 'Crop for Desktop (Wide)';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Cropper Modal */}
      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop.previewUrl}
          fileName={imageToCrop.file.name}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={currentAspectRatio}
          title={cropTitle}
          lockAspectRatio={true}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/admin"
                className="text-gray-500 hover:text-[#8B4513] mr-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-[#8B4513]">Hero Images</h1>
            </div>
            <button
              onClick={handleAddNewPage}
              className="px-4 py-2 bg-[#B8860B] hover:bg-[#DAA520] text-white font-medium rounded-md transition-colors"
            >
              + Add Page
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Manage Hero Images</h2>
          <p className="text-gray-600">
            Configure the hero banner images for each page. Set the focal point to control which part of the image stays visible when cropped.
          </p>
        </div>

        {heroSettings.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 mb-4">
              No hero image settings found. You may need to run the database migration first.
            </p>
            <p className="text-sm text-yellow-700">
              Run the SQL in <code className="bg-yellow-100 px-1 rounded">database/migrations/create_page_hero_settings.sql</code>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {heroSettings.map((setting) => (
              <div key={setting.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Preview */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {setting.hero_image_url ? (
                    <>
                      <img
                        src={setting.hero_image_url}
                        alt={setting.page_name}
                        className="w-full h-full object-cover object-center"
                      />
                      <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: setting.overlay_opacity }}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>No image set</span>
                    </div>
                  )}
                </div>

                {/* Settings */}
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900">{setting.page_name}</h3>
                    <p className="text-sm text-gray-500">/{setting.page_slug}</p>
                  </div>

                  {/* Upload New Image */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload & Crop Image
                    </label>
                    <input
                      ref={(el) => { fileInputRefs.current[setting.id] = el; }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, setting)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[setting.id]?.click()}
                      disabled={uploading === setting.id}
                      className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#B8860B] hover:text-[#B8860B] rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploading === setting.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Choose Image to Crop & Upload
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Select an image, crop it to fit the banner, then it will be uploaded automatically.
                    </p>
                  </div>

                  {/* Or Manual URL Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Or Enter Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={setting.hero_image_url || ''}
                        onChange={(e) => {
                          setHeroSettings(prev =>
                            prev.map(s => s.id === setting.id
                              ? { ...s, hero_image_url: e.target.value }
                              : s
                            )
                          );
                        }}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleCropFromUrl(setting)}
                        disabled={loadingUrlCrop === setting.id || !setting.hero_image_url}
                        className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        title="Crop this image"
                      >
                        {loadingUrlCrop === setting.id ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          'Crop'
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Paste a URL and click "Crop" to crop it, or "Save Settings" to use it directly.
                    </p>
                  </div>

                  {/* Overlay Opacity */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Overlay Opacity: {(setting.overlay_opacity * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={setting.overlay_opacity}
                      onChange={(e) => {
                        setHeroSettings(prev =>
                          prev.map(s => s.id === setting.id
                            ? { ...s, overlay_opacity: parseFloat(e.target.value) }
                            : s
                          )
                        );
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#B8860B]"
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => handleSave(setting)}
                    disabled={saving}
                    className="w-full px-3 py-2 text-sm bg-[#B8860B] hover:bg-[#DAA520] text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
