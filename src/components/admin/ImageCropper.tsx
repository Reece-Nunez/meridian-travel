'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';

interface ImageCropperProps {
  imageSrc: string;
  fileName: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

// Helper function to create a cropped image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  fileName: string
): Promise<File> {
  const image = new Image();
  image.src = imageSrc;

  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to the cropped size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        // Create a new file with the original name
        const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
        const croppedFileName = fileName.replace(/\.[^/.]+$/, '') + '_cropped.' + extension;
        const file = new File([blob], croppedFileName, { type: mimeType });
        resolve(file);
      },
      fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
      0.95 // Quality
    );
  });
}

export default function ImageCropper({
  imageSrc,
  fileName,
  onCropComplete,
  onCancel,
  aspectRatio = 16 / 9,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(aspectRatio);
  const [isProcessing, setIsProcessing] = useState(false);

  const aspectRatioOptions = [
    { label: 'Banner (16:9)', value: 16 / 9 },
    { label: 'Square (1:1)', value: 1 },
    { label: 'Portrait (3:4)', value: 3 / 4 },
    { label: 'Wide (21:9)', value: 21 / 9 },
    { label: 'Free', value: 0 },
  ];

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, fileName);
      onCropComplete(croppedFile);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    // Convert the original image to a file and pass it through
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], fileName, { type: blob.type });
        onCropComplete(file);
      })
      .catch(() => {
        onCancel();
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Crop Image</h3>
          <p className="text-sm text-gray-500 mt-1">
            Adjust the crop area to select the best part of your image for the banner.
          </p>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Aspect Ratio:</span>
            {aspectRatioOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setSelectedAspectRatio(option.value)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  selectedAspectRatio === option.value
                    ? 'bg-[#B8860B] text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cropper Area */}
        <div className="relative flex-1 min-h-[400px] bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={selectedAspectRatio === 0 ? undefined : selectedAspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            showGrid={true}
            cropShape="rect"
            objectFit="contain"
          />
        </div>

        {/* Zoom Control */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Zoom:</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#B8860B]"
            />
            <span className="text-sm text-gray-500 w-12">{zoom.toFixed(1)}x</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Skip Cropping
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className="px-6 py-2 text-sm font-medium text-white bg-[#B8860B] rounded-md hover:bg-[#DAA520] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                'Apply Crop'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
