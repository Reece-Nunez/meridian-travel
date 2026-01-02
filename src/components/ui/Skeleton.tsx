'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'title' | 'paragraph' | 'button' | 'image' | 'card';
  lines?: number;
  animate?: boolean;
}

// Base skeleton with shimmer animation
export function Skeleton({
  className = '',
  variant = 'text',
  lines = 1,
  animate = true
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 rounded';
  const shimmerClasses = animate ? 'animate-pulse' : '';

  const variantClasses = {
    text: 'h-4 w-3/4',
    title: 'h-8 w-1/2',
    paragraph: 'h-4 w-full',
    button: 'h-12 w-32',
    image: 'h-48 w-full',
    card: 'h-64 w-full'
  };

  if (variant === 'paragraph' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${shimmerClasses} h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${shimmerClasses} ${variantClasses[variant]} ${className}`} />
  );
}

// Hero section skeleton
export function HeroSkeleton() {
  return (
    <div className="relative h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-300 animate-pulse" />
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <Skeleton variant="title" className="h-12 sm:h-16 w-3/4 mx-auto mb-6" />
        <Skeleton variant="paragraph" lines={2} className="max-w-2xl mx-auto mb-8" />
        <div className="flex gap-4 justify-center">
          <Skeleton variant="button" className="w-40" />
          <Skeleton variant="button" className="w-40" />
        </div>
      </div>
    </div>
  );
}

// Section skeleton (for about, services, etc.)
export function SectionSkeleton({ hasImage = false }: { hasImage?: boolean }) {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${hasImage ? 'lg:grid-cols-2' : ''} gap-12 items-center`}>
          <div className="space-y-6">
            <Skeleton variant="title" className="h-10 w-2/3" />
            <Skeleton variant="paragraph" lines={4} />
            <Skeleton variant="button" />
          </div>
          {hasImage && (
            <Skeleton variant="image" className="h-80 rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
}

// Card grid skeleton
export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Skeleton variant="image" className="h-48" />
          <div className="p-6 space-y-4">
            <Skeleton variant="title" className="h-6 w-3/4" />
            <Skeleton variant="paragraph" lines={2} />
            <Skeleton variant="button" className="w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Content wrapper that shows skeleton while loading
interface ContentLoaderProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ContentLoader({ isLoading, skeleton, children, className = '' }: ContentLoaderProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // During SSR and initial hydration, always show skeleton to avoid mismatch
  if (!hasMounted || isLoading) {
    return <div className={className}>{skeleton}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Text content that shows skeleton while loading
interface TextLoaderProps {
  isLoading: boolean;
  content: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  skeletonClassName?: string;
  lines?: number;
}

export function TextLoader({
  isLoading,
  content,
  as: Component = 'p',
  className = '',
  skeletonClassName = '',
  lines = 1
}: TextLoaderProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // During SSR and initial hydration, always show skeleton
  if (!hasMounted || isLoading) {
    const variant = ['h1', 'h2', 'h3'].includes(Component) ? 'title' : 'paragraph';
    return <Skeleton variant={variant} lines={lines} className={skeletonClassName} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Component className={className}>{content}</Component>
    </motion.div>
  );
}
