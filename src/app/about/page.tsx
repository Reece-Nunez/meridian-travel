'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-[#2D5016] py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              About Meridian Travel
            </h1>
            <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
              Your trusted Peru travel specialists, dedicated to creating extraordinary adventures 
              that connect you with the heart of this remarkable country.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-6">
              Our Story
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Founded by passionate travelers who fell in love with Peru's incredible diversity, 
              Meridian Travel was born from a desire to share authentic, transformative experiences 
              with fellow adventurers. We believe that travel should be more than just visiting places—it 
              should be about connecting with cultures, understanding histories, and creating memories that last a lifetime.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-[#8B4513] mb-4">
                Peru Specialists Since Day One
              </h3>
              <p className="text-gray-600 mb-4">
                While other travel companies try to cover the entire world, we've chosen to focus 
                exclusively on Peru and the surrounding regions. This specialization allows us to 
                offer unparalleled expertise and insider access to experiences that other travelers simply can't find.
              </p>
              <p className="text-gray-600">
                Our team has personally explored every destination we recommend, from the ancient 
                citadels of the Sacred Valley to the remote tributaries of the Amazon rainforest. 
                We know the best local guides, the most authentic experiences, and the hidden gems 
                that make Peru truly magical.
              </p>
            </div>
            <div className="bg-[#B8860B] h-64 rounded-lg flex items-center justify-center">
              <p className="text-[#F5F5DC] text-xl font-semibold text-center px-8">
                "Every journey we create is a masterpiece<br />crafted from local knowledge<br />and genuine passion."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-16 bg-[#F5F5DC]">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-4">
              Why Choose Meridian Travel?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're not just another travel agency. We're your Peru adventure specialists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-[#B8860B] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h6M7 11h6m-6 4h3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">
                Local Expertise
              </h3>
              <p className="text-gray-600">
                Our Peru specialists have lived and worked in the country, building relationships 
                with local communities and discovering authentic experiences off the beaten path.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-[#B8860B] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">
                Personalized Service
              </h3>
              <p className="text-gray-600">
                Every itinerary is custom-crafted based on your interests, budget, and travel style. 
                No two Meridian Travel journeys are exactly alike.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="w-12 h-12 bg-[#B8860B] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                From the moment you book until you return home safely, our team provides 
                round-the-clock support to ensure your peace of mind.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-[#B8860B] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">
                Fair Pricing
              </h3>
              <p className="text-gray-600">
                We believe in transparent, fair pricing with no hidden fees. You'll know exactly 
                what you're paying for and why it's worth every penny.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="w-12 h-12 bg-[#B8860B] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">
                Sustainable Tourism
              </h3>
              <p className="text-gray-600">
                We partner with local communities and eco-conscious providers to ensure your 
                travel positively impacts Peru's people and environment.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="w-12 h-12 bg-[#B8860B] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">
                Flexible Planning
              </h3>
              <p className="text-gray-600">
                Whether you prefer luxury accommodations or authentic homestays, adventure activities 
                or cultural immersion, we adapt to your travel preferences.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Our Commitment */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-6">
            Our Commitment to You
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            At Meridian Travel, we don't just plan trips—we create transformational experiences. 
            We're committed to showing you the Peru that lives beyond the guidebooks, the Peru 
            that captures hearts and changes perspectives. Every journey we craft is designed to 
            connect you deeply with this incredible country's landscapes, cultures, and people.
          </p>
          <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            Your dreams become our mission. Your adventure becomes our passion. Let us show you 
            why Peru will become one of the most meaningful travel experiences of your life.
          </p>
          <Link
            href="/quote"
            className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
          >
            Start Planning Your Peru Adventure
          </Link>
        </div>
      </div>
    </div>
  );
}