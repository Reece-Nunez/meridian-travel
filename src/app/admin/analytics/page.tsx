'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  totalQuotes: number;
  conversionRate: number;
  averageBookingValue: number;
  pendingRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topDestinations: { destination: string; bookings: number; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
  quotesByStatus: { status: string; count: number }[];
  paymentBreakdown: { type: string; amount: number; count: number }[];
}

export default function AdminAnalytics() {
  const { loading: authLoading, isAuthenticated, logout } = useSimpleAdminAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>('all');

  const getUsername = () => {
    try {
      const session = localStorage.getItem('admin_session');
      if (session) {
        const sessionData = JSON.parse(session);
        const email = sessionData.email;
        if (email === 'chris@meridianluxury.travel') {
          return 'Chris';
        }
        return email.split('@')[0];
      }
    } catch (error) {
      console.error('Error getting username:', error);
    }
    return 'Admin';
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated, timeFilter]);

  const getDateFilter = () => {
    const now = new Date();
    switch (timeFilter) {
      case '30':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      case '365':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return null;
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const dateFilter = getDateFilter();
      
      // Base queries with optional date filtering
      const bookingsQuery = supabase
        .from('bookings')
        .select('*');
      
      const quotesQuery = supabase
        .from('custom_quotes')
        .select('*');

      if (dateFilter) {
        bookingsQuery.gte('created_at', dateFilter);
        quotesQuery.gte('created_at', dateFilter);
      }

      // Fetch all data in parallel
      const [
        { data: bookings, error: bookingsError },
        { data: quotes, error: quotesError },
        { data: packages, error: packagesError }
      ] = await Promise.all([
        bookingsQuery,
        quotesQuery,
        supabase.from('trip_packages').select('*')
      ]);

      if (bookingsError) throw bookingsError;
      if (quotesError) throw quotesError;
      if (packagesError) throw packagesError;

      // Calculate analytics
      const totalBookings = bookings?.length || 0;
      const totalQuotes = quotes?.length || 0;
      const conversionRate = totalQuotes > 0 ? (totalBookings / totalQuotes) * 100 : 0;

      // Revenue calculations
      const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      const paidBookings = bookings?.filter(b => b.full_payment_paid) || [];
      const actualRevenue = paidBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
      const pendingRevenue = totalRevenue - actualRevenue;
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Monthly revenue (last 12 months)
      const monthlyRevenue = calculateMonthlyRevenue(bookings || []);

      // Top destinations
      const destinationStats = calculateDestinationStats(bookings || [], quotes || []);

      // Booking status breakdown
      const bookingsByStatus = calculateStatusBreakdown(bookings || []);

      // Quote status breakdown
      const quotesByStatus = calculateStatusBreakdown(quotes || []);

      // Payment breakdown
      const paymentBreakdown = calculatePaymentBreakdown(bookings || []);

      const analyticsData: AnalyticsData = {
        totalRevenue: actualRevenue,
        totalBookings,
        totalQuotes,
        conversionRate,
        averageBookingValue,
        pendingRevenue,
        monthlyRevenue,
        topDestinations: destinationStats,
        bookingsByStatus,
        quotesByStatus,
        paymentBreakdown
      };

      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (bookings: any[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().substring(0, 7); // YYYY-MM
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthlyBookings = bookings.filter(booking => 
        booking.created_at.startsWith(monthStr) && booking.full_payment_paid
      );
      
      const revenue = monthlyBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
      
      months.push({ month: monthName, revenue });
    }
    
    return months;
  };

  const calculateDestinationStats = (bookings: any[], quotes: any[]) => {
    const destinationMap = new Map();

    // Add booking destinations
    bookings.forEach(booking => {
      const dest = booking.destination || 'Unknown';
      const current = destinationMap.get(dest) || { destination: dest, bookings: 0, revenue: 0 };
      current.bookings += 1;
      current.revenue += booking.total_amount || 0;
      destinationMap.set(dest, current);
    });

    // Add quote destinations (for interest tracking)
    quotes.forEach(quote => {
      const dest = quote.destination || 'Unknown';
      if (!destinationMap.has(dest)) {
        destinationMap.set(dest, { destination: dest, bookings: 0, revenue: 0 });
      }
    });

    return Array.from(destinationMap.values())
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);
  };

  const calculateStatusBreakdown = (items: any[]) => {
    const statusMap = new Map();
    
    items.forEach(item => {
      const status = item.status || 'pending';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    return Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
  };

  const calculatePaymentBreakdown = (bookings: any[]) => {
    const fullyPaid = bookings.filter(b => b.full_payment_paid);
    const depositOnly = bookings.filter(b => b.deposit_paid && !b.full_payment_paid);
    const unpaid = bookings.filter(b => !b.deposit_paid && !b.full_payment_paid);

    return [
      {
        type: 'Fully Paid',
        count: fullyPaid.length,
        amount: fullyPaid.reduce((sum, b) => sum + (b.total_amount || 0), 0)
      },
      {
        type: 'Deposit Only',
        count: depositOnly.length,
        amount: depositOnly.reduce((sum, b) => sum + (b.deposit_amount || 0), 0)
      },
      {
        type: 'Unpaid',
        count: unpaid.length,
        amount: unpaid.reduce((sum, b) => sum + (b.total_amount || 0), 0)
      }
    ];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      quoted: 'bg-purple-100 text-purple-800',
      confirmed: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      paid: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
          <p className="text-gray-800">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load analytics'}</p>
          <button
            onClick={() => fetchAnalytics()}
            className="text-[#B8860B] hover:text-[#DAA520] font-medium"
          >
            Try Again
          </button>
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
                href="/admin"
                className="text-gray-500 hover:text-[#8B4513] mr-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-[#8B4513]">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900 text-sm"
              >
                <option value="all">All Time</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
              </select>
              <span className="text-sm text-gray-700">Welcome, {getUsername()}</span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-red-600 font-medium text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(analytics.totalRevenue)}</dd>
                </dl>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">Total Bookings</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalBookings}</dd>
                </dl>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">Quote Requests</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalQuotes}</dd>
                </dl>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">Conversion Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.conversionRate.toFixed(1)}%</dd>
                </dl>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Confirmed Revenue:</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(analytics.totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Pending Revenue:</span>
                <span className="text-sm font-medium text-orange-600">{formatCurrency(analytics.pendingRevenue)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-sm font-medium text-gray-900">Average Booking Value:</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(analytics.averageBookingValue)}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status</h3>
            <div className="space-y-3">
              {analytics.paymentBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-700">{item.type}:</span>
                    <span className="text-xs text-gray-500 ml-2">({item.count} bookings)</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Monthly Revenue Chart */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-6">Revenue Trend (Last 12 Months)</h3>
          <div className="space-y-4">
            {analytics.monthlyRevenue.map((month, index) => {
              const maxRevenue = Math.max(...analytics.monthlyRevenue.map(m => m.revenue));
              const barWidth = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 text-sm text-gray-700 font-medium">{month.month}</div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-6 relative">
                      <motion.div
                        className="bg-[#B8860B] h-6 rounded-full flex items-center justify-end pr-2"
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      >
                        {month.revenue > 0 && (
                          <span className="text-xs text-white font-medium">
                            {formatCurrency(month.revenue)}
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Destinations */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Popular Destinations</h3>
            <div className="space-y-4">
              {analytics.topDestinations.slice(0, 8).map((dest, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{dest.destination}</div>
                    <div className="text-xs text-gray-700">{dest.bookings} bookings</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(dest.revenue)}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Booking Status */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Booking Status</h3>
            <div className="space-y-3">
              {analytics.bookingsByStatus.map((status, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                    {status.status}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{status.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quote Status */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-6">Quote Status</h3>
            <div className="space-y-3">
              {analytics.quotesByStatus.map((status, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                    {status.status}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{status.count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}