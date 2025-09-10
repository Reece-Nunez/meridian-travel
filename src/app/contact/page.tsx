'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getContentByKey, getSettingByKey } from '@/lib/content';

export default function Contact() {
  const [content, setContent] = useState({
    pageTitle: 'Contact Us',
    pageSubtitle: 'Ready to begin your Peru adventure? Our travel specialists are here to help you plan the perfect journey.',
    sectionTitle: 'Get in Touch',
    phone: '+1 (555) 012-3456',
    phoneHours: 'Monday - Friday: 9:00 AM - 6:00 PM EST\nSaturday: 10:00 AM - 4:00 PM EST',
    email: 'info@meridiantravel.com',
    emailResponse: 'We respond to all inquiries within 24 hours',
    address: '123 Travel Avenue\nAdventure City, AC 12345\nUnited States',
    emergencyPhone: '+1 (555) 019-9999',
    emergencyText: '24/7 emergency support for travelers',
    quickActionTitle: 'Ready to Start Planning?',
    quickActionContent: 'The fastest way to get your custom Peru itinerary is to request a quote online. Our specialists will contact you within 24 hours.',
    quickActionButton: 'Request Your Quote',
    faqTitle: 'Frequently Asked Questions',
    faq1Question: 'How far in advance should I book my Peru trip?',
    faq1Answer: 'We recommend booking at least 3-6 months in advance, especially for travel during peak season (May-September). Popular experiences like the Inca Trail require permits that sell out quickly, so earlier booking ensures better availability.',
    faq2Question: "What's included in your Peru travel packages?",
    faq2Answer: "Our packages typically include accommodations, transportation, guided tours, entrance fees, and most meals. Each itinerary is custom-built, so inclusions vary based on your preferences and budget. We'll provide a detailed breakdown when we send your quote.",
    faq3Question: 'Do you provide travel insurance recommendations?',
    faq3Answer: 'Yes, we strongly recommend travel insurance for all Peru trips. We can provide recommendations for reputable insurance providers that offer coverage for adventure activities and high-altitude destinations.',
    faq4Question: 'What if I need to change my travel dates?',
    faq4Answer: "We understand that plans can change. Depending on how far in advance you notify us and the specific services booked, we'll work with our partners to minimize any change fees. Our team will guide you through the process.",
    faq5Question: 'Do you offer group discounts?',
    faq5Answer: 'Yes! We offer competitive pricing for groups of 8 or more travelers. Group travel also allows for more customization options and can include private guides and exclusive experiences.',
    faq6Question: 'What support do you provide during my trip?',
    faq6Answer: "You'll have access to our 24/7 emergency support line throughout your journey. We also provide detailed pre-departure information and can assist with any issues that arise during your trip.",
    ctaTitle: 'Still Have Questions?',
    ctaSubtitle: "Our Peru travel specialists are here to help. Don't hesitate to reach out—we love talking about Peru adventures!",
    ctaButton1: 'Call Us Now',
    ctaButton2: 'Send an Email'
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [
          pageTitle,
          pageSubtitle,
          sectionTitle,
          phone,
          phoneHours,
          email,
          emailResponse,
          address,
          emergencyPhone,
          emergencyText,
          quickActionTitle,
          quickActionContent,
          quickActionButton,
          faqTitle,
          faq1Question,
          faq1Answer,
          faq2Question,
          faq2Answer,
          faq3Question,
          faq3Answer,
          faq4Question,
          faq4Answer,
          faq5Question,
          faq5Answer,
          faq6Question,
          faq6Answer,
          ctaTitle,
          ctaSubtitle,
          ctaButton1,
          ctaButton2
        ] = await Promise.all([
          getContentByKey('contact_page_title'),
          getContentByKey('contact_page_subtitle'),
          getContentByKey('contact_section_title'),
          getSettingByKey('contact_phone'),
          getSettingByKey('business_hours'),
          getSettingByKey('contact_email'),
          getContentByKey('contact_email_response'),
          getSettingByKey('company_address'),
          getSettingByKey('emergency_contact'),
          getContentByKey('contact_emergency_text'),
          getContentByKey('contact_quick_action_title'),
          getContentByKey('contact_quick_action_content'),
          getContentByKey('contact_quick_action_button'),
          getContentByKey('contact_faq_title'),
          getContentByKey('contact_faq_1_question'),
          getContentByKey('contact_faq_1_answer'),
          getContentByKey('contact_faq_2_question'),
          getContentByKey('contact_faq_2_answer'),
          getContentByKey('contact_faq_3_question'),
          getContentByKey('contact_faq_3_answer'),
          getContentByKey('contact_faq_4_question'),
          getContentByKey('contact_faq_4_answer'),
          getContentByKey('contact_faq_5_question'),
          getContentByKey('contact_faq_5_answer'),
          getContentByKey('contact_faq_6_question'),
          getContentByKey('contact_faq_6_answer'),
          getContentByKey('contact_cta_title'),
          getContentByKey('contact_cta_subtitle'),
          getContentByKey('contact_cta_button_1'),
          getContentByKey('contact_cta_button_2')
        ]);

        setContent({
          pageTitle: pageTitle || content.pageTitle,
          pageSubtitle: pageSubtitle || content.pageSubtitle,
          sectionTitle: sectionTitle || content.sectionTitle,
          phone: phone || content.phone,
          phoneHours: phoneHours || content.phoneHours,
          email: email || content.email,
          emailResponse: emailResponse || content.emailResponse,
          address: address || content.address,
          emergencyPhone: emergencyPhone || content.emergencyPhone,
          emergencyText: emergencyText || content.emergencyText,
          quickActionTitle: quickActionTitle || content.quickActionTitle,
          quickActionContent: quickActionContent || content.quickActionContent,
          quickActionButton: quickActionButton || content.quickActionButton,
          faqTitle: faqTitle || content.faqTitle,
          faq1Question: faq1Question || content.faq1Question,
          faq1Answer: faq1Answer || content.faq1Answer,
          faq2Question: faq2Question || content.faq2Question,
          faq2Answer: faq2Answer || content.faq2Answer,
          faq3Question: faq3Question || content.faq3Question,
          faq3Answer: faq3Answer || content.faq3Answer,
          faq4Question: faq4Question || content.faq4Question,
          faq4Answer: faq4Answer || content.faq4Answer,
          faq5Question: faq5Question || content.faq5Question,
          faq5Answer: faq5Answer || content.faq5Answer,
          faq6Question: faq6Question || content.faq6Question,
          faq6Answer: faq6Answer || content.faq6Answer,
          ctaTitle: ctaTitle || content.ctaTitle,
          ctaSubtitle: ctaSubtitle || content.ctaSubtitle,
          ctaButton1: ctaButton1 || content.ctaButton1,
          ctaButton2: ctaButton2 || content.ctaButton2
        });
      } catch (error) {
        console.log('Using fallback content for contact page');
      }
    };

    fetchContent();
  }, []);
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/contact.jpg" 
            alt="Contact us for travel planning"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load contact.jpg');
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {content.pageTitle}
            </h1>
            <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
              {content.pageSubtitle}
            </p>
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
            <h2 className="text-3xl font-bold text-[#8B4513] mb-8">
              {content.sectionTitle}
            </h2>
            
            <div className="space-y-8">
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
                  <p className="text-gray-600 mb-2">
                    <a href={`tel:${content.phone.replace(/[^+\d]/g, '')}`} className="hover:text-[#B8860B] transition-colors">
                      {content.phone}
                    </a>
                  </p>
                  <p className="text-sm text-gray-500">
                    {content.phoneHours.split('\n').map((line, idx) => (
                      <span key={idx}>
                        {line}
                        {idx < content.phoneHours.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

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
                  <p className="text-gray-600 mb-2">
                    <a href={`mailto:${content.email}`} className="hover:text-[#B8860B] transition-colors">
                      {content.email}
                    </a>
                  </p>
                  <p className="text-sm text-gray-500">
                    {content.emailResponse}
                  </p>
                </div>
              </div>

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
                  <p className="text-gray-600">
                    {content.address.split('\n').map((line, idx) => (
                      <span key={idx}>
                        {line}
                        {idx < content.address.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

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
                  <p className="text-gray-600 mb-2">
                    <a href={`tel:${content.emergencyPhone.replace(/[^+\d]/g, '')}`} className="hover:text-[#B8860B] transition-colors">
                      {content.emergencyPhone}
                    </a>
                  </p>
                  <p className="text-sm text-gray-500">
                    {content.emergencyText}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-12 p-6 bg-[#F5F5DC] rounded-lg">
              <h3 className="text-lg font-semibold text-[#8B4513] mb-4">
                {content.quickActionTitle}
              </h3>
              <p className="text-gray-600 mb-6">
                {content.quickActionContent}
              </p>
              <Link
                href="/quote"
                className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                {content.quickActionButton}
              </Link>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-[#8B4513] mb-8">
              {content.faqTitle}
            </h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                  {content.faq1Question}
                </h3>
                <p className="text-gray-600">
                  {content.faq1Answer}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                  {content.faq2Question}
                </h3>
                <p className="text-gray-600">
                  {content.faq2Answer}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                  {content.faq3Question}
                </h3>
                <p className="text-gray-600">
                  {content.faq3Answer}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                  {content.faq4Question}
                </h3>
                <p className="text-gray-600">
                  {content.faq4Answer}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                  {content.faq5Question}
                </h3>
                <p className="text-gray-600">
                  {content.faq5Answer}
                </p>
              </div>

              <div className="pb-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                  {content.faq6Question}
                </h3>
                <p className="text-gray-600">
                  {content.faq6Answer}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#F5F5DC] py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#8B4513] mb-4">
            {content.ctaTitle}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {content.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${content.phone.replace(/[^+\d]/g, '')}`}
              className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
            >
              {content.ctaButton1}
            </a>
            <a
              href={`mailto:${content.email}`}
              className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
            >
              {content.ctaButton2}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}