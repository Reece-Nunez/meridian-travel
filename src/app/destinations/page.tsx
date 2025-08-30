'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Destinations() {
  const destinations = [
    {
      id: 'machu-picchu',
      name: 'Machu Picchu & Sacred Valley',
      duration: '4-7 Days',
      difficulty: 'Easy to Moderate',
      highlights: ['Machu Picchu sunrise', 'Sacred Valley markets', 'Ollantaytambo fortress', 'Traditional weaving demonstrations'],
      description: 'Discover the crown jewel of Peru with this iconic journey to Machu Picchu. Experience the mystical ancient citadel at sunrise, explore the vibrant Sacred Valley markets, and immerse yourself in traditional Andean culture.',
      price: 'From $2,800 per person'
    },
    {
      id: 'amazon-rainforest',
      name: 'Amazon Rainforest Adventure',
      duration: '3-5 Days',
      difficulty: 'Easy to Moderate',
      highlights: ['Canopy walks', 'Wildlife spotting', 'River excursions', 'Indigenous community visits'],
      description: 'Venture deep into the Peruvian Amazon, one of the world\'s most biodiverse ecosystems. Spot exotic wildlife, walk through the canopy, and learn from indigenous communities about their sustainable way of life.',
      price: 'From $1,950 per person'
    },
    {
      id: 'inca-trail',
      name: 'Classic Inca Trail Trek',
      duration: '4 Days',
      difficulty: 'Challenging',
      highlights: ['Ancient Inca ruins', 'Mountain passes', 'Cloud forest', 'Sunrise at Machu Picchu'],
      description: 'Follow in the footsteps of the ancient Incas on this legendary 4-day trek. Cross high mountain passes, explore remote archaeological sites, and culminate your journey with a spectacular sunrise at Machu Picchu.',
      price: 'From $3,200 per person'
    },
    {
      id: 'cusco-lima',
      name: 'Cusco & Lima Cultural Journey',
      duration: '6-8 Days',
      difficulty: 'Easy',
      highlights: ['Colonial architecture', 'World-class cuisine', 'Art galleries', 'Museums and markets'],
      description: 'Experience Peru\'s rich cultural heritage in two of its most important cities. Explore colonial Cusco\'s cobblestone streets and discover Lima\'s world-renowned culinary scene and vibrant arts district.',
      price: 'From $2,400 per person'
    },
    {
      id: 'rainbow-mountain',
      name: 'Rainbow Mountain & Ausangate',
      duration: '2-4 Days',
      difficulty: 'Moderate to Challenging',
      highlights: ['Colorful mineral mountains', 'High-altitude landscapes', 'Andean communities', 'Hot springs'],
      description: 'Marvel at the incredible natural beauty of Peru\'s Rainbow Mountain (Vinicunca) and the stunning Ausangate region. Experience some of the most dramatically beautiful high-altitude landscapes in the world.',
      price: 'From $1,600 per person'
    },
    {
      id: 'northern-peru',
      name: 'Northern Peru Archaeological Tour',
      duration: '5-7 Days',
      difficulty: 'Easy to Moderate',
      highlights: ['Sipán tomb', 'Huacas del Sol y de la Luna', 'Chachapoya culture', 'Cloud forest'],
      description: 'Discover Peru\'s lesser-known archaeological treasures in the north. Explore ancient Moche and Chachapoya sites, visit world-class museums, and experience the mystical cloud forests.',
      price: 'From $2,600 per person'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-[#2D5016] py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Peru Destinations
            </h1>
            <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
              From ancient ruins to natural wonders, discover Peru's most captivating destinations 
              with expertly crafted itineraries tailored to your interests.
            </p>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {destinations.map((destination, index) => (
            <motion.div 
              key={destination.id} 
              className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-[#8B4513]">{destination.name}</h3>
                  <span className="text-[#B8860B] font-bold text-lg">{destination.price}</span>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {destination.duration}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {destination.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {destination.description}
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-[#8B4513] mb-2">Tour Highlights:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {destination.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-center text-gray-600 text-sm">
                        <svg className="w-4 h-4 text-[#2D5016] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/quote"
                    className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-6 py-3 rounded-md text-center font-medium transition-colors duration-200 flex-1"
                  >
                    Request Quote
                  </Link>
                  <Link
                    href="/contact"
                    className="border border-[#8B4513] text-[#8B4513] hover:bg-[#F5F5DC] px-6 py-3 rounded-md text-center font-medium transition-colors duration-200 flex-1"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#F5F5DC] py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#8B4513] mb-4">
            Don't See What You're Looking For?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Every journey we create is completely customized. Let us know your interests, 
            and we'll craft the perfect Peru adventure just for you.
          </p>
          <Link
            href="/quote"
            className="bg-[#B8860B] hover:bg-[#DAA520] text-[#F5F5DC] px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
          >
            Plan Your Custom Journey
          </Link>
        </div>
      </div>
    </div>
  );
}