import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cities = await prisma.city.findMany();
  
  const badgeData = [
    { name: 'Paris Explorer', desc: 'Ate a croissant near the Eiffel Tower.', icon: '🥐', cityName: 'Paris' },
    { name: 'Tokyo Drifter', desc: 'Navigated the busy streets of Tokyo.', icon: '🗼', cityName: 'Tokyo' },
    { name: 'Big Apple Adventurer', desc: 'Took a bite out of New York City.', icon: '🍎', cityName: 'New York' },
    { name: 'Roman Emperor', desc: 'Conquered the ruins of Rome.', icon: '🏛️', cityName: 'Rome' },
    { name: 'Safari Scout', desc: 'Explored the wonders of Cape Town.', icon: '🦁', cityName: 'Cape Town' },
    { name: 'Aussie Surfer', desc: 'Caught a wave in Sydney.', icon: '🏄', cityName: 'Sydney' },
    { name: 'Carnival King', desc: 'Danced the night away in Rio de Janeiro.', icon: '💃', cityName: 'Rio de Janeiro' }
  ];

  for (const b of badgeData) {
    const city = cities.find(c => c.name === b.cityName);
    if (city) {
      await prisma.badge.upsert({
        where: { city_id: city.id },
        update: {},
        create: {
          name: b.name,
          description: b.desc,
          icon_url: b.icon,
          city_id: city.id
        }
      });
      console.log(`Created badge for ${city.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
