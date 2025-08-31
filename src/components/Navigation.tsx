'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false);

  return (
    <nav className="bg-[#F5F5DC] shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Meridian Luxury Travel" 
                className="h-20 w-auto"
                onError={(e) => {
                  console.error('Failed to load logo.png');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <div className="relative">
                <button
                  onClick={() => setIsDestinationsOpen(!isDestinationsOpen)}
                  onMouseEnter={() => setIsDestinationsOpen(true)}
                  onMouseLeave={() => setIsDestinationsOpen(false)}
                  className="text-[#8B4513] hover:text-[#B8860B] px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  Destinations
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {isDestinationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                      onMouseEnter={() => setIsDestinationsOpen(true)}
                      onMouseLeave={() => setIsDestinationsOpen(false)}
                    >
                      <div className="py-1">
                        <Link
                          href="/destinations/peru"
                          className="block px-4 py-2 text-sm text-[#8B4513] hover:bg-gray-50 hover:text-[#B8860B]"
                        >
                          Peru
                        </Link>
                        <div className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                          Galapagos/Ecuador - Coming Soon
                        </div>
                        <div className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                          Brazil - Coming Soon
                        </div>
                        <div className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                          Argentina - Coming Soon
                        </div>
                        <div className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                          Chile - Coming Soon
                        </div>
                        <div className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                          Antarctica - Coming Soon
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link
                href="/travel-styles"
                className="text-[#8B4513] hover:text-[#B8860B] px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Travel Styles
              </Link>
              <Link
                href="/about"
                className="text-[#8B4513] hover:text-[#B8860B] px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-[#8B4513] hover:text-[#B8860B] px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Contact
              </Link>
              <Link
                href="/quote"
                className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Request Quote
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#8B4513] hover:text-[#B8860B] hover:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#B8860B]"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#F5F5DC] border-t border-gray-200">
              <div>
                <button
                  onClick={() => setIsDestinationsOpen(!isDestinationsOpen)}
                  className="text-[#8B4513] hover:text-[#B8860B] w-full text-left px-3 py-2 text-base font-medium flex items-center justify-between"
                >
                  Destinations
                  <svg className={`h-4 w-4 transform transition-transform ${isDestinationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {isDestinationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-6 space-y-1">
                        <Link
                          href="/destinations/peru"
                          className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-sm"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Peru
                        </Link>
                        <div className="block px-3 py-2 text-sm text-gray-400">
                          Galapagos/Ecuador - Coming Soon
                        </div>
                        <div className="block px-3 py-2 text-sm text-gray-400">
                          Brazil - Coming Soon
                        </div>
                        <div className="block px-3 py-2 text-sm text-gray-400">
                          Argentina - Coming Soon
                        </div>
                        <div className="block px-3 py-2 text-sm text-gray-400">
                          Chile - Coming Soon
                        </div>
                        <div className="block px-3 py-2 text-sm text-gray-400">
                          Antarctica - Coming Soon
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link
                href="/travel-styles"
                className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Travel Styles
              </Link>
              <Link
                href="/about"
                className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/quote"
                className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] block px-3 py-2 rounded-md text-base font-medium mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Request Quote
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}