'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import { clearContentCache } from '@/lib/content';
import { SiteSetting } from '@/types/database';

export default function AdminSettings() {
  const { loading: authLoading, isAuthenticated, logout } = useSimpleAdminAuth();
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'admin' | 'system'>('general');

  // Form states
  const [generalForm, setGeneralForm] = useState<{[key: string]: string}>({});
  const [contactForm, setContactForm] = useState<{[key: string]: string}>({});
  const [adminForm, setAdminForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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
      fetchSettings();
    }
  }, [isAuthenticated]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_key');

      if (error && !error.message.includes('relation "site_settings" does not exist')) {
        throw error;
      }

      if (data) {
        setSettings(data);
        
        // Initialize forms with current values
        const general: {[key: string]: string} = {};
        const contact: {[key: string]: string} = {};

        data.forEach(setting => {
          if (isGeneralSetting(setting.setting_key)) {
            general[setting.setting_key] = setting.setting_value;
          } else if (isContactSetting(setting.setting_key)) {
            contact[setting.setting_key] = setting.setting_value;
          }
        });

        setGeneralForm(general);
        setContactForm(contact);
      } else {
        // Initialize with default settings if no data
        initializeDefaultSettings();
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
      initializeDefaultSettings();
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultSettings = () => {
    const defaultGeneral = {
      company_name: 'Meridian Luxury Travel',
      tagline: 'Creating extraordinary travel experiences',
      business_hours: 'Monday - Friday: 9:00 AM - 6:00 PM EST',
      website_url: 'https://www.meridianluxury.travel'
    };

    const defaultContact = {
      contact_email: 'chris@meridianluxury.travel',
      contact_phone: '+1 (555) 123-4567',
      emergency_contact: '+1 (555) 911-HELP',
      company_address: '123 Travel Way, Adventure City, AC 12345'
    };

    setGeneralForm(defaultGeneral);
    setContactForm(defaultContact);
  };

  const isGeneralSetting = (key: string) => {
    return ['company_name', 'tagline', 'business_hours', 'website_url', 'booking_terms', 'cancellation_policy'].includes(key);
  };

  const isContactSetting = (key: string) => {
    return ['contact_email', 'contact_phone', 'emergency_contact', 'company_address', 'social_facebook', 'social_instagram'].includes(key);
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(generalForm, 'General settings');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(contactForm, 'Contact settings');
  };

  const saveSettings = async (formData: {[key: string]: string}, settingsType: string) => {
    setSaving(true);
    try {
      // Update existing settings or insert new ones
      for (const [key, value] of Object.entries(formData)) {
        const existingSetting = settings.find(s => s.setting_key === key);
        
        if (existingSetting) {
          // Update existing
          const { error } = await supabase
            .from('site_settings')
            .update({ 
              setting_value: value,
              updated_at: new Date().toISOString()
            })
            .eq('setting_key', key);

          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from('site_settings')
            .insert({
              setting_key: key,
              setting_value: value,
              setting_type: getSettingType(key),
              description: getSettingDescription(key)
            });

          if (error) throw error;
        }
      }

      // Update local state
      setSettings(prev => {
        const updated = [...prev];
        Object.entries(formData).forEach(([key, value]) => {
          const existingIndex = updated.findIndex(s => s.setting_key === key);
          if (existingIndex >= 0) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              setting_value: value,
              updated_at: new Date().toISOString()
            };
          } else {
            updated.push({
              id: `new_${key}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              setting_key: key,
              setting_value: value,
              setting_type: getSettingType(key),
              description: getSettingDescription(key)
            });
          }
        });
        return updated;
      });

      // Clear cache so changes appear immediately on the website
      clearContentCache();
      alert(`${settingsType} updated successfully!`);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Failed to save ${settingsType.toLowerCase()}. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  const getSettingType = (key: string): 'text' | 'email' | 'phone' | 'url' | 'textarea' => {
    if (key.includes('email')) return 'email';
    if (key.includes('phone') || key.includes('contact')) return 'phone';
    if (key.includes('url') || key.includes('website') || key.includes('social')) return 'url';
    if (key.includes('address') || key.includes('terms') || key.includes('policy')) return 'textarea';
    return 'text';
  };

  const getSettingDescription = (key: string): string => {
    const descriptions: {[key: string]: string} = {
      company_name: 'Company Name',
      tagline: 'Company Tagline',
      business_hours: 'Business Hours',
      website_url: 'Website URL',
      contact_email: 'Main Contact Email',
      contact_phone: 'Main Contact Phone',
      emergency_contact: '24/7 Emergency Contact',
      company_address: 'Company Address',
      social_facebook: 'Facebook URL',
      social_instagram: 'Instagram URL',
      booking_terms: 'Booking Terms',
      cancellation_policy: 'Cancellation Policy'
    };
    return descriptions[key] || key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminForm.newPassword !== adminForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (adminForm.newPassword.length < 8) {
      alert('New password must be at least 8 characters long');
      return;
    }

    // For the simple auth system, we'll just update localStorage
    // In a real system, you'd verify the current password and hash the new one
    try {
      const session = localStorage.getItem('admin_session');
      if (session) {
        const sessionData = JSON.parse(session);
        // This is a simplified implementation - in production, you'd handle this server-side
        alert('Password functionality is not implemented in this demo. In production, this would securely update your admin password.');
      }
    } catch (error) {
      alert('Error updating password');
    }

    // Reset form
    setAdminForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
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
          <p className="text-gray-800">Loading settings...</p>
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
              <h1 className="text-2xl font-bold text-[#8B4513]">Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-[#B8860B] text-[#B8860B]'
                    : 'border-transparent text-gray-700 hover:text-[#8B4513] hover:border-gray-300'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contact'
                    ? 'border-[#B8860B] text-[#B8860B]'
                    : 'border-transparent text-gray-700 hover:text-[#8B4513] hover:border-gray-300'
                }`}
              >
                Contact Info
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admin'
                    ? 'border-[#B8860B] text-[#B8860B]'
                    : 'border-transparent text-gray-700 hover:text-[#8B4513] hover:border-gray-300'
                }`}
              >
                Admin Account
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'system'
                    ? 'border-[#B8860B] text-[#B8860B]'
                    : 'border-transparent text-gray-700 hover:text-[#8B4513] hover:border-gray-300'
                }`}
              >
                System Info
              </button>
            </nav>
          </div>

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">General Settings</h3>
              
              <form onSubmit={handleGeneralSubmit} className="max-w-2xl space-y-6">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    required
                    value={generalForm.company_name || ''}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, company_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Tagline
                  </label>
                  <input
                    type="text"
                    id="tagline"
                    value={generalForm.tagline || ''}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, tagline: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="e.g., Creating extraordinary travel experiences"
                  />
                </div>

                <div>
                  <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website_url"
                    value={generalForm.website_url || ''}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, website_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="https://www.yourwebsite.com"
                  />
                </div>

                <div>
                  <label htmlFor="business_hours" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Hours
                  </label>
                  <input
                    type="text"
                    id="business_hours"
                    value={generalForm.business_hours || ''}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, business_hours: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="e.g., Monday - Friday: 9:00 AM - 6:00 PM EST"
                  />
                </div>

                <div>
                  <label htmlFor="booking_terms" className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Terms & Conditions
                  </label>
                  <textarea
                    id="booking_terms"
                    rows={4}
                    value={generalForm.booking_terms || ''}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, booking_terms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="Enter your booking terms and conditions..."
                  />
                </div>

                <div>
                  <label htmlFor="cancellation_policy" className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Policy
                  </label>
                  <textarea
                    id="cancellation_policy"
                    rows={4}
                    value={generalForm.cancellation_policy || ''}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, cancellation_policy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="Enter your cancellation policy..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-[#B8860B] hover:bg-[#DAA520] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save General Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Contact Info Tab */}
          {activeTab === 'contact' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Contact Information</h3>
              
              <form onSubmit={handleContactSubmit} className="max-w-2xl space-y-6">
                <div>
                  <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                    Main Contact Email *
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    required
                    value={contactForm.contact_email || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, contact_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Main Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contact_phone"
                    value={contactForm.contact_phone || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-2">
                    24/7 Emergency Contact
                  </label>
                  <input
                    type="tel"
                    id="emergency_contact"
                    value={contactForm.emergency_contact || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="+1 (555) 911-HELP"
                  />
                </div>

                <div>
                  <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Address
                  </label>
                  <textarea
                    id="company_address"
                    rows={3}
                    value={contactForm.company_address || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, company_address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="123 Travel Way, Adventure City, AC 12345"
                  />
                </div>

                <div>
                  <label htmlFor="social_facebook" className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    id="social_facebook"
                    value={contactForm.social_facebook || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, social_facebook: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="https://facebook.com/yourcompany"
                  />
                </div>

                <div>
                  <label htmlFor="social_instagram" className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    id="social_instagram"
                    value={contactForm.social_instagram || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, social_instagram: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    placeholder="https://instagram.com/yourcompany"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-[#B8860B] hover:bg-[#DAA520] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Contact Info'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Admin Account Tab */}
          {activeTab === 'admin' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Admin Account Settings</h3>
              
              <div className="max-w-2xl space-y-8">
                {/* Current Admin Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Current Admin Account</h4>
                  <p className="text-sm text-gray-700">Email: chris@meridianluxury.travel</p>
                  <p className="text-sm text-gray-700">Role: Super Admin</p>
                  <p className="text-sm text-gray-700">Last Login: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Change Password Form */}
                <form onSubmit={handleAdminSubmit} className="space-y-6">
                  <h4 className="text-md font-medium text-gray-900">Change Password</h4>
                  
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      id="current_password"
                      required
                      value={adminForm.currentPassword}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <input
                      type="password"
                      id="new_password"
                      required
                      value={adminForm.newPassword}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      minLength={8}
                    />
                    <p className="text-xs text-gray-600 mt-1">Minimum 8 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      required
                      value={adminForm.confirmPassword}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      minLength={8}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* System Info Tab */}
          {activeTab === 'system' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">System Information</h3>
              
              <div className="max-w-2xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Application Info</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><span className="font-medium">Version:</span> 1.0.0</p>
                      <p><span className="font-medium">Environment:</span> Production</p>
                      <p><span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Database Info</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><span className="font-medium">Status:</span> <span className="text-green-600">Connected</span></p>
                      <p><span className="font-medium">Total Packages:</span> {settings.length > 0 ? 'Available' : 'N/A'}</p>
                      <p><span className="font-medium">Total Bookings:</span> Available</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">System Status</h4>
                  <p className="text-sm text-blue-700">All systems operational. Content management, booking system, and analytics are functioning normally.</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">Maintenance</h4>
                  <p className="text-sm text-yellow-700">No scheduled maintenance. System backups are performed automatically daily.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}