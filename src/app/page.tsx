'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-800 h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover the Magic of Peru
          </motion.h1>
          <motion.p 
            className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience the ancient wonders of Machu Picchu, explore the vibrant Amazon rainforest, 
            and immerse yourself in Peru's rich cultural heritage with expertly crafted luxury tours.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link
              href="/destinations"
              className="bg-white text-blue-900 px-8 py-4 rounded-md text-lg font-medium hover:bg-gray-100 transition-colors duration-200"
            >
              Explore Destinations
            </Link>
            <Link
              href="/quote"
              className="border-2 border-white text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-white hover:text-blue-900 transition-colors duration-200"
            >
              Plan Your Journey
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Meridian Travel?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We create personalized luxury adventures that go beyond typical tourist experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Local Knowledge</h3>
            <p className="text-gray-600">
              Our Peru specialists have personally explored every destination we offer, ensuring authentic and meaningful experiences.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tailored Experiences</h3>
            <p className="text-gray-600">
              Every journey is carefully crafted around your interests, travel style, and budget for a truly personal adventure.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              From planning to your safe return home, our dedicated team provides round-the-clock support for peace of mind.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Destinations */}
      <div className="py-16 bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured Peru Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From ancient ruins to natural wonders, discover Peru's most captivating destinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Machu Picchu */}
            <motion.div 
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="h-48 bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Machu Picchu</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Explore the mystical ancient citadel and marvel at Incan engineering prowess.
                </p>
                <Link href="/destinations" className="text-blue-900 hover:text-blue-800 font-medium">
                  Learn More →
                </Link>
              </div>
            </motion.div>

            {/* Amazon Rainforest */}
            <motion.div 
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="h-48 bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Amazon Rainforest</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Immerse yourself in the world's most biodiverse ecosystem with expert naturalist guides.
                </p>
                <Link href="/destinations" className="text-blue-900 hover:text-blue-800 font-medium">
                  Learn More →
                </Link>
              </div>
            </motion.div>

            {/* Sacred Valley */}
            <motion.div 
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="h-48 bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Sacred Valley</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Experience authentic Andean culture and visit traditional markets and villages.
                </p>
                <Link href="/destinations" className="text-blue-900 hover:text-blue-800 font-medium">
                  Learn More →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-blue-900">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Begin Your Peru Adventure?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Let our Peru experts create a personalized itinerary tailored to your dreams and interests.
          </p>
          <Link
            href="/quote"
            className="bg-white text-blue-900 px-8 py-4 rounded-md text-lg font-medium hover:bg-gray-100 transition-colors duration-200"
          >
            Request Your Custom Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
