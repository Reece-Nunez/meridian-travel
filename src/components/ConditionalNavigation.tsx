'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();

  // Don't show navigation on the homepage (splash page)
  if (pathname === '/') {
    return null;
  }

  return <Navigation />;
}
