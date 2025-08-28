'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-900">Meridian Travel</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/destinations"
                className="text-gray-700 hover:text-blue-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Destinations
              </Link>
              <Link
                href="/travel-styles"
                className="text-gray-700 hover:text-blue-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Travel Styles
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-blue-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Contact
              </Link>
              <Link
                href="/quote"
                className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Request Quote
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-900"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
            <Link
              href="/destinations"
              className="text-gray-700 hover:text-blue-900 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Destinations
            </Link>
            <Link
              href="/travel-styles"
              className="text-gray-700 hover:text-blue-900 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Travel Styles
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-900 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-blue-900 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/quote"
              className="bg-blue-900 hover:bg-blue-800 text-white block px-3 py-2 rounded-md text-base font-medium mt-4"
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