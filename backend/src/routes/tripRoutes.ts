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

const updateTripDates = async (tripId: string) => {
  const stops = await prisma.stop.findMany({ where: { trip_id: tripId } });
  if (stops.length > 0) {
    const minDate = new Date(Math.min(...stops.map((s: any) => s.start_date.getTime())));
    const maxDate = new Date(Math.max(...stops.map((s: any) => s.end_date.getTime())));
    await prisma.trip.update({
      where: { id: tripId },
      data: { start_date: minDate, end_date: maxDate }
    });
  }
};

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

        await updateTripDates(tripId);

        res.status(201).json(stop);
    } catch (error) {
        next(error);
    }
});


// Delete a Stop
router.delete('/:id/stops/:stopId', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, stopId } = req.params;
    await prisma.stop.delete({ where: { id: stopId } });
    await updateTripDates(id);
    res.json({ message: 'Stop deleted' });
  } catch (error) {
    next(error);
  }
});

// Update a Stop (Dates)
router.put('/:id/stops/:stopId', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, stopId } = req.params;
    const { start_date, end_date } = req.body;
    const stop = await prisma.stop.update({
      where: { id: stopId },
      data: {
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined,
      }
    });
    await updateTripDates(id);
    res.json(stop);
  } catch (error) {
    next(error);
  }
});

// Add an activity to a stop
router.post('/:id/stops/:stopId/activities', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, stopId } = req.params;
    const { activity_id, scheduled_date, scheduled_time, cost_override } = req.body;

    const tripActivity = await prisma.tripActivity.create({
      data: {
        stop_id: stopId,
        activity_id,
        scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
        scheduled_time: scheduled_time || null,
        cost_override,
      },
      include: { activity: true }
    });

    // Auto-gen Activities Budget Item
    if (tripActivity.activity.cost > 0 || cost_override) {
      await prisma.budgetItem.create({
         data: {
           trip_id: id,
           category: 'activities',
           amount: cost_override || tripActivity.activity.cost,
           date: scheduled_date ? new Date(scheduled_date) : new Date()
         }
      });
    }

    res.status(201).json(tripActivity);
  } catch (error) {
    next(error);
  }
});

// Update a TripActivity (Date/Time)
router.put('/:id/stops/:stopId/activities/:tripActivityId', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tripActivityId } = req.params;
    const { scheduled_date, scheduled_time } = req.body;
    const tripActivity = await prisma.tripActivity.update({
      where: { id: tripActivityId },
      data: {
        scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
        scheduled_time: scheduled_time || null,
      }
    });
    res.json(tripActivity);
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
