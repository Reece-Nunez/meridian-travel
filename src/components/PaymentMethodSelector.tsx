'use client';

import { useState } from 'react';

export type PaymentMethod = 'stripe' | 'ach' | 'check';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  disabled = false
}: PaymentMethodSelectorProps) {
  const paymentOptions = [
    {
      id: 'stripe' as PaymentMethod,
      name: 'Credit/Debit Card',
      description: 'Pay securely with your credit or debit card',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      ),
      instant: true
    },
    {
      id: 'ach' as PaymentMethod,
      name: 'Bank Transfer (ACH)',
      description: 'Direct transfer from your bank account (3-5 business days)',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      instant: false
    },
    {
      id: 'check' as PaymentMethod,
      name: 'Check',
      description: 'Mail a physical check (allow 7-10 business days)',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      instant: false
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Choose Payment Method</h3>

      <div className="grid gap-3">
        {paymentOptions.map((option) => (
          <label
            key={option.id}
            className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
              disabled
                ? 'cursor-not-allowed opacity-50'
                : selectedMethod === option.id
                ? 'border-[#B8860B] bg-[#B8860B]/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              value={option.id}
              checked={selectedMethod === option.id}
              onChange={(e) => onMethodChange(e.target.value as PaymentMethod)}
              disabled={disabled}
              className="sr-only"
            />

            <div className="flex w-full items-start">
              <div className={`text-${selectedMethod === option.id ? '[#B8860B]' : 'gray-400'} mr-3 mt-0.5`}>
                {option.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    selectedMethod === option.id ? 'text-[#8B4513]' : 'text-gray-900'
                  }`}>
                    {option.name}
                  </span>
                  {option.instant && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Instant
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{option.description}</p>
              </div>
            </div>

            <div className={`absolute -inset-px rounded-lg border-2 pointer-events-none ${
              selectedMethod === option.id ? 'border-[#B8860B]' : 'border-transparent'
            }`} />
          </label>
        ))}
      </div>
    </div>
  );
}