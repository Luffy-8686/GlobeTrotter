import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.tripActivity.deleteMany({});
  await prisma.stop.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Database...');

  // 1. Create Admin and Regular Users
  const password_hash = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.create({
    data: { name: 'Admin', first_name: 'Admin', last_name: 'User', email: 'admin@globetrotter.com', password_hash, role: 'ADMIN' }
  });
  
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Alice Smith', first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com', password_hash } }),
    prisma.user.create({ data: { name: 'Bob Jones', first_name: 'Bob', last_name: 'Jones', email: 'bob@example.com', password_hash } }),
    prisma.user.create({ data: { name: 'Charlie Brown', first_name: 'Charlie', last_name: 'Brown', email: 'charlie@example.com', password_hash } }),
    prisma.user.create({ data: { name: 'Diana Prince', first_name: 'Diana', last_name: 'Prince', email: 'diana@example.com', password_hash } })
  ]);
  
  const allUsers = [admin, ...users];

  // 2. Create Cities and Tailored Activities
  const citiesData = [
    { 
      city: { name: 'Paris', country: 'France', region: 'Europe', cost_index: 5, popularity_score: 95, image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
      activities: [
        { name: 'Eiffel Tower Summit', category: 'Sightseeing', cost: 30.0, duration_minutes: 120, description: 'Skip-the-line access to the top.', image_url: 'https://images.unsplash.com/photo-1543305113-172cebe757d5?auto=format&fit=crop&w=800&q=80' },
        { name: 'Louvre Museum Tour', category: 'Culture', cost: 20.0, duration_minutes: 180, description: 'Guided tour of the Mona Lisa and more.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
        { name: 'Seine River Cruise', category: 'Leisure', cost: 15.0, duration_minutes: 90, description: 'Evening cruise with champagne.', image_url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80' },
        { name: 'Montmartre Food Tour', category: 'Food', cost: 65.0, duration_minutes: 150, description: 'Taste cheese, wine, and pastries.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
        { name: 'Catacombs Exploration', category: 'Adventure', cost: 25.0, duration_minutes: 120, description: 'Underground bone tunnels.', image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80' }
      ]
    },
    { 
      city: { name: 'Tokyo', country: 'Japan', region: 'Asia', cost_index: 4, popularity_score: 98, image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80' },
      activities: [
        { name: 'Tsukiji Fish Market Tour', category: 'Food', cost: 45.0, duration_minutes: 180, description: 'Fresh sushi tasting.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
        { name: 'Akihabara Maid Cafe', category: 'Culture', cost: 25.0, duration_minutes: 90, description: 'Pop culture experience.', image_url: 'https://images.unsplash.com/photo-1518998053401-878c73fd5fce?auto=format&fit=crop&w=800&q=80' },
        { name: 'Mount Fuji Day Trip', category: 'Adventure', cost: 120.0, duration_minutes: 600, description: 'Hiking and hot springs.', image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80' },
        { name: 'Shibuya Crossing Photo Walk', category: 'Sightseeing', cost: 0.0, duration_minutes: 60, description: 'Experience the busiest intersection.', image_url: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=800&q=80' },
        { name: 'Shinjuku Gyoen Gardens', category: 'Leisure', cost: 5.0, duration_minutes: 120, description: 'Relaxing stroll through nature.', image_url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80' }
      ]
    },
    { 
      city: { name: 'New York City', country: 'USA', region: 'North America', cost_index: 5, popularity_score: 92, image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80' },
      activities: [
        { name: 'Statue of Liberty Cruise', category: 'Sightseeing', cost: 25.0, duration_minutes: 120, description: 'Boat ride to Ellis Island.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
        { name: 'Broadway Show', category: 'Culture', cost: 150.0, duration_minutes: 180, description: 'Premium theater tickets.', image_url: 'https://images.unsplash.com/photo-1518998053401-878c73fd5fce?auto=format&fit=crop&w=800&q=80' },
        { name: 'Central Park Bike Tour', category: 'Adventure', cost: 35.0, duration_minutes: 150, description: 'Cycle through the park.', image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80' },
        { name: 'Brooklyn Pizza Crawl', category: 'Food', cost: 55.0, duration_minutes: 180, description: 'Taste 3 iconic pizza slices.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
        { name: 'Empire State Building', category: 'Leisure', cost: 45.0, duration_minutes: 90, description: 'Sunset observation deck.', image_url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80' }
      ]
    },
    { 
      city: { name: 'Rome', country: 'Italy', region: 'Europe', cost_index: 4, popularity_score: 90, image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
      activities: [
        { name: 'Colosseum & Roman Forum', category: 'Sightseeing', cost: 30.0, duration_minutes: 180, description: 'Ancient Rome access.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
        { name: 'Pasta Making Class', category: 'Food', cost: 85.0, duration_minutes: 240, description: 'Learn to make pasta from scratch.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
        { name: 'Vatican Museums', category: 'Culture', cost: 40.0, duration_minutes: 240, description: 'Sistine Chapel tour.', image_url: 'https://images.unsplash.com/photo-1518998053401-878c73fd5fce?auto=format&fit=crop&w=800&q=80' },
        { name: 'Trastevere Evening Stroll', category: 'Leisure', cost: 0.0, duration_minutes: 120, description: 'Wander beautiful cobblestone streets.', image_url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80' },
        { name: 'Appian Way E-Bike Tour', category: 'Adventure', cost: 60.0, duration_minutes: 180, description: 'Cycle ancient ruins.', image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80' }
      ]
    },
    { 
      city: { name: 'Bangkok', country: 'Thailand', region: 'Asia', cost_index: 2, popularity_score: 88, image_url: 'https://images.unsplash.com/photo-1508009603885-247a4964259b?auto=format&fit=crop&w=800&q=80' },
      activities: [
        { name: 'Grand Palace Tour', category: 'Sightseeing', cost: 20.0, duration_minutes: 120, description: 'Explore royal temples.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
        { name: 'Street Food Tuk-Tuk Safari', category: 'Food', cost: 50.0, duration_minutes: 180, description: 'Eat like a local at night.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
        { name: 'Muay Thai Match', category: 'Culture', cost: 35.0, duration_minutes: 180, description: 'Authentic boxing experience.', image_url: 'https://images.unsplash.com/photo-1518998053401-878c73fd5fce?auto=format&fit=crop&w=800&q=80' },
        { name: 'Thai Massage Spa Day', category: 'Leisure', cost: 30.0, duration_minutes: 120, description: 'Relaxing traditional massage.', image_url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80' },
        { name: 'Floating Market Canoe Trip', category: 'Adventure', cost: 40.0, duration_minutes: 240, description: 'Paddle through Damnoen Saduak.', image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80' }
      ]
    },
    { 
      city: { name: 'Cape Town', country: 'South Africa', region: 'Africa', cost_index: 3, popularity_score: 85, image_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80' },
      activities: [
        { name: 'Table Mountain Cable Car', category: 'Sightseeing', cost: 25.0, duration_minutes: 120, description: 'Amazing views of the city.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
        { name: 'Robben Island Tour', category: 'Culture', cost: 35.0, duration_minutes: 240, description: 'Historical tour with ex-inmate guides.', image_url: 'https://images.unsplash.com/photo-1518998053401-878c73fd5fce?auto=format&fit=crop&w=800&q=80' },
        { name: 'Shark Cage Diving', category: 'Adventure', cost: 150.0, duration_minutes: 360, description: 'Get close to Great Whites.', image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80' },
        { name: 'Stellenbosch Wine Tasting', category: 'Food', cost: 70.0, duration_minutes: 300, description: 'Tour the famous winelands.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
        { name: 'Boulders Beach Penguins', category: 'Leisure', cost: 10.0, duration_minutes: 90, description: 'Watch the African penguins.', image_url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80' }
      ]
    },
    { 
      city: { name: 'Sydney', country: 'Australia', region: 'Oceania', cost_index: 5, popularity_score: 89, image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80' },
      activities: [
        { name: 'Sydney Opera House Tour', category: 'Sightseeing', cost: 30.0, duration_minutes: 60, description: 'Inside the iconic sails.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
        { name: 'Bondi to Coogee Coastal Walk', category: 'Leisure', cost: 0.0, duration_minutes: 180, description: 'Beautiful ocean views.', image_url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80' },
        { name: 'Harbour Bridge Climb', category: 'Adventure', cost: 200.0, duration_minutes: 210, description: 'Climb to the summit.', image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80' },
        { name: 'Aboriginal Cultural Tour', category: 'Culture', cost: 45.0, duration_minutes: 90, description: 'Learn indigenous history.', image_url: 'https://images.unsplash.com/photo-1518998053401-878c73fd5fce?auto=format&fit=crop&w=800&q=80' },
        { name: 'Sydney Fish Market Lunch', category: 'Food', cost: 40.0, duration_minutes: 120, description: 'Fresh seafood straight from the boats.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' }
      ]
    },
    { 
      city: { name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', cost_index: 3, popularity_score: 87, image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80' },
      activities: [
        { name: 'Christ the Redeemer', category: 'Sightseeing', cost: 20.0, duration_minutes: 180, description: 'Iconic statue via train.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
        { name: 'Copacabana Beach Day', category: 'Leisure', cost: 15.0, duration_minutes: 300, description: 'Relax with caipirinhas.', image_url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80' },
        { name: 'Favela Walking Tour', category: 'Culture', cost: 30.0, duration_minutes: 180, description: 'Insightful community tour.', image_url: 'https://images.unsplash.com/photo-1518998053401-878c73fd5fce?auto=format&fit=crop&w=800&q=80' },
        { name: 'Churrascaria Dinner', category: 'Food', cost: 60.0, duration_minutes: 150, description: 'Endless Brazilian BBQ.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
        { name: 'Tijuca Forest Jeep Safari', category: 'Adventure', cost: 55.0, duration_minutes: 240, description: 'Explore the urban rainforest.', image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80' }
      ]
    }
  ];

  const createdCities = [];
  for (const c of citiesData) {
    const city = await prisma.city.create({ data: c.city });
    createdCities.push(city);
    
    // Create Tailored Activities for each city
    for (const a of c.activities) {
      await prisma.activity.create({ data: { ...a, city_id: city.id } });
    }
  }

  const allActivities = await prisma.activity.findMany();

  // 3. Create simulated Trips
  console.log('Generating rich trip data...');
  const currentYear = new Date().getFullYear();
  
  for (const user of allUsers) {
    // Each user gets 2-4 trips
    const numTrips = Math.floor(Math.random() * 3) + 2; 
    
    for (let i = 0; i < numTrips; i++) {
      // Random month for seasonality
      const month = Math.floor(Math.random() * 12);
      const tripStart = new Date(currentYear, month, Math.floor(Math.random() * 28) + 1);
      
      const tripDuration = [3, 5, 7, 10, 14, 21][Math.floor(Math.random() * 6)];
      const tripEnd = new Date(tripStart);
      tripEnd.setDate(tripEnd.getDate() + tripDuration);

      // Select a primary city for the trip
      const primaryCity = createdCities[Math.floor(Math.random() * createdCities.length)];

      const trip = await prisma.trip.create({
        data: {
          user_id: user.id,
          name: `${user.name.split(' ')[0]}'s Trip to ${primaryCity.name}`,
          start_date: tripStart,
          end_date: tripEnd,
          is_public: Math.random() > 0.5,
          cover_photo_url: primaryCity.image_url
        }
      });

      // Add Stops to Trip (1-3 stops)
      const numStops = Math.floor(Math.random() * 3) + 1;
      let currentStopDate = new Date(tripStart);
      
      let tripBudget = 0;

      for (let s = 0; s < numStops; s++) {
         // The first stop is always the primary city; subsequent stops can be random
         const city = s === 0 ? primaryCity : createdCities[Math.floor(Math.random() * createdCities.length)];
         const stopEnd = new Date(currentStopDate);
         stopEnd.setDate(stopEnd.getDate() + Math.floor(tripDuration/numStops));
         
         if (stopEnd > tripEnd) stopEnd.setTime(tripEnd.getTime());

         const stop = await prisma.stop.create({
           data: {
             trip_id: trip.id,
             city_id: city.id,
             start_date: currentStopDate,
             end_date: stopEnd,
             order_index: s
           }
         });

         // Add Activities to Stop
         const cityActs = allActivities.filter(a => a.city_id === city.id);
         // add 1-4 random activities
         const numActs = Math.floor(Math.random() * 4) + 1;
         
         for (let a = 0; a < numActs; a++) {
            const act = cityActs[Math.floor(Math.random() * cityActs.length)];
            
            // Random schedule time
            const scheduleDate = new Date(currentStopDate);
            scheduleDate.setHours(10 + Math.floor(Math.random() * 8));

            await prisma.tripActivity.create({
              data: {
                stop_id: stop.id,
                activity_id: act.id,
                scheduled_date: scheduleDate
              }
            });

            tripBudget += act.cost;
         }

         currentStopDate = new Date(stopEnd);
      }

      // Add base budget items (Flights, Hotel)
      const hotelCost = tripDuration * (50 + Math.random() * 200);
      const flightCost = 200 + Math.random() * 800;
      
      await prisma.budgetItem.createMany({
        data: [
          { trip_id: trip.id, category: 'stay', amount: hotelCost },
          { trip_id: trip.id, category: 'transport', amount: flightCost },
          { trip_id: trip.id, category: 'activities', amount: tripBudget }
        ]
      });
    }
  }

  console.log('Database Seeding Complete! Seeded users, admin, and trips.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
