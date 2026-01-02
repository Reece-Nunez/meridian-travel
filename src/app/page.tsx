'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCMSData } from '@/hooks/useContent';
import { Skeleton, ContentLoader } from '@/components/ui/Skeleton';

// Content keys we need from the CMS
const CONTENT_KEYS = [
  'hero_title',
  'hero_subtitle',
  'hero_cta',
  'hero_cta_secondary',
  'about_title',
  'about_content',
  'feature_1_title',
  'feature_1_content',
  'feature_2_title',
  'feature_2_content',
  'feature_3_title',
  'feature_3_content',
  'featured_destinations_title',
  'featured_destinations_subtitle',
  'destination_1_title',
  'destination_1_content',
  'destination_2_title',
  'destination_2_content',
  'destination_3_title',
  'destination_3_content',
  'cta_title',
  'cta_subtitle',
  'cta_button'
];

const SETTING_KEYS = ['company_name'];

export default function Home() {
  const { content, settings, isLoading } = useCMSData(CONTENT_KEYS, SETTING_KEYS);

  // Helper to get content with optional fallback for truly missing content
  const getContent = (key: string) => content[key] || '';
  const getSetting = (key: string) => settings[key] || '';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="https://meridian-travel.s3.us-east-1.amazonaws.com/meridian-header-compressed.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
          <ContentLoader
            isLoading={isLoading}
            skeleton={<Skeleton variant="title" className="h-12 sm:h-16 w-3/4 mx-auto mb-6 bg-white/20" />}
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {getContent('hero_title')}
            </motion.h1>
          </ContentLoader>

          <ContentLoader
            isLoading={isLoading}
            skeleton={<Skeleton variant="paragraph" lines={2} className="max-w-3xl mx-auto mb-8 [&>div]:bg-white/20" />}
          >
            <motion.p
              className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {getContent('hero_subtitle')}
            </motion.p>
          </ContentLoader>

          <ContentLoader
            isLoading={isLoading}
            skeleton={
              <div className="flex gap-4 justify-center">
                <Skeleton variant="button" className="w-40 bg-white/20" />
                <Skeleton variant="button" className="w-40 bg-white/20" />
              </div>
            }
          >
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                href="/destinations"
                className="bg-[#F5F5DC] text-[#8B4513] px-8 py-4 rounded-md text-lg font-medium hover:bg-white transition-colors duration-200"
              >
                {getContent('hero_cta') || 'Explore Destinations'}
              </Link>
              <Link
                href="/quote"
                className="border-2 border-white text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-white hover:text-[#8B4513] transition-colors duration-200"
              >
                {getContent('hero_cta_secondary') || 'Plan Your Journey'}
              </Link>
            </motion.div>
          </ContentLoader>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-16">
          <ContentLoader
            isLoading={isLoading}
            skeleton={<Skeleton variant="title" className="h-10 w-1/2 mx-auto mb-4" />}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-4">
              Why Choose {getSetting('company_name') || 'Us'}?
            </h2>
          </ContentLoader>

          <ContentLoader
            isLoading={isLoading}
            skeleton={<Skeleton variant="paragraph" lines={2} className="max-w-2xl mx-auto" />}
          >
            <p className="text-xl text-gray-800 max-w-2xl mx-auto">
              {getContent('about_content')}
            </p>
          </ContentLoader>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <ContentLoader
              isLoading={isLoading}
              skeleton={
                <>
                  <Skeleton variant="title" className="h-6 w-3/4 mx-auto mb-2" />
                  <Skeleton variant="paragraph" lines={2} className="mx-auto" />
                </>
              }
            >
              <h3 className="text-xl font-bold text-[#8B4513] mb-2">{getContent('feature_1_title')}</h3>
              <p className="text-gray-800">{getContent('feature_1_content')}</p>
            </ContentLoader>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <ContentLoader
              isLoading={isLoading}
              skeleton={
                <>
                  <Skeleton variant="title" className="h-6 w-3/4 mx-auto mb-2" />
                  <Skeleton variant="paragraph" lines={2} className="mx-auto" />
                </>
              }
            >
              <h3 className="text-xl font-bold text-[#8B4513] mb-2">{getContent('feature_2_title')}</h3>
              <p className="text-gray-800">{getContent('feature_2_content')}</p>
            </ContentLoader>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <ContentLoader
              isLoading={isLoading}
              skeleton={
                <>
                  <Skeleton variant="title" className="h-6 w-3/4 mx-auto mb-2" />
                  <Skeleton variant="paragraph" lines={2} className="mx-auto" />
                </>
              }
            >
              <h3 className="text-xl font-bold text-[#8B4513] mb-2">{getContent('feature_3_title')}</h3>
              <p className="text-gray-800">{getContent('feature_3_content')}</p>
            </ContentLoader>
          </div>
        </div>
      </div>

      {/* Featured Destinations */}
      <div className="py-16 bg-[#F5F5DC]">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <ContentLoader
              isLoading={isLoading}
              skeleton={<Skeleton variant="title" className="h-10 w-1/2 mx-auto mb-4" />}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-4">
                {getContent('featured_destinations_title')}
              </h2>
            </ContentLoader>

            <ContentLoader
              isLoading={isLoading}
              skeleton={<Skeleton variant="paragraph" lines={2} className="max-w-2xl mx-auto" />}
            >
              <p className="text-xl text-gray-800 max-w-2xl mx-auto">
                {getContent('featured_destinations_subtitle')}
              </p>
            </ContentLoader>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Destination 1 - Machu Picchu */}
            <motion.div
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="h-48 relative overflow-hidden bg-gray-200">
                <img
                  src="https://meridian-travel.s3.us-east-1.amazonaws.com/machu.webp"
                  alt="Machu Picchu ancient citadel ruins"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-opacity-30 flex items-center justify-center z-10">
                  <ContentLoader
                    isLoading={isLoading}
                    skeleton={<Skeleton variant="title" className="h-8 w-2/3 bg-white/30" />}
                  >
                    <h3 className="text-white text-2xl font-bold">{getContent('destination_1_title')}</h3>
                  </ContentLoader>
                </div>
              </div>
              <div className="p-6">
                <ContentLoader
                  isLoading={isLoading}
                  skeleton={<Skeleton variant="paragraph" lines={2} className="mb-4" />}
                >
                  <p className="text-gray-800 mb-4">{getContent('destination_1_content')}</p>
                </ContentLoader>
                <Link href="/destinations/peru#machu-picchu" className="text-[#8B4513] hover:text-[#B8860B] font-medium">
                  Learn More →
                </Link>
              </div>
            </motion.div>

            {/* Destination 2 - Amazon Rainforest */}
            <motion.div
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="h-48 relative overflow-hidden bg-gray-200">
                <img
                  src="https://meridian-travel.s3.us-east-1.amazonaws.com/rainforest.webp"
                  alt="Amazon rainforest canopy and wildlife"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-opacity-30 flex items-center justify-center z-10">
                  <ContentLoader
                    isLoading={isLoading}
                    skeleton={<Skeleton variant="title" className="h-8 w-2/3 bg-white/30" />}
                  >
                    <h3 className="text-white text-2xl font-bold">{getContent('destination_2_title')}</h3>
                  </ContentLoader>
                </div>
              </div>
              <div className="p-6">
                <ContentLoader
                  isLoading={isLoading}
                  skeleton={<Skeleton variant="paragraph" lines={2} className="mb-4" />}
                >
                  <p className="text-gray-800 mb-4">{getContent('destination_2_content')}</p>
                </ContentLoader>
                <Link href="/destinations/peru#amazon-rainforest" className="text-[#8B4513] hover:text-[#B8860B] font-medium">
                  Learn More →
                </Link>
              </div>
            </motion.div>

            {/* Destination 3 - Sacred Valley */}
            <motion.div
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="h-48 relative overflow-hidden bg-gray-200">
                <img
                  src="https://meridian-travel.s3.us-east-1.amazonaws.com/sacred-valley.webp"
                  alt="Sacred Valley terraced landscapes and Andean villages"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-opacity-30 flex items-center justify-center z-10">
                  <ContentLoader
                    isLoading={isLoading}
                    skeleton={<Skeleton variant="title" className="h-8 w-2/3 bg-white/30" />}
                  >
                    <h3 className="text-white text-2xl font-bold">{getContent('destination_3_title')}</h3>
                  </ContentLoader>
                </div>
              </div>
              <div className="p-6">
                <ContentLoader
                  isLoading={isLoading}
                  skeleton={<Skeleton variant="paragraph" lines={2} className="mb-4" />}
                >
                  <p className="text-gray-800 mb-4">{getContent('destination_3_content')}</p>
                </ContentLoader>
                <Link href="/destinations/peru#sacred-valley" className="text-[#8B4513] hover:text-[#B8860B] font-medium">
                  Learn More →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-[#2D5016]">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <ContentLoader
            isLoading={isLoading}
            skeleton={<Skeleton variant="title" className="h-10 w-2/3 mx-auto mb-4 bg-white/20" />}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {getContent('cta_title')}
            </h2>
          </ContentLoader>

          <ContentLoader
            isLoading={isLoading}
            skeleton={<Skeleton variant="paragraph" lines={1} className="max-w-xl mx-auto mb-8 [&>div]:bg-white/20" />}
          >
            <p className="text-xl text-[#F5F5DC] mb-8">
              {getContent('cta_subtitle')}
            </p>
          </ContentLoader>

          <ContentLoader
            isLoading={isLoading}
            skeleton={<Skeleton variant="button" className="w-48 mx-auto bg-white/20" />}
          >
            <Link
              href="/quote"
              className="bg-[#B8860B] text-[#F5F5DC] px-8 py-4 rounded-md text-lg font-medium hover:bg-[#DAA520] transition-colors duration-200 inline-block"
            >
              {getContent('cta_button') || 'Request Your Custom Quote'}
            </Link>
          </ContentLoader>
        </div>
      </div>
    </div>
  );
}
