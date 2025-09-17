'use client';

import Link from 'next/link';

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8B4513] to-[#DAA520]">
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Accessibility Statement
            </h1>
            <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
              Our commitment to making travel accessible for everyone
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none">

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <p className="text-green-800 font-medium mb-2">Our Commitment</p>
            <p className="text-green-700">
              Meridian Luxury Travel is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Accessibility Standards</h2>
          <p className="text-gray-600 mb-6">
            We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA. These guidelines explain how to make web content more accessible for people with disabilities, and user-friendly for everyone.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Measures We Take</h2>
          <p className="text-gray-600 mb-4">
            We take the following measures to ensure accessibility:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Include accessibility as part of our mission statement</li>
            <li>Provide continual accessibility training for our staff</li>
            <li>Assign clear accessibility targets and responsibilities</li>
            <li>Employ formal accessibility quality assurance methods</li>
            <li>Include people with disabilities in our design personas</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Website Features</h2>
          <p className="text-gray-600 mb-4">Our website includes the following accessibility features:</p>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Keyboard Navigation</h3>
          <p className="text-gray-600 mb-4">
            All interactive elements can be accessed using a keyboard. You can navigate through the website using the Tab key, and activate elements using the Enter key or Space bar.
          </p>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Screen Reader Support</h3>
          <p className="text-gray-600 mb-4">
            Our website is compatible with screen readers and includes proper heading structures, alt text for images, and descriptive link text.
          </p>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Visual Design</h3>
          <p className="text-gray-600 mb-4">
            We use high contrast colors, readable fonts, and ensure that text can be resized up to 200% without losing functionality or readability.
          </p>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Forms and Controls</h3>
          <p className="text-gray-600 mb-4">
            All forms include clear labels, instructions, and error messages to help users complete them successfully.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Accessible Travel Services</h2>
          <p className="text-gray-600 mb-4">
            Beyond our website, we are committed to providing accessible travel experiences:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Accessible accommodation options and recommendations</li>
            <li>Transportation arrangements for travelers with mobility needs</li>
            <li>Detailed accessibility information for destinations and activities</li>
            <li>Specialized assistance for travelers with specific requirements</li>
            <li>24/7 support during your travels</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Assessment and Testing</h2>
          <p className="text-gray-600 mb-6">
            We regularly assess the accessibility of our website using a combination of automated testing tools and manual testing with assistive technologies. We also seek feedback from users with disabilities to identify areas for improvement.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Known Issues</h2>
          <p className="text-gray-600 mb-4">
            We are aware of some accessibility issues that we are actively working to address:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Some third-party embedded content may not be fully accessible</li>
            <li>Image galleries may have limited keyboard navigation</li>
            <li>Some PDF documents may not be optimally formatted for screen readers</li>
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-blue-800 font-medium mb-2">Continuous Improvement</p>
            <p className="text-blue-700">
              We are continuously working to improve the accessibility of our website and services. Your feedback is valuable in helping us identify and address accessibility barriers.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Feedback and Contact</h2>
          <p className="text-gray-600 mb-4">
            We welcome your feedback on the accessibility of our website and travel services. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
          </p>
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-gray-700">
              <strong>Accessibility Coordinator</strong><br />
              Meridian Luxury Travel<br />
              Email: <a href="mailto:accessibility@meridianluxury.travel" className="text-[#B8860B] hover:text-[#DAA520]">accessibility@meridianluxury.travel</a><br />
              Phone: <a href="tel:+15551234567" className="text-[#B8860B] hover:text-[#DAA520]">+1 (555) 123-4567</a><br />
              TTY: <a href="tel:+15551234567" className="text-[#B8860B] hover:text-[#DAA520]">+1 (555) 123-4567</a>
            </p>
          </div>

          <p className="text-gray-600 mb-6">
            We aim to respond to accessibility feedback within 3 business days and will work with you to provide the information, item, or transaction you seek through an alternative communication method or one that is accessible for you.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">External Resources</h2>
          <p className="text-gray-600 mb-4">
            For more information about web accessibility, visit:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li><a href="https://www.w3.org/WAI/" className="text-[#B8860B] hover:text-[#DAA520]" target="_blank" rel="noopener noreferrer">Web Accessibility Initiative (WAI)</a></li>
            <li><a href="https://www.ada.gov/" className="text-[#B8860B] hover:text-[#DAA520]" target="_blank" rel="noopener noreferrer">Americans with Disabilities Act (ADA)</a></li>
            <li><a href="https://webaim.org/" className="text-[#B8860B] hover:text-[#DAA520]" target="_blank" rel="noopener noreferrer">WebAIM - Web Accessibility In Mind</a></li>
          </ul>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-[#B8860B] hover:text-[#DAA520] font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}