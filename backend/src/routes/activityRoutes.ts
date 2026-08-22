import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get activities by city_id
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { city_id, category, max_cost } = req.query;
    let where: any = {};
    
    if (city_id) {
      where.city_id = String(city_id);
    }
    if (category) {
      where.category = String(category);
    }
    if (max_cost) {
      where.cost = { lte: parseFloat(String(max_cost)) };
    }

    const activities = await prisma.activity.findMany({
      where,
    });
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

export default router;
