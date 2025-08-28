'use client';

import { useState } from 'react';

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
    exactStartDate: '',
    exactEndDate: '',
    adults: '2',
    children: '0',
    rooms: '1',
    budget: '',
    specialRequirements: '',
    travelPlans: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your quote request! We will contact you within 24 hours to discuss your Peru adventure.');
    console.log('Form Data:', formData);
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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Request Your Custom Quote
            </h1>
            <p className="text-xl mb-4">
              Tell us about your dream Peru adventure and we'll create a personalized itinerary just for you.
            </p>
            <p className="text-blue-100">
              Our Peru specialists will contact you within 24 hours with a detailed proposal.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Travel Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Details</h2>
            
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
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                    className="h-4 w-4 text-blue-900 focus:ring-blue-900 border-gray-300"
                  />
                  <span className="ml-2">I'm flexible with dates</span>
                </label>
                
                {formData.dateType === 'flexible' && (
                  <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="flexibleMonth" className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Month
                      </label>
                      <select
                        id="flexibleMonth"
                        name="flexibleMonth"
                        value={formData.flexibleMonth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                      >
                        <option value="">Select Year</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
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
                    className="h-4 w-4 text-blue-900 focus:ring-blue-900 border-gray-300"
                  />
                  <span className="ml-2">I have specific dates in mind</span>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              >
                <option value="">Select budget range</option>
                <option value="1000-2000">$1,000 - $2,000</option>
                <option value="2000-3000">$2,000 - $3,000</option>
                <option value="3000-4000">$3,000 - $4,000</option>
                <option value="4000-5000">$4,000 - $5,000</option>
                <option value="5000+">$5,000+</option>
              </select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>
            
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
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
            >
              Request My Custom Quote
            </button>
            <p className="text-gray-600 mt-4 text-sm">
              We'll contact you within 24 hours with a personalized itinerary and pricing.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}