'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CustomQuote } from '@/types/database';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';

export default function QuoteDetail() {
  const { loading: authLoading, isAuthenticated } = useSimpleAdminAuth();
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<CustomQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    status: 'pending',
    quoted_price: '',
    quoted_currency: 'USD',
    admin_notes: ''
  });

  useEffect(() => {
    if (isAuthenticated && quoteId) {
      fetchQuote();
    }
  }, [isAuthenticated, quoteId]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      
      // Get admin email from session
      const session = localStorage.getItem('admin_session');
      const adminEmail = session ? JSON.parse(session).email : '';
      
      const response = await fetch(`/api/admin/quotes/${quoteId}?admin_email=${encodeURIComponent(adminEmail)}`);
      
      if (!response.ok) {
        throw new Error('Quote not found');
      }
      
      const data = await response.json();
      
      if (data) {
        setQuote(data);
        setFormData({
          status: data.status || 'pending',
          quoted_price: data.quoted_price?.toString() || '',
          quoted_currency: data.quoted_currency || 'USD',
          admin_notes: data.admin_notes || ''
        });
      }
    } catch (err) {
      console.error('Error fetching quote:', err);
      setError('Failed to load quote details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Get admin email from session
      const session = localStorage.getItem('admin_session');
      const adminEmail = session ? JSON.parse(session).email : '';

      const response = await fetch('/api/admin/quotes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId,
          status: formData.status,
          quoted_price: formData.quoted_price ? parseFloat(formData.quoted_price) : null,
          quoted_currency: formData.quoted_currency,
          admin_notes: formData.admin_notes,
          adminEmail
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quote');
      }

      const updatedQuote = await response.json();

      // Update local state
      setQuote(updatedQuote);

      // Send email notification if status was changed to approved
      if (formData.status === 'approved' && updatedQuote.quoted_price) {
        try {
          const emailResponse = await fetch('/api/notifications/quote-approved', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              quoteId: quoteId,
              adminEmail: adminEmail
            }),
          });

          if (emailResponse.ok) {
            alert('Quote updated successfully! Email notification sent to client.');
          } else {
            alert('Quote updated successfully, but failed to send email notification.');
          }
        } catch (emailError) {
          console.error('Email notification error:', emailError);
          alert('Quote updated successfully, but failed to send email notification.');
        }
      } else {
        alert('Quote updated successfully!');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Failed to update quote. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'quoted':
        return 'bg-purple-100 text-purple-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-800">Loading quote details...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Quote not found'}</p>
          <Link
            href="/admin/quotes"
            className="text-[#B8860B] hover:text-[#DAA520] font-medium"
          >
            Back to Quotes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/admin/quotes"
                className="text-gray-500 hover:text-[#8B4513] mr-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-[#8B4513]">Quote Request Details</h1>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
              {quote.status || 'pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Client Information */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Client Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{quote.contact_email}</p>
              </div>

              {quote.contact_phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{quote.contact_phone}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Request Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(quote.created_at)}</p>
              </div>

              {quote.budget_range && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget Range</label>
                  <p className="mt-1 text-sm text-gray-900">{quote.budget_range}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Trip Details */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Trip Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                <p className="mt-1 text-sm text-gray-900">{quote.destination}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <p className="mt-1 text-sm text-gray-900">{quote.duration} days</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Travelers</label>
                <p className="mt-1 text-sm text-gray-900">{quote.participants}</p>
              </div>

              {quote.travel_dates_start && quote.travel_dates_end && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Travel Dates</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(quote.travel_dates_start).toLocaleDateString()} - {new Date(quote.travel_dates_end).toLocaleDateString()}
                  </p>
                </div>
              )}

              {quote.special_requirements && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Special Requirements</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{quote.special_requirements}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Admin Response Form */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-6">Admin Response</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="quoted">Quoted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label htmlFor="quoted_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Quoted Price
                </label>
                <input
                  type="number"
                  id="quoted_price"
                  name="quoted_price"
                  min="0"
                  step="0.01"
                  value={formData.quoted_price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  placeholder="e.g., 3500"
                />
              </div>

              <div>
                <label htmlFor="quoted_currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  id="quoted_currency"
                  name="quoted_currency"
                  value={formData.quoted_currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                id="admin_notes"
                name="admin_notes"
                rows={4}
                value={formData.admin_notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                placeholder="Internal notes about this quote request..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/quotes"
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Quotes
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#B8860B] hover:bg-[#DAA520] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Update Quote'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}