const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const specificActivities = {
  'Paris': [
    { name: 'Eiffel Tower Summit Tour', category: 'Sightseeing', cost: 35, duration_minutes: 120, description: 'Skip the line and go to the top.' },
    { name: 'Louvre Museum Guided Tour', category: 'Culture', cost: 45, duration_minutes: 180, description: 'See the Mona Lisa and Venus de Milo.' },
    { name: 'Seine River Dinner Cruise', category: 'Leisure', cost: 85, duration_minutes: 150, description: 'Romantic dinner on the Seine.' },
    { name: 'Montmartre Food Tasting', category: 'Food', cost: 55, duration_minutes: 120, description: 'Taste cheese, wine, and pastries.' }
  ],
  'Tokyo': [
    { name: 'Tsukiji Outer Market Food Tour', category: 'Food', cost: 60, duration_minutes: 180, description: 'Fresh sushi and street food.' },
    { name: 'Shibuya Crossing & Harajuku Tour', category: 'Sightseeing', cost: 25, duration_minutes: 150, description: 'Experience the busiest crossing in the world.' },
    { name: 'Mt. Fuji Day Trip', category: 'Adventure', cost: 120, duration_minutes: 600, description: 'Full day tour to the iconic mountain.' },
    { name: 'Traditional Tea Ceremony', category: 'Culture', cost: 40, duration_minutes: 90, description: 'Authentic matcha experience in a kimono.' }
  ],
  'New York City': [
    { name: 'Statue of Liberty & Ellis Island', category: 'Sightseeing', cost: 30, duration_minutes: 240, description: 'Ferry ride and historic tour.' },
    { name: 'Broadway Show Ticket', category: 'Leisure', cost: 150, duration_minutes: 180, description: 'Experience world-class theater.' },
    { name: 'Central Park Bike Tour', category: 'Adventure', cost: 45, duration_minutes: 120, description: 'Guided bike ride through the park.' },
    { name: 'Brooklyn Pizza Crawl', category: 'Food', cost: 55, duration_minutes: 150, description: 'Taste the best slices in NYC.' }
  ],
  'Rome': [
    { name: 'Colosseum & Roman Forum Tour', category: 'Sightseeing', cost: 50, duration_minutes: 180, description: 'Step back into ancient Rome.' },
    { name: 'Vatican Museums & Sistine Chapel', category: 'Culture', cost: 60, duration_minutes: 210, description: 'Skip the line access.' },
    { name: 'Pasta & Tiramisu Cooking Class', category: 'Food', cost: 85, duration_minutes: 180, description: 'Learn to cook like an Italian nonna.' },
    { name: 'Pantheon Night Tour', category: 'Leisure', cost: 25, duration_minutes: 90, description: 'See the architectural marvel at night.' }
  ],
  'Cape Town': [
    { name: 'Table Mountain Cable Car', category: 'Sightseeing', cost: 25, duration_minutes: 120, description: 'Incredible views of the city.' },
    { name: 'Cape of Good Hope Tour', category: 'Adventure', cost: 75, duration_minutes: 480, description: 'Full day peninsula tour.' },
    { name: 'Robben Island Museum', category: 'Culture', cost: 40, duration_minutes: 240, description: 'Historic site of Nelson Mandela prison.' },
    { name: 'Stellenbosch Wine Tasting', category: 'Food', cost: 65, duration_minutes: 300, description: 'Visit world-renowned vineyards.' }
  ]
};

async function run() {
  console.log('Deleting old activities...');
  await prisma.activity.deleteMany({});
  
  const cities = await prisma.city.findMany();
  for (const city of cities) {
    const activitiesToCreate = specificActivities[city.name] || [
      { name: 'Central ' + city.name + ' Walking Tour', category: 'Sightseeing', cost: 20, duration_minutes: 120, description: 'Explore the heart of ' + city.name },
      { name: 'Authentic ' + city.name + ' Cuisine Tasting', category: 'Food', cost: 45, duration_minutes: 150, description: 'A taste of local flavors.' },
      { name: city.name + ' History Museum', category: 'Culture', cost: 15, duration_minutes: 90, description: 'Learn about the rich history.' },
      { name: 'Sunset Views in ' + city.name, category: 'Leisure', cost: 30, duration_minutes: 120, description: 'Best spots to watch the sun go down.' }
    ];
    
    for (const act of activitiesToCreate) {
      await prisma.activity.create({
        data: {
          ...act,
          city_id: city.id,
          image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
        }
      });
    }
  }
  console.log('Activities updated!');
}

run().catch(console.error).finally(() => prisma.$disconnect());

