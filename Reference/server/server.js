import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve compiled React frontend from dist if built
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ---------------------------------------------------------------------------
// In-Memory Database (Pre-seeded with 20 Cities & 70+ Activities)
// ---------------------------------------------------------------------------
let cities = [
  { id: 1, name: 'Tokyo', country: 'Japan', region: 'asia', cost_index: 3, popularity_score: 95, description: 'A dazzling blend of ultramodern and traditional, from neon-lit skyscrapers to historic temples.', latitude: 35.6762, longitude: 139.6503, image_url: '/images/cities/tokyo.svg' },
  { id: 2, name: 'Bangkok', country: 'Thailand', region: 'asia', cost_index: 1, popularity_score: 88, description: 'Ornate temples, buzzing street markets, legendary street food, and a lively nightlife scene.', latitude: 13.7563, longitude: 100.5018, image_url: '/images/cities/bangkok.svg' },
  { id: 3, name: 'Mumbai', country: 'India', region: 'asia', cost_index: 1, popularity_score: 80, description: 'Bollywood glamour, colonial architecture, street food paradise, and the Gateway of India.', latitude: 19.0760, longitude: 72.8777, image_url: '/images/cities/mumbai.svg' },
  { id: 4, name: 'Paris', country: 'France', region: 'europe', cost_index: 4, popularity_score: 97, description: 'The City of Light — world-class museums, iconic landmarks, exquisite cuisine, and romantic boulevards.', latitude: 48.8566, longitude: 2.3522, image_url: '/images/cities/paris.svg' },
  { id: 5, name: 'Rome', country: 'Italy', region: 'europe', cost_index: 3, popularity_score: 92, description: 'The Eternal City — ancient ruins, Renaissance art, Vatican City, and supreme pasta and gelato.', latitude: 41.9028, longitude: 12.4964, image_url: '/images/cities/rome.svg' },
  { id: 6, name: 'Barcelona', country: 'Spain', region: 'europe', cost_index: 3, popularity_score: 90, description: "Gaudí's architectural wonderland meets Mediterranean beaches, tapas, and vibrant culture.", latitude: 41.3874, longitude: 2.1686, image_url: '/images/cities/barcelona.svg' },
  { id: 7, name: 'London', country: 'United Kingdom', region: 'europe', cost_index: 4, popularity_score: 94, description: 'Royal palaces, West End theatre, iconic double-deckers, and a reinvented world culinary scene.', latitude: 51.5074, longitude: -0.1278, image_url: '/images/cities/london.svg' },
  { id: 8, name: 'New York', country: 'United States', region: 'north_america', cost_index: 4, popularity_score: 96, description: 'Broadway, Central Park, world-class museums, incredible diversity, and endless energy.', latitude: 40.7128, longitude: -74.0060, image_url: '/images/cities/new_york.svg' },
  { id: 9, name: 'Mexico City', country: 'Mexico', region: 'north_america', cost_index: 1, popularity_score: 82, description: 'Ancient Aztec ruins meet vibrant street art, world-famous gastronomy, and colourful markets.', latitude: 19.4326, longitude: -99.1332, image_url: '/images/cities/mexico_city.svg' },
  { id: 10, name: 'Vancouver', country: 'Canada', region: 'north_america', cost_index: 3, popularity_score: 78, description: 'Stunning mountain-meets-ocean scenery, diverse food scene, and outdoor adventure paradise.', latitude: 49.2827, longitude: -123.1207, image_url: '/images/cities/vancouver.svg' },
  { id: 11, name: 'Rio de Janeiro', country: 'Brazil', region: 'south_america', cost_index: 2, popularity_score: 86, description: 'Carnival, Christ the Redeemer, Copacabana beaches, and dramatic coastal mountains.', latitude: -22.9068, longitude: -43.1729, image_url: '/images/cities/rio_de_janeiro.svg' },
  { id: 12, name: 'Buenos Aires', country: 'Argentina', region: 'south_america', cost_index: 2, popularity_score: 79, description: 'The Paris of South America — tango in San Telmo, world-class steaks, and grand architecture.', latitude: -34.6037, longitude: -58.3816, image_url: '/images/cities/buenos_aires.svg' },
  { id: 13, name: 'Cape Town', country: 'South Africa', region: 'africa', cost_index: 2, popularity_score: 84, description: 'Table Mountain, Cape Winelands, penguin colonies, and spectacular coastal biodiversity.', latitude: -33.9249, longitude: 18.4241, image_url: '/images/cities/cape_town.svg' },
  { id: 14, name: 'Marrakech', country: 'Morocco', region: 'africa', cost_index: 1, popularity_score: 81, description: 'Bustling souks, ornate riads, fragrant spice stalls, and the Atlas Mountains horizon.', latitude: 31.6295, longitude: -7.9811, image_url: '/images/cities/marrakech.svg' },
  { id: 15, name: 'Cairo', country: 'Egypt', region: 'africa', cost_index: 1, popularity_score: 85, description: 'The Pyramids of Giza, the Sphinx, the Nile, and millennia of awe-inspiring antiquities.', latitude: 30.0444, longitude: 31.2357, image_url: '/images/cities/cairo.svg' },
  { id: 16, name: 'Dubai', country: 'United Arab Emirates', region: 'middle_east', cost_index: 4, popularity_score: 91, description: 'Futuristic architecture, Burj Khalifa, luxury shopping, and thrilling desert safaris.', latitude: 25.2048, longitude: 55.2708, image_url: '/images/cities/dubai.svg' },
  { id: 17, name: 'Istanbul', country: 'Turkey', region: 'middle_east', cost_index: 2, popularity_score: 87, description: 'Where East meets West — Hagia Sophia, Grand Bazaar, and Bosphorus strait views.', latitude: 41.0082, longitude: 28.9784, image_url: '/images/cities/istanbul.svg' },
  { id: 18, name: 'Sydney', country: 'Australia', region: 'oceania', cost_index: 4, popularity_score: 89, description: 'The Opera House, Harbour Bridge, Bondi Beach, and vibrant coastal lifestyle.', latitude: -33.8688, longitude: 151.2093, image_url: '/images/cities/sydney.svg' },
  { id: 19, name: 'Bali', country: 'Indonesia', region: 'asia', cost_index: 1, popularity_score: 93, description: 'Island of the Gods — emerald rice terraces, sacred temples, surf breaks, and serene yoga.', latitude: -8.3405, longitude: 115.0920, image_url: '/images/cities/bali.svg' },
  { id: 20, name: 'Queenstown', country: 'New Zealand', region: 'oceania', cost_index: 3, popularity_score: 76, description: 'Adventure capital of the world — bungee jumping, Milford Sound, and alpine serenity.', latitude: -45.0312, longitude: 168.6626, image_url: '/images/cities/queenstown.svg' }
];

let activities = [
  // Tokyo
  { id: 1, city_id: 1, city_name: 'Tokyo', name: 'Senso-ji Temple Exploration', category: 'culture', estimated_cost: 0, duration_hours: 2.0, description: "Explore Tokyo's oldest and most iconic temple in Asakusa.", image_url: '/images/activities/culture.svg' },
  { id: 2, city_id: 1, city_name: 'Tokyo', name: 'Tsukiji Outer Market Gourmet Tour', category: 'food', estimated_cost: 3500, duration_hours: 3.0, description: 'Sample the freshest sushi, wagyu skewers, and matcha sweets.', image_url: '/images/activities/food.svg' },
  { id: 3, city_id: 1, city_name: 'Tokyo', name: 'Shibuya Crossing & Harajuku Walk', category: 'sightseeing', estimated_cost: 500, duration_hours: 3.0, description: "World's busiest crossing followed by vibrant youth fashion streets.", image_url: '/images/activities/sightseeing.svg' },
  { id: 4, city_id: 1, city_name: 'Tokyo', name: 'teamLab Borderless Digital Museum', category: 'culture', estimated_cost: 2500, duration_hours: 2.5, description: 'Immerse yourself in interactive boundaryless digital light art.', image_url: '/images/activities/culture.svg' },
  // Bangkok
  { id: 5, city_id: 2, city_name: 'Bangkok', name: 'Grand Palace & Emerald Buddha', category: 'culture', estimated_cost: 500, duration_hours: 3.0, description: 'Majestic royal palace and sacred Thai Buddhist shrine.', image_url: '/images/activities/culture.svg' },
  { id: 6, city_id: 2, city_name: 'Bangkok', name: 'Chinatown Night Street Food Trail', category: 'food', estimated_cost: 400, duration_hours: 2.5, description: 'Taste Michelin-rated pad thai, crab omelettes, and mango sticky rice.', image_url: '/images/activities/food.svg' },
  { id: 7, city_id: 2, city_name: 'Bangkok', name: 'Damnoen Saduak Floating Market Boat', category: 'sightseeing', estimated_cost: 800, duration_hours: 4.5, description: 'Navigate vibrant canal waterways with wooden boats.', image_url: '/images/activities/sightseeing.svg' },
  // Mumbai
  { id: 8, city_id: 3, city_name: 'Mumbai', name: 'Gateway of India & Colaba Walk', category: 'sightseeing', estimated_cost: 200, duration_hours: 2.5, description: 'Visit the iconic arch monument and browse eclectic street markets.', image_url: '/images/activities/sightseeing.svg' },
  { id: 9, city_id: 3, city_name: 'Mumbai', name: 'Elephanta Caves Island Excursion', category: 'culture', estimated_cost: 600, duration_hours: 5.0, description: 'Ferry across the Arabian Sea to UNESCO rock-cut Hindu cave temples.', image_url: '/images/activities/culture.svg' },
  // Paris
  { id: 10, city_id: 4, city_name: 'Paris', name: 'Eiffel Tower Summit Access', category: 'sightseeing', estimated_cost: 2600, duration_hours: 2.0, description: 'Ascend to the summit for breathtaking panoramic views of Paris.', image_url: '/images/activities/sightseeing.svg' },
  { id: 11, city_id: 4, city_name: 'Paris', name: 'Louvre Museum Masterpieces Tour', category: 'culture', estimated_cost: 1700, duration_hours: 4.0, description: 'Home to the Mona Lisa, Venus de Milo, and 35,000+ art treasures.', image_url: '/images/activities/culture.svg' },
  { id: 12, city_id: 4, city_name: 'Paris', name: 'Montmartre & Sacré-Cœur Artist Trail', category: 'culture', estimated_cost: 500, duration_hours: 2.5, description: 'Cobblestone streets, artists square, and hilltop basilica.', image_url: '/images/activities/culture.svg' },
  { id: 13, city_id: 4, city_name: 'Paris', name: 'Sunset Seine River Cruise', category: 'sightseeing', estimated_cost: 1500, duration_hours: 1.5, description: 'Glide past Notre-Dame and illuminated monuments.', image_url: '/images/activities/sightseeing.svg' },
  // Rome
  { id: 14, city_id: 5, city_name: 'Rome', name: 'Colosseum & Roman Forum VIP Tour', category: 'culture', estimated_cost: 1600, duration_hours: 3.5, description: 'Step into the gladiator arena and ancient heart of the Roman Empire.', image_url: '/images/activities/culture.svg' },
  { id: 15, city_id: 5, city_name: 'Rome', name: 'Vatican Museums & Sistine Chapel', category: 'culture', estimated_cost: 2000, duration_hours: 4.0, description: "Michelangelo's masterpiece ceiling and Raphael rooms.", image_url: '/images/activities/culture.svg' },
  { id: 16, city_id: 5, city_name: 'Rome', name: 'Trastevere Food & Wine Walking Tour', category: 'food', estimated_cost: 1200, duration_hours: 3.0, description: 'Authentic pasta carbonara, supplì, and artisanal gelato tasting.', image_url: '/images/activities/food.svg' },
  // Barcelona
  { id: 17, city_id: 6, city_name: 'Barcelona', name: 'Sagrada Família Fast-Track & Towers', category: 'sightseeing', estimated_cost: 2600, duration_hours: 2.5, description: "Gaudí's iconic basilica with forest-like interior columns.", image_url: '/images/activities/sightseeing.svg' },
  { id: 18, city_id: 6, city_name: 'Barcelona', name: 'Park Güell Mosaic Wonderland', category: 'nature', estimated_cost: 1000, duration_hours: 2.0, description: 'Playful architectural park overlooking the Mediterranean.', image_url: '/images/activities/nature.svg' },
  { id: 19, city_id: 6, city_name: 'Barcelona', name: 'La Boqueria & Gothic Quarter Tapas', category: 'food', estimated_cost: 1500, duration_hours: 3.0, description: 'Taste Iberian ham, patatas bravas, and sangria in medieval alleys.', image_url: '/images/activities/food.svg' },
  // London
  { id: 20, city_id: 7, city_name: 'London', name: 'British Museum Treasures Walk', category: 'culture', estimated_cost: 0, duration_hours: 3.5, description: 'Rosetta Stone, Egyptian mummies, and world antiquities.', image_url: '/images/activities/culture.svg' },
  { id: 21, city_id: 7, city_name: 'London', name: 'Tower of London & Crown Jewels', category: 'culture', estimated_cost: 3000, duration_hours: 3.0, description: 'Medieval fortress, royal history, and dazzling jewels.', image_url: '/images/activities/culture.svg' },
  // New York
  { id: 22, city_id: 8, city_name: 'New York', name: 'Central Park Scenic Walk & Rowboats', category: 'nature', estimated_cost: 400, duration_hours: 3.0, description: 'Bethesda Terrace, Bow Bridge, and scenic lake rowing.', image_url: '/images/activities/nature.svg' },
  { id: 23, city_id: 8, city_name: 'New York', name: 'Broadway Musical Evening Show', category: 'nightlife', estimated_cost: 8500, duration_hours: 3.0, description: 'Experience an unforgettable world-class Broadway production.', image_url: '/images/activities/nightlife.svg' },
  // Rio
  { id: 24, city_id: 11, city_name: 'Rio de Janeiro', name: 'Christ the Redeemer & Corcovado', category: 'sightseeing', estimated_cost: 1500, duration_hours: 3.0, description: 'Iconic mountaintop statue overlooking Guanabara Bay.', image_url: '/images/activities/sightseeing.svg' },
  // Cape Town
  { id: 25, city_id: 13, city_name: 'Cape Town', name: 'Table Mountain Cableway Ascent', category: 'nature', estimated_cost: 1800, duration_hours: 3.0, description: 'Rotating cable car to flat summit with sweeping ocean panoramas.', image_url: '/images/activities/nature.svg' },
  // Dubai
  { id: 26, city_id: 16, city_name: 'Dubai', name: 'Burj Khalifa Observation Deck', category: 'sightseeing', estimated_cost: 3500, duration_hours: 2.0, description: "Ascend the world's tallest building for 360-degree desert and sea views.", image_url: '/images/activities/sightseeing.svg' },
  { id: 27, city_id: 16, city_name: 'Dubai', name: 'Desert Dune Safari & Stargazing BBQ', category: 'adventure', estimated_cost: 4000, duration_hours: 6.0, description: '4x4 dune bashing, camel rides, and Arabic feast in the dunes.', image_url: '/images/activities/adventure.svg' },
  // Bali
  { id: 28, city_id: 19, city_name: 'Bali', name: 'Tegallalang Rice Terraces & Jungle Swing', category: 'nature', estimated_cost: 300, duration_hours: 3.0, description: 'Lush green stepped valleys and exhilarating jungle swings.', image_url: '/images/activities/nature.svg' },
  { id: 29, city_id: 19, city_name: 'Bali', name: 'Uluwatu Temple Sunset & Kecak Fire Dance', category: 'culture', estimated_cost: 500, duration_hours: 3.0, description: 'Dramatic cliffside temple performance against ocean sunset.', image_url: '/images/activities/culture.svg' },
  { id: 30, city_id: 19, city_name: 'Bali', name: 'Ubud Traditional Spa & Yoga Session', category: 'wellness', estimated_cost: 1200, duration_hours: 3.5, description: 'Rejuvenating Balinese flower bath and rainforest yoga.', image_url: '/images/activities/wellness.svg' },
  // Queenstown
  { id: 31, city_id: 20, city_name: 'Queenstown', name: 'Kawarau Bridge Historic Bungee Jump', category: 'adventure', estimated_cost: 10000, duration_hours: 2.0, description: "The world's original commercial bungee site over turquoise waters.", image_url: '/images/activities/adventure.svg' },
  { id: 32, city_id: 20, city_name: 'Queenstown', name: 'Milford Sound Fjord Scenic Cruise', category: 'nature', estimated_cost: 8000, duration_hours: 8.0, description: 'Dramatic waterfalls, towering peaks, and marine wildlife.', image_url: '/images/activities/nature.svg' }
];

let userProfile = {
  name: 'Alex Rivera',
  email: 'alex.rivera@globetrotter.app',
  bio: 'Passionate globetrotter, photographer, and foodie exploring cultures and hidden gems around the world.',
  travel_preferences: 'Culture, Food, Nature, Photography, Architecture',
  saved_destinations: [1, 4, 6, 19] // Tokyo, Paris, Barcelona, Bali
};

let trips = [
  {
    id: 1,
    name: 'Grand European Discovery',
    description: 'A 10-day dream journey through Paris, Rome, and Barcelona exploring world heritage, art, and culinary treasures.',
    start_date: '2026-09-10',
    end_date: '2026-09-20',
    cover_image: '/images/cities/paris.svg',
    state: 'upcoming',
    share_token: 'demo-europe-2026',
    views: 84,
    stops: [
      {
        id: 101,
        city_id: 4,
        city_name: 'Paris',
        city_country: 'France',
        arrival_date: '2026-09-10',
        departure_date: '2026-09-13',
        sequence: 10,
        notes: 'Stay at Le Marais boutique hotel. Book museum passes.',
        activities: [
          { id: 1001, activity_id: 10, activity_name: 'Eiffel Tower Summit Access', category: 'sightseeing', time_slot: 'morning', day_index: 1, duration_hours: 2.0, cost: 2600, image_url: '/images/activities/sightseeing.svg' },
          { id: 1002, activity_id: 11, activity_name: 'Louvre Museum Masterpieces Tour', category: 'culture', time_slot: 'afternoon', day_index: 1, duration_hours: 4.0, cost: 1700, image_url: '/images/activities/culture.svg' },
          { id: 1003, activity_id: 13, activity_name: 'Sunset Seine River Cruise', category: 'sightseeing', time_slot: 'evening', day_index: 2, duration_hours: 1.5, cost: 1500, image_url: '/images/activities/sightseeing.svg' },
        ]
      },
      {
        id: 102,
        city_id: 5,
        city_name: 'Rome',
        city_country: 'Italy',
        arrival_date: '2026-09-14',
        departure_date: '2026-09-17',
        sequence: 20,
        notes: 'High-speed train from Paris to Rome.',
        activities: [
          { id: 1004, activity_id: 14, activity_name: 'Colosseum & Roman Forum VIP Tour', category: 'culture', time_slot: 'morning', day_index: 4, duration_hours: 3.5, cost: 1600, image_url: '/images/activities/culture.svg' },
          { id: 1005, activity_id: 15, activity_name: 'Vatican Museums & Sistine Chapel', category: 'culture', time_slot: 'afternoon', day_index: 5, duration_hours: 4.0, cost: 2000, image_url: '/images/activities/culture.svg' },
          { id: 1006, activity_id: 16, activity_name: 'Trastevere Food & Wine Walking Tour', category: 'food', time_slot: 'evening', day_index: 5, duration_hours: 3.0, cost: 1200, image_url: '/images/activities/food.svg' },
        ]
      },
      {
        id: 103,
        city_id: 6,
        city_name: 'Barcelona',
        city_country: 'Spain',
        arrival_date: '2026-09-18',
        departure_date: '2026-09-20',
        sequence: 30,
        notes: 'Flight Rome to Barcelona. Tapas tour in Gothic Quarter.',
        activities: [
          { id: 1007, activity_id: 17, activity_name: 'Sagrada Família Fast-Track & Towers', category: 'sightseeing', time_slot: 'morning', day_index: 8, duration_hours: 2.5, cost: 2600, image_url: '/images/activities/sightseeing.svg' },
          { id: 1008, activity_id: 19, activity_name: 'La Boqueria & Gothic Quarter Tapas', category: 'food', time_slot: 'evening', day_index: 9, duration_hours: 3.0, cost: 1500, image_url: '/images/activities/food.svg' },
        ]
      }
    ],
    expenses: [
      { id: 1, name: 'Flights (Round-Trip International)', category: 'transport', amount: 48000, date: '2026-09-10' },
      { id: 2, name: 'Hotels (Paris + Rome + Barcelona)', category: 'stay', amount: 42000, date: '2026-09-10' },
      { id: 3, name: 'Dining & Specialty Tapas budget', category: 'meal', amount: 16000, date: '2026-09-12' },
    ]
  },
  {
    id: 2,
    name: 'Wonders of Asia: Tokyo & Bali',
    description: 'A 12-day contrast between the hyper-modern energy of Tokyo and the spiritual serenity of Bali.',
    start_date: '2026-11-05',
    end_date: '2026-11-17',
    cover_image: '/images/cities/tokyo.svg',
    state: 'upcoming',
    share_token: 'demo-asia-wonders',
    views: 39,
    stops: [
      {
        id: 201,
        city_id: 1,
        city_name: 'Tokyo',
        city_country: 'Japan',
        arrival_date: '2026-11-05',
        departure_date: '2026-11-11',
        sequence: 10,
        notes: 'Hotel in Shinjuku.',
        activities: [
          { id: 2001, activity_id: 1, activity_name: 'Senso-ji Temple Exploration', category: 'culture', time_slot: 'morning', day_index: 1, duration_hours: 2.0, cost: 0, image_url: '/images/activities/culture.svg' },
          { id: 2002, activity_id: 2, activity_name: 'Tsukiji Outer Market Gourmet Tour', category: 'food', time_slot: 'afternoon', day_index: 2, duration_hours: 3.0, cost: 3500, image_url: '/images/activities/food.svg' },
          { id: 2003, activity_id: 4, activity_name: 'teamLab Borderless Digital Museum', category: 'culture', time_slot: 'evening', day_index: 3, duration_hours: 2.5, cost: 2500, image_url: '/images/activities/culture.svg' }
        ]
      },
      {
        id: 202,
        city_id: 19,
        city_name: 'Bali',
        city_country: 'Indonesia',
        arrival_date: '2026-11-12',
        departure_date: '2026-11-17',
        sequence: 20,
        notes: 'Villa in Ubud + Canggu resort.',
        activities: [
          { id: 2004, activity_id: 28, activity_name: 'Tegallalang Rice Terraces & Jungle Swing', category: 'nature', time_slot: 'morning', day_index: 8, duration_hours: 3.0, cost: 300, image_url: '/images/activities/nature.svg' },
          { id: 2005, activity_id: 29, activity_name: 'Uluwatu Temple Sunset & Kecak Fire Dance', category: 'culture', time_slot: 'evening', day_index: 9, duration_hours: 3.0, cost: 500, image_url: '/images/activities/culture.svg' },
          { id: 2006, activity_id: 30, activity_name: 'Ubud Traditional Spa & Yoga Session', category: 'wellness', time_slot: 'morning', day_index: 10, duration_hours: 3.5, cost: 1200, image_url: '/images/activities/wellness.svg' }
        ]
      }
    ],
    expenses: [
      { id: 4, name: 'Flights (Tokyo + Bali)', category: 'transport', amount: 36000, date: '2026-11-05' },
      { id: 5, name: 'Hotels & Private Pool Villa', category: 'stay', amount: 28000, date: '2026-11-05' },
    ]
  }
];

// Helper to compute trip totals
function calculateTripBudget(trip) {
  let actTotal = 0;
  trip.stops.forEach(s => {
    s.stop_budget = s.activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
    s.activity_count = s.activities.length;
    actTotal += s.stop_budget;
  });
  let expTotal = (trip.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  trip.total_budget = actTotal + expTotal;
  trip.activity_cost_total = actTotal;
  trip.expense_cost_total = expTotal;
  return trip;
}

// ---------------------------------------------------------------------------
// REST API Endpoints
// ---------------------------------------------------------------------------

// 1. Cities
app.get('/api/cities', (req, res) => {
  let { q, region } = req.query;
  let result = [...cities];
  if (q) {
    q = q.toLowerCase();
    result = result.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q));
  }
  if (region) {
    result = result.filter(c => c.region === region);
  }
  result.sort((a, b) => b.popularity_score - a.popularity_score);
  res.json(result);
});

// 2. Activities
app.get('/api/activities', (req, res) => {
  let { city_id, category, q } = req.query;
  let result = [...activities];
  if (city_id) {
    result = result.filter(a => a.city_id === Number(city_id));
  }
  if (category) {
    result = result.filter(a => a.category === category);
  }
  if (q) {
    q = q.toLowerCase();
    result = result.filter(a => a.name.toLowerCase().includes(q) || (a.description && a.description.toLowerCase().includes(q)));
  }
  res.json(result);
});

// 3. Trips CRUD
app.get('/api/trips', (req, res) => {
  trips.forEach(calculateTripBudget);
  res.json(trips);
});

app.get('/api/trips/:id', (req, res) => {
  const trip = trips.find(t => t.id === Number(req.params.id));
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  calculateTripBudget(trip);
  res.json(trip);
});

app.post('/api/trips', (req, res) => {
  const { name, start_date, end_date, description, cover_image } = req.body;
  const newTrip = {
    id: Date.now(),
    name: name || 'My Next Adventure',
    start_date: start_date || new Date().toISOString().split('T')[0],
    end_date: end_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    description: description || '',
    cover_image: cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    state: 'upcoming',
    share_token: `trip-${Date.now()}`,
    views: 0,
    stops: [],
    expenses: []
  };
  trips.unshift(calculateTripBudget(newTrip));
  res.status(201).json(newTrip);
});

app.put('/api/trips/:id', (req, res) => {
  const trip = trips.find(t => t.id === Number(req.params.id));
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  Object.assign(trip, req.body);
  calculateTripBudget(trip);
  res.json(trip);
});

app.delete('/api/trips/:id', (req, res) => {
  const index = trips.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Trip not found' });
  trips.splice(index, 1);
  res.json({ success: true });
});

app.post('/api/trips/:id/clone', (req, res) => {
  const trip = trips.find(t => t.id === Number(req.params.id));
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const cloned = JSON.parse(JSON.stringify(trip));
  cloned.id = Date.now();
  cloned.name = `${cloned.name} (Copy)`;
  cloned.share_token = `trip-${Date.now()}`;
  cloned.views = 0;
  trips.unshift(cloned);
  res.status(201).json(cloned);
});

// 4. Stops Management
app.post('/api/trips/:id/stops', (req, res) => {
  const trip = trips.find(t => t.id === Number(req.params.id));
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const { city_id, arrival_date, departure_date, notes } = req.body;
  const city = cities.find(c => c.id === Number(city_id));
  if (!city) return res.status(400).json({ error: 'Invalid city' });

  const newStop = {
    id: Date.now(),
    city_id: city.id,
    city_name: city.name,
    city_country: city.country,
    arrival_date: arrival_date || trip.start_date,
    departure_date: departure_date || trip.end_date,
    sequence: (trip.stops.length + 1) * 10,
    notes: notes || '',
    activities: []
  };
  trip.stops.push(newStop);
  calculateTripBudget(trip);
  res.status(201).json(newStop);
});

app.delete('/api/stops/:id', (req, res) => {
  const stopId = Number(req.params.id);
  for (const trip of trips) {
    const idx = trip.stops.findIndex(s => s.id === stopId);
    if (idx !== -1) {
      trip.stops.splice(idx, 1);
      calculateTripBudget(trip);
      return res.json({ success: true });
    }
  }
  res.status(404).json({ error: 'Stop not found' });
});

app.post('/api/stops/reorder', (req, res) => {
  const { trip_id, stop_ids } = req.body;
  const trip = trips.find(t => t.id === Number(trip_id));
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  trip.stops.sort((a, b) => stop_ids.indexOf(a.id) - stop_ids.indexOf(b.id));
  trip.stops.forEach((s, i) => s.sequence = (i + 1) * 10);
  res.json({ success: true, stops: trip.stops });
});

// 5. Activities in Stop
app.post('/api/stops/:id/activities', (req, res) => {
  const stopId = Number(req.params.id);
  const { activity_id, time_slot, day_index, cost_override } = req.body;
  const act = activities.find(a => a.id === Number(activity_id));
  if (!act) return res.status(400).json({ error: 'Invalid activity' });

  for (const trip of trips) {
    const stop = trip.stops.find(s => s.id === stopId);
    if (stop) {
      const newSA = {
        id: Date.now(),
        activity_id: act.id,
        activity_name: act.name,
        category: act.category,
        time_slot: time_slot || 'morning',
        day_index: day_index || 1,
        duration_hours: act.duration_hours,
        cost: cost_override !== undefined ? Number(cost_override) : act.estimated_cost
      };
      stop.activities.push(newSA);
      calculateTripBudget(trip);
      return res.status(201).json(newSA);
    }
  }
  res.status(404).json({ error: 'Stop not found' });
});

app.delete('/api/stop-activities/:id', (req, res) => {
  const saId = Number(req.params.id);
  for (const trip of trips) {
    for (const stop of trip.stops) {
      const idx = stop.activities.findIndex(a => a.id === saId);
      if (idx !== -1) {
        stop.activities.splice(idx, 1);
        calculateTripBudget(trip);
        return res.json({ success: true });
      }
    }
  }
  res.status(404).json({ error: 'Activity not found' });
});

// 6. Expenses
app.post('/api/trips/:id/expenses', (req, res) => {
  const trip = trips.find(t => t.id === Number(req.params.id));
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const { name, category, amount, date } = req.body;
  const newExp = {
    id: Date.now(),
    name: name || 'Expense',
    category: category || 'other',
    amount: Number(amount) || 0,
    date: date || trip.start_date
  };
  trip.expenses.push(newExp);
  calculateTripBudget(trip);
  res.status(201).json(newExp);
});

app.delete('/api/expenses/:id', (req, res) => {
  const expId = Number(req.params.id);
  for (const trip of trips) {
    const idx = trip.expenses.findIndex(e => e.id === expId);
    if (idx !== -1) {
      trip.expenses.splice(idx, 1);
      calculateTripBudget(trip);
      return res.json({ success: true });
    }
  }
  res.status(404).json({ error: 'Expense not found' });
});

// 7. Budget Analytics
app.get('/api/trips/:id/budget', (req, res) => {
  const trip = trips.find(t => t.id === Number(req.params.id));
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  calculateTripBudget(trip);

  const category_breakdown = {
    activity: trip.activity_cost_total,
    transport: 0,
    stay: 0,
    meal: 0,
    other: 0
  };
  (trip.expenses || []).forEach(e => {
    category_breakdown[e.category] = (category_breakdown[e.category] || 0) + e.amount;
  });

  const daily_breakdown = {};
  trip.stops.forEach(s => {
    s.activities.forEach(a => {
      const dKey = `Day ${a.day_index || 1}`;
      daily_breakdown[dKey] = (daily_breakdown[dKey] || 0) + a.cost;
    });
  });

  res.json({
    total: trip.total_budget,
    activity_total: trip.activity_cost_total,
    expense_total: trip.expense_cost_total,
    category_breakdown,
    daily_breakdown
  });
});

// 8. Public Share
app.get('/api/share/:token', (req, res) => {
  const trip = trips.find(t => t.share_token === req.params.token);
  if (!trip) return res.status(404).json({ error: 'Trip link expired or invalid' });
  trip.views = (trip.views || 0) + 1;
  calculateTripBudget(trip);
  res.json(trip);
});

// 9. Community Trips
app.get('/api/community', (req, res) => {
  trips.forEach(calculateTripBudget);
  res.json(trips);
});

// 10. User Profile
app.get('/api/profile', (req, res) => {
  res.json(userProfile);
});

app.put('/api/profile', (req, res) => {
  Object.assign(userProfile, req.body);
  res.json(userProfile);
});

// 11. Admin Analytics
app.get('/api/analytics', (req, res) => {
  const totalTrips = trips.length;
  const totalStops = trips.reduce((sum, t) => sum + t.stops.length, 0);
  const totalActivitiesAssigned = trips.reduce((sum, t) => sum + t.stops.reduce((s2, st) => s2 + st.activities.length, 0), 0);
  const totalSharesViews = trips.reduce((sum, t) => sum + (t.views || 0), 0);

  const cityStopCounts = {};
  trips.forEach(t => t.stops.forEach(s => {
    cityStopCounts[s.city_name] = (cityStopCounts[s.city_name] || 0) + 1;
  }));

  res.json({
    totalTrips,
    totalCities: cities.length,
    totalActivities: activities.length,
    totalStops,
    totalActivitiesAssigned,
    totalSharesViews,
    topDestinations: Object.entries(cityStopCounts).map(([name, count]) => ({ name, count }))
  });
});

// Wildcard SPA Fallback
app.get('*', (req, res) => {
  if (fs.existsSync(distPath)) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.json({ message: 'GlobeTrotter API is running. Run `npm run dev` to start the frontend.' });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🚀 GlobeTrotter Node.js Fullstack Server running on http://localhost:${PORT}`);
  console.log(`====================================================`);
});
