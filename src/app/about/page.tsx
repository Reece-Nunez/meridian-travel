'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCMSData } from '@/hooks/useContent';
import { useHeroSettings } from '@/hooks/useHeroSettings';
import { Skeleton, ContentLoader } from '@/components/ui/Skeleton';
import { HeroImage } from '@/components/ui/HeroImage';

const CONTENT_KEYS = [
  'about_page_title',
  'about_content',
  'about_story_title',
  'about_story_content',
  'about_services_title',
  'about_services_content',
  'about_commitment_cta'
];

const SETTING_KEYS = ['company_name'];

const SERVICE_CARDS = [
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h6M7 11h6m-6 4h3" />,
    title: 'Bespoke Itineraries',
    description: 'Customized trips designed around your passions and schedule. Every journey is crafted to reflect your unique interests and travel dreams.',
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />,
    title: 'Exclusive Accommodations',
    description: 'Hand-picked 5-star resorts, boutique hideaways, and luxury villas that reflect both elegance and authenticity.',
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
    title: 'Private Experiences',
    description: 'From cooking with Michelin-starred chefs to after-hours museum tours, exclusive access to experiences few others can provide.',
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />,
    title: 'Seamless Logistics',
    description: 'Private transfers, first-class rail, chartered yachts, and concierge service to ensure every step feels effortless.',
  },
];

export default function About() {
  const heroSettings = useHeroSettings('about', 'https://meridian-travel.s3.us-east-1.amazonaws.com/about-us.webp');
  const { content, settings, isLoading } = useCMSData(CONTENT_KEYS, SETTING_KEYS);

  const getContent = (key: string) => content[key] || '';
  const getSetting = (key: string) => settings[key] || '';

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <HeroImage
            desktopSrc={heroSettings.imageUrl}
            mobileSrc={heroSettings.originalImageUrl}
            alt="About Meridian Luxury Travel"
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
                {getContent('about_page_title') || 'About Us'}
              </h1>
            </ContentLoader>
            <ContentLoader
              isLoading={isLoading}
              skeleton={<Skeleton variant="paragraph" lines={3} className="max-w-3xl mx-auto [&>div]:bg-white/20" />}
            >
              <p className="text-xl sm:text-2xl max-w-3xl mx-auto">
                {getContent('about_content')}
              </p>
            </ContentLoader>
          </div>
        </div>
      </div>

      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <ContentLoader
              isLoading={isLoading}
              skeleton={<Skeleton variant="title" className="h-10 w-1/3 mx-auto mb-6" />}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-6">
                {getContent('about_story_title') || 'Our Story'}
              </h2>
            </ContentLoader>
            <ContentLoader
              isLoading={isLoading}
              skeleton={<Skeleton variant="paragraph" lines={5} className="mx-auto" />}
            >
              <p className="text-lg text-gray-600 leading-relaxed">
                {getContent('about_story_content')}
              </p>
            </ContentLoader>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-[#8B4513] mb-4">
                Luxury Travel Specialists Since Day One
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

      <div className="py-16 bg-[#F5F5DC]">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {getContent('about_services_content')}
              </p>
            </ContentLoader>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICE_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                className="bg-white p-8 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * (i + 1) }}
              >
                <div className="w-12 h-12 bg-[#B8860B] rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {card.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#8B4513] mb-3">{card.title}</h3>
                <p className="text-gray-600">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-6">
            Our Commitment to You
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            At every stage, our mission is to elevate travel into an art form—where every journey reflects your unique story, and every detail whispers luxury.
          </p>
          <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            Your dreams become our mission. Your adventure becomes our passion. Let us show you
            why Meridian Luxury Travel will become one of the most meaningful travel experiences of your life.
          </p>
          <Link
            href="/quote"
            className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
          >
            {getContent('about_commitment_cta') || 'Start Planning Your Peru Adventure'}
          </Link>
        </div>
      </div>
    </div>
  );
}
