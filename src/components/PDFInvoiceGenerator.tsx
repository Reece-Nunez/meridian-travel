'use client';

import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CustomQuote } from '@/types/database';

interface PDFInvoiceGeneratorProps {
  quote: CustomQuote;
  onGenerate?: () => void;
}

export default function PDFInvoiceGenerator({ quote, onGenerate }: PDFInvoiceGeneratorProps) {
  const generatePDF = async () => {
    try {
      onGenerate?.();

      const invoiceElement = document.getElementById('invoice-preview');
      if (!invoiceElement) {
        console.error('Invoice preview element not found');
        return;
      }

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: invoiceElement.scrollWidth,
        height: invoiceElement.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `invoice-${quote.id.slice(-8)}-${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

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
    <div className="space-y-6">
      {/* Generate PDF Button */}
      <div className="flex justify-end">
        <button
          onClick={generatePDF}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#B8860B] hover:bg-[#DAA520] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B8860B] transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Invoice PDF
        </button>
      </div>

      {/* Invoice Preview */}
      <div
        id="invoice-preview"
        className="bg-white p-8 rounded-lg shadow-sm border max-w-4xl mx-auto"
        style={{ minHeight: '1056px', width: '816px' }} // A4 proportions
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#8B4513] mb-2">INVOICE</h1>
            <div className="text-gray-600">
              <p className="font-medium">Meridian Luxury Travel</p>
              <p>Premium South American Adventures</p>
              <p>chris@meridianluxury.travel</p>
            </div>
          </div>
          <div className="text-right">
            <div className="mb-4">
              <p className="text-sm text-gray-600">Invoice #</p>
              <p className="font-mono text-lg font-semibold">ML-{quote.id.slice(-8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{formatDate(quote.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill To:</h3>
            <div className="text-gray-700">
              <p className="font-medium">{quote.contact_email}</p>
              {quote.contact_phone && <p>{quote.contact_phone}</p>}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Trip Details:</h3>
            <div className="text-gray-700 space-y-1">
              <p><span className="font-medium">Destination:</span> {quote.destination}</p>
              <p><span className="font-medium">Duration:</span> {quote.duration} days</p>
              <p><span className="font-medium">Travelers:</span> {quote.participants}</p>
              {quote.travel_dates_start && quote.travel_dates_end && (
                <p>
                  <span className="font-medium">Travel Dates:</span> {' '}
                  {formatDate(quote.travel_dates_start)} - {formatDate(quote.travel_dates_end)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Breakdown */}
        {(quote.adult_price || quote.child_price) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing Breakdown</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quote.adult_count && quote.adult_count > 0 && (
                    <tr>
                      <td className="px-4 py-3 text-gray-800">Adult Traveler</td>
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
                    <tr>
                      <td className="px-4 py-3 text-gray-800">Child Traveler (Under 12)</td>
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
                <tfoot>
                  <tr className="bg-[#8B4513] text-white">
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold text-lg">
                      Total Amount:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-xl">
                      {quote.quoted_currency || 'USD'} ${calculateTotal().toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* What's Included */}
        {quote.inclusions && quote.inclusions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What's Included</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {quote.inclusions.map((inclusion, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{inclusion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* What's Not Included */}
        {quote.exclusions && quote.exclusions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What's Not Included</h3>
            <div className="bg-red-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {quote.exclusions.map((exclusion, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{exclusion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {quote.admin_notes && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Notes</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{quote.admin_notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-8 mt-12">
          <div className="text-center text-gray-600">
            <p className="font-semibold text-[#8B4513] mb-2">Thank you for choosing Meridian Luxury Travel!</p>
            <p className="text-sm">For questions about this invoice, please contact chris@meridianluxury.travel</p>
            <p className="text-sm mt-2">Meridian Luxury Travel - Creating Unforgettable South American Adventures</p>
          </div>
        </div>
      </div>
    </div>
  );
}