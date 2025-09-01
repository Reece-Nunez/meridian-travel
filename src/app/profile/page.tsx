'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [travelPreferences, setTravelPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/profile');
      return;
    }

    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      setEmergencyContact(profile.emergency_contact || '');
      setDietaryRestrictions(profile.dietary_restrictions || '');
      setTravelPreferences(profile.travel_preferences || '');
    }
  }, [user, profile, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await updateProfile({
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      emergency_contact: emergencyContact,
      dietary_restrictions: dietaryRestrictions,
      travel_preferences: travelPreferences,
    });

    if (error) {
      setMessage('Error updating profile. Please try again.');
    } else {
      setMessage('Profile updated successfully!');
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-[#8B4513]">Your Profile</h1>
            <p className="text-gray-600 mt-1">
              Update your travel preferences and contact information
            </p>
          </div>

          <div className="p-6">
            {/* User Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email Verified:</strong> {user.email_confirmed_at ? '✅ Yes' : '❌ No - Check your email'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-md mb-6 ${
                message.includes('Error') 
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-green-50 border border-green-200 text-green-800'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full text-[#8B4513] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full text-[#8B4513] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-[#8B4513] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact
                </label>
                <input
                  id="emergencyContact"
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full text-[#8B4513] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
                  placeholder="Name and phone number"
                />
              </div>

              <div>
                <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <textarea
                  id="dietaryRestrictions"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  rows={3}
                  className="w-full text-[#8B4513] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
                  placeholder="Any allergies or dietary preferences..."
                />
              </div>

              <div>
                <label htmlFor="travelPreferences" className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Preferences
                </label>
                <textarea
                  id="travelPreferences"
                  value={travelPreferences}
                  onChange={(e) => setTravelPreferences(e.target.value)}
                  rows={3}
                  className="w-full text-[#8B4513] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B]"
                  placeholder="Adventure level, accommodation preferences, special interests..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}