'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import { clearContentCache } from '@/lib/content';

interface ContentSection {
  id: string;
  section_key: string;
  title: string;
  content: string;
  section_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Define the page structure and editable sections
const PAGE_SECTIONS = {
  'Home': {
    key: 'home',
    sections: {
      'Hero Title': 'hero_title',
      'Hero Subtitle': 'hero_subtitle', 
      'Hero CTA Button': 'hero_cta',
      'Hero Secondary CTA': 'hero_cta_secondary',
      'About Title': 'about_title',
      'About Content': 'about_content',
      'Feature 1 Title': 'feature_1_title',
      'Feature 1 Content': 'feature_1_content',
      'Feature 2 Title': 'feature_2_title',
      'Feature 2 Content': 'feature_2_content',
      'Feature 3 Title': 'feature_3_title',
      'Feature 3 Content': 'feature_3_content',
      'Featured Destinations Title': 'featured_destinations_title',
      'Featured Destinations Subtitle': 'featured_destinations_subtitle',
      'Destination 1 Title': 'destination_1_title',
      'Destination 1 Content': 'destination_1_content',
      'Destination 2 Title': 'destination_2_title', 
      'Destination 2 Content': 'destination_2_content',
      'Destination 3 Title': 'destination_3_title',
      'Destination 3 Content': 'destination_3_content',
      'CTA Title': 'cta_title',
      'CTA Subtitle': 'cta_subtitle',
      'CTA Button': 'cta_button'
    }
  },
  'About Us': {
    key: 'about',
    sections: {
      'Page Title': 'about_page_title',
      'Main Content': 'about_content',
      'Story Title': 'about_story_title', 
      'Story Content': 'about_story_content',
      'Services Title': 'about_services_title',
      'Services Content': 'about_services_content',
      'Service 1 Title': 'about_service_1_title',
      'Service 1 Content': 'about_service_1_content',
      'Service 2 Title': 'about_service_2_title',
      'Service 2 Content': 'about_service_2_content',
      'Service 3 Title': 'about_service_3_title',
      'Service 3 Content': 'about_service_3_content',
      'Service 4 Title': 'about_service_4_title',
      'Service 4 Content': 'about_service_4_content'
    }
  },
  'Contact': {
    key: 'contact',
    sections: {
      'Page Title': 'contact_page_title',
      'Page Subtitle': 'contact_page_subtitle',
      'Section Title': 'contact_section_title',
      'Phone Number': 'contact_phone',
      'Phone Hours': 'contact_phone_hours',
      'Email Address': 'contact_email',
      'Email Response Time': 'contact_email_response',
      'Office Address': 'contact_address',
      'Emergency Phone': 'contact_emergency_phone',
      'Emergency Text': 'contact_emergency_text',
      'Quick Action Title': 'contact_quick_action_title',
      'Quick Action Content': 'contact_quick_action_content',
      'Quick Action Button': 'contact_quick_action_button',
      'FAQ Title': 'contact_faq_title',
      'FAQ 1 Question': 'contact_faq_1_question',
      'FAQ 1 Answer': 'contact_faq_1_answer',
      'FAQ 2 Question': 'contact_faq_2_question',
      'FAQ 2 Answer': 'contact_faq_2_answer',
      'FAQ 3 Question': 'contact_faq_3_question',
      'FAQ 3 Answer': 'contact_faq_3_answer',
      'FAQ 4 Question': 'contact_faq_4_question',
      'FAQ 4 Answer': 'contact_faq_4_answer',
      'FAQ 5 Question': 'contact_faq_5_question',
      'FAQ 5 Answer': 'contact_faq_5_answer',
      'FAQ 6 Question': 'contact_faq_6_question',
      'FAQ 6 Answer': 'contact_faq_6_answer',
      'CTA Title': 'contact_cta_title',
      'CTA Subtitle': 'contact_cta_subtitle',
      'CTA Button 1': 'contact_cta_button_1',
      'CTA Button 2': 'contact_cta_button_2'
    }
  },
  'Destinations': {
    key: 'destinations',
    sections: {
      'Page Title': 'destinations_page_title',
      'Page Subtitle': 'destinations_page_subtitle',
      'Available Title': 'destinations_available_title',
      'Available Subtitle': 'destinations_available_subtitle',
      'Coming Soon Title': 'destinations_coming_title',
      'Coming Soon Subtitle': 'destinations_coming_subtitle',
      'CTA Title': 'destinations_cta_title',
      'CTA Subtitle': 'destinations_cta_subtitle'
    }
  }
};

export default function AdminContent() {
  const { loading: authLoading, isAuthenticated, logout } = useSimpleAdminAuth();
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [contentForm, setContentForm] = useState({
    title: '',
    content: '',
    is_active: true
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
    console.log('useEffect triggered - isAuthenticated:', isAuthenticated, 'authLoading:', authLoading);
    
    if (isAuthenticated && !authLoading) {
      fetchContentSections();
    } else if (!authLoading && !isAuthenticated) {
      // If not authenticated and not loading, set loading to false
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const fetchContentSections = async () => {
    try {
      console.log('Starting to fetch content sections...');
      setLoading(true);
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const supabasePromise = supabase
        .from('content_sections')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

      console.log('Supabase response:', { data, error, dataLength: data?.length });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Successfully fetched', data?.length || 0, 'content sections');
      setContentSections(data || []);
    } catch (err) {
      console.error('Catch block - Error fetching content:', err);
      if (err.message === 'Request timeout') {
        setError('Request timed out - please try refreshing');
      } else {
        setError('Failed to load content sections');
      }
      setContentSections([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handlePageChange = (page: string) => {
    setSelectedPage(page);
    setSelectedSection('');
    setContentForm({ title: '', content: '', is_active: true });
    setError(null);
    setSuccess(null);
  };

  const handleSectionChange = (sectionKey: string, sectionTitle: string) => {
    setSelectedSection(sectionKey);
    
    // Find existing content for this section
    const existingContent = contentSections.find(cs => cs.section_key === sectionKey);
    
    if (existingContent) {
      setContentForm({
        title: existingContent.title,
        content: existingContent.content,
        is_active: existingContent.is_active
      });
    } else {
      setContentForm({
        title: sectionTitle,
        content: '',
        is_active: true
      });
    }
    
    setError(null);
    setSuccess(null);
  };

  const handleSaveContent = async () => {
    if (!selectedSection || !contentForm.title.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const existingContent = contentSections.find(cs => cs.section_key === selectedSection);
      const pageKey = PAGE_SECTIONS[selectedPage as keyof typeof PAGE_SECTIONS]?.key || 'general';

      if (existingContent) {
        // Update existing content
        const { error } = await supabase
          .from('content_sections')
          .update({
            title: contentForm.title,
            content: contentForm.content,
            is_active: contentForm.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContent.id);

        if (error) throw error;
      } else {
        // Create new content
        const { error } = await supabase
          .from('content_sections')
          .insert({
            section_key: selectedSection,
            title: contentForm.title,
            content: contentForm.content,
            section_type: pageKey,
            is_active: contentForm.is_active
          });

        if (error) throw error;
      }

      // Clear cache and refresh
      clearContentCache();
      await fetchContentSections();
      
      setSuccess('Content updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error saving content:', err);
      setError('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const availableSections = selectedPage ? PAGE_SECTIONS[selectedPage as keyof typeof PAGE_SECTIONS]?.sections || {} : {};

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
              <h1 className="text-2xl font-bold text-[#8B4513]">Website Content Manager</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#8B4513] mb-6">Edit Content Section</h2>
              
              {/* Page Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Page <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPage}
                  onChange={(e) => handlePageChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-black"
                >
                  <option value="">Choose a page to edit...</option>
                  {Object.keys(PAGE_SECTIONS).map(page => (
                    <option key={page} value={page}>{page}</option>
                  ))}
                </select>
              </div>

              {/* Section Selection */}
              {selectedPage && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => {
                      const sectionKey = e.target.value;
                      const sectionTitle = e.target.options[e.target.selectedIndex].text;
                      handleSectionChange(sectionKey, sectionTitle);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-black"
                  >
                    <option value="">Choose a section to edit...</option>
                    {Object.entries(availableSections).map(([title, key]) => (
                      <option key={key} value={key}>{title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Content Form */}
              {selectedSection && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contentForm.title}
                      onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-black"
                      placeholder="Enter section title..."
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={contentForm.content}
                      onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-black"
                      placeholder="Enter your content here..."
                    />
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={contentForm.is_active}
                        onChange={(e) => setContentForm({ ...contentForm, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                      />
                      <span className="ml-2 text-sm text-black">Active (visible on website)</span>
                    </label>
                  </div>

                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                      {success}
                    </div>
                  )}

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setSelectedSection('');
                        setContentForm({ title: '', content: '', is_active: true });
                        setError(null);
                        setSuccess(null);
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveContent}
                      disabled={saving}
                      className="px-6 py-2 bg-[#B8860B] hover:bg-[#DAA520] text-white rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Update Content'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Existing Content Sections */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#8B4513]">Existing Content Sections</h3>
                <button
                  onClick={() => {
                    console.log('Manual refresh clicked');
                    fetchContentSections();
                  }}
                  className="text-sm text-[#B8860B] hover:text-[#DAA520] font-medium"
                >
                  Refresh
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513] mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading content sections...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-2">{error}</div>
                  <button
                    onClick={fetchContentSections}
                    className="text-sm text-[#B8860B] hover:text-[#DAA520] font-medium"
                  >
                    Try Again
                  </button>
                </div>
              ) : contentSections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No content sections found.</p>
                  <p className="text-xs mt-2">Create some content using the form on the left.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {contentSections.map((section) => (
                    <div
                      key={section.id}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        // Auto-select the page and section when clicking on existing content
                        const pageEntry = Object.entries(PAGE_SECTIONS).find(([, pageData]) => 
                          Object.values(pageData.sections).includes(section.section_key as any)
                        );
                        if (pageEntry) {
                          const [pageName, pageData] = pageEntry;
                          const sectionTitle = Object.entries(pageData.sections).find(([, key]) => key === section.section_key)?.[0] || section.title;
                          setSelectedPage(pageName);
                          handleSectionChange(section.section_key, sectionTitle);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {section.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {section.section_type} • {section.section_key}
                          </p>
                        </div>
                        <div className="flex items-center ml-2">
                          <span className={`w-2 h-2 rounded-full ${
                            section.is_active ? 'bg-green-400' : 'bg-gray-300'
                          }`}></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}