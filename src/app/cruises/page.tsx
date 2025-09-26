'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getContentByKey, getSettingByKey } from '@/lib/content';
import { supabase } from '@/lib/supabase';
import { TripPackage } from '@/types/database';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Cruises() {
  const [content, setContent] = useState({
    cruisesTitle: '',
    cruisesContent: '',
    companyName: '',
    accommodationsTitle: '',
    accommodationsSubtitle: '',
    itinerariesTitle: '',
    itinerariesSubtitle: '',
    pricingTitle: '',
    pricingSubtitle: '',
    includedTitle: '',
    additionalTitle: '',
    bookingTitle: '',
    bookingSubtitle: '',
    bookingButton: ''
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [cruisePackages, setCruisePackages] = useState<TripPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const slideImages = [
    {
      src: '/galapagos-1.jpg',
      alt: 'Sea lions basking on volcanic rocks',
      caption: 'Meet the Galapagos sea lions up close'
    },
    {
      src: '/galapagos-2.jpg',
      alt: 'Giant tortoise in natural habitat',
      caption: 'Encounter the famous Galapagos giant tortoises'
    },
    {
      src: '/galapagos-3.jpg',
      alt: 'Blue-footed booby birds',
      caption: 'Observe unique bird species like the blue-footed booby'
    },
    {
      src: '/galapagos-4.webp',
      alt: 'Volcanic landscape of the islands',
      caption: 'Explore dramatic volcanic landscapes'
    },
    {
      src: '/galapagos-5.jpg',
      alt: 'Snorkeling with marine life',
      caption: 'Snorkel with incredible marine wildlife'
    }
  ];

  const cabinTypes = [
    {
      name: 'Standard Plus',
      image: '/cabin-standard-plus.jpg',
      size: '160 sq ft',
      features: ['Ocean view porthole', 'Twin or double bed', 'Private bathroom', 'Air conditioning', 'Storage space'],
      description: 'Comfortable and well-appointed cabins with ocean views through portholes.'
    },
    {
      name: 'Superior',
      image: '/cabin-superior.jpg',
      size: '200 sq ft',
      features: ['Large panoramic window', 'Queen bed', 'Sitting area', 'Premium amenities', 'Mini-bar'],
      description: 'Spacious cabins with large windows offering stunning ocean panoramas.'
    },
    {
      name: 'Premium',
      image: '/cabin-premium.jpg',
      size: '240 sq ft',
      features: ['Floor-to-ceiling windows', 'King bed', 'Separate seating area', 'Premium bath amenities', 'Room service'],
      description: 'Luxurious cabins with expansive windows and premium appointments.'
    },
    {
      name: 'Premium Plus',
      image: '/cabin-premium-plus.jpg',
      size: '280 sq ft',
      features: ['Private balcony', 'King bed', 'Living area', 'Marble bathroom', 'Butler service'],
      description: 'Elegant cabins featuring private balconies for ultimate privacy and comfort.'
    },
    {
      name: 'Junior Suite',
      image: '/cabin-junior-suite.jpg',
      size: '320 sq ft',
      features: ['Large private balcony', 'Separate bedroom', 'Living room', 'Marble bathroom with tub', 'Concierge service'],
      description: 'Spacious suites with separate living areas and oversized balconies.'
    },
    {
      name: 'Master Suite',
      image: '/cabin-master-suite.jpg',
      size: '400 sq ft',
      features: ['Wraparound balcony', 'King bedroom suite', 'Separate living room', 'Luxury bathroom', 'Personal butler'],
      description: 'Our most luxurious accommodations with wraparound balconies and premium services.'
    },
    {
      name: 'Owner\'s Suite',
      image: '/cabin-owners-suite.jpg',
      size: '500 sq ft',
      features: ['Private deck', 'Master bedroom', 'Full living room', 'Dining area', 'Dedicated butler service'],
      description: 'The pinnacle of luxury with private decks and unparalleled space and service.'
    }
  ];

  // React Slick settings for cabin carousel
  const cabinSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ],
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  // Custom arrow components
  function NextArrow(props: any) {
    const { onClick } = props;
    return (
      <button
        onClick={onClick}
        className="absolute -right-12 top-1/2 transform -translate-y-1/2 text-[#B8860B] hover:text-[#DAA520] transition-all duration-200 z-10"
        style={{ display: 'block' }}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  function PrevArrow(props: any) {
    const { onClick } = props;
    return (
      <button
        onClick={onClick}
        className="absolute -left-12 top-1/2 transform -translate-y-1/2 text-[#B8860B] hover:text-[#DAA520] transition-all duration-200 z-10"
        style={{ display: 'block' }}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    );
  }

  const cruiseItineraries = [
    {
      name: '4-Day Western Islands',
      duration: '4 Days / 3 Nights',
      image: '/itinerary-western.jpg',
      highlights: [
        'Santa Cruz Island - Darwin Research Station',
        'Isabela Island - Sierra Negra Volcano',
        'Fernandina Island - Marine iguana colony',
        'Tagus Cove - Historical site and wildlife viewing'
      ],
      description: 'Explore the western islands of the Galapagos, known for their volcanic activity and unique wildlife.',
      price: 'From $3,200 per person'
    },
    {
      name: '5-Day Eastern Islands',
      duration: '5 Days / 4 Nights',
      image: '/itinerary-eastern.jpg',
      highlights: [
        'San Cristóbal - Sea Lion Colony',
        'Española Island - Waved albatross nesting',
        'Floreana Island - Flamingo Lagoon',
        'Santa Fe Island - Land iguana sanctuary',
        'North Seymour - Blue-footed booby colony'
      ],
      description: 'Discover the eastern archipelago with its diverse bird life and pristine beaches.',
      price: 'From $4,000 per person'
    },
    {
      name: '8-Day Complete Circuit',
      duration: '8 Days / 7 Nights',
      image: '/itinerary-complete.jpg',
      highlights: [
        'All major islands and wildlife sites',
        'Darwin and Wolf Islands diving',
        'Genovesa Island - Bird watching paradise',
        'Santiago Island - Fur seal grotto',
        'Bartolomé Island - Iconic pinnacle rock',
        'Plaza Sur - Land and marine iguana interaction'
      ],
      description: 'The ultimate Galapagos experience covering all major islands and wildlife encounters.',
      price: 'From $7,500 per person'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slideImages.length]);

  const fetchCruisePackages = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_packages')
        .select('*')
        .eq('type', 'cruise')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCruisePackages(data || []);
    } catch (error) {
      console.error('Error fetching cruise packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [
          cruisesTitle,
          cruisesContent,
          companyName,
          accommodationsTitle,
          accommodationsSubtitle,
          itinerariesTitle,
          itinerariesSubtitle,
          pricingTitle,
          pricingSubtitle,
          includedTitle,
          additionalTitle,
          bookingTitle,
          bookingSubtitle,
          bookingButton
        ] = await Promise.all([
          getContentByKey('cruises_page_title'),
          getContentByKey('cruises_page_content'),
          getSettingByKey('company_name'),
          getContentByKey('cruises_accommodations_title'),
          getContentByKey('cruises_accommodations_subtitle'),
          getContentByKey('cruises_itineraries_title'),
          getContentByKey('cruises_itineraries_subtitle'),
          getContentByKey('cruises_pricing_title'),
          getContentByKey('cruises_pricing_subtitle'),
          getContentByKey('cruises_included_title'),
          getContentByKey('cruises_additional_title'),
          getContentByKey('cruises_booking_title'),
          getContentByKey('cruises_booking_subtitle'),
          getContentByKey('cruises_booking_button')
        ]);

        // Set content from CMS or fallbacks - the getContentByKey function handles fallbacks
        setContent({
          cruisesTitle: cruisesTitle,
          cruisesContent: cruisesContent,
          companyName: companyName,
          accommodationsTitle: accommodationsTitle,
          accommodationsSubtitle: accommodationsSubtitle,
          itinerariesTitle: itinerariesTitle,
          itinerariesSubtitle: itinerariesSubtitle,
          pricingTitle: pricingTitle,
          pricingSubtitle: pricingSubtitle,
          includedTitle: includedTitle,
          additionalTitle: additionalTitle,
          bookingTitle: bookingTitle,
          bookingSubtitle: bookingSubtitle,
          bookingButton: bookingButton
        });
      } catch (error) {
        console.log('CMS content unavailable for cruises page, using fallback content', error);
        // Set fallback content directly from the content system
        setContent({
          cruisesTitle: await getContentByKey('cruises_page_title'),
          cruisesContent: await getContentByKey('cruises_page_content'),
          companyName: await getSettingByKey('company_name'),
          accommodationsTitle: await getContentByKey('cruises_accommodations_title'),
          accommodationsSubtitle: await getContentByKey('cruises_accommodations_subtitle'),
          itinerariesTitle: await getContentByKey('cruises_itineraries_title'),
          itinerariesSubtitle: await getContentByKey('cruises_itineraries_subtitle'),
          pricingTitle: await getContentByKey('cruises_pricing_title'),
          pricingSubtitle: await getContentByKey('cruises_pricing_subtitle'),
          includedTitle: await getContentByKey('cruises_included_title'),
          additionalTitle: await getContentByKey('cruises_additional_title'),
          bookingTitle: await getContentByKey('cruises_booking_title'),
          bookingSubtitle: await getContentByKey('cruises_booking_subtitle'),
          bookingButton: await getContentByKey('cruises_booking_button')
        });
      }
    };

    fetchContent();
    fetchCruisePackages();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative h-[600px] overflow-hidden">
        <img
          src="/cruise-ship.png"
          alt="Luxury cruise ship in the Galapagos Islands"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Failed to load cruise-ship.jpg');
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {content.cruisesTitle}
            </motion.h1>
          </div>
        </div>
      </div>

      {/* Title and Description Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {content.cruisesTitle}
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {content.cruisesContent}
          </motion.p>
        </div>
      </div>

      {/* Image Slideshow Section */}
      <div className="bg-[#F5F5DC]">
        {/* Image Slideshow */}
        <div className="relative h-[600px] overflow-hidden">
            <div className="relative w-full h-full">
              {slideImages.map((image, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: index === currentSlide ? 1 : 0,
                    scale: index === currentSlide ? 1 : 1.05
                  }}
                  transition={{
                    opacity: { duration: 0.8 },
                    scale: { duration: 8 }
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`Failed to load ${image.src}`);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slideImages.length) % slideImages.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-all duration-200"
              aria-label="Previous image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slideImages.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-all duration-200"
              aria-label="Next image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Custom Line Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {slideImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-12 bg-white'
                      : 'w-6 bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
      </div>

      {/* Cabins Section */}
      <div className="py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#8B4513] mb-4">
              {content.accommodationsTitle}
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {content.accommodationsSubtitle}
            </p>
          </div>

          {/* Cabins Carousel with React Slick */}
          <div className="relative cabin-slider">
            <style jsx global>{`
              .cabin-slider .slick-dots {
                bottom: -50px !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 8px !important;
                list-style: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .cabin-slider .slick-dots li {
                margin: 0 !important;
                width: auto !important;
                height: auto !important;
                display: block !important;
              }
              .cabin-slider .slick-dots li button {
                width: 24px !important;
                height: 4px !important;
                padding: 0 !important;
                background-color: #d1d5db !important;
                border-radius: 2px !important;
                border: none !important;
                transition: all 0.3s ease !important;
                cursor: pointer !important;
                display: block !important;
                outline: none !important;
                text-indent: -9999px !important;
              }
              .cabin-slider .slick-dots li button:before {
                display: none !important;
              }
              .cabin-slider .slick-dots li.slick-active button {
                width: 48px !important;
                background-color: #B8860B !important;
              }
              .cabin-slider .slick-dots li button:hover {
                background-color: #9ca3af !important;
              }
              .cabin-slider .slick-dots li.slick-active button:hover {
                background-color: #DAA520 !important;
              }
              .cabin-slider .slick-arrow {
                z-index: 10 !important;
              }
              .cabin-slider .slick-arrow:before {
                display: none !important;
              }
            `}</style>
            <Slider {...cabinSliderSettings}>
              {cabinTypes.map((cabin, index) => (
                <div key={cabin.name} className="px-4">
                  <motion.div
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="h-64 relative overflow-hidden">
                      <img
                        src={cabin.image}
                        alt={`${cabin.name} cabin interior`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          console.error(`Failed to load ${cabin.image}`);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute top-4 right-4 bg-[#B8860B] text-[#F5F5DC] px-3 py-1 rounded-full text-sm font-medium">
                        {cabin.size}
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="text-xl font-bold text-[#8B4513] mb-2">
                        {cabin.name}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {cabin.description}
                      </p>

                      <h5 className="font-semibold text-[#8B4513] mb-2">Features:</h5>
                      <ul className="space-y-1">
                        {cabin.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="text-gray-600 flex items-center">
                            <svg className="w-4 h-4 text-[#B8860B] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      {/* Itineraries Section */}
      <div className="py-16 bg-[#F5F5DC]">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#8B4513] mb-4">
              {content.itinerariesTitle}
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {content.itinerariesSubtitle}
            </p>
          </div>

          {/* Cruise Packages */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : cruisePackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cruisePackages.map((cruise, index) => (
                <motion.div
                  key={cruise.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={cruise.images && cruise.images[0] ? cruise.images[0] : '/cruise-default.jpg'}
                      alt={cruise.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error(`Failed to load image for ${cruise.title}`);
                        e.currentTarget.src = '/cruise-default.jpg';
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-[#B8860B] text-[#F5F5DC] px-3 py-1 rounded-full text-sm font-medium">
                      {cruise.duration} days
                    </div>
                    <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      Cruise
                    </div>
                    {cruise.destination && (
                      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                        {cruise.destination}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h4 className="text-xl font-bold text-[#8B4513] mb-2">
                      {cruise.title}
                    </h4>
                    {cruise.description && (
                      <p className="text-gray-600 mb-4">
                        {cruise.description}
                      </p>
                    )}

                    {/* Cruise Details */}
                    {(cruise.cruise_line || cruise.ship_name) && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-[#8B4513] mb-2">Cruise Details:</h5>
                        <div className="space-y-1 text-sm text-gray-600">
                          {cruise.cruise_line && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-[#B8860B] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span>Cruise Line: {cruise.cruise_line}</span>
                            </div>
                          )}
                          {cruise.ship_name && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-[#B8860B] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              <span>Ship: {cruise.ship_name}</span>
                            </div>
                          )}
                          {cruise.cabin_category && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-[#B8860B] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                              </svg>
                              <span>Cabin: {cruise.cabin_category}</span>
                            </div>
                          )}
                          {(cruise.departure_port || cruise.arrival_port) && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-[#B8860B] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{cruise.departure_port}{cruise.departure_port && cruise.arrival_port ? ' → ' : ''}{cruise.arrival_port}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Luxury Highlights */}
                    {cruise.luxury_highlights && cruise.luxury_highlights.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-[#8B4513] mb-2">Highlights:</h5>
                        <ul className="space-y-1">
                          {cruise.luxury_highlights.slice(0, 3).map((highlight, highlightIndex) => (
                            <li key={highlightIndex} className="text-gray-600 flex items-start">
                              <svg className="w-4 h-4 text-[#B8860B] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Link
                      href="/quote"
                      className="inline-block bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 w-full text-center"
                    >
                      Book This Cruise
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No cruises available</h3>
              <p className="text-gray-600">Check back soon for exciting cruise adventures!</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Banner */}
      <div className="py-16 bg-[#2D5016]">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {content.bookingTitle}
          </h3>
          <p className="text-xl text-[#F5F5DC] mb-8">
            {content.bookingSubtitle}
          </p>
          <Link
            href="/quote"
            className="bg-[#B8860B] text-[#F5F5DC] px-8 py-4 rounded-md text-lg font-medium hover:bg-[#DAA520] transition-colors duration-200"
          >
            {content.bookingButton}
          </Link>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#8B4513] mb-4">
              {content.pricingTitle}
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {content.pricingSubtitle}
            </p>
          </div>

          {/* Pricing Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h4 className="text-2xl font-bold text-[#8B4513] mb-6">{content.includedTitle}</h4>
              <div className="space-y-3">
                {[
                  'All meals and beverages (excluding premium spirits)',
                  'Professional naturalist guide',
                  'All excursions and activities',
                  'Snorkeling equipment',
                  'Kayaking and panga rides',
                  'Airport transfers in Galapagos',
                  'Galapagos National Park entrance fee',
                  'Wet suits and snorkeling gear'
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-[#B8860B] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-2xl font-bold text-[#8B4513] mb-6">{content.additionalTitle}</h4>
              <div className="bg-[#F5F5DC] p-6 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-[#8B4513] mb-2">Group Size</h5>
                    <p className="text-gray-600">Maximum 16 passengers for intimate wildlife encounters</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-[#8B4513] mb-2">Best Time to Visit</h5>
                    <p className="text-gray-600">Year-round destination with unique wildlife activity each season</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-[#8B4513] mb-2">Booking</h5>
                    <p className="text-gray-600">Reserve with 25% deposit, full payment 90 days prior to departure</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-[#8B4513] mb-2">Cancellation</h5>
                    <p className="text-gray-600">Flexible cancellation policy with cruise insurance options</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}