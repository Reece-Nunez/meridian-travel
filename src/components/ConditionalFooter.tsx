'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Don't show footer on the homepage (splash page)
  if (pathname === '/') {
    return null;
  }

  return <Footer />;
}
