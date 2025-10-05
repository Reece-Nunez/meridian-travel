'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getContentByKey, getSettingByKey } from '@/lib/content';
import { supabase } from '@/lib/supabase';
import { TripPackage, Ship } from '@/types/database';

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

const locations = [
  {
    name: "Galapagos",
    title: "Galapagos Discoveries",
    description: "Follow Darwin's footsteps through the enchanted islands where evolution comes alive with unique wildlife found nowhere else.",
    image: "/locations/galapagos-hero.webp",
    boatCount: 4,
    startingPrice: 3200,
    features: ["Unique wildlife", "Snorkeling", "Educational tours", "Multiple itineraries"]
  },
  {
    name: "Amazon",
    title: "Amazon Explorations",
    description: "Journey deep into the world's largest rainforest, discovering incredible biodiversity and indigenous cultures.",
    image: "/locations/amazon-hero.png",
    boatCount: 5,
    startingPrice: 2400,
    features: ["Rainforest wildlife", "Indigenous culture", "River expeditions", "Birdwatching"]
  },
  {
    name: "Antarctica",
    title: "Antarctic Expeditions",
    description: "Experience the last pristine wilderness on Earth with encounters with penguins, whales, and dramatic ice formations.",
    image: "/locations/antarctica-hero.jpg",
    boatCount: 5,
    startingPrice: 9800,
    features: ["Emperor penguins", "Massive icebergs", "Zodiac landings", "Expert guides"]
  },
  {
    name: "Chile",
    title: "Chilean Adventures",
    description: "Navigate the dramatic fjords and channels of Chilean Patagonia, discovering glaciers, wildlife, and remote landscapes.",
    image: "/locations/chile-hero.webp",
    boatCount: 6,
    startingPrice: 3800,
    features: ["Glacier viewing", "Fjord navigation", "Wildlife watching", "Hiking excursions"]
  }
];

interface ItineraryModalProps {
  boat: any;
  isOpen: boolean;
  onClose: () => void;
}

function ItineraryModal({ boat, isOpen, onClose }: ItineraryModalProps) {
  if (!isOpen || !boat) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-[#8B4513]">{boat.name} - Itineraries</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {boat.itineraries.map((itinerary: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-bold text-[#8B4513] mb-2">{itinerary.name}</h4>
                <p className="text-[#B8860B] font-semibold mb-2">{itinerary.duration}</p>
                <p className="text-2xl font-bold text-[#8B4513] mb-4">
                  From ${itinerary.price.toLocaleString()} per person
                </p>

                {/* Itinerary Description */}
                {itinerary.description && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Description:</h5>
                    <p className="text-sm text-gray-600">{itinerary.description}</p>
                  </div>
                )}

                {/* Itinerary Highlights */}
                {itinerary.highlights && itinerary.highlights.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Highlights:</h5>
                    <div className="space-y-1">
                      {itinerary.highlights.map((highlight: string, hIndex: number) => (
                        <div key={hIndex} className="flex items-start text-sm text-gray-600">
                          <svg className="w-4 h-4 text-[#B8860B] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  <h5 className="font-semibold text-gray-900">Boat Features:</h5>
                  {boat.features.map((feature: string, fIndex: number) => (
                    <div key={fIndex} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-[#B8860B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link
                  href={`/quote?packageId=${itinerary.id}&boat=${boat.name}&itinerary=${itinerary.name}&location=${boat.location}`}
                  className="block w-full bg-[#B8860B] hover:bg-[#DAA520] text-white text-center py-3 rounded-md font-medium transition-colors"
                  onClick={onClose}
                >
                  Request Quote
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Cruises() {
  const [content, setContent] = useState({
    cruisesTitle: 'Luxury South American Cruises',
    cruisesContent: 'Discover the pristine wilderness of Antarctica, the dramatic fjords of Patagonia, the unique wildlife of the Galapagos, and the incredible biodiversity of the Amazon aboard our carefully selected fleet of luxury expedition vessels.',
    companyName: 'Meridian Luxury Travel'
  });

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedBoat, setSelectedBoat] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cruisePackages, setCruisePackages] = useState<TripPackage[]>([]);
  const [processedBoats, setProcessedBoats] = useState<ProcessedBoat[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationStats, setLocationStats] = useState<{[key: string]: {boatCount: number, startingPrice: number}}>({});

  const filteredBoats = selectedLocation
    ? processedBoats.filter(boat => boat.location === selectedLocation)
    : processedBoats;

  const openItineraryModal = (boat: any) => {
    setSelectedBoat(boat);
    setIsModalOpen(true);
  };

  const closeItineraryModal = () => {
    setSelectedBoat(null);
    setIsModalOpen(false);
  };

  // Fetch cruise packages and process them into boats
  const fetchCruiseData = async () => {
    try {
      // First, fetch all active ships to get real data
      const { data: allShips, error: shipsError } = await supabase
        .from('ships')
        .select('*')
        .eq('is_active', true);

      if (shipsError) throw shipsError;

      // Calculate real location stats from ships
      const stats: {[key: string]: {boatCount: number, startingPrice: number}} = {};

      allShips?.forEach((ship: any) => {
        ship.operating_regions?.forEach((region: string) => {
          if (!stats[region]) {
            stats[region] = { boatCount: 0, startingPrice: 0 };
          }
          stats[region].boatCount++;

          // Calculate a base price for this ship/region
          // We'll update this with real prices when we have package data
          const basePrice = calculateBasePrice(7, region); // Default 7-day estimate
          if (stats[region].startingPrice === 0 || basePrice < stats[region].startingPrice) {
            stats[region].startingPrice = basePrice;
          }
        });
      });

      // Temporarily set initial stats (will be updated with real prices after packages are fetched)
      setLocationStats(stats);

      // Fetch cruise packages
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

      if (error) throw error;

      setCruisePackages(packagesWithShips || []);

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
      // Create a boat entry for each operating region
      const boatsArray: ProcessedBoat[] = [];

      allShips?.forEach((ship: any) => {
        const regions = ship.operating_regions || ['Galapagos'];

        // Get itineraries for this ship (if any)
        const shipItineraries = itinerariesByShip.get(ship.id) || [];

        // Create a boat entry for each operating region
        regions.forEach((region: string) => {
          const location = mapDestinationToLocation(region);

          // Calculate starting price for this region
          let startingPrice = 0;
          if (shipItineraries.length > 0) {
            // First, check if any itineraries have real prices set
            const realPrices = shipItineraries
              .map((itin: any) => itin.price)
              .filter((price: number) => price > 0);

            if (realPrices.length > 0) {
              // Use the lowest real price
              startingPrice = Math.min(...realPrices);
            } else {
              // Fall back to calculated price
              const durations = packagesWithShips
                ?.filter((pkg: any) => pkg.ship_id === ship.id)
                .map((pkg: any) => pkg.duration) || [];
              const minDuration = Math.min(...durations);
              startingPrice = calculateBasePrice(minDuration, location);
            }
          } else {
            // Default 7-day estimate for ships without packages
            startingPrice = calculateBasePrice(7, location);
          }

          boatsArray.push({
            id: `${ship.id}-${location}`, // Unique ID per region
            name: ship.name,
            location: location,
            capacity: ship.capacity,
            itineraryCount: shipItineraries.length,
            image: ship.images && ship.images[0] ? ship.images[0] : '/cruise-default.jpg',
            startingPrice: startingPrice,
            boatType: ship.ship_type || 'Expedition',
            features: ship.luxury_highlights?.slice(0, 3) || ship.ship_features?.slice(0, 3) || ['Professional crew', 'Naturalist guides', 'Premium amenities'],
            ship: ship,
            itineraries: shipItineraries
          });
        });
      });

      setProcessedBoats(boatsArray);

      // Update location stats with real prices from boats
      const updatedStats: {[key: string]: {boatCount: number, startingPrice: number}} = {};
      boatsArray.forEach(boat => {
        if (!updatedStats[boat.location]) {
          updatedStats[boat.location] = { boatCount: 0, startingPrice: 0 };
        }
        // Count unique ships (not per-region duplicates)
        updatedStats[boat.location].boatCount = (updatedStats[boat.location].boatCount || 0);

        // Use the lowest starting price
        if (updatedStats[boat.location].startingPrice === 0 || boat.startingPrice < updatedStats[boat.location].startingPrice) {
          updatedStats[boat.location].startingPrice = boat.startingPrice;
        }
      });

      // Count unique ships per location (not the per-region entries)
      const shipCounts: {[key: string]: Set<string>} = {};
      boatsArray.forEach(boat => {
        if (!shipCounts[boat.location]) {
          shipCounts[boat.location] = new Set();
        }
        shipCounts[boat.location].add(boat.ship.id);
      });

      Object.keys(shipCounts).forEach(location => {
        if (updatedStats[location]) {
          updatedStats[location].boatCount = shipCounts[location].size;
        }
      });

      setLocationStats(updatedStats);

    } catch (error) {
      console.error('Error fetching cruise data:', error);
      setProcessedBoats([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate base price (temporary until pricing is added to DB)
  const calculateBasePrice = (duration: number, location: string): number => {
    const basePrices: { [key: string]: number } = {
      'Antarctica': 1000,
      'Chile': 400,
      'Galapagos': 500,
      'Amazon': 350
    };

    const baseRate = basePrices[location] || 400;
    return duration * baseRate;
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
            {locations.map((location) => (
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

      {/* Location Overview Cards (when no specific location selected) */}
      {!selectedLocation && (
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
            {locations.map((location, index) => (
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
                      e.currentTarget.src = '/cruise-default.jpg';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-[#B8860B] text-white px-3 py-1 rounded-full text-sm font-medium">
                    {locationStats[location.name]?.boatCount || location.boatCount} boats available
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                    From ${(locationStats[location.name]?.startingPrice || location.startingPrice).toLocaleString()}
                  </div>
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
            ))}
          </div>
        </div>
      )}

      {/* Boat Cards - Specific Location View */}
      {selectedLocation && (
        <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#8B4513] mb-4">
              {locations.find(l => l.name === selectedLocation)?.title} Fleet
            </h2>
            <p className="text-lg text-gray-600">
              {locations.find(l => l.name === selectedLocation)?.description}
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
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={boat.image}
                    alt={boat.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/cruise-default.jpg';
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
                  <div className="absolute bottom-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    {boat.itineraryCount} itinerary{boat.itineraryCount > 1 ? 'ies' : ''}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#8B4513] mb-2">{boat.name}</h3>
                  <p className="text-2xl font-bold text-[#B8860B] mb-4">
                    From ${boat.startingPrice.toLocaleString()}
                  </p>

                  <div className="space-y-2 mb-6">
                    <h4 className="font-semibold text-gray-900">Features:</h4>
                    {boat.features.slice(0, 3).map((feature: string, fIndex: number) => (
                      <div key={fIndex} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-[#B8860B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/ships/${boat.ship.id}`}
                      className="flex-1 text-center border-2 border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white py-3 rounded-md font-medium transition-colors"
                    >
                      Ship Details
                    </Link>
                    <button
                      onClick={() => openItineraryModal(boat)}
                      className="flex-1 bg-[#B8860B] hover:bg-[#DAA520] text-white py-3 rounded-md font-medium transition-colors"
                    >
                      Itineraries ({boat.itineraryCount})
                    </button>
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
          {locations.map((location, locationIndex) => {
            const locationBoats = processedBoats.filter(boat => boat.location === location.name);

            return (
              <div key={location.name} className="mb-20">
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
                      {location.title}
                    </motion.h2>
                    <motion.p
                      className="text-lg text-gray-600 max-w-3xl mx-auto mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: locationIndex * 0.1 + 0.1 }}
                    >
                      {location.description}
                    </motion.p>
                    <motion.div
                      className="inline-flex items-center space-x-4 text-sm text-[#B8860B]"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: locationIndex * 0.1 + 0.2 }}
                    >
                      <span>{locationStats[location.name]?.boatCount || locationBoats.length} boats available</span>
                      <span>•</span>
                      <span>Starting from ${(locationStats[location.name]?.startingPrice || (locationBoats.length > 0 ? Math.min(...locationBoats.map(b => b.startingPrice)) : location.startingPrice)).toLocaleString()}</span>
                    </motion.div>
                  </div>

                  {/* Location Boats Grid */}
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
                        <div className="h-48 relative overflow-hidden">
                          <img
                            src={boat.image}
                            alt={boat.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = '/cruise-default.jpg';
                            }}
                          />
                          <div className="absolute top-4 left-4 bg-[#B8860B] text-white px-3 py-1 rounded-full text-sm font-medium">
                            {boat.capacity} guests
                          </div>
                          <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {boat.boatType}
                          </div>
                          <div className="absolute bottom-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            {boat.itineraryCount} itinerary{boat.itineraryCount > 1 ? 'ies' : ''}
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-[#8B4513] mb-2">{boat.name}</h3>
                          <p className="text-2xl font-bold text-[#B8860B] mb-4">
                            From ${boat.startingPrice.toLocaleString()}
                          </p>

                          <div className="space-y-2 mb-6">
                            <h4 className="font-semibold text-gray-900">Features:</h4>
                            {boat.features.slice(0, 3).map((feature: string, fIndex: number) => (
                              <div key={fIndex} className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 text-[#B8860B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {feature}
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-3">
                            <Link
                              href={`/ships/${boat.ship.id}`}
                              className="flex-1 text-center border-2 border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white py-3 rounded-md font-medium transition-colors"
                            >
                              Ship Details
                            </Link>
                            <button
                              onClick={() => openItineraryModal(boat)}
                              className="flex-1 bg-[#B8860B] hover:bg-[#DAA520] text-white py-3 rounded-md font-medium transition-colors"
                            >
                              Itineraries ({boat.itineraryCount})
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* View All Location Button */}
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setSelectedLocation(location.name)}
                      className="inline-flex items-center px-6 py-3 border border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white rounded-md font-medium transition-colors"
                    >
                      View All {location.title}
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Separator line between sections */}
                {locationIndex < locations.length - 1 && (
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

      {/* Itinerary Modal */}
      <ItineraryModal
        boat={selectedBoat}
        isOpen={isModalOpen}
        onClose={closeItineraryModal}
      />
    </div>
  );
}