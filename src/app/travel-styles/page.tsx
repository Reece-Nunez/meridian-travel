import Link from 'next/link';

export default function TravelStyles() {
  const travelStyles = [
    {
      id: 'luxury',
      name: 'Luxury & Comfort',
      subtitle: 'Premium accommodations and exclusive experiences',
      description: 'Experience Peru in ultimate comfort with luxury lodges, fine dining, private guides, and exclusive access to remarkable sites. Perfect for travelers who want to explore Peru\'s wonders while enjoying premium amenities and personalized service.',
      features: [
        '5-star luxury hotels and boutique lodges',
        'Private transportation and guides',
        'Exclusive access to archaeological sites',
        'Gourmet dining experiences',
        'Spa services and wellness activities',
        'Premium domestic flights'
      ],
      idealFor: 'Honeymooners, luxury travelers, special occasions',
      duration: '7-14 days',
      price: 'From $4,500 per person'
    },
    {
      id: 'adventure',
      name: 'Adventure & Trekking',
      subtitle: 'Active journeys through Peru\'s stunning landscapes',
      description: 'Challenge yourself with Peru\'s most iconic treks and adventure activities. From the legendary Inca Trail to white-water rafting in the Sacred Valley, experience Peru\'s natural beauty through active exploration.',
      features: [
        'Multi-day trekking expeditions',
        'Camping under the stars',
        'Professional mountain guides',
        'All trekking equipment provided',
        'White-water rafting and zip-lining',
        'Mountain biking adventures'
      ],
      idealFor: 'Active travelers, hiking enthusiasts, adventurers',
      duration: '5-12 days',
      price: 'From $2,800 per person'
    },
    {
      id: 'cultural',
      name: 'Cultural Immersion',
      subtitle: 'Deep connections with local communities and traditions',
      description: 'Go beyond tourist attractions to experience authentic Peruvian culture. Stay with local families, participate in traditional ceremonies, learn ancient crafts, and discover the living heritage that makes Peru so special.',
      features: [
        'Homestays with local families',
        'Traditional cooking classes',
        'Artisan workshops and crafts',
        'Community-based tourism',
        'Traditional ceremonies and festivals',
        'Language exchange opportunities'
      ],
      idealFor: 'Culture enthusiasts, meaningful travel seekers',
      duration: '6-10 days',
      price: 'From $2,200 per person'
    },
    {
      id: 'family',
      name: 'Family Adventures',
      subtitle: 'Peru experiences designed for travelers of all ages',
      description: 'Create lasting family memories with age-appropriate activities, comfortable accommodations, and engaging experiences that captivate both adults and children. Our family tours balance education, adventure, and fun.',
      features: [
        'Family-friendly accommodations',
        'Interactive educational activities',
        'Moderate hiking and walking tours',
        'Wildlife viewing opportunities',
        'Cultural workshops for kids',
        'Flexible itineraries'
      ],
      idealFor: 'Families with children, multigenerational groups',
      duration: '7-10 days',
      price: 'From $2,600 per person'
    },
    {
      id: 'wildlife',
      name: 'Wildlife & Nature',
      subtitle: 'Discover Peru\'s incredible biodiversity',
      description: 'Explore Peru\'s diverse ecosystems from the Amazon rainforest to high-altitude cloud forests. Perfect for nature lovers who want to see exotic wildlife, rare birds, and unique plant species with expert naturalist guides.',
      features: [
        'Amazon rainforest expeditions',
        'Professional naturalist guides',
        'Bird watching and wildlife spotting',
        'Canopy walks and river excursions',
        'Night jungle tours',
        'Photography opportunities'
      ],
      idealFor: 'Nature lovers, wildlife enthusiasts, photographers',
      duration: '5-8 days',
      price: 'From $2,400 per person'
    },
    {
      id: 'photography',
      name: 'Photography Tours',
      subtitle: 'Capture Peru\'s most photogenic moments',
      description: 'Join expert photography guides to capture Peru\'s most stunning landscapes, vibrant cultures, and incredible wildlife. Tours are designed with optimal lighting conditions and exclusive access for the perfect shot.',
      features: [
        'Professional photography guides',
        'Sunrise and sunset positioning',
        'Exclusive access for photography',
        'Small group sizes',
        'Post-processing workshops',
        'Portfolio review sessions'
      ],
      idealFor: 'Photography enthusiasts, professional photographers',
      duration: '8-12 days',
      price: 'From $3,200 per person'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Travel Styles
            </h1>
            <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
              Every traveler is unique. Discover the Peru adventure that matches your 
              interests, travel style, and dreams.
            </p>
          </div>
        </div>
      </div>

      {/* Travel Styles Grid */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {travelStyles.map((style) => (
            <div key={style.id} className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{style.name}</h3>
                    <p className="text-blue-900 font-medium">{style.subtitle}</p>
                  </div>
                  <span className="text-blue-900 font-bold text-lg">{style.price}</span>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {style.description}
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                  <ul className="space-y-1">
                    {style.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600 text-sm">
                        <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <span className="font-semibold text-gray-900">Ideal for:</span>
                    <p className="text-gray-600">{style.idealFor}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Duration:</span>
                    <p className="text-gray-600">{style.duration}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/quote"
                    className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-md text-center font-medium transition-colors duration-200 flex-1"
                  >
                    Request Quote
                  </Link>
                  <Link
                    href="/contact"
                    className="border border-blue-900 text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-md text-center font-medium transition-colors duration-200 flex-1"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Combination Tours */}
      <div className="bg-gray-50 py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Can't Choose Just One Style?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Many of our travelers combine multiple styles for the ultimate Peru experience. 
              Mix luxury with adventure, or combine cultural immersion with wildlife viewing.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Custom Combinations
                </h3>
                <p className="text-gray-600">
                  Mix and match different travel styles to create your perfect Peru adventure.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Group Flexibility
                </h3>
                <p className="text-gray-600">
                  Different group members can enjoy different activities that match their interests.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Extended Journeys
                </h3>
                <p className="text-gray-600">
                  Longer trips allow for multiple experiences across Peru's diverse regions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Discover Your Perfect Peru Style?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Our Peru specialists will help you choose the travel style that best matches 
          your interests and create a completely personalized itinerary.
        </p>
        <Link
          href="/quote"
          className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
        >
          Start Planning Your Adventure
        </Link>
      </div>
    </div>
  );
}