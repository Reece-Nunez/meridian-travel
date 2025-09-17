'use client';

import Link from 'next/link';

export default function CookiePolicy() {
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
              Cookie Policy
            </h1>
            <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
              How we use cookies and similar technologies on our website
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none">

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-blue-800 font-medium mb-2">Last Updated: {new Date().toLocaleDateString()}</p>
            <p className="text-blue-700">
              This Cookie Policy explains how Meridian Luxury Travel uses cookies and similar technologies when you visit our website.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">What Are Cookies?</h2>
          <p className="text-gray-600 mb-6">
            Cookies are small text files that are placed on your device when you visit a website. They help websites remember your preferences and improve your browsing experience. Cookies do not contain personal information and cannot harm your device.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">How We Use Cookies</h2>
          <p className="text-gray-600 mb-4">We use cookies for the following purposes:</p>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Essential Cookies</h3>
          <p className="text-gray-600 mb-4">
            These cookies are necessary for the website to function properly. They enable core functionality such as security,
            network management, and accessibility. You cannot opt-out of these cookies.
          </p>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Performance Cookies</h3>
          <p className="text-gray-600 mb-4">
            These cookies help us understand how visitors interact with our website by collecting and reporting information
            anonymously. This helps us improve our website's performance and user experience.
          </p>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Functional Cookies</h3>
          <p className="text-gray-600 mb-4">
            These cookies enable the website to provide enhanced functionality and personalization. They may be set by us
            or by third-party providers whose services we have added to our pages.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Third-Party Cookies</h2>
          <p className="text-gray-600 mb-4">
            We may use third-party services that set their own cookies. These include:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Google Analytics - for website analytics and performance monitoring</li>
            <li>Social media platforms - for social sharing functionality</li>
            <li>Payment processors - for secure transaction processing</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Managing Your Cookie Preferences</h2>
          <p className="text-gray-600 mb-4">
            You can control and manage cookies in various ways:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Browser Settings: Most browsers allow you to view, manage, and delete cookies</li>
            <li>Opt-out Links: Some third-party providers offer direct opt-out mechanisms</li>
            <li>Privacy Tools: You can use browser extensions and privacy tools to manage cookies</li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <p className="text-amber-800 font-medium mb-2">Important Note:</p>
            <p className="text-amber-700">
              Disabling certain cookies may affect the functionality of our website and your ability to access some features or services.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Updates to This Policy</h2>
          <p className="text-gray-600 mb-6">
            We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational,
            legal, or regulatory reasons. Please check this page periodically for updates.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about our use of cookies or this Cookie Policy, please contact us:
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700">
              <strong>Meridian Luxury Travel</strong><br />
              Email: <a href="mailto:privacy@meridianluxury.travel" className="text-[#B8860B] hover:text-[#DAA520]">privacy@meridianluxury.travel</a><br />
              Phone: <a href="tel:+15551234567" className="text-[#B8860B] hover:text-[#DAA520]">+1 (555) 123-4567</a>
            </p>
          </div>
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