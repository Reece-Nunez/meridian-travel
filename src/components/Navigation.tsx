'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin, isUserAdmin } from '@/lib/adminUtils';

const DESTINATIONS = [
  { name: 'Peru', href: '/destinations/peru' },
  { name: 'Ecuador', href: '/destinations/ecuador' },
  { name: 'Brazil', href: '/destinations/brazil' },
  { name: 'Argentina', href: '/destinations/argentina' },
  { name: 'Chile', href: '/destinations/chile' },
  { name: 'Galapagos Islands', href: '/destinations/galapagos' },
  { name: 'Antarctica', href: '/destinations/antarctica' },
  { name: 'Arctic', href: '/destinations/arctic' },
];

const NAV_LINKS = [
  { name: 'Cruises', href: '/cruises' },
  { name: 'Packages', href: '/packages' },
  { name: 'Guides', href: '/blog' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const { user, profile, signOut, loading } = useAuth();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsAccountMenuOpen(false);
        setIsDestinationsOpen(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const checkAdminStatus = () => {
      if (user?.email) {
        setUserIsAdmin(isAdmin() || isUserAdmin(user.email));
      } else {
        setUserIsAdmin(false);
      }
    };

    checkAdminStatus();

    window.addEventListener('storage', checkAdminStatus);
    return () => window.removeEventListener('storage', checkAdminStatus);
  }, [user, loading]);

  const handleSignOut = useCallback(async () => {
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    try {
      const { error } = await signOut();
      if (error) {
        alert('Sign out failed. Please try again.');
      } else {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/auth/signin';
      }
    } catch {
      alert('Sign out failed. Please try again.');
    }
  }, [signOut]);

  const dashboardHref = userIsAdmin ? '/admin' : '/dashboard';
  const dashboardLabel = userIsAdmin ? 'Admin Dashboard' : 'Dashboard';

  return (
    <nav className={`${isScrolled ? 'bg-[#F5F5DC]/80 backdrop-blur-md' : 'bg-[#F5F5DC]'} shadow-sm border-b border-gray-200 sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-22">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="flex-shrink-0">
              <img
                src="https://meridian-travel.s3.us-east-1.amazonaws.com/logo.png"
                alt="Meridian Luxury Travel"
                className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </Link>
            <Link href="/" className="flex-shrink-0 hidden sm:block">
              <div className="text-left">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-serif font-bold text-[#8B4513] tracking-wide leading-tight">
                  Meridian Luxury Travel
                </h1>
                <p className="text-xs md:text-sm font-serif text-[#B8860B] tracking-wider">
                  Tailor-Made Journeys
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:block">
              {user ? (
                <div
                  className="relative"
                  onMouseEnter={() => setIsAccountMenuOpen(true)}
                  onMouseLeave={() => setIsAccountMenuOpen(false)}
                >
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center space-x-2 text-[#8B4513] hover:text-[#B8860B] px-3 py-2 text-sm font-medium transition-colors duration-200 border border-[#8B4513] rounded-md hover:border-[#B8860B]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{profile?.first_name || 'Account'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isAccountMenuOpen && (
                    <div className="absolute top-full right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
                            {user.email}
                          </div>
                          <Link
                            href={dashboardHref}
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-[#8B4513] hover:bg-gray-50 hover:text-[#B8860B]"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                            {dashboardLabel}
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-[#8B4513] hover:bg-gray-50 hover:text-[#B8860B]"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-[#8B4513] hover:bg-gray-50 hover:text-[#B8860B] cursor-pointer"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              ) : loading ? (
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-16 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/signin"
                    className="text-[#8B4513] hover:text-[#B8860B] px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/quote"
                    className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Get Quote
                  </Link>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-[#8B4513] hover:text-[#B8860B] hover:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#B8860B]"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:block border-t border-gray-300/50">
          <div className="flex items-center justify-center space-x-8 py-3">
            <div
              className="relative"
              onMouseEnter={() => setIsDestinationsOpen(true)}
              onMouseLeave={() => setIsDestinationsOpen(false)}
            >
              <div className="flex items-center">
                <Link
                  href="/destinations"
                  className="text-[#8B4513] hover:text-[#B8860B] px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Destinations
                </Link>
                <button
                  onClick={() => setIsDestinationsOpen(!isDestinationsOpen)}
                  className="text-[#8B4513] hover:text-[#B8860B] p-1 text-sm font-medium transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {isDestinationsOpen && (
                <div className="absolute top-full left-0 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link
                        href="/destinations"
                        className="block px-4 py-2 text-sm font-medium text-[#B8860B] hover:bg-gray-50 border-b border-gray-100"
                      >
                        View All Destinations
                      </Link>
                      {DESTINATIONS.map((dest) => (
                        <Link
                          key={dest.href}
                          href={dest.href}
                          className="block px-4 py-2 text-sm text-[#8B4513] hover:bg-gray-50 hover:text-[#B8860B]"
                        >
                          {dest.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#8B4513] hover:text-[#B8860B] px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#F5F5DC] border-t border-gray-200">
              <div>
                <div className="flex items-center justify-between px-3 py-2">
                  <Link
                    href="/destinations"
                    className="text-[#8B4513] hover:text-[#B8860B] text-base font-medium flex-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Destinations
                  </Link>
                  <button
                    onClick={() => setIsDestinationsOpen(!isDestinationsOpen)}
                    className="text-[#8B4513] hover:text-[#B8860B] p-1"
                  >
                    <svg className={`h-4 w-4 transform transition-transform ${isDestinationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {isDestinationsOpen && (
                  <div className="overflow-hidden">
                      <div className="pl-6 space-y-1">
                        <Link
                          href="/destinations"
                          className="text-[#B8860B] hover:text-[#DAA520] block px-3 py-2 text-sm font-medium border-b border-gray-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          View All Destinations
                        </Link>
                        {DESTINATIONS.map((dest) => (
                          <Link
                            key={dest.href}
                            href={dest.href}
                            className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {dest.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
              <Link
                href="/packages"
                className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Packages
              </Link>
              <Link
                href="/cruises"
                className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cruises
              </Link>
              <Link
                href="/about"
                className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/quote"
                className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] block px-3 py-2 rounded-md text-base font-medium mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Request Quote
              </Link>

              {loading ? (
                <div className="flex items-center px-3 py-2 mt-4">
                  <div className="w-6 h-6 animate-pulse bg-gray-200 rounded-full"></div>
                  <div className="ml-2 w-20 h-4 animate-pulse bg-gray-200 rounded"></div>
                </div>
              ) : user ? (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="px-3 py-2 text-base text-gray-600">
                    {profile?.first_name ? `Hello, ${profile.first_name}` : 'Welcome!'}
                  </div>
                  <Link
                    href={dashboardHref}
                    className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {dashboardLabel}
                  </Link>
                  <Link
                    href="/profile"
                    className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/packages"
                    className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Packages
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left text-[#8B4513] hover:text-[#B8860B] px-3 py-2 text-base font-medium cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href="/auth/signin"
                    className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-[#8B4513] hover:text-[#B8860B] block px-3 py-2 text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
    </nav>
  );
}
