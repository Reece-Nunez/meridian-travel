'use client';

import Link from 'next/link';

export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
              Terms and conditions for using our travel services
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
              These Terms of Service govern your use of Meridian Luxury Travel's website and services. By using our services, you agree to these terms.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 mb-6">
            By accessing or using our website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">2. Description of Services</h2>
          <p className="text-gray-600 mb-4">
            Meridian Luxury Travel provides custom travel planning and booking services for luxury travel experiences in South America. Our services include:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Custom itinerary planning and design</li>
            <li>Accommodation and transportation booking</li>
            <li>Tour and activity arrangements</li>
            <li>Travel consultation and support</li>
            <li>24/7 emergency assistance during travel</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">3. Booking and Payment Terms</h2>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Booking Process</h3>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>All bookings are subject to availability and confirmation</li>
            <li>A signed agreement and deposit are required to secure reservations</li>
            <li>Final payment is due according to the terms specified in your agreement</li>
            <li>All prices are subject to change until full payment is received</li>
          </ul>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Payment Terms</h3>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Deposits are typically 25-50% of the total trip cost</li>
            <li>Final payment is due 60-90 days before departure</li>
            <li>We accept major credit cards, bank transfers, and certified checks</li>
            <li>All payments are in US Dollars unless otherwise specified</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">4. Cancellation and Refund Policy</h2>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Client Cancellations</h3>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>90+ days before departure: Forfeit deposit, refund remaining balance</li>
            <li>60-89 days before departure: 50% of total trip cost penalty</li>
            <li>30-59 days before departure: 75% of total trip cost penalty</li>
            <li>Less than 30 days before departure: 100% penalty (no refund)</li>
            <li>Cancellation fees may vary based on supplier policies</li>
          </ul>

          <h3 className="text-xl font-semibold text-[#8B4513] mt-6 mb-3">Trip Modifications</h3>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Changes to confirmed bookings may incur fees</li>
            <li>Availability is not guaranteed for modifications</li>
            <li>Price adjustments may apply for changes</li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <p className="text-amber-800 font-medium mb-2">Travel Insurance Recommended</p>
            <p className="text-amber-700">
              We strongly recommend purchasing travel insurance to protect against unforeseen circumstances that may affect your trip.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">5. Travel Documents and Requirements</h2>
          <p className="text-gray-600 mb-4">
            Travelers are responsible for ensuring they have all required documentation:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Valid passport with at least 6 months remaining validity</li>
            <li>Required visas for destination countries</li>
            <li>Vaccination certificates and health documentation</li>
            <li>Travel insurance policies</li>
            <li>Emergency contact information</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">6. Limitations of Liability</h2>
          <p className="text-gray-600 mb-4">
            Meridian Luxury Travel acts as an intermediary between travelers and service providers. Our liability is limited as follows:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>We are not responsible for acts or omissions of third-party suppliers</li>
            <li>Our liability is limited to the cost of services provided</li>
            <li>We are not liable for delays, cancellations, or changes by suppliers</li>
            <li>Force majeure events are beyond our control and responsibility</li>
            <li>Personal injury or property damage claims are subject to supplier terms</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">7. Force Majeure</h2>
          <p className="text-gray-600 mb-6">
            We are not responsible for cancellations, delays, or changes due to force majeure events including but not limited to: natural disasters, war, terrorism, government actions, pandemic, strikes, or other circumstances beyond our reasonable control.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">8. Health and Safety</h2>
          <p className="text-gray-600 mb-4">
            Travelers acknowledge and agree that:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>International travel involves inherent risks</li>
            <li>They are responsible for their own health and safety</li>
            <li>They must disclose any medical conditions that may affect travel</li>
            <li>They will follow local laws and customs of destination countries</li>
            <li>They will obtain appropriate travel insurance</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">9. Intellectual Property</h2>
          <p className="text-gray-600 mb-6">
            All content on our website, including text, graphics, logos, images, and software, is the property of Meridian Luxury Travel and is protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our written permission.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">10. Privacy Policy</h2>
          <p className="text-gray-600 mb-6">
            Your privacy is important to us. Please review our
            <Link href="/privacy" className="text-[#B8860B] hover:text-[#DAA520]"> Privacy Policy</Link>
            to understand how we collect, use, and protect your personal information.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">11. Dispute Resolution</h2>
          <p className="text-gray-600 mb-4">
            Any disputes arising from these terms or our services shall be resolved as follows:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>First, through good faith negotiation</li>
            <li>If unsuccessful, through binding arbitration</li>
            <li>Arbitration shall be conducted under applicable state laws</li>
            <li>Each party shall bear their own costs and fees</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">12. Governing Law</h2>
          <p className="text-gray-600 mb-6">
            These Terms of Service are governed by and construed in accordance with the laws of the state in which Meridian Luxury Travel is incorporated, without regard to conflict of law principles.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">13. Severability</h2>
          <p className="text-gray-600 mb-6">
            If any provision of these terms is found to be unenforceable or invalid, the remaining provisions shall continue in full force and effect.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">14. Changes to Terms</h2>
          <p className="text-gray-600 mb-6">
            We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-bold text-[#8B4513] mt-8 mb-4">15. Contact Information</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700">
              <strong>Meridian Luxury Travel</strong><br />
              123 Travel Avenue<br />
              Adventure City, AC 12345<br />
              United States<br />
              Email: <a href="mailto:legal@meridianluxury.travel" className="text-[#B8860B] hover:text-[#DAA520]">legal@meridianluxury.travel</a><br />
              Phone: <a href="tel:+15551234567" className="text-[#B8860B] hover:text-[#DAA520]">+1 (555) 123-4567</a>
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
            <p className="text-green-800 font-medium mb-2">Acknowledgment</p>
            <p className="text-green-700">
              By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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