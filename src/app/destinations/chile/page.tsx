'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Chile() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#2D5016] py-24">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center text-white">
            <motion.h1 
              className="text-4xl sm:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Chile
            </motion.h1>
            <motion.p 
              className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Coming Soon
            </motion.p>
          </div>
        </div>
      </div>

      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-[#8B4513] mb-6">
            Chilean Adventures Coming Soon
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            We're designing incredible experiences across Chile's diverse geography. 
            From the otherworldly landscapes of the Atacama Desert and the pristine wilderness 
            of Patagonia to the mysterious Easter Island and vibrant Santiago.
          </p>
          <p className="text-gray-600 mb-8">
            Explore ancient astronomical sites, world-renowned wine valleys, dramatic fjords, 
            and some of the most unique ecosystems on Earth.
          </p>
          <Link
            href="/contact"
            className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
          >
            Get Notified When Available
          </Link>
        </motion.div>
      </div>
    </div>
  );
}