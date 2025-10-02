'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

export interface ImageWithCaption {
  url: string;
  caption: string;
  isPending?: boolean;
  file?: File;
  previewUrl?: string;
}

interface ImageUploadWithCaptionsProps {
  images: ImageWithCaption[];
  onChange: (images: ImageWithCaption[]) => void;
  maxImages?: number;
  title?: string;
}

export default function ImageUploadWithCaptions({
  images,
  onChange,
  maxImages = 10,
  title = "Images"
}: ImageUploadWithCaptionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, removeToast, success, error } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Check if adding these files would exceed max
    if (images.length + files.length > maxImages) {
      error('Too Many Images', `Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages: ImageWithCaption[] = [];

    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        error('Invalid File Type', `${file.name} is not an image`);
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        error('File Too Large', `${file.name} must be less than 5MB`);
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        url: previewUrl,
        caption: '',
        isPending: true,
        file: file,
        previewUrl: previewUrl
      });
    });

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
      success('Images Added', `${newImages.length} image(s) added`);
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const image = images[index];
    if (image.previewUrl && image.isPending) {
      URL.revokeObjectURL(image.previewUrl);
    }

    const updatedImages = images.filter((_, i) => i !== index);
    onChange(updatedImages);
    success('Image Removed', 'Image has been removed');
  };

  const updateCaption = (index: number, caption: string) => {
    const updatedImages = images.map((img, i) =>
      i === index ? { ...img, caption } : img
    );
    onChange(updatedImages);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updatedImages = [...images];
    [updatedImages[index], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[index]];
    onChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">
          {images.length} / {maxImages} images
        </span>
      </div>

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages}
          className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#B8860B] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm text-gray-600">
            {images.length >= maxImages ? 'Maximum images reached' : 'Add Images'}
          </span>
        </button>
      </div>

      {/* Image List */}
      {images.length > 0 && (
        <div className="space-y-4">
          {images.map((image, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex gap-4">
                {/* Image Preview */}
                <div className="flex-shrink-0">
                  <img
                    src={image.isPending ? image.previewUrl : image.url}
                    alt={image.caption || `Image ${index + 1}`}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>

                {/* Caption and Controls */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption {image.isPending && <span className="text-xs text-blue-600">(New)</span>}
                    </label>
                    <input
                      type="text"
                      value={image.caption}
                      onChange={(e) => updateCaption(index, e.target.value)}
                      placeholder="e.g., Master Suite - Deck 3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-sm"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === images.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="flex-1"></div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No images added yet. Click "Add Images" to get started.
        </div>
      )}
    </div>
  );
}
