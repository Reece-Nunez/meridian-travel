'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import { clearContentCache } from '@/lib/content';
import RichTextEditor from '@/components/RichTextEditor';

interface ContentSection {
  id: string;
  section_key: string;
  title: string;
  content: string | null;
  section_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// Define the page structure and editable sections
const PAGE_SECTIONS = {
  Home: {
    key: 'hero',
    sections: {
      'Hero Title': 'hero_title',
      'Hero Subtitle': 'hero_subtitle',
      'Hero CTA Button': 'hero_cta',
      'Hero Secondary CTA': 'hero_cta_secondary',
      'Why Choose Us Title': 'about_title',
      'Why Choose Us Content': 'about_content',
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
      'CTA Button': 'cta_button',
    },
  },
  'About Us': {
    key: 'about',
    sections: {
      'Page Title': 'about_page_title',
      'Main Content': 'about_page_content',
      'Story Title': 'about_story_title',
      'Story Content': 'about_story_content',
      'Services Title': 'about_services_title',
      'Services Content': 'about_services_content',
      'Commitment Title': 'about_commitment_title',
      'Commitment Content': 'about_commitment_content',
      'Commitment CTA': 'about_commitment_cta',
    },
  },
  Contact: {
    key: 'contact',
    sections: {
      'Page Title': 'contact_page_title',
      'Page Subtitle': 'contact_page_subtitle',
      'Section Title': 'contact_section_title',
      'Email Response Time': 'contact_email_response',
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
      'CTA Button 2': 'contact_cta_button_2',
    },
  },
  Destinations: {
    key: 'destinations',
    sections: {
      'Page Title': 'destinations_page_title',
      'Page Subtitle': 'destinations_page_subtitle',
      'Available Title': 'destinations_available_title',
      'Available Subtitle': 'destinations_available_subtitle',
      'Coming Soon Title': 'destinations_coming_title',
      'Coming Soon Subtitle': 'destinations_coming_subtitle',
      'CTA Title': 'destinations_cta_title',
      'CTA Subtitle': 'destinations_cta_subtitle',
      'CTA Button 1': 'destinations_cta_button_1',
      'CTA Button 2': 'destinations_cta_button_2',
    },
  },
  Cruises: {
    key: 'cruises',
    sections: {
      'Page Hero Title': 'cruises_page_title',
      'Page Hero Content': 'cruises_page_content',
      'Accommodations Title': 'cruises_accommodations_title',
      'Accommodations Subtitle': 'cruises_accommodations_subtitle',
      'Itineraries Title': 'cruises_itineraries_title',
      'Itineraries Subtitle': 'cruises_itineraries_subtitle',
      'Pricing Title': 'cruises_pricing_title',
      'Pricing Subtitle': 'cruises_pricing_subtitle',
      'What\'s Included Title': 'cruises_included_title',
      'Additional Info Title': 'cruises_additional_title',
      'Booking Banner Title': 'cruises_booking_title',
      'Booking Banner Subtitle': 'cruises_booking_subtitle',
      'Booking Banner Button': 'cruises_booking_button',
    },
  },
  'Navigation & Global': {
    key: 'global',
    sections: {
      'Company Name': 'nav_company_name',
      'Company Tagline': 'nav_company_tagline',
      'Login Text': 'nav_login_text',
      'Get Quote Text': 'nav_get_quote_text',
      'Dashboard Text': 'nav_dashboard_text',
      'Profile Text': 'nav_profile_text',
      'Sign Out Text': 'nav_sign_out_text',
      'Destinations Menu': 'nav_destinations_text',
      'View All Destinations': 'nav_view_all_destinations',
      'Packages Menu': 'nav_packages_text',
      'Cruises Menu': 'nav_cruises_text',
      'About Menu': 'nav_about_text',
      'Contact Menu': 'nav_contact_text',
      'Request Quote Mobile': 'nav_request_quote_mobile',
    },
  },
  Footer: {
    key: 'footer',
    sections: {
      'Company Description': 'footer_company_description',
      'Destinations Title': 'footer_destinations_title',
      'Company Links Title': 'footer_company_title',
      'Contact Title': 'footer_contact_title',
      'Newsletter Title': 'footer_newsletter_title',
      'Newsletter Description': 'footer_newsletter_description',
      'Newsletter Placeholder': 'footer_newsletter_placeholder',
      'Newsletter Button': 'footer_newsletter_button',
      'Copyright Text': 'footer_copyright_text',
      'Privacy Policy': 'footer_privacy_policy',
      'Terms of Service': 'footer_terms_service',
      'Cookie Policy': 'footer_cookie_policy',
      'Accessibility': 'footer_accessibility',
    },
  },
} as const;

type PageKey = keyof typeof PAGE_SECTIONS;

export default function AdminContent() {
  const { loading: authLoading, isAuthenticated, logout } = useSimpleAdminAuth();
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [bulkSelection, setBulkSelection] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auto-save states
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form states
  const [selectedPage, setSelectedPage] = useState<PageKey | ''>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [contentForm, setContentForm] = useState({
    title: '',
    content: '',
    is_active: true,
  });

  // Memoized computed values
  const availableSections = useMemo(() => {
    if (!selectedPage) return {} as Record<string, string>;
    return PAGE_SECTIONS[selectedPage].sections;
  }, [selectedPage]);

  // Validation configuration
  const validationRules = {
    title: {
      required: true,
      minLength: 3,
      maxLength: 200,
      message: 'Title must be 3-200 characters'
    },
    content: {
      required: true,
      minLength: 10,
      maxLength: 5000,
      message: 'Content must be 10-5000 characters'
    }
  };

  // Validation function
  const validateForm = useCallback((form: typeof contentForm) => {
    const errors: Record<string, string> = {};
    
    // Get plain text from HTML content
    const getPlainText = (html: string) => html.replace(/<[^>]*>/g, '').trim();
    
    // Validate title
    const title = form.title.trim();
    if (validationRules.title.required && !title) {
      errors.title = 'Title is required';
    } else if (title.length < validationRules.title.minLength) {
      errors.title = `Title must be at least ${validationRules.title.minLength} characters`;
    } else if (title.length > validationRules.title.maxLength) {
      errors.title = `Title must be no more than ${validationRules.title.maxLength} characters`;
    }

    // Validate content
    const plainContent = getPlainText(form.content);
    if (validationRules.content.required && !plainContent) {
      errors.content = 'Content is required';
    } else if (plainContent.length < validationRules.content.minLength) {
      errors.content = `Content must be at least ${validationRules.content.minLength} characters`;
    } else if (plainContent.length > validationRules.content.maxLength) {
      errors.content = `Content must be no more than ${validationRules.content.maxLength} characters`;
    }

    return errors;
  }, []);

  // Real-time validation effect
  useEffect(() => {
    if (selectedSection && (contentForm.title || contentForm.content)) {
      const errors = validateForm(contentForm);
      setValidationErrors(errors);
    } else {
      setValidationErrors({});
    }
  }, [contentForm, selectedSection, validateForm]);

  // Auto-save refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousFormRef = useRef(contentForm);

  // Auto-save functionality (saves as draft to localStorage)
  const performAutoSave = useCallback(async (formData: typeof contentForm) => {
    if (!selectedSection) {
      return;
    }

    // Don't auto-save if there are validation errors
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setAutoSaving(true);
      
      // Save draft to localStorage instead of database
      const draftKey = `content_draft_${selectedSection}`;
      const draftData = {
        title: formData.title,
        content: formData.content,
        is_active: formData.is_active,
        lastSaved: new Date().toISOString(),
        sectionKey: selectedSection
      };
      
      localStorage.setItem(draftKey, JSON.stringify(draftData));

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      console.log('Draft saved locally for section:', selectedSection);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setHasUnsavedChanges(true);
    } finally {
      setAutoSaving(false);
    }
  }, [selectedSection, validateForm]);

  // Debounced auto-save effect
  useEffect(() => {
    const currentForm = contentForm;
    const previousForm = previousFormRef.current;

    // Check if form has actually changed
    const hasChanged = 
      currentForm.title !== previousForm.title ||
      currentForm.content !== previousForm.content ||
      currentForm.is_active !== previousForm.is_active;

    if (hasChanged && selectedSection && currentForm.title.trim()) {
      setHasUnsavedChanges(true);
      
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save (2 seconds after user stops typing)
      autoSaveTimeoutRef.current = setTimeout(() => {
        performAutoSave(currentForm);
      }, 2000);
    }

    // Update previous form reference
    previousFormRef.current = currentForm;

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [contentForm, selectedSection, performAutoSave]);

  const getUsername = () => {
    try {
      const session = localStorage.getItem('admin_session');
      if (session) {
        const sessionData = JSON.parse(session);
        const email = sessionData.email as string | undefined;
        if (email === 'chris@meridianluxury.travel') return 'Chris';
        if (email) return email.split('@')[0];
      }
    } catch {
      /* noop */
    }
    return 'Admin';
  };

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      fetchContentSections();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const fetchContentSections = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal as any);

      if (error) throw error;
      setContentSections(data ?? []);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setError('Request timed out — please try refreshing.');
      } else {
        setError('Failed to load content sections');
      }
      setContentSections([]);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const handlePageChange = (page: PageKey) => {
    setSelectedPage(page);
    setSelectedSection('');
    setContentForm({ title: '', content: '', is_active: true });
    setError(null);
    setSuccess(null);
  };

  const handleSectionChange = (sectionKey: string, sectionTitle: string) => {
    setSelectedSection(sectionKey);

    // Reset auto-save states when changing sections
    setHasUnsavedChanges(false);
    setLastSaved(null);
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }

    // Check for saved draft first
    const draftKey = `content_draft_${sectionKey}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setContentForm({
          title: draftData.title,
          content: draftData.content,
          is_active: draftData.is_active,
        });
        setLastSaved(new Date(draftData.lastSaved));
        setHasUnsavedChanges(true); // Mark as having unsaved changes since it's a draft
        console.log('Loaded draft for section:', sectionKey);
      } catch (error) {
        console.error('Error loading draft:', error);
        // Fall through to existing content loading
      }
    }
    
    // If no draft found, load from database
    if (!savedDraft) {
      const existingContent = contentSections.find((cs) => cs.section_key === sectionKey);

      if (existingContent) {
        setContentForm({
          title: existingContent.title ?? sectionTitle,
          content: existingContent.content ?? '',
          is_active: existingContent.is_active,
        });
        setLastSaved(existingContent.updated_at ? new Date(existingContent.updated_at) : new Date(existingContent.created_at));
      } else {
        setContentForm({
          title: sectionTitle,
          content: '',
          is_active: false, // Set new content as inactive by default
        });
      }
    }

    setError(null);
    setSuccess(null);
  };

  const handleSaveContent = async () => {
    if (!selectedSection) {
      setError('Please select a section');
      return;
    }

    // Validate form before saving
    const errors = validateForm(contentForm);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix validation errors before saving');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const existingContent = contentSections.find((cs) => cs.section_key === selectedSection);
      const pageKey =
        (selectedPage ? PAGE_SECTIONS[selectedPage].key : 'hero') ?? 'hero';

      if (existingContent) {
        const { error } = await supabase
          .from('content_sections')
          .update({
            title: contentForm.title,
            content: contentForm.content,
            is_active: contentForm.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingContent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('content_sections').insert({
          section_key: selectedSection,
          title: contentForm.title,
          content: contentForm.content,
          section_type: pageKey,
          is_active: contentForm.is_active,
        });

        if (error) throw error;
      }

      // Clear cache and refresh
      try {
        await Promise.resolve(clearContentCache());
      } catch {
        // non-fatal
      }

      await fetchContentSections();

      // Reset auto-save states after manual save
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      // Clear any pending auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

      // Clear the draft since we've published the content
      const draftKey = `content_draft_${selectedSection}`;
      localStorage.removeItem(draftKey);

      setSuccess('Content published successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/admin" className="text-gray-500 hover:text-[#8B4513] mr-4">
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513] mr-3" />
            <span className="text-gray-600">Loading content...</span>
          </div>
        ) : !selectedSection ? (
          /* Page Grid View */
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#8B4513] mb-2">Website Content Manager</h2>
                  <p className="text-gray-600">Click any section below to edit its content</p>
                </div>

                {/* Search and Bulk Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent text-sm w-64"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {bulkSelection.size > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{bulkSelection.size} selected</span>
                      <button
                        className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full hover:bg-green-200 transition-colors"
                        onClick={async () => {
                          const keys = Array.from(bulkSelection);
                          if (!keys.length) return;
                          setSaving(true);
                          try {
                            const { error } = await supabase
                              .from('content_sections')
                              .update({ is_active: true, updated_at: new Date().toISOString() })
                              .in('section_key', keys);
                            if (error) throw error;
                            await fetchContentSections();
                            setSuccess('Selected sections activated.');
                            setTimeout(() => setSuccess(null), 2500);
                          } catch {
                            setError('Failed to activate selected sections');
                          } finally {
                            setSaving(false);
                          }
                        }}
                      >
                        Activate All
                      </button>
                      <button
                        className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full hover:bg-gray-200 transition-colors"
                        onClick={async () => {
                          const keys = Array.from(bulkSelection);
                          if (!keys.length) return;
                          setSaving(true);
                          try {
                            const { error } = await supabase
                              .from('content_sections')
                              .update({ is_active: false, updated_at: new Date().toISOString() })
                              .in('section_key', keys);
                            if (error) throw error;
                            await fetchContentSections();
                            setSuccess('Selected sections deactivated.');
                            setTimeout(() => setSuccess(null), 2500);
                          } catch {
                            setError('Failed to deactivate selected sections');
                          } finally {
                            setSaving(false);
                          }
                        }}
                      >
                        Deactivate All
                      </button>
                      <button
                        onClick={() => setBulkSelection(new Set())}
                        className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full hover:bg-red-200 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-400 mr-2" />
                      <span className="text-gray-600">Has Content</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2" />
                      <span className="text-gray-600">Empty</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-gray-400 mr-2" />
                      <span className="text-gray-600">Inactive</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-8">
                {Object.entries(PAGE_SECTIONS).map(([pageName, pageData]) => {
                  const totalSections = Object.keys(pageData.sections).length || 1;
                  const completedSections = Object.values(pageData.sections).filter((sectionKey) => {
                    const content = contentSections.find((cs) => cs.section_key === sectionKey);
                    return Boolean(content && content.content && content.content.trim().length > 0 && content.is_active);
                  }).length;

                  return (
                    <div key={pageName} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-[#8B4513] flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {pageName}
                        </h3>
                        <div className="text-sm text-gray-500">{completedSections}/{totalSections} complete</div>
                      </div>

                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(completedSections / totalSections) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(pageData.sections)
                          .filter(([sectionTitle, sectionKey]) => {
                            if (!searchQuery) return true;
                            const q = searchQuery.toLowerCase();
                            return sectionTitle.toLowerCase().includes(q) || String(sectionKey).toLowerCase().includes(q);
                          })
                          .map(([sectionTitle, sectionKey]) => {
                            const existingContent = contentSections.find((cs) => cs.section_key === sectionKey);
                            const hasContent =
                              !!(existingContent && existingContent.content && existingContent.content.trim().length > 0);
                            const isActive = existingContent?.is_active ?? true;
                            const isSelected = bulkSelection.has(String(sectionKey));

                            return (
                              <div key={String(sectionKey)} className="relative group">
                                {/* Bulk selection checkbox */}
                                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      const newSelection = new Set(bulkSelection);
                                      if (e.target.checked) newSelection.add(String(sectionKey));
                                      else newSelection.delete(String(sectionKey));
                                      setBulkSelection(newSelection);
                                    }}
                                    className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                                  />
                                </div>

                                <div
                                  onClick={() => {
                                    handlePageChange(pageName as PageKey);
                                    handleSectionChange(String(sectionKey), sectionTitle);
                                  }}
                                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
                                    isSelected
                                      ? 'border-blue-300 bg-blue-50'
                                      : hasContent && isActive
                                      ? 'border-green-200 bg-green-50 hover:bg-green-100'
                                      : hasContent && !isActive
                                      ? 'border-gray-300 bg-gray-100 hover:bg-gray-200'  /* fixed invalid gray-150 */
                                      : 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 text-sm mb-2">{sectionTitle}</h4>
                                      {hasContent ? (
                                        <div>
                                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                            {existingContent?.content?.substring(0, 100)}
                                            {(existingContent?.content?.length ?? 0) > 100 ? '...' : ''}
                                          </p>
                                          <p className="text-xs text-gray-400">
                                            {(existingContent?.content?.length ?? 0)} characters
                                          </p>
                                        </div>
                                      ) : (
                                        <p className="text-xs text-amber-600 italic font-medium">Click to add content</p>
                                      )}
                                    </div>

                                    <div className="flex flex-col items-center ml-3">
                                      {!isActive && (
                                        <svg className="w-4 h-4 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12l3.29-3.29m-6.412 6.412L12 12m-3.128-3.128l-4.242-4.242"
                                          />
                                        </svg>
                                      )}
                                      <span
                                        className={`w-3 h-3 rounded-full shadow-sm ${
                                          hasContent && isActive ? 'bg-green-500' : hasContent && !isActive ? 'bg-gray-400' : 'bg-amber-400'
                                        }`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Content Editor */
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Editor Panel */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <button
                      onClick={() => {
                        setSelectedSection('');
                        setSelectedPage('');
                        setContentForm({ title: '', content: '', is_active: true });
                        setError(null);
                        setSuccess(null);
                      }}
                      className="inline-flex items-center text-gray-500 hover:text-[#8B4513] mb-2"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Content Overview
                    </button>
                    <h2 className="text-xl font-semibold text-[#8B4513]">
                      Edit {selectedPage}{' '}
                      {/* find section label from key */}
                      -
                      {' '}
                      {Object.entries(PAGE_SECTIONS[selectedPage as PageKey]?.sections || {}).find(
                        ([, key]) => key === selectedSection,
                      )?.[0] || 'Content'}
                    </h2>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowPreview((s) => !s)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        showPreview ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        contentForm.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {contentForm.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Content Templates */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Templates</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          setContentForm((f) => ({
                            ...f,
                            title: 'Experience Amazing [Destination]',
                            content:
                              'Discover the magic of [destination name] with our expertly crafted itineraries. From [highlight 1] to [highlight 2], every moment is designed to create lasting memories.',
                          }))
                        }
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
                      >
                        Destination Template
                      </button>
                      <button
                        onClick={() =>
                          setContentForm((f) => ({
                            ...f,
                            title: 'Premium [Service Name]',
                            content:
                              'Our [service] ensures exceptional quality and attention to detail. With years of expertise, we deliver personalized experiences that exceed expectations.',
                          }))
                        }
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
                      >
                        Service Template
                      </button>
                      <button
                        onClick={() =>
                          setContentForm((f) => ({
                            ...f,
                            title: 'Get in Touch',
                            content:
                              'Ready to start planning your adventure? Contact our travel specialists today. We are here to help you create the perfect journey tailored to your dreams.',
                          }))
                        }
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
                      >
                        Contact Template
                      </button>
                      <button
                        onClick={() =>
                          setContentForm((f) => ({
                            ...f,
                            title: 'Frequently Asked Question',
                            content:
                              'Question: [Insert your question here]\n\nAnswer: [Provide a detailed, helpful answer that addresses the customer concern and builds confidence in your services.]',
                          }))
                        }
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
                      >
                        FAQ Template
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contentForm.title}
                      onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-black ${
                        validationErrors.title 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-[#B8860B] focus:border-[#B8860B]'
                      }`}
                      placeholder="Enter section title..."
                    />
                    {validationErrors.title && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {contentForm.title.length}/{validationRules.title.maxLength} characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      value={contentForm.content}
                      onChange={(content) => setContentForm({ ...contentForm, content })}
                      placeholder="Enter your content here..."
                      className={`focus-within:ring-2 ${
                        validationErrors.content
                          ? 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500'
                          : 'focus-within:ring-[#B8860B] focus-within:border-[#B8860B]'
                      }`}
                    />
                    {validationErrors.content && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.content}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {contentForm.content.replace(/<[^>]*>/g, '').length}/{validationRules.content.maxLength} characters (plain text)
                    </p>
                  </div>

                  <div>
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

                  {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{error}</div>}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">{success}</div>
                  )}

                  {/* Auto-save Status Indicator */}
                  <div className="flex items-center justify-between pt-2 pb-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      {autoSaving && (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#B8860B]"></div>
                          <span className="text-[#B8860B]">Saving draft...</span>
                        </>
                      )}
                      {hasUnsavedChanges && !autoSaving && (
                        <>
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-orange-600">Draft changes (not published)</span>
                        </>
                      )}
                      {!hasUnsavedChanges && !autoSaving && lastSaved && (
                        <>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-blue-600">
                            Draft saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Auto-saves drafts locally • Click "Update Content" to publish
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedSection('');
                        setSelectedPage('');
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
                      disabled={saving || Object.keys(validationErrors).length > 0}
                      className="px-6 py-2 bg-[#B8860B] hover:bg-[#DAA520] text-white rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : Object.keys(validationErrors).length > 0 ? 'Fix Errors to Save' : 'Update Content'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Panel */}
              {showPreview && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[#8B4513]">Live Preview</h3>
                    <span className="text-xs text-gray-500">Updates as you type</span>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[300px] relative">
                    {selectedSection.includes('hero') ? (
                      <div className="text-center py-8">
                        <h1 className="text-3xl font-bold text-[#8B4513] mb-4">{contentForm.title || 'Preview Title'}</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                          {contentForm.content || 'Your content will appear here as you type...'}
                        </p>
                      </div>
                    ) : selectedSection.includes('feature') ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-[#F5F5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#8B4513] mb-2">{contentForm.title || 'Preview Title'}</h3>
                        <p className="text-gray-600">{contentForm.content || 'Your content will appear here as you type...'}</p>
                      </div>
                    ) : selectedSection.includes('destination') ? (
                      <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-sm mx-auto">
                        <div className="h-32 bg-gradient-to-r from-[#B8860B] to-[#DAA520] flex items-center justify-center">
                          <h3 className="text-white text-xl font-bold">{contentForm.title || 'Destination'}</h3>
                        </div>
                        <div className="p-4">
                          <p className="text-gray-600 text-sm">
                            {contentForm.content || 'Destination description will appear here...'}
                          </p>
                        </div>
                      </div>
                    ) : selectedSection.includes('contact') ? (
                      <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-[#8B4513] mb-4">{contentForm.title || 'Contact Section'}</h2>
                        <p className="text-gray-600">{contentForm.content || 'Contact information will appear here...'}</p>
                      </div>
                    ) : (
                      <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-[#8B4513] mb-4">{contentForm.title || 'Content Title'}</h2>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-600 leading-relaxed">
                            {contentForm.content || 'Your content will appear here as you type. This preview shows how it will look on your website.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {!contentForm.is_active && (
                      <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-lg">
                        <div className="bg-white px-4 py-2 rounded-lg text-sm text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12l3.29-3.29m-6.412 6.412L12 12m-3.128-3.128l-4.242-4.242"
                            />
                          </svg>
                          Content is inactive
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    <p>💡 This preview shows approximately how your content will appear on the website. Actual styling may vary slightly.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
