'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getContentByKey, getSettingByKey, getContentByType, clearContentCache } from '@/lib/content';

export default function About() {
  const [content, setContent] = useState({
    aboutTitle: 'About Meridian Luxury Travel',
    aboutContent: 'At Meridian Luxury Travel, we specialize in crafting tailor-made journeys for discerning travelers who seek more than just a vacation—they seek an experience that resonates deeply. Our focus is on personalized, high-end itineraries that blend exclusivity, comfort, and cultural depth, creating moments that linger long after the journey ends.',
    storyTitle: 'Our Story',
    storyContent: 'Whether it\'s embarking on a private yacht excursion in the Galápagos, watching the sunrise over Machu Picchu, traveling aboard the legendary Hiram Bingham train, or enjoying exclusive access to historic landmarks closed to the public, each journey is designed with meticulous attention to detail. We believe true luxury lies in the combination of iconic destinations and insider access. That means staying in hand-selected accommodations that reflect both elegance and authenticity, traveling with expert local guides who open doors few others can, and enjoying seamless logistics that ensure every step feels effortless. Our mission is simple: to transform travel into curated experiences that elevate exploration into something truly extraordinary. With Meridian Luxury Travel, you don\'t just see the world; you live its most unforgettable stories.',
    companyName: 'Meridian Luxury Travel',
    servicesTitle: 'Our Services',
    servicesContent: 'At every stage, our mission is to elevate travel into an art form—where every journey reflects your unique story, and every detail whispers luxury.'
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Clear cache to get latest content
        clearContentCache();
        
        // Use the new CMS structure with section_key based content
        const [
          aboutPageTitle,
          aboutContent, 
          aboutStoryTitle,
          aboutStoryContent,
          aboutServicesTitle,
          aboutServicesContent,
          companyName
        ] = await Promise.all([
          getContentByKey('about_page_title'),
          getContentByKey('about_content'),
          getContentByKey('about_story_title'), 
          getContentByKey('about_story_content'),
          getContentByKey('about_services_title'),
          getContentByKey('about_services_content'),
          getSettingByKey('company_name')
        ]);

        console.log('About page content loaded:', {
          aboutPageTitle,
          aboutContent: aboutContent?.substring(0, 50) + '...',
          aboutStoryTitle,
          aboutStoryContent: aboutStoryContent?.substring(0, 50) + '...',
          aboutServicesTitle,
          aboutServicesContent: aboutServicesContent?.substring(0, 50) + '...',
          companyName
        });

        setContent({
          aboutTitle: aboutPageTitle || content.aboutTitle,
          aboutContent: aboutContent || content.aboutContent,
          storyTitle: aboutStoryTitle || content.storyTitle,
          storyContent: aboutStoryContent || content.storyContent,
          companyName: companyName || content.companyName,
          servicesTitle: aboutServicesTitle || content.servicesTitle,
          servicesContent: aboutServicesContent || content.servicesContent
        });
      } catch (error) {
        console.log('Using fallback content for about page', error);
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
            src="/about-us.jpg" 
            alt="About us team and travel experiences"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load about-us.jpg');
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {content.aboutTitle}
            </h1>
            <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
              {content.aboutContent}
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-6">
              {content.storyTitle}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {content.storyContent}
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
              Why Choose {content.companyName}?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {content.servicesContent}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                Bespoke Itineraries
              </h3>
              <p className="text-gray-600">
                Customized trips designed around your passions and schedule. Every journey is crafted 
                to reflect your unique interests and travel dreams.
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">
                Exclusive Accommodations
              </h3>
              <p className="text-gray-600">
                Hand-picked 5-star resorts, boutique hideaways, and luxury villas that reflect 
                both elegance and authenticity.
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">
                Private Experiences
              </h3>
              <p className="text-gray-600">
                From cooking with Michelin-starred chefs to after-hours museum tours, 
                exclusive access to experiences few others can provide.
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#8B4513] mb-3">
                Seamless Logistics
              </h3>
              <p className="text-gray-600">
                Private transfers, first-class rail, chartered yachts, and concierge service 
                to ensure every step feels effortless.
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
            At Meridian Luxury Travel, we don't just plan trips—we create transformational experiences. 
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