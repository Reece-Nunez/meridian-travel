'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          
          <p className="text-gray-600 mb-8">
            You don't have permission to access the admin area. This area is restricted to authorized personnel only.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#B8860B] hover:bg-[#DAA520] transition-colors"
            >
              Return to Home
            </Link>
            
            <div className="text-center">
              <Link
                href="/admin/login"
                className="text-[#B8860B] hover:text-[#DAA520] font-medium"
              >
                Try signing in with different credentials
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}