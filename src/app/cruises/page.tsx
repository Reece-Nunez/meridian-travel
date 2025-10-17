'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getContentByKey, getSettingByKey } from '@/lib/content';
import { supabase } from '@/lib/supabase';
import { TripPackage, Ship } from '@/types/database';

// Helper function to extract numbers from pricing text
const extractPriceFromText = (priceText: string): number | null => {
  // Remove all non-numeric characters except decimal points
  // Match patterns like "$1,500", "1500.00", "$ 1500", etc.
  const matches = priceText.match(/\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  if (matches && matches[1]) {
    // Remove commas and parse as number
    const numericValue = parseFloat(matches[1].replace(/,/g, ''));
    return isNaN(numericValue) ? null : numericValue;
  }
  return null;
};

// Helper function to map destinations to our location categories
const mapDestinationToLocation = (destination: string): string => {
  const dest = destination.toLowerCase();
  if (dest.includes('galapagos')) return 'Galapagos';
  if (dest.includes('amazon')) return 'Amazon';
  if (dest.includes('antarctica') || dest.includes('antarctic')) return 'Antarctica';
  if (dest.includes('chile') || dest.includes('patagonia') || dest.includes('fjord')) return 'Chile';
  return dest; // fallback to original destination
};

// Helper function to determine boat type from package data
const determineBoatType = (pkg: TripPackage): string => {
  const highlights = pkg.luxury_highlights?.join(' ').toLowerCase() || '';
  const description = pkg.description?.toLowerCase() || '';

  if (highlights.includes('luxury') || highlights.includes('butler') || highlights.includes('suite')) {
    return 'Luxury';
  }
  if (highlights.includes('adventure') || description.includes('adventure')) {
    return 'Adventure';
  }
  if (highlights.includes('expedition') || description.includes('expedition')) {
    return 'Expedition';
  }
  if (highlights.includes('boutique') || highlights.includes('intimate')) {
    return 'Boutique';
  }
  return 'Expedition'; // default
};

// Interface for our processed boat data
interface ProcessedBoat {
  id: string;
  name: string;
  location: string;
  capacity: number;
  itineraryCount: number;
  image: string;
  startingPrice: number;
  priceRange: string | null; // e.g., "$1500 - $3600" or null if no cabins
  boatType: string;
  features: string[];
  ship: Ship;
  itineraries: {
    id: string;
    name: string;
    duration: string;
    price: number;
    description?: string;
    highlights?: string[];
  }[];
}

// Location information derived from database
interface LocationInfo {
  name: string;
  boatCount: number;
  startingPrice: number | null;
}

// Static location display information (for UI only, not data)
const locationDisplayInfo = [
  {
    name: "Galapagos",
    title: "Galapagos Discoveries",
    description: "Follow Darwin's footsteps through the enchanted islands where evolution comes alive with unique wildlife found nowhere else.",
    image: "/locations/galapagos-hero.webp",
    features: ["Unique wildlife", "Snorkeling", "Educational tours", "Multiple itineraries"]
  },
  {
    name: "Amazon",
    title: "Amazon Explorations",
    description: "Journey deep into the world's largest rainforest, discovering incredible biodiversity and indigenous cultures.",
    image: "/locations/amazon-hero.png",
    features: ["Rainforest wildlife", "Indigenous culture", "River expeditions", "Birdwatching"]
  },
  {
    name: "Antarctica",
    title: "Antarctic Expeditions",
    description: "Experience the last pristine wilderness on Earth with encounters with penguins, whales, and dramatic ice formations.",
    image: "/locations/antarctica-hero.jpg",
    features: ["Emperor penguins", "Massive icebergs", "Zodiac landings", "Expert guides"]
  },
  {
    name: "Chile",
    title: "Chilean Adventures",
    description: "Navigate the dramatic fjords and channels of Chilean Patagonia, discovering glaciers, wildlife, and remote landscapes.",
    image: "/locations/chile-hero.webp",
    features: ["Glacier viewing", "Fjord navigation", "Wildlife watching", "Hiking excursions"]
  },
  {
    name: "Diving",
    title: "Diving Cruises",
    description: "Explore the world's most spectacular dive sites aboard specialized diving vessels with expert crews and top-notch equipment.",
    image: "/locations/diving-hero.jpg",
    features: ["World-class dive sites", "Expert dive guides", "Modern equipment", "Small group expeditions"]
  }
];

export default function Cruises() {
  const [content, setContent] = useState({
    cruisesTitle: 'Luxury South American Cruises',
    cruisesContent: 'Discover the pristine wilderness of Antarctica, the dramatic fjords of Patagonia, the unique wildlife of the Galapagos, and the incredible biodiversity of the Amazon aboard our carefully selected fleet of luxury expedition vessels.',
    companyName: 'Meridian Luxury Travel'
  });

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [cruisePackages, setCruisePackages] = useState<TripPackage[]>([]);
  const [processedBoats, setProcessedBoats] = useState<ProcessedBoat[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<LocationInfo[]>([]);

  const filteredBoats = selectedLocation
    ? processedBoats.filter(boat => boat.location === selectedLocation)
    : processedBoats;

  // Fetch cruise packages and process them into boats
  const fetchCruiseData = async () => {
    try {
      console.log('🚢 Fetching ships from database...');

      // Add timeout protection to the ships query
      const shipsQueryPromise = supabase
        .from('ships')
        .select('*')
        .eq('is_active', true);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Ships query timeout')), 5000);
      });

      const { data: allShips, error: shipsError } = await Promise.race([
        shipsQueryPromise,
        timeoutPromise
      ]);

      if (shipsError) {
        console.error('❌ Error fetching ships:', shipsError);
        throw shipsError;
      }

      console.log(`✅ Fetched ${allShips?.length || 0} ships from database`);

      // Fetch cruise packages
      console.log('📦 Fetching cruise packages...');
      const { data: packagesWithShips, error } = await supabase
        .from('trip_packages')
        .select(`
          *,
          ship:ships(*)
        `)
        .eq('type', 'cruise')
        .eq('is_active', true)
        .not('ship_id', 'is', null)
        .order('ship_id', { ascending: true });

      if (error) {
        console.error('❌ Error fetching packages:', error);
        throw error;
      }

      console.log(`✅ Fetched ${packagesWithShips?.length || 0} cruise packages`);
      setCruisePackages(packagesWithShips || []);

      // Fetch all cabin categories
      console.log('🛏️ Fetching cabin categories...');
      const { data: cabinCategories, error: cabinError } = await supabase
        .from('cabin_categories')
        .select('ship_id, pricing_per_person');

      if (cabinError) {
        console.error('❌ Error fetching cabin categories:', cabinError);
      }

      console.log(`✅ Fetched ${cabinCategories?.length || 0} cabin categories`);

      // Create a map to store cabin price ranges by ship_id
      const priceRangesByShip = new Map<string, string>();

      if (cabinCategories) {
        const cabinsByShip = new Map<string, any[]>();

        // Group cabins by ship
        cabinCategories.forEach((cabin: any) => {
          if (!cabin.ship_id || !cabin.pricing_per_person) return;

          const existing = cabinsByShip.get(cabin.ship_id) || [];
          existing.push(cabin);
          cabinsByShip.set(cabin.ship_id, existing);
        });

        // Calculate price range for each ship
        cabinsByShip.forEach((cabins, shipId) => {
          const prices: number[] = [];

          cabins.forEach(cabin => {
            const price = extractPriceFromText(cabin.pricing_per_person);
            if (price !== null) {
              prices.push(price);
            }
          });

          if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            if (minPrice === maxPrice) {
              priceRangesByShip.set(shipId, `$${minPrice.toLocaleString()}`);
            } else {
              priceRangesByShip.set(shipId, `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`);
            }
          }
        });
      }

      console.log(`📊 Calculated price ranges for ${priceRangesByShip.size} ships`);

      // Create a map to store itineraries by ship_id
      const itinerariesByShip = new Map<string, any[]>();

      packagesWithShips?.forEach((pkg: any) => {
        if (!pkg.ship_id) return;

        const existing = itinerariesByShip.get(pkg.ship_id) || [];
        existing.push({
          id: pkg.id,
          name: pkg.title,
          duration: `${pkg.duration} days`,
          price: pkg.price_usd || 0, // Use real price if available
          description: pkg.description || undefined,
          highlights: pkg.luxury_highlights || undefined
        });
        itinerariesByShip.set(pkg.ship_id, existing);
      });

      // Now process all ships, including those without packages
      // Create a boat entry for each operating region or ship type (for diving ships)
      const boatsArray: ProcessedBoat[] = [];

      allShips?.forEach((ship: any) => {
        // Get itineraries for this ship (if any)
        const shipItineraries = itinerariesByShip.get(ship.id) || [];

        // Special handling for Diving Ships - they go in "Diving" category
        if (ship.ship_type && ship.ship_type.toLowerCase().includes('diving')) {
          const location = 'Diving';

          // Calculate starting price - ONLY from real data, no fallbacks
          let startingPrice = 0;
          if (shipItineraries.length > 0) {
            const realPrices = shipItineraries
              .map((itin: any) => itin.price)
              .filter((price: number) => price > 0);

            if (realPrices.length > 0) {
              startingPrice = Math.min(...realPrices);
            }
          }

          boatsArray.push({
            id: `${ship.id}-${location}`,
            name: ship.name,
            location: location,
            capacity: ship.capacity,
            itineraryCount: shipItineraries.length,
            image: ship.images && ship.images[0] ? ship.images[0] : '', // No default image
            startingPrice: startingPrice,
            priceRange: priceRangesByShip.get(ship.id) || null,
            boatType: ship.ship_type || 'Diving Ship',
            features: ship.luxury_highlights?.slice(0, 3) || ship.ship_features?.slice(0, 3) || [],
            ship: ship,
            itineraries: shipItineraries
          });
        } else {
          // Normal ships - create entry for each operating region
          const regions = ship.operating_regions || [];

          // Skip ships with no operating regions
          if (regions.length === 0) return;

          regions.forEach((region: string) => {
            const location = mapDestinationToLocation(region);

            // Calculate starting price - ONLY from real data, no fallbacks
            let startingPrice = 0;
            if (shipItineraries.length > 0) {
              const realPrices = shipItineraries
                .map((itin: any) => itin.price)
                .filter((price: number) => price > 0);

              if (realPrices.length > 0) {
                startingPrice = Math.min(...realPrices);
              }
            }

            boatsArray.push({
              id: `${ship.id}-${location}`, // Unique ID per region
              name: ship.name,
              location: location,
              capacity: ship.capacity,
              itineraryCount: shipItineraries.length,
              image: ship.images && ship.images[0] ? ship.images[0] : '', // No default image
              startingPrice: startingPrice,
              priceRange: priceRangesByShip.get(ship.id) || null,
              boatType: ship.ship_type || 'Expedition',
              features: ship.luxury_highlights?.slice(0, 3) || ship.ship_features?.slice(0, 3) || [],
              ship: ship,
              itineraries: shipItineraries
            });
          });
        }
      });

      console.log(`🚤 Processed ${boatsArray.length} boat entries from ${allShips?.length || 0} ships`);
      setProcessedBoats(boatsArray);

      // Build locations array from actual boat data (no hardcoded locations)
      const locationMap: {[key: string]: LocationInfo} = {};
      const shipsByLocation: {[key: string]: Set<string>} = {};

      boatsArray.forEach(boat => {
        if (!locationMap[boat.location]) {
          locationMap[boat.location] = {
            name: boat.location,
            boatCount: 0,
            startingPrice: null
          };
          shipsByLocation[boat.location] = new Set();
        }

        // Add ship to unique set for counting
        shipsByLocation[boat.location].add(boat.ship.id);

        // Update starting price (only if boat has a real price > 0)
        if (boat.startingPrice > 0) {
          if (locationMap[boat.location].startingPrice === null ||
              boat.startingPrice < locationMap[boat.location].startingPrice!) {
            locationMap[boat.location].startingPrice = boat.startingPrice;
          }
        }
      });

      // Update boat counts with unique ship counts
      Object.keys(shipsByLocation).forEach(location => {
        locationMap[location].boatCount = shipsByLocation[location].size;
      });

      // Convert to array and set locations
      const locationsArray = Object.values(locationMap);
      console.log(`📍 Found ${locationsArray.length} locations:`, locationsArray);
      setLocations(locationsArray);

    } catch (error) {
      console.error('Error fetching cruise data:', error);
      setProcessedBoats([]);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [cruisesTitle, cruisesContent, companyName] = await Promise.all([
          getContentByKey('cruises_page_title'),
          getContentByKey('cruises_page_content'),
          getSettingByKey('company_name')
        ]);

        setContent({
          cruisesTitle: cruisesTitle || 'Luxury South American Cruises',
          cruisesContent: cruisesContent || 'Discover the pristine wilderness of Antarctica, the dramatic fjords of Patagonia, the unique wildlife of the Galapagos, and the incredible biodiversity of the Amazon aboard our carefully selected fleet of luxury expedition vessels.',
          companyName: companyName || 'Meridian Luxury Travel'
        });
      } catch (error) {
        console.log('CMS content unavailable for cruises page, using fallback content');
      }
    };

    fetchContent();
    fetchCruiseData(); // Fetch cruise data from database
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative h-[600px] overflow-hidden">
        <img
          src="/cruise-ship.png"
          alt="Luxury cruise ship"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Failed to load cruise-ship.jpg');
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {content.cruisesTitle}
            </motion.h1>
            <motion.p
              className="text-xl sm:text-2xl mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {content.cruisesContent}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Location Navigation */}
      <div className="bg-[#F5F5DC] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedLocation(null)}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                selectedLocation === null
                  ? 'bg-[#B8860B] text-white'
                  : 'bg-white text-[#8B4513] hover:bg-gray-50'
              }`}
            >
              All Locations
            </button>
            {locationDisplayInfo.map((location) => (
              <button
                key={location.name}
                onClick={() => setSelectedLocation(location.name)}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  selectedLocation === location.name
                    ? 'bg-[#B8860B] text-white'
                    : 'bg-white text-[#8B4513] hover:bg-gray-50'
                }`}
              >
                {location.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Choose Your Adventure Section with Destination Cards */}
      {!selectedLocation && !loading && (
        <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-4">
              Choose Your Adventure
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From the pristine wilderness of Antarctica to the incredible biodiversity of the Amazon,
              each destination offers unique experiences aboard our carefully selected fleet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {locationDisplayInfo.map((location, index) => {
              const locationStats = locations.find(l => l.name === location.name);

              return (
                <motion.div
                  key={location.name}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => setSelectedLocation(location.name)}
                >
                  <div className="h-64 relative overflow-hidden">
                    <img
                      src={location.image}
                      alt={location.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-[#B8860B] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {locationStats ? `${locationStats.boatCount} boats available` : 'Coming Soon'}
                    </div>
                    {locationStats && locationStats.startingPrice !== null && locationStats.startingPrice > 0 && (
                      <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                        From ${locationStats.startingPrice.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#8B4513] mb-3">{location.title}</h3>
                    <p className="text-gray-600 mb-4">{location.description}</p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {location.features.map((feature, fIndex) => (
                        <div key={fIndex} className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-[#B8860B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <button className="w-full bg-[#B8860B] hover:bg-[#DAA520] text-white py-3 rounded-md font-medium transition-colors">
                      Explore {location.title}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Boat Cards - Specific Location View */}
      {selectedLocation && filteredBoats.length > 0 && (
        <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-4">
              {locationDisplayInfo.find(l => l.name === selectedLocation)?.title || selectedLocation} Fleet
            </h2>
            <p className="text-lg text-gray-600">
              {locationDisplayInfo.find(l => l.name === selectedLocation)?.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBoats.map((boat, index) => (
              <motion.div
                key={boat.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {boat.image && (
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <img
                      src={boat.image}
                      alt={boat.name}
                      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-[#B8860B] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {boat.capacity} guests
                    </div>
                    <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      {boat.boatType}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                      {boat.location}
                    </div>
                    {boat.itineraryCount > 0 && (
                      <div className="absolute bottom-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        {boat.itineraryCount} {boat.itineraryCount > 1 ? 'itineraries' : 'itinerary'}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#8B4513] mb-2">{boat.name}</h3>
                  <p className="text-2xl font-bold text-[#B8860B] mb-4">
                    {boat.priceRange ? `Price: ${boat.priceRange}` : 'Price: N/A'}
                  </p>

                  {boat.features.length > 0 && (
                    <div className="space-y-2 mb-6">
                      <h4 className="font-semibold text-gray-900">Features:</h4>
                      {boat.features.map((feature: string, fIndex: number) => (
                        <div key={fIndex} className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-[#B8860B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link
                      href={`/ships/${boat.ship.id}`}
                      className="flex-1 text-center border-2 border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white py-3 rounded-md font-medium transition-colors"
                    >
                      Ship Details
                    </Link>
                    {boat.itineraryCount > 0 && (
                      <Link
                        href={`/ships/${boat.ship.id}/itineraries`}
                        className="flex-1 text-center bg-[#B8860B] hover:bg-[#DAA520] text-white py-3 rounded-md font-medium transition-colors"
                      >
                        Itineraries ({boat.itineraryCount})
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Locations View - Boats Grouped by Location */}
      {!selectedLocation && (
        <div className="py-16">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8860B]"></div>
              <p className="mt-4 text-gray-600">Loading cruise ships...</p>
            </div>
          )}
          {!loading && processedBoats.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No ships found. Please check your database connection or RLS policies.</p>
            </div>
          )}
          {!loading && locationDisplayInfo.map((locationDisplay, locationIndex) => {
            const locationBoats = processedBoats.filter(boat => boat.location === locationDisplay.name);
            const locationStats = locations.find(l => l.name === locationDisplay.name);

            // Show location even if no boats (but with message)
            return (
              <div key={locationDisplay.name} className="mb-20">
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                  {/* Location Section Header */}
                  <div className="text-center mb-12">
                    <motion.h2
                      className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: locationIndex * 0.1 }}
                    >
                      {locationDisplay.title}
                    </motion.h2>
                    <motion.p
                      className="text-lg text-gray-600 max-w-3xl mx-auto mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: locationIndex * 0.1 + 0.1 }}
                    >
                      {locationDisplay.description}
                    </motion.p>
                    {locationStats && (
                      <motion.div
                        className="inline-flex items-center space-x-4 text-sm text-[#B8860B]"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: locationIndex * 0.1 + 0.2 }}
                      >
                        <span>{locationStats.boatCount} {locationStats.boatCount === 1 ? 'boat' : 'boats'} available</span>
                        {locationStats.startingPrice !== null && locationStats.startingPrice > 0 && (
                          <>
                            <span>•</span>
                            <span>Starting from ${locationStats.startingPrice.toLocaleString()}</span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Location Boats Grid */}
                  {locationBoats.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {locationBoats.map((boat, boatIndex) => (
                      <motion.div
                        key={boat.id}
                        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: boatIndex * 0.1 }}
                      >
                        {boat.image && (
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                            <img
                              src={boat.image}
                              alt={boat.name}
                              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              style={{
                                objectFit: 'cover',
                                objectPosition: 'center',
                                width: '100%',
                                height: '100%'
                              }}
                            />
                            <div className="absolute top-4 left-4 bg-[#B8860B] text-white px-3 py-1 rounded-full text-sm font-medium">
                              {boat.capacity} guests
                            </div>
                            <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {boat.boatType}
                            </div>
                            {boat.itineraryCount > 0 && (
                              <div className="absolute bottom-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                {boat.itineraryCount} {boat.itineraryCount > 1 ? 'itineraries' : 'itinerary'}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-[#8B4513] mb-2">{boat.name}</h3>
                          <p className="text-2xl font-bold text-[#B8860B] mb-4">
                            {boat.priceRange ? `Price: ${boat.priceRange}` : 'Price: N/A'}
                          </p>

                          {boat.features.length > 0 && (
                            <div className="space-y-2 mb-6">
                              <h4 className="font-semibold text-gray-900">Features:</h4>
                              {boat.features.map((feature: string, fIndex: number) => (
                                <div key={fIndex} className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 text-[#B8860B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {feature}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-3">
                            <Link
                              href={`/ships/${boat.ship.id}`}
                              className="flex-1 text-center border-2 border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white py-3 rounded-md font-medium transition-colors"
                            >
                              Ship Details
                            </Link>
                            {boat.itineraryCount > 0 && (
                              <Link
                                href={`/ships/${boat.ship.id}/itineraries`}
                                className="flex-1 text-center bg-[#B8860B] hover:bg-[#DAA520] text-white py-3 rounded-md font-medium transition-colors"
                              >
                                Itineraries ({boat.itineraryCount})
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-lg text-gray-600">
                        New vessels coming soon to this destination. Contact us to learn more about upcoming availability.
                      </p>
                    </div>
                  )}

                  {/* View All Location Button */}
                  {locationBoats.length > 0 && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => setSelectedLocation(locationDisplay.name)}
                        className="inline-flex items-center px-6 py-3 border border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white rounded-md font-medium transition-colors"
                      >
                        View All {locationDisplay.title}
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Separator line between sections */}
                {locationIndex < locationDisplayInfo.length - 1 && (
                  <div className="mt-16 border-t border-gray-200"></div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CTA Section */}
      <div className="py-16 bg-[#2D5016]">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Plan Your Cruise Adventure?
          </h3>
          <p className="text-xl text-[#F5F5DC] mb-8">
            Let our experts help you choose the perfect vessel and itinerary for your South American cruise experience.
          </p>
          <Link
            href="/quote"
            className="bg-[#B8860B] text-[#F5F5DC] px-8 py-4 rounded-md text-lg font-medium hover:bg-[#DAA520] transition-colors duration-200"
          >
            Get Your Custom Quote
          </Link>
        </div>
      </div>
    </div>
  );
}