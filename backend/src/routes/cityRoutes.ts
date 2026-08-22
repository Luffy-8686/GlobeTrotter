import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all cities with optional search
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, region, country } = req.query;
    let where: any = {};
    
    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }
    if (region) {
      where.region = String(region);
    }
    if (country) {
      where.country = String(country);
    }

    const cities = await prisma.city.findMany({
      where,
      orderBy: { popularity_score: 'desc' }
    });
    res.json(cities);
  } catch (error) {
    next(error);
  }
});

// Get single city
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const city = await prisma.city.findUnique({
      where: { id: req.params.id },
      include: { activities: true }
    });
    if (!city) {
      res.status(404).json({ error: 'City not found' });
      return;
    }
    res.json(city);
  } catch (error) {
    next(error);
  }
});

export default router;
