'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-[#2D5016] py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
              Ready to begin your Peru adventure? Our travel specialists are here to help 
              you plan the perfect journey.
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
              Get in Touch
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
                    <a href="tel:+1-555-0123" className="hover:text-[#B8860B] transition-colors">
                      +1 (555) 012-3456
                    </a>
                  </p>
                  <p className="text-sm text-gray-500">
                    Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                    Saturday: 10:00 AM - 4:00 PM EST
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
                    <a href="mailto:info@meridiantravel.com" className="hover:text-[#B8860B] transition-colors">
                      info@meridiantravel.com
                    </a>
                  </p>
                  <p className="text-sm text-gray-500">
                    We respond to all inquiries within 24 hours
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
                    123 Travel Avenue<br />
                    Adventure City, AC 12345<br />
                    United States
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
                    <a href="tel:+1-555-0199" className="hover:text-[#B8860B] transition-colors">
                      +1 (555) 019-9999
                    </a>
                  </p>
                  <p className="text-sm text-gray-500">
                    24/7 emergency support for travelers
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-12 p-6 bg-[#F5F5DC] rounded-lg">
              <h3 className="text-lg font-semibold text-[#8B4513] mb-4">
                Ready to Start Planning?
              </h3>
              <p className="text-gray-600 mb-6">
                The fastest way to get your custom Peru itinerary is to request a quote online. 
                Our specialists will contact you within 24 hours.
              </p>
              <Link
                href="/quote"
                className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                Request Your Quote
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
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                  How far in advance should I book my Peru trip?
                </h3>
                <p className="text-gray-600">
                  We recommend booking at least 3-6 months in advance, especially for travel during 
                  peak season (May-September). Popular experiences like the Inca Trail require permits 
                  that sell out quickly, so earlier booking ensures better availability.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                  What's included in your Peru travel packages?
                </h3>
                <p className="text-gray-600">
                  Our packages typically include accommodations, transportation, guided tours, 
                  entrance fees, and most meals. Each itinerary is custom-built, so inclusions 
                  vary based on your preferences and budget. We'll provide a detailed breakdown 
                  when we send your quote.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                  Do you provide travel insurance recommendations?
                </h3>
                <p className="text-gray-600">
                  Yes, we strongly recommend travel insurance for all Peru trips. We can provide 
                  recommendations for reputable insurance providers that offer coverage for 
                  adventure activities and high-altitude destinations.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                  What if I need to change my travel dates?
                </h3>
                <p className="text-gray-600">
                  We understand that plans can change. Depending on how far in advance you notify us 
                  and the specific services booked, we'll work with our partners to minimize any 
                  change fees. Our team will guide you through the process.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                  Do you offer group discounts?
                </h3>
                <p className="text-gray-600">
                  Yes! We offer competitive pricing for groups of 8 or more travelers. Group travel 
                  also allows for more customization options and can include private guides and 
                  exclusive experiences.
                </p>
              </div>

              <div className="pb-6">
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                  What support do you provide during my trip?
                </h3>
                <p className="text-gray-600">
                  You'll have access to our 24/7 emergency support line throughout your journey. 
                  We also provide detailed pre-departure information and can assist with any 
                  issues that arise during your trip.
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
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Our Peru travel specialists are here to help. Don't hesitate to reach out—we love 
            talking about Peru adventures!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+1-555-0123"
              className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
            >
              Call Us Now
            </a>
            <a
              href="mailto:info@meridiantravel.com"
              className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
            >
              Send an Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}