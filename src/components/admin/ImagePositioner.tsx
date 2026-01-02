'use client';

import { useState, useRef, useEffect } from 'react';

interface ImagePositionerProps {
  imageSrc: string;
  initialX?: number;
  initialY?: number;
  onSave: (x: number, y: number) => void;
  onCancel: () => void;
}

// Banner height matches the actual pages (h-[400px] md:h-[500px])
const BANNER_HEIGHT_DESKTOP = 500;

export default function ImagePositioner({
  imageSrc,
  initialX = 50,
  initialY = 50,
  onSave,
  onCancel,
}: ImagePositionerProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState<'actual' | 'mobile' | 'tablet'>('actual');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: initialX, y: initialY });

  // Track window width for actual aspect ratio calculation
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Calculate aspect ratio based on preview mode
  const getAspectRatio = () => {
    switch (previewMode) {
      case 'mobile':
        return 375 / 400; // Mobile: 375px width, 400px height
      case 'tablet':
        return 768 / 500; // Tablet: 768px width, 500px height
      case 'actual':
      default:
        // Use actual viewport width with desktop banner height
        return windowWidth / BANNER_HEIGHT_DESKTOP;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastPosRef.current.x;
      const deltaY = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.3;
      const newX = Math.max(0, Math.min(100, positionRef.current.x - deltaX * sensitivity));
      const newY = Math.max(0, Math.min(100, positionRef.current.y - deltaY * sensitivity));

      positionRef.current = { x: newX, y: newY };

      // Cancel any pending animation frame
      if (rafId) cancelAnimationFrame(rafId);

      // Use requestAnimationFrame for smooth updates
      rafId = requestAnimationFrame(() => {
        // Direct DOM manipulation for smooth real-time updates
        if (imageRef.current) {
          imageRef.current.style.backgroundPosition = `${newX}% ${newY}%`;
        }
        // Also update state for position display (batched by React)
        setPosition({ x: newX, y: newY });
      });
    };

    const handleMouseUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      setIsDragging(false);
      // Sync final position to state when drag ends
      setPosition({ x: positionRef.current.x, y: positionRef.current.y });
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const presetPositions = [
    { label: 'Top', x: 50, y: 0 },
    { label: 'Center', x: 50, y: 50 },
    { label: 'Bottom', x: 50, y: 100 },
  ];

  const handlePresetClick = (x: number, y: number) => {
    setPosition({ x, y });
    positionRef.current = { x, y };
    // Also update DOM directly for immediate feedback
    if (imageRef.current) {
      imageRef.current.style.backgroundPosition = `${x}% ${y}%`;
    }
  };

  const aspectRatio = getAspectRatio();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Position Image</h3>
          <p className="text-sm text-gray-500 mt-1">
            Preview shows exactly how the banner will appear. Drag to reposition.
          </p>
        </div>

        {/* Controls Row */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Quick Positions */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Quick:</span>
              {presetPositions.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetClick(preset.x, preset.y)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    Math.abs(position.y - preset.y) < 5
                      ? 'bg-[#B8860B] text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Preview Mode Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Preview:</span>
              <button
                type="button"
                onClick={() => setPreviewMode('actual')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  previewMode === 'actual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Your Screen
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('tablet')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  previewMode === 'tablet'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tablet
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  previewMode === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-900 p-6 flex items-center justify-center min-h-[250px] overflow-auto">
          <div
            ref={containerRef}
            className="relative w-full rounded-lg overflow-hidden shadow-2xl"
            style={{
              aspectRatio: aspectRatio,
              maxHeight: '400px',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Use background-image for reliable position control */}
            <div
              ref={imageRef}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: `${position.x}% ${position.y}%`,
                backgroundRepeat: 'no-repeat'
              }}
            />

            {/* Focal point crosshair indicator */}
            <div
              className="absolute pointer-events-none transition-all duration-75"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Crosshair */}
              <div className="relative">
                <div className="absolute w-8 h-0.5 bg-white shadow-lg" style={{ left: '-16px', top: '-1px' }} />
                <div className="absolute w-0.5 h-8 bg-white shadow-lg" style={{ left: '-1px', top: '-16px' }} />
                <div className="w-4 h-4 border-2 border-white rounded-full shadow-lg bg-[#B8860B] bg-opacity-80" />
              </div>
            </div>

            {/* Overlay with drag text */}
            <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
              <span className="text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg shadow-lg">
                {isDragging ? `${position.x.toFixed(0)}%, ${position.y.toFixed(0)}%` : 'Drag to reposition'}
              </span>
            </div>
          </div>
        </div>

        {/* Position Display */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Position: <span className="font-mono font-medium text-gray-900">{position.x.toFixed(0)}% {position.y.toFixed(0)}%</span>
            </p>
            <p className="text-sm text-gray-500">
              {previewMode === 'actual' && `Aspect ratio: ${aspectRatio.toFixed(2)}:1 (${windowWidth}px × ${BANNER_HEIGHT_DESKTOP}px)`}
              {previewMode === 'tablet' && 'Tablet view: 768px × 500px'}
              {previewMode === 'mobile' && 'Mobile view: 375px × 400px'}
            </p>
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
          <button
            type="button"
            onClick={() => onSave(position.x, position.y)}
            className="px-6 py-2 text-sm font-medium text-white bg-[#B8860B] rounded-md hover:bg-[#DAA520]"
          >
            Save Position
          </button>
        </div>
      </div>
    </div>
  );
}
