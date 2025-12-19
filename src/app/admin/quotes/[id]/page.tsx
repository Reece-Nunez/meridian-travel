'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CustomQuote, TripPackage } from '@/types/database';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import { usePercentageScrollRestoration } from '@/hooks/usePercentageScrollRestoration';
import ItineraryBuilder from '@/components/ItineraryBuilder';
import PDFInvoiceGenerator from '@/components/PDFInvoiceGenerator';
import Modal from '@/components/Modal';
import CustomerItineraryPreview from '@/components/CustomerItineraryPreview';
import CustomerInvoicePreview from '@/components/CustomerInvoicePreview';
import { parseGroupDetails } from '@/utils/parseQuoteDetails';

export default function QuoteDetail() {
  const { loading: authLoading, isAuthenticated, refreshSession } = useSimpleAdminAuth();
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<CustomQuote | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<TripPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showItineraryPreview, setShowItineraryPreview] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  const [formData, setFormData] = useState({
    status: 'pending',
    quoted_price: '',
    quoted_currency: 'USD',
    admin_notes: '',
    adult_price: '',
    child_price: '',
    adult_count: 0,
    child_count: 0,
    inclusions: [] as string[],
    exclusions: [] as string[],
    pdf_title: ''
  });

  // Restore scroll position on refresh/back button
  usePercentageScrollRestoration(`admin-quote-${quoteId}`, !loading);

  useEffect(() => {
    if (isAuthenticated && quoteId) {
      fetchQuote();
    }
  }, [isAuthenticated, quoteId]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      
      // Get admin email from session, with fallback to expected admin email
      const session = localStorage.getItem('admin_session');
      let adminEmail = session ? JSON.parse(session).email : '';

      // Ensure we use the correct admin email for API calls
      if (!adminEmail || adminEmail !== 'chris@meridianluxury.travel') {
        adminEmail = 'chris@meridianluxury.travel';
        console.log('Using fallback admin email for fetch:', adminEmail);
      }

      const response = await fetch(`/api/admin/quotes/${quoteId}?admin_email=${encodeURIComponent(adminEmail)}`);
      
      if (!response.ok) {
        throw new Error('Quote not found');
      }
      
      const data = await response.json();
      
      if (data) {
        setQuote(data);

        // Fetch selected package if it exists
        if (data.selected_package_id) {
          try {
            const { data: packageData, error: packageError } = await supabase
              .from('trip_packages')
              .select('*')
              .eq('id', data.selected_package_id)
              .single();

            if (!packageError && packageData) {
              setSelectedPackage(packageData);
            }
          } catch (packageErr) {
            console.error('Error fetching selected package:', packageErr);
          }
        }

        // Parse group details from special_requirements only as fallback for very old quotes
        const groupDetails = parseGroupDetails(data.special_requirements);

        setFormData({
          status: data.status || 'pending',
          quoted_price: data.quoted_price?.toString() || '',
          quoted_currency: data.quoted_currency || 'USD',
          admin_notes: data.admin_notes || '',
          adult_price: data.adult_price?.toString() || '',
          child_price: data.child_price?.toString() || '',
          // Use database values if they exist, only fallback to parsing if they're null/undefined
          adult_count: data.adult_count !== null && data.adult_count !== undefined ? data.adult_count : groupDetails.adults,
          child_count: data.child_count !== null && data.child_count !== undefined ? data.child_count : groupDetails.children,
          inclusions: data.inclusions || [],
          exclusions: data.exclusions || [],
          pdf_title: data.pdf_title || ''
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
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Auto-calculate quoted_price and participants when adult/child prices or counts change
      if (['adult_price', 'child_price', 'adult_count', 'child_count'].includes(name)) {
        const adultPrice = name === 'adult_price' ? parseFloat(value) || 0 : parseFloat(newData.adult_price) || 0;
        const childPrice = name === 'child_price' ? parseFloat(value) || 0 : parseFloat(newData.child_price) || 0;
        const adultCount = name === 'adult_count' ? parseInt(value) || 0 : parseInt(newData.adult_count?.toString()) || 0;
        const childCount = name === 'child_count' ? parseInt(value) || 0 : parseInt(newData.child_count?.toString()) || 0;

        const totalPrice = (adultPrice * adultCount) + (childPrice * childCount);
        newData.quoted_price = totalPrice > 0 ? totalPrice.toString() : '';

        // Auto-update participants count for immediate UI update
        const totalParticipants = adultCount + childCount;
        if (quote) {
          setQuote(prev => prev ? { ...prev, participants: totalParticipants } : prev);
        }
      }

      return newData;
    });
  };

  // Functions for managing inclusions
  const addInclusion = () => {
    setFormData(prev => ({
      ...prev,
      inclusions: [...prev.inclusions, '']
    }));
  };

  const removeInclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }));
  };

  const updateInclusion = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.map((item, i) => i === index ? value : item)
    }));
  };

  // Functions for managing exclusions
  const addExclusion = () => {
    setFormData(prev => ({
      ...prev,
      exclusions: [...prev.exclusions, '']
    }));
  };

  const removeExclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exclusions: prev.exclusions.filter((_, i) => i !== index)
    }));
  };

  const updateExclusion = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      exclusions: prev.exclusions.map((item, i) => i === index ? value : item)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Refresh session before saving to prevent auth issues
      const sessionValid = await refreshSession();
      if (!sessionValid) {
        alert('Your session has expired. Please log in again.');
        setSaving(false);
        return;
      }

      // Get admin email from session, with fallback to expected admin email
      const session = localStorage.getItem('admin_session');
      let adminEmail = session ? JSON.parse(session).email : '';

      // Ensure we use the correct admin email for API calls
      if (!adminEmail || adminEmail !== 'chris@meridianluxury.travel') {
        adminEmail = 'chris@meridianluxury.travel';
        console.log('Using fallback admin email for notifications:', adminEmail);
      }

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
          adult_price: formData.adult_price ? parseFloat(formData.adult_price) : null,
          child_price: formData.child_price ? parseFloat(formData.child_price) : null,
          adult_count: formData.adult_count,
          child_count: formData.child_count,
          participants: parseInt(formData.adult_count.toString()) + parseInt(formData.child_count.toString()),
          inclusions: formData.inclusions,
          exclusions: formData.exclusions,
          pdf_title: formData.pdf_title,
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
          console.log('Sending email notification for quote:', quoteId);
          console.log('Admin email:', adminEmail);

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

          console.log('Email response status:', emailResponse.status);

          if (emailResponse.ok) {
            const result = await emailResponse.json();
            console.log('Email sent successfully:', result);
            alert('Quote updated successfully! Email notification sent to client.');
          } else {
            const errorData = await emailResponse.text();
            console.error('Email send failed:', errorData);
            alert(`Quote updated successfully, but failed to send email notification. Error: ${errorData}`);
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
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPackageTypeColor = (packageType: string | null) => {
    switch (packageType) {
      case 'package':
        return 'bg-green-100 text-green-800';
      case 'cruise':
        return 'bg-blue-100 text-blue-800';
      case 'custom':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPackageTypeLabel = (packageType: string | null) => {
    switch (packageType) {
      case 'package':
        return 'Travel Package';
      case 'cruise':
        return 'Cruise Package';
      case 'custom':
      default:
        return 'Custom Experience';
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
                  <label className="block text-sm font-medium text-gray-700">Accommodations</label>
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

        {/* Package/Cruise Information */}
        {(quote.package_type !== 'custom' && quote.package_type !== null) && (
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {getPackageTypeLabel(quote.package_type)} Information
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPackageTypeColor(quote.package_type)}`}>
                {getPackageTypeLabel(quote.package_type)}
              </span>
            </div>

            {selectedPackage ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {quote.package_type === 'cruise' ? 'Cruise' : 'Package'} Title
                  </label>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{selectedPackage.title}</p>
                </div>

                {selectedPackage.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPackage.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPackage.duration} days</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destination</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPackage.destination}</p>
                  </div>
                  {selectedPackage.max_participants && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Max Participants</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPackage.max_participants}</p>
                    </div>
                  )}
                </div>

                {/* Cruise-specific information */}
                {quote.package_type === 'cruise' && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Cruise Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedPackage.cruise_line && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Cruise Line</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedPackage.cruise_line}</p>
                        </div>
                      )}
                      {selectedPackage.ship_name && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Ship Name</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedPackage.ship_name}</p>
                        </div>
                      )}
                      {selectedPackage.cabin_category && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Cabin Category</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedPackage.cabin_category}</p>
                        </div>
                      )}
                      {selectedPackage.departure_port && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Departure Port</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedPackage.departure_port}</p>
                        </div>
                      )}
                      {selectedPackage.arrival_port && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Arrival Port</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedPackage.arrival_port}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Package includes/excludes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4 mt-4">
                  {selectedPackage.includes && selectedPackage.includes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Includes</label>
                      <ul className="space-y-1">
                        {selectedPackage.includes.map((item, index) => (
                          <li key={index} className="text-sm text-gray-900 flex items-start">
                            <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPackage.excludes && selectedPackage.excludes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Excludes</label>
                      <ul className="space-y-1">
                        {selectedPackage.excludes.map((item, index) => (
                          <li key={index} className="text-sm text-gray-900 flex items-start">
                            <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Luxury highlights for cruises */}
                {selectedPackage.luxury_highlights && selectedPackage.luxury_highlights.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Luxury Highlights</label>
                    <ul className="space-y-1">
                      {selectedPackage.luxury_highlights.map((item, index) => (
                        <li key={index} className="text-sm text-gray-900 flex items-start">
                          <svg className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Selected {quote.package_type} information could not be loaded.</p>
                <p className="text-sm mt-1">Package ID: {quote.selected_package_id}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Admin Response Form */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-6">Admin Response</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status and Currency Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
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

            {/* Pricing Breakdown Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Pricing Breakdown</h4>

              {/* Traveler Counts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label htmlFor="adult_count" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Adults
                  </label>
                  <input
                    type="number"
                    id="adult_count"
                    name="adult_count"
                    min="0"
                    value={formData.adult_count}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="child_count" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Children (Under 12)
                  </label>
                  <input
                    type="number"
                    id="child_count"
                    name="child_count"
                    min="0"
                    value={formData.child_count}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  />
                </div>
              </div>

              {/* Pricing Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label htmlFor="adult_price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Adult ({formData.quoted_currency})
                  </label>
                  <input
                    type="number"
                    id="adult_price"
                    name="adult_price"
                    min="0"
                    step="0.01"
                    value={formData.adult_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="e.g., 5000"
                  />
                </div>
                <div>
                  <label htmlFor="child_price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Child Under 12 ({formData.quoted_currency})
                  </label>
                  <input
                    type="number"
                    id="child_price"
                    name="child_price"
                    min="0"
                    step="0.01"
                    value={formData.child_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="e.g., 3000"
                  />
                </div>
              </div>

              {/* Total Price Display */}
              <div className="bg-white p-4 rounded-lg border-2 border-[#B8860B]">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-700">Total Price:</span>
                  <span className="text-[#B8860B]">
                    {formData.quoted_currency} ${formData.quoted_price || '0'}
                  </span>
                </div>
                {(formData.adult_count > 0 || formData.child_count > 0) && (
                  <div className="mt-2 text-sm text-gray-600">
                    {formData.adult_count > 0 && (
                      <span>Adults: {formData.adult_count} × ${formData.adult_price || 0} = ${((parseFloat(formData.adult_price) || 0) * formData.adult_count).toFixed(2)}</span>
                    )}
                    {formData.adult_count > 0 && formData.child_count > 0 && <span> + </span>}
                    {formData.child_count > 0 && (
                      <span>Children: {formData.child_count} × ${formData.child_price || 0} = ${((parseFloat(formData.child_price) || 0) * formData.child_count).toFixed(2)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="pdf_title" className="block text-sm font-medium text-gray-700 mb-2">
                Custom PDF Title
              </label>
              <input
                type="text"
                id="pdf_title"
                name="pdf_title"
                value={formData.pdf_title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                placeholder={`e.g., "Reece's Awesome ${quote?.destination || 'Peru'} Adventure"`}
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be the main title shown in the PDF itinerary. If left empty, defaults to "Your {quote?.destination || 'Peru'} Adventure".
              </p>
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

            {/* What's Included Section */}
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">What's Included</h4>
                <button
                  type="button"
                  onClick={addInclusion}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>
              <div className="space-y-3">
                {formData.inclusions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items added yet. Click "Add Item" to start.</p>
                ) : (
                  formData.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={inclusion}
                        onChange={(e) => updateInclusion(index, e.target.value)}
                        placeholder="e.g., All meals and accommodation"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => removeInclusion(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* What's Not Included Section */}
            <div className="bg-red-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">What's Not Included</h4>
                <button
                  type="button"
                  onClick={addExclusion}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>
              <div className="space-y-3">
                {formData.exclusions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items added yet. Click "Add Item" to start.</p>
                ) : (
                  formData.exclusions.map((exclusion, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={exclusion}
                        onChange={(e) => updateExclusion(index, e.target.value)}
                        placeholder="e.g., International flights"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => removeExclusion(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
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

        {/* Itinerary Builder */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Itinerary Builder</h3>
            <button
              onClick={() => setShowItineraryPreview(true)}
              className="inline-flex items-center px-4 py-2 border border-[#B8860B] text-[#B8860B] bg-white hover:bg-[#B8860B] hover:text-white font-medium rounded-md transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview Customer View
            </button>
          </div>

          <ItineraryBuilder
            quoteId={quoteId}
            onSave={() => {
              console.log('Itinerary saved successfully');
            }}
          />
        </motion.div>

        {/* PDF Invoice Generator */}
        {quote.status === 'approved' && quote.quoted_price && (
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Professional Invoice</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowInvoicePreview(true)}
                  className="inline-flex items-center px-4 py-2 border border-[#B8860B] text-[#B8860B] bg-white hover:bg-[#B8860B] hover:text-white font-medium rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Customer View
                </button>
              </div>
            </div>

            <PDFInvoiceGenerator
              quote={quote}
              onGenerate={() => {
                console.log('PDF invoice generated for quote:', quoteId);
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Preview Modals */}
      <Modal
        isOpen={showItineraryPreview}
        onClose={() => setShowItineraryPreview(false)}
        title="Itinerary Preview - Customer View"
        size="full"
      >
        {quote && <CustomerItineraryPreview quote={quote} />}
      </Modal>

      <Modal
        isOpen={showInvoicePreview}
        onClose={() => setShowInvoicePreview(false)}
        title="Invoice Preview - Customer View"
        size="full"
      >
        {quote && <CustomerInvoicePreview quote={quote} />}
      </Modal>
    </div>
  );
}