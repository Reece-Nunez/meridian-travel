'use client';

import Link from 'next/link';

export default function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
              How we collect, use, and protect your personal information
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
              This Privacy Policy describes how Meridian Luxury Travel collects, uses, and protects your personal information when you use our website and services.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Information We Collect</h2>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Personal Information</h3>
          <p className="text-gray-600 mb-4">We may collect the following personal information:</p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Name, email address, phone number, and mailing address</li>
            <li>Travel preferences, dietary requirements, and accessibility needs</li>
            <li>Passport information and emergency contact details</li>
            <li>Payment information (processed securely by third-party providers)</li>
            <li>Communication history and feedback</li>
          </ul>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Automatically Collected Information</h3>
          <p className="text-gray-600 mb-4">When you visit our website, we automatically collect:</p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>IP address and browser information</li>
            <li>Pages visited and time spent on our site</li>
            <li>Referring websites and search terms</li>
            <li>Device information and operating system</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">We use your information for the following purposes:</p>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Travel Services</h3>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Planning and booking your travel itinerary</li>
            <li>Providing customer support and assistance</li>
            <li>Processing payments and managing reservations</li>
            <li>Communicating important travel updates and information</li>
            <li>Ensuring your safety and security during travel</li>
          </ul>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Marketing and Communications</h3>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Sending newsletters and promotional materials (with your consent)</li>
            <li>Personalizing your experience on our website</li>
            <li>Conducting market research and surveys</li>
            <li>Improving our services and developing new offerings</li>
          </ul>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Legal and Business Operations</h3>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Complying with legal obligations and regulations</li>
            <li>Protecting against fraud and security threats</li>
            <li>Resolving disputes and enforcing our terms</li>
            <li>Maintaining business records and analytics</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Information Sharing</h2>
          <p className="text-gray-600 mb-4">We may share your information with:</p>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Service Providers</h3>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Hotels, airlines, and other travel suppliers</li>
            <li>Payment processors and financial institutions</li>
            <li>Travel insurance providers</li>
            <li>Local tour operators and guides</li>
            <li>Technology service providers</li>
          </ul>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Legal Requirements</h3>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Government authorities when required by law</li>
            <li>Law enforcement agencies for safety and security</li>
            <li>Courts and legal proceedings</li>
            <li>Regulatory bodies and compliance authorities</li>
          </ul>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <p className="text-green-800 font-medium mb-2">No Selling of Personal Information</p>
            <p className="text-green-700">
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Data Security</h2>
          <p className="text-gray-600 mb-4">We implement appropriate security measures to protect your information:</p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>SSL encryption for data transmission</li>
            <li>Secure servers and firewalls</li>
            <li>Regular security audits and updates</li>
            <li>Limited access to personal information</li>
            <li>Employee training on data protection</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Your Rights and Choices</h2>
          <p className="text-gray-600 mb-4">You have the following rights regarding your personal information:</p>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Access and Correction</h3>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Request access to your personal information</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Update your preferences and contact details</li>
          </ul>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Deletion and Restriction</h3>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Request deletion of your personal information</li>
            <li>Restrict processing of your information</li>
            <li>Withdraw consent for marketing communications</li>
          </ul>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Data Portability</h3>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Request a copy of your personal information</li>
            <li>Transfer your information to another service provider</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Cookies and Tracking</h2>
          <p className="text-gray-600 mb-4">
            We use cookies and similar technologies to enhance your experience. You can manage your cookie preferences
            through your browser settings. For more information, please see our
            <Link href="/cookies" className="text-[#B8860B] hover:text-[#DAA520]"> Cookie Policy</Link>.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">International Transfers</h2>
          <p className="text-gray-600 mb-6">
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate
            safeguards are in place to protect your information in accordance with applicable privacy laws.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Data Retention</h2>
          <p className="text-gray-600 mb-6">
            We retain your personal information for as long as necessary to provide our services, comply with legal
            obligations, resolve disputes, and enforce our agreements. When information is no longer needed, we securely
            delete or anonymize it.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Children's Privacy</h2>
          <p className="text-gray-600 mb-6">
            Our services are not directed to children under 13 years of age. We do not knowingly collect personal
            information from children under 13. If you believe we have collected such information, please contact us
            immediately.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Changes to This Policy</h2>
          <p className="text-gray-600 mb-6">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by
            posting the new policy on our website and updating the "Last Updated" date. Your continued use of our
            services after such changes constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700">
              <strong>Privacy Officer</strong><br />
              Meridian Luxury Travel<br />
              123 Travel Avenue<br />
              Adventure City, AC 12345<br />
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