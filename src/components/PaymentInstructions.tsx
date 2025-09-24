'use client';

import { CustomQuote } from '@/types/database';
import { PaymentMethod } from './PaymentMethodSelector';

interface PaymentInstructionsProps {
  paymentMethod: PaymentMethod;
  quote: CustomQuote;
  totalAmount: number;
}

export default function PaymentInstructions({
  paymentMethod,
  quote,
  totalAmount
}: PaymentInstructionsProps) {
  if (paymentMethod === 'stripe') {
    return null; // Stripe handles its own UI
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (paymentMethod === 'ach') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          <h3 className="text-lg font-semibold text-blue-900">ACH Bank Transfer Instructions</h3>
        </div>

        <div className="bg-white rounded-md p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Send payment to:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Bank Name:</span>
              <p className="text-gray-900">First National Bank</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Routing Number:</span>
              <p className="text-gray-900 font-mono">123456789</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Account Number:</span>
              <p className="text-gray-900 font-mono">987654321</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Account Name:</span>
              <p className="text-gray-900">Meridian Travel LLC</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Transfer amount: <strong>{formatCurrency(totalAmount, quote.quoted_currency)}</strong></li>
            <li>• Include reference: <strong>Quote #{quote.id.slice(-8).toUpperCase()}</strong></li>
            <li>• Processing time: 3-5 business days</li>
            <li>• Contact us at payments@meridiantravel.com once transfer is initiated</li>
          </ul>
        </div>
      </div>
    );
  }

  if (paymentMethod === 'check') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Check Payment Instructions</h3>
        </div>

        <div className="bg-white rounded-md p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Mail your check to:</h4>
          <div className="text-sm text-gray-900 leading-relaxed">
            <p className="font-medium">Meridian Travel LLC</p>
            <p>Attn: Accounts Receivable</p>
            <p>123 Travel Lane</p>
            <p>Adventure City, AC 12345</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Check Requirements:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Make check payable to: <strong>"Meridian Travel LLC"</strong></li>
            <li>• Check amount: <strong>{formatCurrency(totalAmount, quote.quoted_currency)}</strong></li>
            <li>• Write in memo: <strong>Quote #{quote.id.slice(-8).toUpperCase()}</strong></li>
            <li>• Include your name and email: <strong>{quote.contact_email}</strong></li>
            <li>• Allow 7-10 business days for processing</li>
            <li>• Email a photo of your check to: payments@meridiantravel.com</li>
          </ul>
        </div>
      </div>
    );
  }

  return null;
}