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
    data: { name: 'Admin', email: 'admin@globetrotter.com', password_hash, role: 'ADMIN' }
  });
  
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Alice Smith', email: 'alice@example.com', password_hash } }),
    prisma.user.create({ data: { name: 'Bob Jones', email: 'bob@example.com', password_hash } }),
    prisma.user.create({ data: { name: 'Charlie Brown', email: 'charlie@example.com', password_hash } }),
    prisma.user.create({ data: { name: 'Diana Prince', email: 'diana@example.com', password_hash } })
  ]);
  
  const allUsers = [admin, ...users];

  // 2. Create Cities
  const citiesData = [
    { name: 'Paris', country: 'France', region: 'Europe', cost_index: 5, popularity_score: 95, image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
    { name: 'Tokyo', country: 'Japan', region: 'Asia', cost_index: 4, popularity_score: 98, image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80' },
    { name: 'New York City', country: 'USA', region: 'North America', cost_index: 5, popularity_score: 92, image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80' },
    { name: 'Rome', country: 'Italy', region: 'Europe', cost_index: 4, popularity_score: 90, image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
    { name: 'Bangkok', country: 'Thailand', region: 'Asia', cost_index: 2, popularity_score: 88, image_url: 'https://images.unsplash.com/photo-1508009603885-247a4964259b?auto=format&fit=crop&w=800&q=80' },
  ];

  const createdCities = [];
  for (const c of citiesData) {
    const city = await prisma.city.create({ data: c });
    createdCities.push(city);
    
    // Create Activities for each city
    const activities = [
      { name: `City Tour of ${city.name}`, category: 'Sightseeing', cost: 25.0, duration_minutes: 120, description: 'A comprehensive guided tour.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
      { name: `Local Food Tasting`, category: 'Food', cost: 45.0, duration_minutes: 180, description: 'Taste the best local dishes.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
      { name: `Museum Entry`, category: 'Culture', cost: 15.0, duration_minutes: 90, description: 'Skip the line tickets.', image_url: 'https://images.unsplash.com/photo-1518998053401-878c73fd5fce?auto=format&fit=crop&w=800&q=80' },
      { name: `Night Cruise`, category: 'Leisure', cost: 60.0, duration_minutes: 150, description: 'Relaxing evening cruise.', image_url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80' },
      { name: `Adventure Hike`, category: 'Adventure', cost: 0.0, duration_minutes: 240, description: 'A scenic hike.', image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80' },
    ];

    for (const a of activities) {
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

      const trip = await prisma.trip.create({
        data: {
          user_id: user.id,
          name: `${user.name.split(' ')[0]}'s Trip to ${createdCities[Math.floor(Math.random() * createdCities.length)].name}`,
          start_date: tripStart,
          end_date: tripEnd,
          is_public: Math.random() > 0.5,
          cover_photo_url: createdCities[0].image_url
        }
      });

      // Add Stops to Trip (1-3 stops)
      const numStops = Math.floor(Math.random() * 3) + 1;
      let currentStopDate = new Date(tripStart);
      
      let tripBudget = 0;

      for (let s = 0; s < numStops; s++) {
         const city = createdCities[Math.floor(Math.random() * createdCities.length)];
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
