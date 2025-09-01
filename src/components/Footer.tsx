'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#2D5016] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <img 
                src="/logo.png" 
                alt="Meridian Luxury Travel" 
                className="h-32 w-auto mb-4"
                onError={(e) => {
                  console.error('Failed to load logo.png');
                  e.currentTarget.style.display = 'none';
                }}
              />
              <p className="text-[#F5F5DC] text-sm leading-relaxed">
                Your trusted South American travel specialists, dedicated to creating extraordinary 
                luxury adventures that connect you with the heart of this remarkable continent.
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-[#F5F5DC] hover:text-[#B8860B] transition-colors duration-200">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-[#F5F5DC] hover:text-[#B8860B] transition-colors duration-200">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.082 5.52.204 5.021.345a5.97 5.97 0 0 0-2.159 1.407 5.97 5.97 0 0 0-1.407 2.159c-.141.499-.263 1.073-.297 2.02C.013 7.989 0 8.396 0 12.017s.013 4.028.048 4.976c.034.947.156 1.521.297 2.02a5.97 5.97 0 0 0 1.407 2.159 5.97 5.97 0 0 0 2.159 1.407c.499.141 1.073.263 2.02.297.948.035 1.355.048 4.976.048s4.028-.013 4.976-.048c.947-.034 1.521-.156 2.02-.297a5.97 5.97 0 0 0 2.159-1.407 5.97 5.97 0 0 0 1.407-2.159c.141-.499.263-1.073.297-2.02.035-.948.048-1.355.048-4.976s-.013-4.028-.048-4.976c-.034-.947-.156-1.521-.297-2.02a5.97 5.97 0 0 0-1.407-2.159A5.97 5.97 0 0 0 19.994.345c-.499-.141-1.073-.263-2.02-.297C17.026.013 16.619 0 12.999 0h-.982zm-.717 1.442h.718c3.136 0 3.506.012 4.741.048.97.035 1.497.162 1.848.269.465.18.797.395 1.146.744.35.35.564.682.744 1.146.107.351.234.878.269 1.848.035 1.235.048 1.605.048 4.741s-.013 3.506-.048 4.741c-.035.97-.162 1.497-.269 1.848-.18.465-.395.797-.744 1.146-.35.35-.682.564-1.146.744-.351.107-.878.234-1.848.269-1.235.035-1.605.048-4.741.048s-3.506-.013-4.741-.048c-.97-.035-1.497-.162-1.848-.269a3.083 3.083 0 0 1-1.146-.744 3.083 3.083 0 0 1-.744-1.146c-.107-.351-.234-.878-.269-1.848-.035-1.235-.048-1.605-.048-4.741s.013-3.506.048-4.741c.035-.97.162-1.497.269-1.848.18-.465.395-.797.744-1.146a3.083 3.083 0 0 1 1.146-.744c.351-.107.878-.234 1.848-.269 1.235-.035 1.605-.048 4.741-.048z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12.017 5.838a6.179 6.179 0 1 0 0 12.358 6.179 6.179 0 0 0 0-12.358zM12.017 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" clipRule="evenodd" />
                  <path d="M19.953 5.606a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
                </svg>
              </a>
              <a href="#" className="text-[#F5F5DC] hover:text-[#B8860B] transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Destinations</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/destinations/peru" className="text-[#F5F5DC] hover:text-[#B8860B] transition-colors duration-200">
                  Peru
                </Link>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">Galapagos/Ecuador</span>
                <span className="text-xs text-gray-500 ml-2">Coming Soon</span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">Brazil</span>
                <span className="text-xs text-gray-500 ml-2">Coming Soon</span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">Argentina</span>
                <span className="text-xs text-gray-500 ml-2">Coming Soon</span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">Chile</span>
                <span className="text-xs text-gray-500 ml-2">Coming Soon</span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">Antarctica</span>
                <span className="text-xs text-gray-500 ml-2">Coming Soon</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-[#F5F5DC] hover:text-[#B8860B] transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/travel-styles" className="text-[#F5F5DC] hover:text-[#B8860B] transition-colors duration-200">
                  Travel Styles
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#F5F5DC] hover:text-[#B8860B] transition-colors duration-200">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/quote" className="text-[#F5F5DC] hover:text-[#B8860B] transition-colors duration-200">
                  Request Quote
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#B8860B] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <a href="tel:+1-555-0123" className="text-[#F5F5DC] hover:text-[#B8860B] transition-colors duration-200">
                    +1 (555) 012-3456
                  </a>
                  <p className="text-xs text-gray-400 mt-1">Mon-Fri: 9AM-6PM EST</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#B8860B] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@meridianluxurytravel.com" className="text-[#F5F5DC] hover:text-[#B8860B] transition-colors duration-200">
                  info@meridianluxurytravel.com
                </a>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#B8860B] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-[#F5F5DC] text-sm">
                  123 Travel Avenue<br />
                  Adventure City, AC 12345<br />
                  United States
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-600">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Stay Inspired</h3>
            <p className="text-[#F5F5DC] text-sm mb-4">
              Get exclusive travel insights, destination guides, and special offers delivered to your inbox.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-white text-gray-900 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-[#B8860B] hover:bg-[#DAA520] text-white rounded-r-md transition-colors duration-200 font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black bg-opacity-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-[#F5F5DC] text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Meridian Luxury Travel. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <Link href="/privacy" className="text-[#F5F5DC] hover:text-[#B8860B] text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[#F5F5DC] hover:text-[#B8860B] text-sm transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-[#F5F5DC] hover:text-[#B8860B] text-sm transition-colors duration-200">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="text-[#F5F5DC] hover:text-[#B8860B] text-sm transition-colors duration-200">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}