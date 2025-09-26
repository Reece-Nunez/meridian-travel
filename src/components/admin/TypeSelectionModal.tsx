'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface TypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TypeSelectionModal({ isOpen, onClose }: TypeSelectionModalProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'package' | 'cruise' | null>(null);

  const handleTypeSelect = (type: 'package' | 'cruise') => {
    setSelectedType(type);
    // Navigate to the new page with the type parameter
    router.push(`/admin/packages/new?type=${type}`);
    onClose();
  };

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  What would you like to create?
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {/* Package Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTypeSelect('package')}
                  className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-[#B8860B] hover:bg-[#B8860B]/5 transition-all duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#B8860B] rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Travel Package</h4>
                      <p className="text-sm text-gray-600">
                        Create a custom land-based travel package with accommodations, activities, and itinerary
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Cruise Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTypeSelect('cruise')}
                  className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-[#B8860B] hover:bg-[#B8860B]/5 transition-all duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#B8860B] rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Cruise Package</h4>
                      <p className="text-sm text-gray-600">
                        Create a cruise-based package with ship details, cruise line, cabin categories, and ports
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Cancel Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}