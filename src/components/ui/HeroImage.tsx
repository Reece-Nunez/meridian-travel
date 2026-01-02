'use client';

interface HeroImageProps {
  desktopSrc: string;      // Cropped image for desktop
  mobileSrc: string;       // Original image for mobile
  alt: string;
  focalX?: number;         // Focal point X for desktop (0-100)
  focalY?: number;         // Focal point Y for desktop (0-100)
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Responsive hero image component that shows:
 * - Original/uncropped image on mobile (with center positioning)
 * - Cropped image on desktop (with custom focal point positioning)
 *
 * Uses CSS show/hide approach for reliable cross-browser support
 */
export function HeroImage({
  desktopSrc,
  mobileSrc,
  alt,
  focalX = 50,
  focalY = 50,
  className = '',
  onError
}: HeroImageProps) {
  return (
    <div className="w-full h-full relative">
      {/* Mobile image - uses original image with focal point positioning */}
      <img
        src={mobileSrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover block md:hidden ${className}`}
        style={{ objectPosition: `${focalX}% ${focalY}%` }}
        onError={onError}
      />
      {/* Desktop image - hidden on mobile */}
      <img
        src={desktopSrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover hidden md:block ${className}`}
        style={{ objectPosition: `${focalX}% ${focalY}%` }}
        onError={onError}
      />
    </div>
  );
}
