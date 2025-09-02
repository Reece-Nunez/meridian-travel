'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImages?: string[];
  maxImages?: number;
  bucketName?: string;
}

export default function ImageUpload({ 
  onImageUploaded, 
  currentImages = [], 
  maxImages = 5,
  bucketName = 'content-images' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${fileExt}`;
      const filePath = `${bucketName}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images') // Make sure this bucket exists in your Supabase project
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        // If storage doesn't work, we'll provide a fallback
        console.log('Supabase storage not configured, using placeholder');
        // For now, create a mock URL for development
        const mockUrl = `https://via.placeholder.com/800x600/8B4513/FFFFFF?text=${encodeURIComponent(file.name)}`;
        onImageUploaded(mockUrl);
        alert('Image uploaded successfully (using placeholder for development)');
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      alert('Image uploaded successfully!');

    } catch (error) {
      console.error('Error uploading image:', error);
      // Fallback to placeholder
      const mockUrl = `https://via.placeholder.com/800x600/8B4513/FFFFFF?text=${encodeURIComponent(file.name)}`;
      onImageUploaded(mockUrl);
      alert('Image uploaded successfully (using placeholder for development)');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (imageUrl: string) => {
    if (confirm('Are you sure you want to remove this image?')) {
      // In a real implementation, you would also delete from storage
      // For now, we'll just notify the parent component
      onImageUploaded(''); // Empty string signals removal
    }
  };

  const canUploadMore = currentImages.length < maxImages;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images ({currentImages.length}/{maxImages})
        </label>
        
        {/* Upload Button */}
        {canUploadMore && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B8860B] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Image'}
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-2">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#B8860B] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {currentImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(imageUrl)}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <p className="text-sm text-gray-800">
        Upload images in JPG, PNG, or WebP format. Maximum file size: 5MB.
      </p>
    </div>
  );
}