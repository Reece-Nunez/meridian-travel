'use client';

import React from 'react';
import { CustomQuote } from '@/types/database';

interface CustomerInvoicePreviewProps {
  quote: CustomQuote;
}

export default function CustomerInvoicePreview({ quote }: CustomerInvoicePreviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotal = () => {
    const adultTotal = (quote.adult_price || 0) * (quote.adult_count || 0);
    const childTotal = (quote.child_price || 0) * (quote.child_count || 0);
    return adultTotal + childTotal;
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B4513] to-[#D2B48C] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Your Travel Quote</h1>
          <p className="text-xl opacity-90">{quote.destination} • {quote.duration} Days</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-[#8B4513] mb-2">QUOTE DETAILS</h2>
                <div className="text-gray-600">
                  <p className="font-medium text-[#8B4513]">Meridian Luxury Travel</p>
                  <p>Premium South American Adventures</p>
                  <p>chris@meridianluxury.travel</p>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Quote #</p>
                  <p className="font-mono text-lg font-semibold">ML-{quote.id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{formatDate(quote.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Overview */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Trip Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#B8860B] mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-gray-700">Destination:</span>
                    <span className="ml-2 text-gray-900">{quote.destination}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#B8860B] mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="ml-2 text-gray-900">{quote.duration} days</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#B8860B] mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span className="font-medium text-gray-700">Travelers:</span>
                    <span className="ml-2 text-gray-900">{quote.participants}</span>
                  </div>
                </div>
              </div>
              <div>
                {quote.travel_dates_start && quote.travel_dates_end && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-[#B8860B] mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="font-medium text-gray-700">Travel Dates:</span>
                      <div className="ml-2 text-gray-900">
                        {formatDate(quote.travel_dates_start)} - {formatDate(quote.travel_dates_end)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          {(quote.adult_price || quote.child_price) && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#B8860B] to-[#DAA520] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-200">
                    {quote.adult_count && quote.adult_count > 0 && (
                      <tr className="bg-white">
                        <td className="px-4 py-3 text-gray-800 font-medium">Adult Traveler</td>
                        <td className="px-4 py-3 text-center text-gray-700">{quote.adult_count}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {quote.quoted_currency || 'USD'} ${quote.adult_price?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                          {quote.quoted_currency || 'USD'} ${((quote.adult_price || 0) * quote.adult_count).toLocaleString()}
                        </td>
                      </tr>
                    )}
                    {quote.child_count && quote.child_count > 0 && (
                      <tr className="bg-amber-50">
                        <td className="px-4 py-3 text-gray-800 font-medium">Child Traveler (Under 12)</td>
                        <td className="px-4 py-3 text-center text-gray-700">{quote.child_count}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {quote.quoted_currency || 'USD'} ${quote.child_price?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                          {quote.quoted_currency || 'USD'} ${((quote.child_price || 0) * quote.child_count).toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Total */}
                <div className="bg-gradient-to-r from-[#8B4513] to-[#B8860B] text-white p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Investment:</span>
                    <span className="text-2xl font-bold">
                      {quote.quoted_currency || 'USD'} ${calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* What's Included */}
          {quote.inclusions && quote.inclusions.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  {quote.inclusions.map((inclusion, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 leading-relaxed">{inclusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* What's Not Included */}
          {quote.exclusions && quote.exclusions.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Not Included</h3>
              <div className="bg-red-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  {quote.exclusions.map((exclusion, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 leading-relaxed">{exclusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Special Requirements */}
          {quote.special_requirements && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Special Requests</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{quote.special_requirements}</p>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#8B4513] mb-2">Ready to Book Your Adventure?</h3>
              <p className="text-gray-600 mb-6">Contact us to secure your dates and begin your luxury South American journey.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center text-[#B8860B]">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="font-medium">chris@meridianluxury.travel</span>
                </div>

                <button className="px-6 py-3 bg-gradient-to-r from-[#B8860B] to-[#DAA520] text-white font-medium rounded-lg hover:from-[#DAA520] hover:to-[#B8860B] transition-all duration-200 transform hover:scale-105 shadow-lg">
                  Book This Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#8B4513] text-white p-8 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <h4 className="text-xl font-semibold mb-2">Meridian Luxury Travel</h4>
          <p className="opacity-90">Creating Unforgettable South American Adventures</p>
        </div>
      </div>
    </div>
  );
}