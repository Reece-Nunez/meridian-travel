'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getSettingByKey } from '@/lib/content';
import SplashNavigation from '@/components/SplashNavigation';

export default function ComingSoon() {
  const [contactInfo, setContactInfo] = useState({
    email: 'chris@meridianluxury.travel',
    phone: '+1 (555) 123-4567',
    address: '123 Travel Way, Adventure City, AC 12345'
  });

  const [emailSignup, setEmailSignup] = useState('');
  const [signupStatus, setSignupStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const [contactEmail, contactPhone, companyAddress] = await Promise.all([
          getSettingByKey('contact_email'),
          getSettingByKey('contact_phone'),
          getSettingByKey('company_address')
        ]);

        setContactInfo({
          email: contactEmail || contactInfo.email,
          phone: contactPhone || contactInfo.phone,
          address: companyAddress || contactInfo.address
        });
      } catch (error) {
        console.log('Settings unavailable, using defaults');
      }
    };

    fetchContactInfo();
  }, []);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStatus('submitting');

    try {
      const response = await fetch('/api/email-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailSignup }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      setSignupStatus('success');
      setEmailSignup('');

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSignupStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Email signup error:', error);
      setSignupStatus('error');

      // Reset error message after 5 seconds
      setTimeout(() => {
        setSignupStatus('idle');
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SplashNavigation />

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/meridian-header.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Full Site Coming Soon
          </motion.h1>
          <motion.p
            className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            We're crafting exceptional luxury travel experiences to South America's most breathtaking destinations. Our full website will launch shortly with exclusive itineraries, expert insights, and seamless booking.
          </motion.p>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="flex flex-col items-center">
              <span className="text-white text-sm mb-2">Scroll to explore</span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Email Signup Section */}
      <div className="py-16 bg-[#8B4513]">
        <div className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Be the First to Know
            </h2>
            <p className="text-xl text-[#F5F5DC] mb-8">
              Join our exclusive list to receive updates about our launch and early access to special offers.
            </p>
            <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                value={emailSignup}
                onChange={(e) => setEmailSignup(e.target.value)}
                className="flex-1 px-6 py-4 rounded-lg text-white placeholder-gray-300 bg-white/10 backdrop-blur-sm border-2 border-[#F5F5DC] focus:outline-none focus:ring-2 focus:ring-[#F5F5DC] focus:border-[#F5F5DC]"
                required
                disabled={signupStatus === 'submitting'}
              />
              <button
                type="submit"
                disabled={signupStatus === 'submitting'}
                className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signupStatus === 'submitting' ? 'Submitting...' : 'Notify Me'}
              </button>
            </form>
            {signupStatus === 'success' && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#B8860B] font-semibold text-base mt-4 bg-white/20 py-2 px-4 rounded-lg inline-block"
              >
                ✓ Thank you! You'll be notified when we launch.
              </motion.p>
            )}
            {signupStatus === 'error' && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-300 font-semibold text-base mt-4"
              >
                Something went wrong. Please try again.
              </motion.p>
            )}
            {signupStatus === 'idle' && (
              <p className="text-[#F5F5DC]/80 text-sm mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-4">
            Coming Soon to Our Platform
          </h2>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto">
            Meridian Luxury Travel is preparing an exceptional online experience featuring everything you need to plan your perfect South American adventure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Luxury Cruises */}
          <motion.div
            className="bg-gradient-to-br from-[#F5F5DC] to-white rounded-xl shadow-lg p-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-[#B8860B] rounded-full flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#8B4513]">Luxury Cruises</h3>
            </div>
            <p className="text-gray-800 mb-4">
              Explore South America's waterways aboard world-class vessels with all-inclusive luxury experiences.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#B8860B] mr-2">•</span>
                <span>Galapagos Islands Expeditions</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B8860B] mr-2">•</span>
                <span>Amazon River Cruises</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B8860B] mr-2">•</span>
                <span>Antarctica & Patagonia Voyages</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B8860B] mr-2">•</span>
                <span>Chilean Fjords Exploration</span>
              </li>
            </ul>
          </motion.div>

          {/* Custom Packages */}
          <motion.div
            className="bg-gradient-to-br from-[#F5F5DC] to-white rounded-xl shadow-lg p-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-[#B8860B] rounded-full flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#8B4513]">Custom Packages</h3>
            </div>
            <p className="text-gray-800 mb-4">
              Tailored itineraries designed around your interests, preferences, and travel style.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#B8860B] mr-2">•</span>
                <span>Private guided tours with local experts</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B8860B] mr-2">•</span>
                <span>Luxury accommodation selections</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B8860B] mr-2">•</span>
                <span>Exclusive access experiences</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#B8860B] mr-2">•</span>
                <span>Seamless travel logistics & support</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Destinations Section */}
      <div className="py-16 bg-[#F5F5DC]">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-4">
              Destinations We Cover
            </h2>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto">
              From ancient ruins to pristine wilderness, explore South America's most captivating locations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-[#8B4513] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#8B4513]">Peru</h3>
              </div>
              <p className="text-gray-700 text-sm">
                Machu Picchu, Sacred Valley, Lima, Cusco, Amazon Rainforest, Lake Titicaca
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-[#8B4513] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#8B4513]">Ecuador & Galapagos</h3>
              </div>
              <p className="text-gray-700 text-sm">
                Galapagos Islands, Quito, Amazon Basin, Otavalo Markets, Cloud Forests
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-[#8B4513] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#8B4513]">Argentina</h3>
              </div>
              <p className="text-gray-700 text-sm">
                Buenos Aires, Patagonia, Iguazu Falls, Mendoza Wine Country, Ushuaia
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-[#8B4513] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#8B4513]">Chile</h3>
              </div>
              <p className="text-gray-700 text-sm">
                Santiago, Atacama Desert, Easter Island, Chilean Fjords, Torres del Paine
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-[#8B4513] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#8B4513]">Brazil</h3>
              </div>
              <p className="text-gray-700 text-sm">
                Rio de Janeiro, Amazon Rainforest, Salvador, Pantanal, Iguazu Falls
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-[#8B4513] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#8B4513]">Antarctica</h3>
              </div>
              <p className="text-gray-700 text-sm">
                Antarctic Peninsula, South Shetland Islands, Drake Passage, Wildlife Expeditions
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-4">
            Why Choose Meridian Luxury Travel?
          </h2>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto">
            We're not just another travel agency. We're your gateway to authentic, transformative experiences in South America.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-16 h-16 bg-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#8B4513] mb-2">Trusted Expertise</h3>
            <p className="text-gray-700 text-sm">
              Years of experience creating unforgettable journeys throughout South America
            </p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#8B4513] mb-2">Local Partnerships</h3>
            <p className="text-gray-700 text-sm">
              Direct relationships with the best guides, hotels, and service providers
            </p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="w-16 h-16 bg-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#8B4513] mb-2">Personalized Service</h3>
            <p className="text-gray-700 text-sm">
              Every itinerary is custom-crafted to match your unique interests and preferences
            </p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="w-16 h-16 bg-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#8B4513] mb-2">24/7 Support</h3>
            <p className="text-gray-700 text-sm">
              Round-the-clock assistance before, during, and after your journey
            </p>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-[#F5F5DC]">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-800">
              Everything you need to know about our upcoming launch
            </p>
          </div>

          <div className="space-y-6">
            <motion.div
              className="bg-white rounded-lg p-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">When will the full website launch?</h3>
              <p className="text-gray-700">
                Our full website is currently under development and will launch in the coming months. Sign up for our email list above to be notified the moment we go live with exclusive early access offers.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">Can I book a trip right now?</h3>
              <p className="text-gray-700">
                Absolutely! While our website is being finalized, our team is actively planning and booking luxury travel experiences. Contact us directly via email or phone (details below) to start planning your dream South American adventure today.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">What types of trips do you offer?</h3>
              <p className="text-gray-700">
                We specialize in luxury cruises (Galapagos, Amazon, Antarctica), custom land packages throughout South America, and combination trips. Every journey is tailored to your interests, whether you're seeking adventure, culture, wildlife, or relaxation.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">How do I get a custom quote?</h3>
              <p className="text-gray-700">
                Simply reach out via email or phone with your travel dates, interests, and preferences. Our travel specialists will work with you to design a personalized itinerary and provide a detailed quote, typically within 24-48 hours.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">What makes your trips "luxury"?</h3>
              <p className="text-gray-700">
                Our trips feature hand-selected 4-5 star accommodations, private guides, exclusive experiences, small group sizes (or private tours), seamless logistics, and personalized service. We focus on quality over quantity, ensuring every moment of your journey is exceptional.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="py-16 bg-[#2D5016]">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Interested in Learning More?
            </h2>
            <p className="text-xl text-[#F5F5DC] mb-4">
              Contact us today to discuss your dream South American adventure.
            </p>
            <p className="text-base text-[#F5F5DC]/80">
              While our full website is under construction, our team is ready to help you plan your perfect luxury escape.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Email</h3>
              <p className="text-[#F5F5DC]">{contactInfo.email}</p>
            </motion.div>

            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Phone</h3>
              <p className="text-[#F5F5DC]">{contactInfo.phone}</p>
            </motion.div>

            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="w-12 h-12 bg-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Address</h3>
              <p className="text-[#F5F5DC]">{contactInfo.address}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
