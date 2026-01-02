'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface FocalPointPickerProps {
  imageSrc: string;
  initialX?: number; // 0-100 percentage
  initialY?: number; // 0-100 percentage
  onFocalPointChange: (x: number, y: number) => void;
  onSave: (x: number, y: number) => void;
  onCancel: () => void;
}

export default function FocalPointPicker({
  imageSrc,
  initialX = 50,
  initialY = 50,
  onFocalPointChange,
  onSave,
  onCancel,
}: FocalPointPickerProps) {
  const [focalPoint, setFocalPoint] = useState({ x: initialX, y: initialY });
  const [previewPosition, setPreviewPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Update preview position whenever focal point changes
  useEffect(() => {
    setPreviewPosition({ x: focalPoint.x, y: focalPoint.y });
  }, [focalPoint.x, focalPoint.y]);

  const updateFocalPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

      setFocalPoint({ x, y });
      onFocalPointChange(x, y);
    },
    [onFocalPointChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateFocalPoint(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateFocalPoint(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    updateFocalPoint(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      updateFocalPoint(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const presetPositions = [
    { label: 'Top Left', x: 25, y: 25 },
    { label: 'Top Center', x: 50, y: 25 },
    { label: 'Top Right', x: 75, y: 25 },
    { label: 'Center Left', x: 25, y: 50 },
    { label: 'Center', x: 50, y: 50 },
    { label: 'Center Right', x: 75, y: 50 },
    { label: 'Bottom Left', x: 25, y: 75 },
    { label: 'Bottom Center', x: 50, y: 75 },
    { label: 'Bottom Right', x: 75, y: 75 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Set Focal Point</h3>
          <p className="text-sm text-gray-500 mt-1">
            Click or drag on the image to set the focal point. This determines which part of the image stays visible when cropped.
          </p>
        </div>

        {/* Preset Positions */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Quick Positions:</span>
            {presetPositions.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setFocalPoint({ x: preset.x, y: preset.y });
                  onFocalPointChange(preset.x, preset.y);
                }}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  Math.abs(focalPoint.x - preset.x) < 5 && Math.abs(focalPoint.y - preset.y) < 5
                    ? 'bg-[#B8860B] text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Image with Focal Point */}
        <div className="relative flex-1 min-h-[400px] bg-gray-900 overflow-hidden">
          <div
            ref={containerRef}
            className="relative w-full h-full cursor-crosshair select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={imageSrc}
              alt="Set focal point"
              className="w-full h-full object-contain"
              draggable={false}
            />

            {/* Crosshair overlay */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${focalPoint.x}%`,
                top: `${focalPoint.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Vertical line */}
              <div className="absolute w-0.5 h-12 bg-white opacity-75 -translate-x-1/2 -translate-y-1/2 shadow-lg" />
              {/* Horizontal line */}
              <div className="absolute w-12 h-0.5 bg-white opacity-75 -translate-x-1/2 -translate-y-1/2 shadow-lg" />
              {/* Center dot */}
              <div className="absolute w-4 h-4 bg-[#B8860B] rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 shadow-lg" />
            </div>

            {/* Grid overlay for guidance */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white opacity-20" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white opacity-20" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white opacity-20" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white opacity-20" />
            </div>
          </div>
        </div>

        {/* Preview strip showing how image will look in banner format */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview (banner crop):</p>
          <div className="h-24 bg-gray-200 rounded overflow-hidden">
            <img
              src={imageSrc}
              alt="Preview"
              className="w-full h-full object-cover"
              style={{ objectPosition: `${previewPosition.x}% ${previewPosition.y}%` }}
            />
          </div>
        </div>

        {/* Position Display */}
        <div className="px-6 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-600">
            Focal Point: <span className="font-mono font-medium">{focalPoint.x.toFixed(0)}% horizontal, {focalPoint.y.toFixed(0)}% vertical</span>
          </p>
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
          <button
            type="button"
            onClick={() => onSave(focalPoint.x, focalPoint.y)}
            className="px-6 py-2 text-sm font-medium text-white bg-[#B8860B] rounded-md hover:bg-[#DAA520]"
          >
            Save Focal Point
          </button>
        </div>
      </div>
    </div>
  );
}
