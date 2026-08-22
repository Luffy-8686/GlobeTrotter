const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imageMap = {
  'Eiffel': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
  'Louvre': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
  'Seine': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  'Montmartre': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  
  'Tsukiji': 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
  'Shibuya': 'https://images.unsplash.com/photo-1542051812-ba3200ce4373?auto=format&fit=crop&w=800&q=80',
  'Fuji': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
  'Tea Ceremony': 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80',
  
  'Statue of Liberty': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
  'Broadway': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  'Central Park': 'https://images.unsplash.com/photo-1522083111812-706b83f0f745?auto=format&fit=crop&w=800&q=80',
  'Brooklyn': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',

  'Colosseum': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
  'Vatican': 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80',
  'Pasta': 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80',
  'Pantheon': 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?auto=format&fit=crop&w=800&q=80',

  'Table Mountain': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80',
  'Cape of Good Hope': 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
  'Robben Island': 'https://images.unsplash.com/photo-1518998053401-878c73fd5fce?auto=format&fit=crop&w=800&q=80',
  'Stellenbosch': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80',
};

const categoryMap = {
  'Sightseeing': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
  'Food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  'Culture': 'https://images.unsplash.com/photo-1518998053401-878c73fd5fce?auto=format&fit=crop&w=800&q=80',
  'Leisure': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80',
  'Adventure': 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80'
};

async function run() {
  const activities = await prisma.activity.findMany({ include: { city: true } });
  
  for (const act of activities) {
    let imageUrl = categoryMap[act.category]; // fallback to category
    
    // Look for exact keyword matches
    for (const [key, url] of Object.entries(imageMap)) {
      if (act.name.includes(key)) {
        imageUrl = url;
        break;
      }
    }
    
    // If it's a generic city tour, use the city's image
    if (act.name.includes(act.city.name) && (act.category === 'Sightseeing' || act.category === 'Culture')) {
      imageUrl = act.city.image_url;
    }
    
    await prisma.activity.update({
      where: { id: act.id },
      data: { image_url: imageUrl }
    });
  }
  
  console.log('Activity images updated successfully!');
}

run().catch(console.error).finally(() => prisma.$disconnect());

