'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuoteRequest() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    destination: 'Peru',
    dateType: '',
    flexibleMonth: '',
    flexibleYear: '',
    flexibleDuration: '7',
    exactStartDate: '',
    exactEndDate: '',
    adults: '2',
    children: '0',
    rooms: '1',
    budget: '',
    specialRequirements: '',
    travelPlans: ''
  });

  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    destination: 'Peru',
    dateType: '',
    flexibleMonth: '',
    flexibleYear: '',
    flexibleDuration: '7',
    exactStartDate: '',
    exactEndDate: '',
    adults: '2',
    children: '0',
    rooms: '1',
    budget: '',
    specialRequirements: '',
    travelPlans: ''
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Show success toast
        setShowToast(true);
        
        // Clear form
        setFormData(initialFormState);
        
        // Hide toast after 5 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        // Show error message
        alert('Failed to submit quote request. Please try again.');
        console.error('Submission error:', result);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold">Quote Request Submitted!</p>
              <p className="text-sm">We'll contact you within 24 hours to discuss your Peru adventure.</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-4 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/quote.jpg" 
            alt="Request custom travel quote"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load quote.jpg');
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Request Your Custom Quote
            </h1>
            <p className="text-xl mb-4">
              Tell us about your dream Peru adventure and we'll create a personalized itinerary just for you.
            </p>
            <p className="text-[#F5F5DC]">
              Our Peru specialists will contact you within 24 hours with a detailed proposal.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Contact Information */}
          <motion.div 
            className="bg-[#F5F5DC] p-6 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-[#8B4513] mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>

          {/* Travel Details */}
          <motion.div 
            className="bg-[#F5F5DC] p-6 rounded-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-[#8B4513] mb-6">Travel Details</h2>
            
            <div className="mb-6">
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                Destination *
              </label>
              <select
                id="destination"
                name="destination"
                required
                value={formData.destination}
                onChange={handleInputChange}
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              >
                <option value="Peru">Peru</option>
                <option value="Ecuador" disabled>Ecuador (Coming Soon)</option>
                <option value="Galapagos" disabled>Galapagos Islands (Coming Soon)</option>
                <option value="Bolivia" disabled>Bolivia (Coming Soon)</option>
                <option value="Chile" disabled>Chile (Coming Soon)</option>
                <option value="Argentina" disabled>Argentina (Coming Soon)</option>
              </select>
            </div>

            {/* Travel Dates */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                When would you like to travel? *
              </label>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="dateType"
                    value="flexible"
                    checked={formData.dateType === 'flexible'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#B8860B] focus:ring-[#B8860B] border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">I'm flexible with dates</span>
                </label>
                
                {formData.dateType === 'flexible' && (
                  <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="flexibleMonth" className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Month
                      </label>
                      <select
                        id="flexibleMonth"
                        name="flexibleMonth"
                        value={formData.flexibleMonth}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                      >
                        <option value="">Select Month</option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="flexibleYear" className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <select
                        id="flexibleYear"
                        name="flexibleYear"
                        value={formData.flexibleYear}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                      >
                        <option value="">Select Year</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="flexibleDuration" className="block text-sm font-medium text-gray-700 mb-2">
                        Trip Duration *
                      </label>
                      <select
                        id="flexibleDuration"
                        name="flexibleDuration"
                        required
                        value={formData.flexibleDuration}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                      >
                        <option value="3">3 days</option>
                        <option value="4">4 days</option>
                        <option value="5">5 days</option>
                        <option value="6">6 days</option>
                        <option value="7">7 days</option>
                        <option value="8">8 days</option>
                        <option value="9">9 days</option>
                        <option value="10">10 days</option>
                        <option value="11">11 days</option>
                        <option value="12">12 days</option>
                        <option value="14">14 days (2 weeks)</option>
                        <option value="21">21 days (3 weeks)</option>
                        <option value="28">28 days (4 weeks)</option>
                        <option value="custom">Custom duration</option>
                      </select>
                    </div>
                  </div>
                )}

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="dateType"
                    value="exact"
                    checked={formData.dateType === 'exact'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#B8860B] focus:ring-[#B8860B] border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">I have specific dates in mind</span>
                </label>

                {formData.dateType === 'exact' && (
                  <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="exactStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Departure Date
                      </label>
                      <input
                        type="date"
                        id="exactStartDate"
                        name="exactStartDate"
                        value={formData.exactStartDate}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="exactEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Return Date
                      </label>
                      <input
                        type="date"
                        id="exactEndDate"
                        name="exactEndDate"
                        value={formData.exactEndDate}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Group Size */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div>
                <label htmlFor="adults" className="block text-sm font-medium text-gray-700 mb-2">
                  Adults *
                </label>
                <select
                  id="adults"
                  name="adults"
                  required
                  value={formData.adults}
                  onChange={handleInputChange}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="children" className="block text-sm font-medium text-gray-700 mb-2">
                  Children
                </label>
                <select
                  id="children"
                  name="children"
                  value={formData.children}
                  onChange={handleInputChange}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                >
                  {[...Array(6)].map((_, i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Rooms Needed *
                </label>
                <select
                  id="rooms"
                  name="rooms"
                  required
                  value={formData.rooms}
                  onChange={handleInputChange}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                >
                  {[...Array(5)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget */}
            <div className="mb-6">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget per person (USD) *
              </label>
              <select
                id="budget"
                name="budget"
                required
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              >
                <option value="">Select budget range</option>
                <option value="1000-2000">$1,000 - $2,000</option>
                <option value="2000-3000">$2,000 - $3,000</option>
                <option value="3000-4000">$3,000 - $4,000</option>
                <option value="4000-5000">$4,000 - $5,000</option>
                <option value="5000+">$5,000+</option>
              </select>
            </div>
          </motion.div>

          {/* Additional Information */}
          <motion.div 
            className="bg-[#F5F5DC] p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-[#8B4513] mb-6">Additional Information</h2>
            
            <div className="mb-6">
              <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-2">
                Special Requirements
              </label>
              <textarea
                id="specialRequirements"
                name="specialRequirements"
                rows={3}
                value={formData.specialRequirements}
                onChange={handleInputChange}
                placeholder="Dietary restrictions, mobility requirements, allergies, etc."
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="travelPlans" className="block text-sm font-medium text-gray-700 mb-2">
                Tell us about your travel plans, interests, and any questions
              </label>
              <textarea
                id="travelPlans"
                name="travelPlans"
                rows={5}
                value={formData.travelPlans}
                onChange={handleInputChange}
                placeholder="What experiences are you most excited about? Are you interested in adventure activities, cultural immersion, wildlife viewing, luxury accommodations? Any specific sites you must see? Any concerns or questions?"
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#B8860B] hover:bg-[#DAA520] disabled:bg-gray-400 disabled:cursor-not-allowed text-[#F5F5DC] px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isSubmitting && (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isSubmitting ? 'Submitting...' : 'Request My Custom Quote'}</span>
            </button>
            <p className="text-gray-800 mt-4 text-sm">
              We'll contact you within 24 hours with a personalized itinerary and pricing.
            </p>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}