-- Sample trip packages data
INSERT INTO trip_packages (
  title, 
  description, 
  destination, 
  duration, 
  price_usd, 
  price_eur, 
  price_gbp,
  itinerary,
  images,
  max_participants,
  difficulty_level,
  includes,
  excludes
) VALUES 
(
  'Machu Picchu Explorer',
  'Discover the ancient wonders of Machu Picchu with expert guides and luxury accommodations.',
  'Peru',
  7,
  3500.00,
  3200.00,
  2800.00,
  '[
    {"day": 1, "title": "Arrival in Cusco", "activities": ["Airport transfer", "City orientation", "Welcome dinner"], "accommodation": "Hotel Monasterio"},
    {"day": 2, "title": "Sacred Valley", "activities": ["Pisac market visit", "Ollantaytambo fortress", "Traditional lunch"], "accommodation": "Sacred Valley Lodge"},
    {"day": 3, "title": "Machu Picchu", "activities": ["Early morning train", "Guided tour of Machu Picchu", "Afternoon at leisure"], "accommodation": "Sanctuary Lodge"},
    {"day": 4, "title": "Cusco Exploration", "activities": ["Qorikancha temple", "San Pedro market", "Cooking class"], "accommodation": "Hotel Monasterio"},
    {"day": 5, "title": "Rainbow Mountain", "activities": ["Early departure", "Hike to Rainbow Mountain", "Return to Cusco"], "accommodation": "Hotel Monasterio"},
    {"day": 6, "title": "Cultural Immersion", "activities": ["Local community visit", "Textile workshop", "Farewell dinner"], "accommodation": "Hotel Monasterio"},
    {"day": 7, "title": "Departure", "activities": ["Airport transfer"], "accommodation": null}
  ]'::jsonb,
  ARRAY['/machu.jpg', '/sacred-valley.jpg'],
  12,
  'moderate',
  ARRAY['Luxury accommodation', 'All meals', 'Professional guide', 'Transportation', 'Entrance fees'],
  ARRAY['International flights', 'Travel insurance', 'Personal expenses', 'Gratuities']
),
(
  'Amazon Rainforest Adventure',
  'Immerse yourself in the worlds most biodiverse ecosystem with expert naturalist guides.',
  'Peru',
  5,
  2800.00,
  2550.00,
  2200.00,
  '[
    {"day": 1, "title": "Lima to Iquitos", "activities": ["Domestic flight", "Transfer to lodge", "Evening wildlife spotting"], "accommodation": "Amazon Lodge"},
    {"day": 2, "title": "River Exploration", "activities": ["Morning bird watching", "Canoe expedition", "Night sounds tour"], "accommodation": "Amazon Lodge"},
    {"day": 3, "title": "Indigenous Culture", "activities": ["Community visit", "Traditional crafts", "Medicinal plant walk"], "accommodation": "Amazon Lodge"},
    {"day": 4, "title": "Wildlife Photography", "activities": ["Early morning wildlife", "Photography workshop", "Sunset cruise"], "accommodation": "Amazon Lodge"},
    {"day": 5, "title": "Departure", "activities": ["Return to Iquitos", "Flight to Lima"], "accommodation": null}
  ]'::jsonb,
  ARRAY['/rainforest.jpg'],
  8,
  'easy',
  ARRAY['Eco-lodge accommodation', 'All meals', 'Expert naturalist guide', 'Canoe expeditions', 'Entrance fees'],
  ARRAY['Domestic flights', 'Travel insurance', 'Alcoholic beverages', 'Personal expenses']
),
(
  'Sacred Valley Complete',
  'Experience authentic Andean culture and visit traditional markets and villages.',
  'Peru',
  4,
  1800.00,
  1650.00,
  1400.00,
  '[
    {"day": 1, "title": "Cusco to Sacred Valley", "activities": ["Scenic drive", "Chinchero village", "Traditional weaving"], "accommodation": "Sacred Valley Resort"},
    {"day": 2, "title": "Ollantaytambo", "activities": ["Fortress exploration", "Local market", "Inca terraces"], "accommodation": "Sacred Valley Resort"},
    {"day": 3, "title": "Maras & Moray", "activities": ["Salt mines visit", "Circular terraces", "Authentic lunch"], "accommodation": "Sacred Valley Resort"},
    {"day": 4, "title": "Return to Cusco", "activities": ["Pisac market", "Return journey", "Farewell lunch"], "accommodation": null}
  ]'::jsonb,
  ARRAY['/sacred-valley.jpg'],
  15,
  'easy',
  ARRAY['Boutique accommodation', 'All meals', 'Cultural guide', 'Transportation', 'Market visits'],
  ARRAY['Cusco accommodation', 'International flights', 'Travel insurance', 'Souvenirs']
),
(
  'Patagonia Wilderness',
  'Explore the dramatic landscapes of Patagonia with luxury camping and expert guides.',
  'Argentina',
  10,
  4500.00,
  4100.00,
  3600.00,
  '[
    {"day": 1, "title": "Arrival in Buenos Aires", "activities": ["Airport transfer", "City tour", "Tango show"], "accommodation": "Luxury Hotel Buenos Aires"},
    {"day": 2, "title": "Flight to El Calafate", "activities": ["Domestic flight", "Glacier National Park", "Welcome dinner"], "accommodation": "Xelena Hotel"},
    {"day": 3, "title": "Perito Moreno Glacier", "activities": ["Glacier trek", "Ice climbing", "Boat excursion"], "accommodation": "Luxury Camping"},
    {"day": 4, "title": "El Chalten", "activities": ["Transfer to El Chalten", "Fitz Roy base trek", "Mountain views"], "accommodation": "Luxury Camping"},
    {"day": 5, "title": "Laguna de los Tres", "activities": ["Full day hike", "Scenic photography", "Star gazing"], "accommodation": "Luxury Camping"},
    {"day": 6, "title": "Gaucho Experience", "activities": ["Estancia visit", "Horseback riding", "Traditional BBQ"], "accommodation": "Estancia Lodge"},
    {"day": 7, "title": "Torres del Paine", "activities": ["Cross to Chile", "Park entrance", "Wildlife spotting"], "accommodation": "EcoCamp Patagonia"},
    {"day": 8, "title": "Base Torres Trek", "activities": ["Early morning hike", "Iconic towers view", "Celebration dinner"], "accommodation": "EcoCamp Patagonia"},
    {"day": 9, "title": "Grey Glacier", "activities": ["Catamaran excursion", "Glacier viewing", "Leisure time"], "accommodation": "EcoCamp Patagonia"},
    {"day": 10, "title": "Departure", "activities": ["Return to Punta Arenas", "Flight connections"], "accommodation": null}
  ]'::jsonb,
  ARRAY['/patagonia.jpg'],
  10,
  'challenging',
  ARRAY['Luxury accommodations', 'All meals', 'Expert guides', 'Trekking equipment', 'Park fees'],
  ARRAY['International flights', 'Travel insurance', 'Personal gear', 'Gratuities']
);

-- You can run this in your Supabase SQL editor after creating the schema