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
  section_type: 'hero' | 'about' | 'services' | 'contact' | 'footer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SiteSettings {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'text' | 'email' | 'phone' | 'url' | 'textarea';
  description: string;
  updated_at: string;
}

export default function AdminContent() {
  const { loading: authLoading, isAuthenticated, logout } = useSimpleAdminAuth();
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Form states
  const [contentForm, setContentForm] = useState({
    title: '',
    content: '',
    section_type: 'hero' as const,
    is_active: true
  });

  const [settingsForm, setSettingsForm] = useState<{[key: string]: string}>({});

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
      initializeTables();
    }
  }, [isAuthenticated]);

  const initializeTables = async () => {
    try {
      setLoading(true);
      
      // Check if tables exist and create them if they don't
      await createTablesIfNotExist();
      await fetchContent();
      await fetchSettings();
    } catch (err) {
      console.error('Error initializing content management:', err);
      setError('Failed to initialize content management');
    } finally {
      setLoading(false);
    }
  };

  const createTablesIfNotExist = async () => {
    try {
      // Try to query the tables first to see if they exist
      const { error: contentError } = await supabase
        .from('content_sections')
        .select('id')
        .limit(1);

      if (contentError && contentError.message.includes('relation "content_sections" does not exist')) {
        // Create content_sections table
        await supabase.rpc('create_content_table');
      }

      const { error: settingsError } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1);

      if (settingsError && settingsError.message.includes('relation "site_settings" does not exist')) {
        // Create site_settings table
        await supabase.rpc('create_settings_table');
      }

      // Insert default content if tables are empty
      await insertDefaultContent();
    } catch (error) {
      console.log('Tables may already exist or will be created manually');
      // Continue with manual content management using existing structure
    }
  };

  const insertDefaultContent = async () => {
    try {
      // Check if content already exists
      const { data: existingContent } = await supabase
        .from('content_sections')
        .select('id')
        .limit(1);

      if (!existingContent || existingContent.length === 0) {
        // Insert default content sections
        const defaultSections = [
          {
            section_key: 'hero_title',
            title: 'Hero Title',
            content: 'Discover Extraordinary Adventures',
            section_type: 'hero',
            is_active: true
          },
          {
            section_key: 'hero_subtitle',
            title: 'Hero Subtitle',
            content: 'Embark on carefully curated luxury travel experiences that create lasting memories.',
            section_type: 'hero',
            is_active: true
          },
          {
            section_key: 'about_title',
            title: 'About Us Title',
            content: 'About Meridian Luxury Travel',
            section_type: 'about',
            is_active: true
          },
          {
            section_key: 'about_content',
            title: 'About Us Content',
            content: 'We specialize in creating bespoke travel experiences that exceed expectations. Our team of travel experts carefully crafts each journey to ensure unforgettable adventures.',
            section_type: 'about',
            is_active: true
          }
        ];

        await supabase.from('content_sections').insert(defaultSections);
      }

      // Check if settings already exist
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1);

      if (!existingSettings || existingSettings.length === 0) {
        // Insert default settings
        const defaultSettings = [
          {
            setting_key: 'company_name',
            setting_value: 'Meridian Luxury Travel',
            setting_type: 'text',
            description: 'Company Name'
          },
          {
            setting_key: 'contact_email',
            setting_value: 'chris@meridianluxury.travel',
            setting_type: 'email',
            description: 'Main Contact Email'
          },
          {
            setting_key: 'contact_phone',
            setting_value: '+1 (555) 123-4567',
            setting_type: 'phone',
            description: 'Main Contact Phone'
          },
          {
            setting_key: 'website_url',
            setting_value: 'https://www.meridianluxury.travel',
            setting_type: 'url',
            description: 'Website URL'
          },
          {
            setting_key: 'company_address',
            setting_value: '123 Travel Way, Adventure City, AC 12345',
            setting_type: 'textarea',
            description: 'Company Address'
          }
        ];

        await supabase.from('site_settings').insert(defaultSettings);
      }
    } catch (error) {
      // If tables don't exist, we'll work with local state only
      console.log('Working with local content management');
      setContentSections([
        {
          id: '1',
          section_key: 'hero_title',
          title: 'Hero Title',
          content: 'Discover Extraordinary Adventures',
          section_type: 'hero',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          section_key: 'hero_subtitle',
          title: 'Hero Subtitle',
          content: 'Embark on carefully curated luxury travel experiences that create lasting memories.',
          section_type: 'hero',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      setSiteSettings([
        {
          id: '1',
          setting_key: 'company_name',
          setting_value: 'Meridian Luxury Travel',
          setting_type: 'text',
          description: 'Company Name',
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          setting_key: 'contact_email',
          setting_value: 'chris@meridianluxury.travel',
          setting_type: 'email',
          description: 'Main Contact Email',
          updated_at: new Date().toISOString()
        }
      ]);
    }
  };

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .order('section_type', { ascending: true });

      if (error && !error.message.includes('relation "content_sections" does not exist')) {
        throw error;
      }

      if (data) {
        setContentSections(data);
      }
    } catch (err) {
      console.log('Content sections table may not exist yet');
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_key', { ascending: true });

      if (error && !error.message.includes('relation "site_settings" does not exist')) {
        throw error;
      }

      if (data) {
        setSiteSettings(data);
        // Initialize form with current values
        const formData: {[key: string]: string} = {};
        data.forEach(setting => {
          formData[setting.setting_key] = setting.setting_value;
        });
        setSettingsForm(formData);
      }
    } catch (err) {
      console.log('Site settings table may not exist yet');
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const contentData = {
        section_key: `${contentForm.section_type}_${Date.now()}`,
        title: contentForm.title,
        content: contentForm.content,
        section_type: contentForm.section_type,
        is_active: contentForm.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingSection) {
        // Update existing
        const { error } = await supabase
          .from('content_sections')
          .update(contentData)
          .eq('id', editingSection);

        if (error) throw error;

        setContentSections(prev => prev.map(section => 
          section.id === editingSection 
            ? { ...section, ...contentData }
            : section
        ));
      } else {
        // Create new
        const { data, error } = await supabase
          .from('content_sections')
          .insert([contentData])
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setContentSections(prev => [...prev, data]);
        }
      }

      // Reset form
      setContentForm({
        title: '',
        content: '',
        section_type: 'hero',
        is_active: true
      });
      setEditingSection(null);
      
      // Clear cache so changes appear immediately on the website
      clearContentCache();
      alert('Content updated successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update each setting
      for (const [key, value] of Object.entries(settingsForm)) {
        const { error } = await supabase
          .from('site_settings')
          .update({ 
            setting_value: value,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', key);

        if (error) throw error;
      }

      // Update local state
      setSiteSettings(prev => prev.map(setting => ({
        ...setting,
        setting_value: settingsForm[setting.setting_key] || setting.setting_value,
        updated_at: new Date().toISOString()
      })));

      // Clear cache so changes appear immediately on the website
      clearContentCache();
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const startEditingContent = (section: ContentSection) => {
    setEditingSection(section.id);
    setContentForm({
      title: section.title,
      content: section.content,
      section_type: section.section_type,
      is_active: section.is_active
    });
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content section?')) return;

    try {
      const { error } = await supabase
        .from('content_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContentSections(prev => prev.filter(section => section.id !== id));
      alert('Content deleted successfully!');
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content.');
    }
  };

  const getSectionTypeColor = (type: string) => {
    const colors = {
      hero: 'bg-purple-100 text-purple-800',
      about: 'bg-blue-100 text-blue-800',
      services: 'bg-green-100 text-green-800',
      contact: 'bg-orange-100 text-orange-800',
      footer: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
          <p className="text-gray-800">Loading content management...</p>
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
              <h1 className="text-2xl font-bold text-[#8B4513]">Content Management</h1>
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
                onClick={() => setActiveTab('content')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-[#B8860B] text-[#B8860B]'
                    : 'border-transparent text-gray-700 hover:text-[#8B4513] hover:border-gray-300'
                }`}
              >
                Website Content
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-[#B8860B] text-[#B8860B]'
                    : 'border-transparent text-gray-700 hover:text-[#8B4513] hover:border-gray-300'
                }`}
              >
                Site Settings
              </button>
            </nav>
          </div>

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Content Form */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    {editingSection ? 'Edit Content Section' : 'Add New Content Section'}
                  </h3>
                  
                  <form onSubmit={handleContentSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Section Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        required
                        value={contentForm.title}
                        onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                        placeholder="e.g., Hero Title, About Us"
                      />
                    </div>

                    <div>
                      <label htmlFor="section_type" className="block text-sm font-medium text-gray-700 mb-2">
                        Section Type *
                      </label>
                      <select
                        id="section_type"
                        required
                        value={contentForm.section_type}
                        onChange={(e) => setContentForm(prev => ({ ...prev, section_type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      >
                        <option value="hero">Hero Section</option>
                        <option value="about">About Us</option>
                        <option value="services">Services</option>
                        <option value="contact">Contact</option>
                        <option value="footer">Footer</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                      </label>
                      <textarea
                        id="content"
                        required
                        rows={6}
                        value={contentForm.content}
                        onChange={(e) => setContentForm(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                        placeholder="Enter the content for this section..."
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={contentForm.is_active}
                        onChange={(e) => setContentForm(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="h-4 w-4 text-[#B8860B] focus:ring-[#B8860B] border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                        Active (visible on website)
                      </label>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-[#B8860B] hover:bg-[#DAA520] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : editingSection ? 'Update Content' : 'Add Content'}
                      </button>
                      {editingSection && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSection(null);
                            setContentForm({
                              title: '',
                              content: '',
                              section_type: 'hero',
                              is_active: true
                            });
                          }}
                          className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Content List */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Existing Content Sections</h3>
                  
                  <div className="space-y-4">
                    {contentSections.map((section, index) => (
                      <motion.div
                        key={section.id}
                        className="border border-gray-200 rounded-lg p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900">{section.title}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSectionTypeColor(section.section_type)}`}>
                                {section.section_type}
                              </span>
                              {section.is_active && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-800 line-clamp-2">{section.content}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => startEditingContent(section)}
                              className="text-[#B8860B] hover:text-[#DAA520] text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteContent(section.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {contentSections.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No content sections yet</h3>
                        <p className="text-gray-800">Create your first content section to get started.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Site Settings</h3>
              
              <form onSubmit={handleSettingsSubmit} className="max-w-2xl space-y-6">
                {siteSettings.map((setting) => (
                  <div key={setting.id}>
                    <label htmlFor={setting.setting_key} className="block text-sm font-medium text-gray-700 mb-2">
                      {setting.description}
                    </label>
                    {setting.setting_type === 'textarea' ? (
                      <textarea
                        id={setting.setting_key}
                        rows={3}
                        value={settingsForm[setting.setting_key] || ''}
                        onChange={(e) => setSettingsForm(prev => ({
                          ...prev,
                          [setting.setting_key]: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      />
                    ) : (
                      <input
                        type={setting.setting_type}
                        id={setting.setting_key}
                        value={settingsForm[setting.setting_key] || ''}
                        onChange={(e) => setSettingsForm(prev => ({
                          ...prev,
                          [setting.setting_key]: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] text-gray-900"
                      />
                    )}
                  </div>
                ))}

                {siteSettings.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Settings will be available soon</h3>
                    <p className="text-gray-800">Site settings management is being set up.</p>
                  </div>
                )}

                {siteSettings.length > 0 && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-[#B8860B] hover:bg-[#DAA520] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}