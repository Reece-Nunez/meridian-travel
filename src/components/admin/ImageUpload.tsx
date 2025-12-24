'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import ImageCropper from './ImageCropper';

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface ImageToCrop {
  file: File;
  previewUrl: string;
}

interface ImageUploadProps {
  onImagesChange: (images: string[], pendingImages: PendingImage[], imagesToDelete: string[]) => void;
  currentImages?: string[];
  pendingImages?: PendingImage[];
  imagesToDelete?: string[];
  maxImages?: number;
  bucketName?: string;
  /** Enable cropping before upload. Defaults to true for package images. */
  enableCropping?: boolean;
  /** Default aspect ratio for cropping. Defaults to 16/9 for banner images. */
  cropAspectRatio?: number;
}

export default function ImageUpload({
  onImagesChange,
  currentImages = [],
  pendingImages = [],
  imagesToDelete = [],
  maxImages = 5,
  bucketName = 'content-images',
  enableCropping = true,
  cropAspectRatio = 16 / 9
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, removeToast, success, error, confirm } = useToast();

  // State for cropping workflow
  const [imagesToCrop, setImagesToCrop] = useState<ImageToCrop[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);

  const totalImages = currentImages.length + pendingImages.length;
  const canUploadMore = totalImages < maxImages;

  // Get the current image being cropped
  const currentImageToCrop = imagesToCrop[currentCropIndex];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const availableSlots = maxImages - totalImages;
    if (availableSlots <= 0) {
      error('Maximum Images Reached', `You can only have ${maxImages} images total.`);
      return;
    }

    // Limit to available slots
    const filesToProcess = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      error('Some Images Skipped', `Only ${availableSlots} image(s) can be added. ${files.length - availableSlots} image(s) were skipped.`);
    }

    const validFiles: ImageToCrop[] = [];
    const invalidFiles: string[] = [];
    const oversizedFiles: string[] = [];

    for (const file of filesToProcess) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(file.name);
        continue;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        oversizedFiles.push(file.name);
        continue;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      validFiles.push({ file, previewUrl });
    }

    // Show error messages for invalid files
    if (invalidFiles.length > 0) {
      error('Invalid File Type', `${invalidFiles.join(', ')} - Please select image files only.`);
    }
    if (oversizedFiles.length > 0) {
      error('Files Too Large', `${oversizedFiles.join(', ')} - File size must be less than 5MB.`);
    }

    if (validFiles.length > 0) {
      if (enableCropping) {
        // Queue files for cropping
        setImagesToCrop(validFiles);
        setCurrentCropIndex(0);
      } else {
        // Add directly without cropping
        addFilesToPending(validFiles.map(v => v.file));
        // Clean up preview URLs
        validFiles.forEach(v => URL.revokeObjectURL(v.previewUrl));
      }
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add files directly to pending (used when cropping is disabled or after cropping)
  const addFilesToPending = (files: File[]) => {
    const newPendingImages: PendingImage[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file: file,
      previewUrl: URL.createObjectURL(file)
    }));

    const updatedPendingImages = [...pendingImages, ...newPendingImages];
    onImagesChange(currentImages, updatedPendingImages, imagesToDelete);

    const imageText = newPendingImages.length === 1 ? 'image has' : 'images have';
    success('Images Added', `${newPendingImages.length} ${imageText} been added and will be uploaded when you save.`);
  };

  // Handle crop completion for a single image
  const handleCropComplete = (croppedFile: File) => {
    // Clean up the preview URL for the cropped image
    if (currentImageToCrop) {
      URL.revokeObjectURL(currentImageToCrop.previewUrl);
    }

    // Add the cropped file to pending
    const newPendingImage: PendingImage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file: croppedFile,
      previewUrl: URL.createObjectURL(croppedFile)
    };

    const updatedPendingImages = [...pendingImages, newPendingImage];
    onImagesChange(currentImages, updatedPendingImages, imagesToDelete);

    // Move to next image or finish
    if (currentCropIndex < imagesToCrop.length - 1) {
      setCurrentCropIndex(prev => prev + 1);
    } else {
      // All done
      setImagesToCrop([]);
      setCurrentCropIndex(0);
      success('Images Added', `${imagesToCrop.length} image${imagesToCrop.length > 1 ? 's have' : ' has'} been added and will be uploaded when you save.`);
    }
  };

  // Handle cancel cropping
  const handleCropCancel = () => {
    // Clean up all preview URLs
    imagesToCrop.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImagesToCrop([]);
    setCurrentCropIndex(0);
  };

  const removeCurrentImage = (imageUrl: string) => {
    const imageName = imageUrl.split('/').pop()?.split('_').slice(1).join('_') || 'this image';
    
    confirm(
      'Delete Image',
      `Are you sure you want to remove "${imageName}"? This will be deleted when you save.`,
      () => {
        // Remove from current images and add to deletion list
        const updatedCurrentImages = currentImages.filter(img => img !== imageUrl);
        const updatedImagesToDelete = [...imagesToDelete, imageUrl];
        onImagesChange(updatedCurrentImages, pendingImages, updatedImagesToDelete);
        success('Image Removed', `${imageName} will be deleted when you save.`);
      },
      () => {
        // Delete cancelled - do nothing
      },
      'Remove',
      'Cancel'
    );
  };

  const removePendingImage = (pendingId: string) => {
    const pendingImage = pendingImages.find(img => img.id === pendingId);
    if (!pendingImage) return;
    
    confirm(
      'Remove Image',
      `Are you sure you want to remove "${pendingImage.file.name}"?`,
      () => {
        // Clean up the preview URL
        URL.revokeObjectURL(pendingImage.previewUrl);
        
        // Remove from pending images
        const updatedPendingImages = pendingImages.filter(img => img.id !== pendingId);
        onImagesChange(currentImages, updatedPendingImages, imagesToDelete);
        success('Image Removed', `${pendingImage.file.name} has been removed.`);
      },
      () => {
        // Delete cancelled - do nothing
      },
      'Remove',
      'Cancel'
    );
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Image Cropper Modal */}
      {currentImageToCrop && (
        <ImageCropper
          imageSrc={currentImageToCrop.previewUrl}
          fileName={currentImageToCrop.file.name}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={cropAspectRatio}
        />
      )}

      {/* Cropping Progress Indicator */}
      {imagesToCrop.length > 1 && currentImageToCrop && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
          <span className="text-sm text-gray-700">
            Cropping image {currentCropIndex + 1} of {imagesToCrop.length}
          </span>
        </div>
      )}

      <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images ({totalImages}/{maxImages})
          {pendingImages.length > 0 && (
            <span className="text-orange-600 text-xs ml-2">
              ({pendingImages.length} pending upload)
            </span>
          )}
        </label>
        
        {/* Upload Button */}
        {canUploadMore && (
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
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B8860B]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Images
            </button>
          </div>
        )}

      </div>

      {/* Current and Pending Images */}
      {(currentImages.length > 0 || pendingImages.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Current Images (already uploaded) */}
          {currentImages.map((imageUrl, index) => (
            <div key={`current-${index}`} className="relative group">
              <img
                src={imageUrl}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute top-2 left-2">
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                  Saved
                </span>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeCurrentImage(imageUrl)}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Pending Images (not yet uploaded) */}
          {pendingImages.map((pendingImage, index) => (
            <div key={`pending-${pendingImage.id}`} className="relative group">
              <img
                src={pendingImage.previewUrl}
                alt={`Pending ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-orange-200"
              />
              <div className="absolute top-2 left-2">
                <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded">
                  Pending
                </span>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removePendingImage(pendingImage.id)}
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
      <p className="text-sm text-gray-600">
        Upload images in JPG, PNG, or WebP format. Maximum file size: 5MB.
        {enableCropping && ' You can crop images to fit the banner area after selecting them.'}
      </p>
      </div>
    </>
  );
}