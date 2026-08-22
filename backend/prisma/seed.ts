import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 1. Create Cities
  const citiesData = [
    { name: 'Paris', country: 'France', region: 'Europe', cost_index: 5, popularity_score: 95, image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
    { name: 'Tokyo', country: 'Japan', region: 'Asia', cost_index: 4, popularity_score: 98, image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80' },
    { name: 'New York City', country: 'USA', region: 'North America', cost_index: 5, popularity_score: 92, image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80' },
    { name: 'Rome', country: 'Italy', region: 'Europe', cost_index: 4, popularity_score: 90, image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
    { name: 'Bangkok', country: 'Thailand', region: 'Asia', cost_index: 2, popularity_score: 88, image_url: 'https://images.unsplash.com/photo-1508009603885-247a4964259b?auto=format&fit=crop&w=800&q=80' },
    { name: 'London', country: 'UK', region: 'Europe', cost_index: 5, popularity_score: 93, image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' },
    { name: 'Dubai', country: 'UAE', region: 'Middle East', cost_index: 5, popularity_score: 85, image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },
    { name: 'Singapore', country: 'Singapore', region: 'Asia', cost_index: 5, popularity_score: 89, image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80' },
    { name: 'Barcelona', country: 'Spain', region: 'Europe', cost_index: 3, popularity_score: 87, image_url: 'https://images.unsplash.com/photo-1583422409516-1500d05a415a?auto=format&fit=crop&w=800&q=80' },
    { name: 'Istanbul', country: 'Turkey', region: 'Europe/Asia', cost_index: 2, popularity_score: 86, image_url: 'https://images.unsplash.com/photo-1522083111812-706b83f0f745?auto=format&fit=crop&w=800&q=80' },
    { name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', cost_index: 3, popularity_score: 82, image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80' },
    { name: 'Cape Town', country: 'South Africa', region: 'Africa', cost_index: 2, popularity_score: 80, image_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80' },
    { name: 'Sydney', country: 'Australia', region: 'Oceania', cost_index: 4, popularity_score: 84, image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80' },
    { name: 'Kyoto', country: 'Japan', region: 'Asia', cost_index: 4, popularity_score: 91, image_url: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=800&q=80' },
    { name: 'Amsterdam', country: 'Netherlands', region: 'Europe', cost_index: 4, popularity_score: 86, image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80' },
    { name: 'Seoul', country: 'South Korea', region: 'Asia', cost_index: 3, popularity_score: 88, image_url: 'https://images.unsplash.com/photo-1538681105587-85640961bf8b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Los Angeles', country: 'USA', region: 'North America', cost_index: 5, popularity_score: 83, image_url: 'https://images.unsplash.com/photo-1515896769750-31548ea180d1?auto=format&fit=crop&w=800&q=80' },
    { name: 'Buenos Aires', country: 'Argentina', region: 'South America', cost_index: 2, popularity_score: 79, image_url: 'https://images.unsplash.com/photo-1614088924639-652a92612cf7?auto=format&fit=crop&w=800&q=80' },
    { name: 'Marrakech', country: 'Morocco', region: 'Africa', cost_index: 2, popularity_score: 77, image_url: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80' },
    { name: 'Prague', country: 'Czech Republic', region: 'Europe', cost_index: 2, popularity_score: 85, image_url: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=800&q=80' },
  ];

  for (const c of citiesData) {
    const city = await prisma.city.create({ data: c });
    
    // 2. Create Activities for each city
    const activities = [
      { name: `City Tour of ${city.name}`, category: 'Sightseeing', cost: 25.0, duration_minutes: 120, description: 'A comprehensive guided tour of the city center.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
      { name: `Local Food Tasting in ${city.name}`, category: 'Food', cost: 45.0, duration_minutes: 180, description: 'Taste the best local dishes.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
      { name: `Museum Entry`, category: 'Culture', cost: 15.0, duration_minutes: 90, description: 'Skip the line tickets to the most popular museum.', image_url: 'https://images.unsplash.com/photo-1518998053401-878c73fd5fce?auto=format&fit=crop&w=800&q=80' },
      { name: `Night Cruise`, category: 'Leisure', cost: 60.0, duration_minutes: 150, description: 'Relaxing evening cruise with dinner.', image_url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80' },
      { name: `Adventure Hike nearby`, category: 'Adventure', cost: 0.0, duration_minutes: 240, description: 'A scenic hike just outside the city.', image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80' },
    ];

    for (const a of activities) {
      await prisma.activity.create({
        data: {
          ...a,
          city_id: city.id,
        },
      });
    }
  }

  console.log('Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
