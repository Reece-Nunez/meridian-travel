'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCMSData } from '@/hooks/useContent';
import { useHeroSettings } from '@/hooks/useHeroSettings';
import { Skeleton, ContentLoader } from '@/components/ui/Skeleton';
import { HeroImage } from '@/components/ui/HeroImage';

// Content keys we need from the CMS
const CONTENT_KEYS = [
  'contact_page_title',
  'contact_page_subtitle',
  'contact_section_title',
  'contact_email_response',
  'contact_emergency_text',
  'contact_quick_action_title',
  'contact_quick_action_content',
  'contact_quick_action_button',
  'contact_faq_title',
  'contact_faq_1_question',
  'contact_faq_1_answer',
  'contact_faq_2_question',
  'contact_faq_2_answer',
  'contact_faq_3_question',
  'contact_faq_3_answer',
  'contact_faq_4_question',
  'contact_faq_4_answer',
  'contact_faq_5_question',
  'contact_faq_5_answer',
  'contact_faq_6_question',
  'contact_faq_6_answer',
  'contact_cta_title',
  'contact_cta_subtitle',
  'contact_cta_button_1',
  'contact_cta_button_2'
];

const SETTING_KEYS = [
  'contact_phone',
  'business_hours',
  'contact_email',
  'company_address',
  'emergency_contact'
];

export default function Contact() {
  // Hero image settings from database
  const heroSettings = useHeroSettings('contact', 'https://meridian-travel.s3.us-east-1.amazonaws.com/contact.webp');

  const { content, settings, isLoading } = useCMSData(CONTENT_KEYS, SETTING_KEYS);

  // Helper to get content
  const getContent = (key: string) => content[key] || '';
  const getSetting = (key: string) => settings[key] || '';

  // Formatted values
  const phone = getSetting('contact_phone');
  const phoneHref = phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : '#';
  const email = getSetting('contact_email');
  const emailHref = email ? `mailto:${email}` : '#';
  const businessHours = getSetting('business_hours');
  const address = getSetting('company_address');
  const emergencyPhone = getSetting('emergency_contact');
  const emergencyPhoneHref = emergencyPhone ? `tel:${emergencyPhone.replace(/[^+\d]/g, '')}` : '#';

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <HeroImage
            desktopSrc={heroSettings.imageUrl}
            mobileSrc={heroSettings.originalImageUrl}
            alt="Contact Meridian Luxury Travel"
            focalX={heroSettings.focalX}
            focalY={heroSettings.focalY}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: heroSettings.overlayOpacity }}
          ></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white max-w-4xl">
            <ContentLoader
              isLoading={isLoading}
              skeleton={<Skeleton variant="title" className="h-12 w-2/3 mx-auto mb-4 bg-white/20" />}
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                {getContent('contact_page_title') || 'Contact Us'}
              </h1>
            </ContentLoader>
            <ContentLoader
              isLoading={isLoading}
              skeleton={<Skeleton variant="paragraph" lines={2} className="max-w-3xl mx-auto [&>div]:bg-white/20" />}
            >
              <p className="text-xl sm:text-2xl max-w-3xl mx-auto">
                {getContent('contact_page_subtitle')}
              </p>
            </ContentLoader>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ContentLoader
              isLoading={isLoading}
              skeleton={<Skeleton variant="title" className="h-9 w-1/2 mb-8" />}
            >
              <h2 className="text-3xl font-bold text-[#8B4513] mb-8">
                {getContent('contact_section_title') || 'Get in Touch'}
              </h2>
            </ContentLoader>

            <div className="space-y-8">
              {/* Phone */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-[#B8860B] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                    Phone
                  </h3>
                  <ContentLoader
                    isLoading={isLoading}
                    skeleton={
                      <div className="space-y-2">
                        <Skeleton variant="text" className="h-5 w-36" />
                        <Skeleton variant="text" className="h-4 w-48" />
                        <Skeleton variant="text" className="h-4 w-44" />
                      </div>
                    }
                  >
                    <p className="text-gray-600 mb-2">
                      <a href={phoneHref} className="hover:text-[#B8860B] transition-colors">
                        {phone}
                      </a>
                    </p>
                    <p className="text-sm text-gray-500">
                      {businessHours?.split('\n').map((line: string, idx: number) => (
                        <span key={idx}>
                          {line}
                          {idx < (businessHours?.split('\n').length || 1) - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </ContentLoader>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-[#B8860B] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                    Email
                  </h3>
                  <ContentLoader
                    isLoading={isLoading}
                    skeleton={
                      <div className="space-y-2">
                        <Skeleton variant="text" className="h-5 w-48" />
                        <Skeleton variant="text" className="h-4 w-56" />
                      </div>
                    }
                  >
                    <p className="text-gray-600 mb-2">
                      <a href={emailHref} className="hover:text-[#B8860B] transition-colors">
                        {email}
                      </a>
                    </p>
                    <p className="text-sm text-gray-500">
                      {getContent('contact_email_response')}
                    </p>
                  </ContentLoader>
                </div>
              </div>

              {/* Office */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-[#B8860B] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                    Office
                  </h3>
                  <ContentLoader
                    isLoading={isLoading}
                    skeleton={
                      <div className="space-y-2">
                        <Skeleton variant="text" className="h-5 w-36" />
                        <Skeleton variant="text" className="h-5 w-44" />
                        <Skeleton variant="text" className="h-5 w-32" />
                      </div>
                    }
                  >
                    <p className="text-gray-600">
                      {address?.split('\n').map((line: string, idx: number) => (
                        <span key={idx}>
                          {line}
                          {idx < (address?.split('\n').length || 1) - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </ContentLoader>
                </div>
              </div>

              {/* Emergency Support */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-[#B8860B] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                    Emergency Support
                  </h3>
                  <ContentLoader
                    isLoading={isLoading}
                    skeleton={
                      <div className="space-y-2">
                        <Skeleton variant="text" className="h-5 w-36" />
                        <Skeleton variant="text" className="h-4 w-52" />
                      </div>
                    }
                  >
                    <p className="text-gray-600 mb-2">
                      <a href={emergencyPhoneHref} className="hover:text-[#B8860B] transition-colors">
                        {emergencyPhone}
                      </a>
                    </p>
                    <p className="text-sm text-gray-500">
                      {getContent('contact_emergency_text')}
                    </p>
                  </ContentLoader>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-12 p-6 bg-[#F5F5DC] rounded-lg">
              <ContentLoader
                isLoading={isLoading}
                skeleton={
                  <div className="space-y-4">
                    <Skeleton variant="title" className="h-6 w-2/3" />
                    <Skeleton variant="paragraph" lines={2} />
                    <Skeleton variant="text" className="h-12 w-40" />
                  </div>
                }
              >
                <h3 className="text-lg font-semibold text-[#8B4513] mb-4">
                  {getContent('contact_quick_action_title') || 'Ready to Start Planning?'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {getContent('contact_quick_action_content')}
                </p>
                <Link
                  href="/quote"
                  className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-6 py-3 rounded-md font-medium transition-colors duration-200"
                >
                  {getContent('contact_quick_action_button') || 'Request Your Quote'}
                </Link>
              </ContentLoader>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ContentLoader
              isLoading={isLoading}
              skeleton={<Skeleton variant="title" className="h-9 w-3/4 mb-8" />}
            >
              <h2 className="text-3xl font-bold text-[#8B4513] mb-8">
                {getContent('contact_faq_title') || 'Frequently Asked Questions'}
              </h2>
            </ContentLoader>

            <div className="space-y-6">
              {/* FAQ 1 */}
              <div className="border-b border-gray-200 pb-6">
                <ContentLoader
                  isLoading={isLoading}
                  skeleton={
                    <div className="space-y-3">
                      <Skeleton variant="text" className="h-6 w-5/6" />
                      <Skeleton variant="paragraph" lines={3} />
                    </div>
                  }
                >
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                    {getContent('contact_faq_1_question')}
                  </h3>
                  <p className="text-gray-600">
                    {getContent('contact_faq_1_answer')}
                  </p>
                </ContentLoader>
              </div>

              {/* FAQ 2 */}
              <div className="border-b border-gray-200 pb-6">
                <ContentLoader
                  isLoading={isLoading}
                  skeleton={
                    <div className="space-y-3">
                      <Skeleton variant="text" className="h-6 w-4/5" />
                      <Skeleton variant="paragraph" lines={3} />
                    </div>
                  }
                >
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                    {getContent('contact_faq_2_question')}
                  </h3>
                  <p className="text-gray-600">
                    {getContent('contact_faq_2_answer')}
                  </p>
                </ContentLoader>
              </div>

              {/* FAQ 3 */}
              <div className="border-b border-gray-200 pb-6">
                <ContentLoader
                  isLoading={isLoading}
                  skeleton={
                    <div className="space-y-3">
                      <Skeleton variant="text" className="h-6 w-3/4" />
                      <Skeleton variant="paragraph" lines={2} />
                    </div>
                  }
                >
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                    {getContent('contact_faq_3_question')}
                  </h3>
                  <p className="text-gray-600">
                    {getContent('contact_faq_3_answer')}
                  </p>
                </ContentLoader>
              </div>

              {/* FAQ 4 */}
              <div className="border-b border-gray-200 pb-6">
                <ContentLoader
                  isLoading={isLoading}
                  skeleton={
                    <div className="space-y-3">
                      <Skeleton variant="text" className="h-6 w-2/3" />
                      <Skeleton variant="paragraph" lines={2} />
                    </div>
                  }
                >
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                    {getContent('contact_faq_4_question')}
                  </h3>
                  <p className="text-gray-600">
                    {getContent('contact_faq_4_answer')}
                  </p>
                </ContentLoader>
              </div>

              {/* FAQ 5 */}
              <div className="border-b border-gray-200 pb-6">
                <ContentLoader
                  isLoading={isLoading}
                  skeleton={
                    <div className="space-y-3">
                      <Skeleton variant="text" className="h-6 w-1/2" />
                      <Skeleton variant="paragraph" lines={2} />
                    </div>
                  }
                >
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                    {getContent('contact_faq_5_question')}
                  </h3>
                  <p className="text-gray-600">
                    {getContent('contact_faq_5_answer')}
                  </p>
                </ContentLoader>
              </div>

              {/* FAQ 6 */}
              <div className="pb-6">
                <ContentLoader
                  isLoading={isLoading}
                  skeleton={
                    <div className="space-y-3">
                      <Skeleton variant="text" className="h-6 w-3/5" />
                      <Skeleton variant="paragraph" lines={2} />
                    </div>
                  }
                >
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                    {getContent('contact_faq_6_question')}
                  </h3>
                  <p className="text-gray-600">
                    {getContent('contact_faq_6_answer')}
                  </p>
                </ContentLoader>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#F5F5DC] py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <ContentLoader
            isLoading={isLoading}
            skeleton={
              <div className="space-y-4">
                <Skeleton variant="title" className="h-9 w-1/2 mx-auto" />
                <Skeleton variant="paragraph" lines={2} className="max-w-2xl mx-auto" />
              </div>
            }
          >
            <h2 className="text-3xl font-bold text-[#8B4513] mb-4">
              {getContent('contact_cta_title') || 'Still Have Questions?'}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {getContent('contact_cta_subtitle')}
            </p>
          </ContentLoader>
          <ContentLoader
            isLoading={isLoading}
            skeleton={
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Skeleton variant="text" className="h-14 w-40" />
                <Skeleton variant="text" className="h-14 w-40" />
              </div>
            }
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={phoneHref}
                className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
              >
                {getContent('contact_cta_button_1') || 'Call Us Now'}
              </a>
              <a
                href={emailHref}
                className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
              >
                {getContent('contact_cta_button_2') || 'Send an Email'}
              </a>
            </div>
          </ContentLoader>
        </div>
      </div>
    </div>
  );
}
