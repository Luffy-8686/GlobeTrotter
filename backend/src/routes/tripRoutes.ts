import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

const tripSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Trip name is required'),
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
    description: z.string().optional(),
    cover_photo_url: z.string().url().optional().or(z.literal('')),
  }).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "End date must be after or equal to start date",
    path: ["end_date"],
  }),
});

// Create Trip
router.post('/', authenticate, validateRequest(tripSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, start_date, end_date, description, cover_photo_url } = req.body;
    const share_slug = crypto.randomBytes(8).toString('hex');
    
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const trip = await prisma.trip.create({
      data: {
        user_id: req.user!.userId,
        name,
        start_date: startDate,
        end_date: endDate,
        description,
        cover_photo_url,
        share_slug,
        budget_items: {
          create: [
            { category: 'meals', amount: days * 25, date: startDate } // $25/day placeholder
          ]
        }
      }
    });
    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
});

// Get My Trips
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trips = await prisma.trip.findMany({
      where: { user_id: req.user!.userId },
      include: { _count: { select: { stops: true } } },
      orderBy: { start_date: 'asc' }
    });
    res.json(trips);
  } catch (error) {
    next(error);
  }
});

// Get single Trip details
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        stops: {
          include: { city: true, activities: { include: { activity: true } } },
          orderBy: { order_index: 'asc' }
        },
        budget_items: true
      }
    });
    
    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }
    
    if (trip.user_id !== req.user!.userId && !trip.is_public) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(trip);
  } catch (error) {
    next(error);
  }
});

// Public Trip by share_slug
router.get('/shared/:slug', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { share_slug: req.params.slug },
      include: {
        stops: {
          include: { city: true, activities: { include: { activity: true } } },
          orderBy: { order_index: 'asc' }
        }
      }
    });
    
    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }
    
    res.json(trip);
  } catch (error) {
    next(error);
  }
});

// Delete trip
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
        if (!trip || trip.user_id !== req.user!.userId) {
            res.status(404).json({ error: 'Trip not found or unauthorized' });
            return;
        }

        await prisma.trip.delete({ where: { id: req.params.id } });
        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        next(error);
    }
})

// Add Stop
const stopSchema = z.object({
    body: z.object({
      city_id: z.string(),
      start_date: z.string().datetime(),
      end_date: z.string().datetime(),
      order_index: z.number().int().default(0)
    })
});

router.post('/:id/stops', authenticate, validateRequest(stopSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { city_id, start_date, end_date, order_index } = req.body;
        const tripId = req.params.id;
        
        const city = await prisma.city.findUnique({ where: { id: city_id } });
        if (!city) {
          res.status(404).json({ error: 'City not found' });
          return;
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const nights = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        
        // Auto-generate budget items
        const stayCost = city.cost_index * 50 * nights;
        const transportCost = 30; // Flat transport cost transition

        const stop = await prisma.stop.create({
            data: {
                trip_id: tripId,
                city_id,
                start_date: startDate,
                end_date: endDate,
                order_index
            }
        });

        await prisma.budgetItem.createMany({
          data: [
            { trip_id: tripId, category: 'stay', amount: stayCost, date: startDate },
            { trip_id: tripId, category: 'transport', amount: transportCost, date: startDate }
          ]
        });

        res.status(201).json(stop);
    } catch (error) {
        next(error);
    }
});

// Add Activity to Stop
const activitySchema = z.object({
  body: z.object({
    activity_id: z.string()
  })
});

router.post('/:id/stops/:stopId/activities', authenticate, validateRequest(activitySchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { activity_id } = req.body;
    const { id, stopId } = req.params;

    const activity = await prisma.activity.findUnique({ where: { id: activity_id } });
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    const stop = await prisma.stop.findUnique({ where: { id: stopId } });

    const tripActivity = await prisma.tripActivity.create({
      data: {
        stop_id: stopId,
        activity_id,
        scheduled_date: stop?.start_date, // Default to stop start date
      }
    });

    // Auto-generate budget item
    if (activity.cost > 0) {
      await prisma.budgetItem.create({
        data: {
          trip_id: id,
          category: 'activities',
          amount: activity.cost,
          date: stop?.start_date
        }
      });
    }

    res.status(201).json(tripActivity);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/stops/:stopId/activities/:tripActivityId', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tripActivityId } = req.params;
    await prisma.tripActivity.delete({
      where: { id: tripActivityId }
    });
    res.json({ message: 'Activity removed from itinerary' });
  } catch (error) {
    next(error);
  }
});

// Budget CRUD
const budgetSchema = z.object({
  body: z.object({
    category: z.string(),
    amount: z.number().min(0),
    date: z.string().datetime().optional()
  })
});

router.post('/:id/budget', authenticate, validateRequest(budgetSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, amount, date } = req.body;
    const item = await prisma.budgetItem.create({
      data: {
        trip_id: req.params.id,
        category,
        amount,
        date: date ? new Date(date) : undefined
      }
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/budget/:itemId', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.budgetItem.delete({ where: { id: req.params.itemId } });
    res.json({ message: 'Budget item deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
