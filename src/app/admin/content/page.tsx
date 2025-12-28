'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
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
  status?: 'draft' | 'published';
  draft_content?: string | null;
  published_at?: string | null;
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
  const supabase = useMemo(() => createClient(), []);
  
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

  // Validation configuration - simplified to just content
  const validationRules = {
    content: {
      required: true,
      minLength: 1, // Allow short content like button text
      maxLength: 5000,
      message: 'Content is required'
    }
  };

  // Validation function
  const validateForm = useCallback((form: typeof contentForm) => {
    const errors: Record<string, string> = {};

    // Get plain text from HTML content
    const getPlainText = (html: string) => html.replace(/<[^>]*>/g, '').trim();

    // Validate content only
    const plainContent = getPlainText(form.content);
    if (validationRules.content.required && !plainContent) {
      errors.content = 'Content is required';
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
    
    // If no localStorage draft found, load from database
    if (!savedDraft) {
      const existingContent = contentSections.find((cs) => cs.section_key === sectionKey);

      if (existingContent) {
        // Prioritize draft_content if it exists (unpublished changes)
        const contentToEdit = existingContent.draft_content || existingContent.content || '';
        const hasDraft = !!existingContent.draft_content;

        setContentForm({
          title: sectionTitle, // Always use the section label as the title
          content: contentToEdit,
          is_active: existingContent.is_active,
        });

        if (hasDraft) {
          setHasUnsavedChanges(true); // Mark as having unpublished draft
        }

        setLastSaved(existingContent.updated_at ? new Date(existingContent.updated_at) : new Date(existingContent.created_at));
      } else {
        setContentForm({
          title: sectionTitle, // Use section label as the title
          content: '',
          is_active: true, // Set new content as active by default
        });
      }
    }

    setError(null);
    setSuccess(null);
  };

  // Save content as a draft (to draft_content field in database)
  const handleSaveDraft = async () => {
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
        // Update existing content with draft
        const { error } = await supabase
          .from('content_sections')
          .update({
            title: contentForm.title,
            draft_content: contentForm.content,
            is_active: contentForm.is_active,
            status: 'draft',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingContent.id);

        if (error) throw error;
      } else {
        // Create new content as draft
        const { error } = await supabase.from('content_sections').insert({
          section_key: selectedSection,
          title: contentForm.title,
          content: '', // Empty published content
          draft_content: contentForm.content, // Content goes to draft
          section_type: pageKey,
          is_active: contentForm.is_active,
          status: 'draft',
        });

        if (error) throw error;
      }

      await fetchContentSections();

      // Reset auto-save states
      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      // Clear any pending auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

      // Clear the localStorage draft
      const draftKey = `content_draft_${selectedSection}`;
      localStorage.removeItem(draftKey);

      setSuccess('Draft saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  // Publish content (copies draft to content and sets status to published)
  const handlePublish = async () => {
    if (!selectedSection) {
      setError('Please select a section');
      return;
    }

    // Validate form before publishing
    const errors = validateForm(contentForm);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix validation errors before publishing');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const existingContent = contentSections.find((cs) => cs.section_key === selectedSection);
      const pageKey =
        (selectedPage ? PAGE_SECTIONS[selectedPage].key : 'hero') ?? 'hero';
      const now = new Date().toISOString();

      if (existingContent) {
        const { error } = await supabase
          .from('content_sections')
          .update({
            title: contentForm.title,
            content: contentForm.content, // Publish to main content
            draft_content: null, // Clear draft
            is_active: contentForm.is_active,
            status: 'published',
            published_at: now,
            updated_at: now,
          })
          .eq('id', existingContent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('content_sections').insert({
          section_key: selectedSection,
          title: contentForm.title,
          content: contentForm.content,
          draft_content: null,
          section_type: pageKey,
          is_active: contentForm.is_active,
          status: 'published',
          published_at: now,
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

      // Reset auto-save states after publishing
      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      // Clear any pending auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

      // Clear the localStorage draft since we've published
      const draftKey = `content_draft_${selectedSection}`;
      localStorage.removeItem(draftKey);

      setSuccess('Content published successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to publish content');
    } finally {
      setSaving(false);
    }
  };

  // Get the preview URL for the current section
  const getPreviewUrl = () => {
    if (!selectedPage) return null;

    const pageRoutes: Record<string, string> = {
      'Home': '/',
      'About Us': '/about',
      'Contact': '/contact',
      'Destinations': '/destinations',
      'Cruises': '/cruises',
      'Navigation & Global': '/',
      'Footer': '/',
    };

    const route = pageRoutes[selectedPage] || '/';
    return `${route}?preview=true`;
  };

  // Open preview in new tab
  const handlePreviewOnSite = () => {
    const previewUrl = getPreviewUrl();
    if (previewUrl) {
      window.open(previewUrl, '_blank');
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
              <Link
                href="/admin/media"
                className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5DC] text-[#8B4513] rounded-md hover:bg-[#E8E4C9] transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Media Library
              </Link>
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
          <div className="space-y-8">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#8B4513] rounded-2xl shadow-xl p-8 text-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Content Manager</h2>
                  <p className="text-white/80 text-lg">Manage and publish your website content</p>
                </div>

                {/* Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search sections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-72 pl-11 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-sm"
                    />
                    <svg className="w-5 h-5 text-white/50 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status Legend */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                    <span className="text-white/90">Published</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-400 shadow-lg shadow-orange-400/50" />
                    <span className="text-white/90">Has Draft</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
                    <span className="text-white/90">Empty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-white/90">Inactive</span>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              {bulkSelection.size > 0 && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{bulkSelection.size} selected</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
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
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
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
                        className="px-4 py-2 bg-red-500/30 hover:bg-red-500/40 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Page Sections Grid */}
            <div className="grid gap-6">
              {Object.entries(PAGE_SECTIONS).map(([pageName, pageData]) => {
                const totalSections = Object.keys(pageData.sections).length || 1;
                const completedSections = Object.values(pageData.sections).filter((sectionKey) => {
                  const content = contentSections.find((cs) => cs.section_key === sectionKey);
                  return Boolean(content && content.content && content.content.trim().length > 0 && content.is_active);
                }).length;
                const progressPercent = Math.round((completedSections / totalSections) * 100);

                return (
                  <div key={pageName} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {/* Page Header */}
                    <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B4513] to-[#A0522D] flex items-center justify-center shadow-lg shadow-[#8B4513]/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{pageName}</h3>
                            <p className="text-sm text-gray-500">{totalSections} content sections</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#8B4513]">{progressPercent}%</div>
                          <div className="text-xs text-gray-500">{completedSections} of {totalSections} complete</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section Cards */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                            const hasDraft = !!(existingContent?.draft_content);
                            const isActive = existingContent?.is_active ?? true;
                            const isSelected = bulkSelection.has(String(sectionKey));

                            return (
                              <div key={String(sectionKey)} className="relative group">
                                {/* Bulk selection checkbox */}
                                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
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
                                    className="w-4 h-4 rounded border-gray-300 text-[#8B4513] focus:ring-[#8B4513] shadow-sm"
                                  />
                                </div>

                                <div
                                  onClick={() => {
                                    handlePageChange(pageName as PageKey);
                                    handleSectionChange(String(sectionKey), sectionTitle);
                                  }}
                                  className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-2 ${
                                    isSelected
                                      ? 'border-indigo-400 bg-indigo-50 shadow-md'
                                      : hasDraft
                                      ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white hover:border-orange-300'
                                      : hasContent && isActive
                                      ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-300'
                                      : hasContent && !isActive
                                      ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-gray-300'
                                      : 'border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:border-amber-300'
                                  }`}
                                >
                                  {/* Status indicator dot */}
                                  <div className="absolute top-3 right-3">
                                    <span
                                      className={`block w-3 h-3 rounded-full shadow-sm ${
                                        hasDraft
                                          ? 'bg-orange-500 animate-pulse'
                                          : hasContent && isActive
                                          ? 'bg-emerald-500'
                                          : hasContent && !isActive
                                          ? 'bg-gray-400'
                                          : 'bg-amber-400'
                                      }`}
                                    />
                                  </div>

                                  <div className="pr-6">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">{sectionTitle}</h4>
                                    </div>

                                    {hasDraft && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700 rounded-full mb-2">
                                        <span className="w-1 h-1 rounded-full bg-orange-500" />
                                        Unpublished Draft
                                      </span>
                                    )}

                                    {hasContent ? (
                                      <div>
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                          {existingContent?.content?.replace(/<[^>]*>/g, '').substring(0, 80)}
                                          {(existingContent?.content?.replace(/<[^>]*>/g, '').length ?? 0) > 80 ? '...' : ''}
                                        </p>
                                      </div>
                                    ) : hasDraft ? (
                                      <p className="text-xs text-orange-600 font-medium">Draft ready to publish</p>
                                    ) : (
                                      <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add content
                                      </p>
                                    )}

                                    {!isActive && hasContent && (
                                      <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12l3.29-3.29"
                                          />
                                        </svg>
                                        Hidden from website
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Content Editor */
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Editor Panel */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Editor Header */}
                <div className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <button
                        onClick={() => {
                          setSelectedSection('');
                          setSelectedPage('');
                          setContentForm({ title: '', content: '', is_active: true });
                          setError(null);
                          setSuccess(null);
                        }}
                        className="inline-flex items-center text-white/80 hover:text-white text-sm font-medium transition-colors mb-1"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Overview
                      </button>
                      <h2 className="text-xl font-semibold text-white">
                        {Object.entries(PAGE_SECTIONS[selectedPage as PageKey]?.sections || {}).find(
                          ([, key]) => key === selectedSection,
                        )?.[0] || 'Content'}
                      </h2>
                      <p className="text-white/70 text-sm mt-0.5">{selectedPage} Section</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status badges */}
                      {(() => {
                        const existingContent = contentSections.find((cs) => cs.section_key === selectedSection);
                        const hasDraft = !!(existingContent?.draft_content);
                        const isPublished = !!(existingContent?.content);

                        return (
                          <>
                            {hasDraft && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-orange-500/20 text-orange-100 backdrop-blur-sm border border-orange-400/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-300 animate-pulse" />
                                Draft
                              </span>
                            )}
                            {isPublished && !hasDraft && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-100 backdrop-blur-sm border border-emerald-400/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                                Published
                              </span>
                            )}
                            {!isPublished && !hasDraft && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-100 backdrop-blur-sm border border-amber-400/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                                New
                              </span>
                            )}
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full backdrop-blur-sm border ${
                              contentForm.is_active
                                ? 'bg-green-500/20 text-green-100 border-green-400/30'
                                : 'bg-gray-500/20 text-gray-200 border-gray-400/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${contentForm.is_active ? 'bg-green-300' : 'bg-gray-400'}`} />
                              {contentForm.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setShowPreview((s) => !s)}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      showPreview
                        ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>

                  <button
                    onClick={handlePreviewOnSite}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Preview on Site
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Current Live Content Reference */}
                  {(() => {
                    const existingContent = contentSections.find((cs) => cs.section_key === selectedSection);
                    const currentLiveContent = existingContent?.content;

                    if (currentLiveContent) {
                      return (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <h4 className="text-sm font-medium text-gray-700">Currently Live on Website</h4>
                          </div>
                          <div className="bg-white border border-gray-200 rounded p-3 text-gray-800 text-sm">
                            <div dangerouslySetInnerHTML={{ __html: currentLiveContent.substring(0, 300) + (currentLiveContent.length > 300 ? '...' : '') }} />
                          </div>
                          {existingContent?.draft_content && (
                            <p className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              You have unpublished draft changes below
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Content Templates - Collapsed by default */}
                  <details className="bg-blue-50 border border-blue-200 rounded-lg">
                    <summary className="p-4 cursor-pointer text-sm font-medium text-blue-900 hover:bg-blue-100 rounded-lg transition-colors">
                      Quick Templates (click to expand)
                    </summary>
                    <div className="px-4 pb-4 flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          setContentForm((f) => ({
                            ...f,
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
                            content:
                              'Question: [Insert your question here]\n\nAnswer: [Provide a detailed, helpful answer that addresses the customer concern and builds confidence in your services.]',
                          }))
                        }
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
                      >
                        FAQ Template
                      </button>
                    </div>
                  </details>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Edit Content <span className="text-red-500">*</span>
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
                      Auto-saves drafts locally • Use "Save as Draft" to save to database • Use "Publish" to go live
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 mt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedSection('');
                        setSelectedPage('');
                        setContentForm({ title: '', content: '', is_active: true });
                        setError(null);
                        setSuccess(null);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all duration-200 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSaveDraft}
                        disabled={saving || Object.keys(validationErrors).length > 0}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                      >
                        {saving ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                        )}
                        {saving ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={handlePublish}
                        disabled={saving || Object.keys(validationErrors).length > 0}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:from-emerald-500 disabled:hover:to-emerald-600"
                      >
                        {saving ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {saving ? 'Publishing...' : Object.keys(validationErrors).length > 0 ? 'Fix Errors' : 'Publish'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Panel */}
              {showPreview && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Live Preview</h3>
                          <p className="text-indigo-100 text-xs">Updates as you type</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white min-h-[300px] relative">
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

                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>This preview shows approximately how your content will appear. Actual styling may vary.</p>
                    </div>
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
