import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireAdmin);

// 1. Overview Stats
router.get('/stats/overview', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();
    const publicTrips = await prisma.trip.count({ where: { is_public: true } });
    
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const activeTripsThisMonth = await prisma.trip.count({
      where: {
        start_date: { gte: thisMonthStart }
      }
    });

    res.json({
      totalUsers,
      totalTrips,
      publicTrips,
      activeTripsThisMonth
    });
  } catch (error) {
    next(error);
  }
});

// 2. Top Cities
router.get('/trends/top-cities', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const topStops = await prisma.stop.groupBy({
      by: ['city_id'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    const cityIds = topStops.map(s => s.city_id);
    const cities = await prisma.city.findMany({ where: { id: { in: cityIds } } });

    const results = topStops.map(stop => {
      const city = cities.find(c => c.id === stop.city_id);
      return {
        id: city?.id,
        name: city?.name || 'Unknown',
        country: city?.country || 'Unknown',
        count: stop._count.id
      };
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// 3. Top Activities
router.get('/trends/top-activities', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const topActs = await prisma.tripActivity.groupBy({
      by: ['activity_id'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    const actIds = topActs.map(a => a.activity_id);
    const activities = await prisma.activity.findMany({ where: { id: { in: actIds } } });

    const results = topActs.map(ta => {
      const act = activities.find(a => a.id === ta.activity_id);
      return {
        id: act?.id,
        name: act?.name || 'Unknown',
        category: act?.category || 'Unknown',
        count: ta._count.id
      };
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// 4. Interest Categories
router.get('/trends/interest-categories', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Note: SQLite requires double quotes for exact table names.
    const results: any = await prisma.$queryRaw`
      SELECT a.category, CAST(COUNT(ta.id) AS INTEGER) as count
      FROM "TripActivity" ta
      JOIN "Activity" a ON ta.activity_id = a.id
      GROUP BY a.category
      ORDER BY count DESC
    `;
    
    // SQLite returns BigInt for COUNT which can't be JSON serialized directly without mapping.
    const formatted = results.map((r: any) => ({
      category: r.category,
      count: Number(r.count)
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// 5. Seasonality
router.get('/trends/seasonality', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trips = await prisma.trip.findMany({
      select: { start_date: true }
    });

    const monthCounts = new Array(12).fill(0);
    trips.forEach(trip => {
      if (trip.start_date) {
        const month = new Date(trip.start_date).getMonth();
        monthCounts[month]++;
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const results = months.map((m, i) => ({ month: m, count: monthCounts[i] }));
    
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// 6. Trip Duration
router.get('/trends/trip-duration', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trips = await prisma.trip.findMany({
      select: { start_date: true, end_date: true }
    });

    const buckets = {
      '1-3 Days': 0,
      '4-7 Days': 0,
      '8-14 Days': 0,
      '15+ Days': 0
    };

    trips.forEach(trip => {
      if (trip.start_date && trip.end_date) {
        const diffMs = new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime();
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        if (days <= 3) buckets['1-3 Days']++;
        else if (days <= 7) buckets['4-7 Days']++;
        else if (days <= 14) buckets['8-14 Days']++;
        else buckets['15+ Days']++;
      }
    });

    const results = Object.entries(buckets).map(([range, count]) => ({ range, count }));
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// 7. Budget Ranges
router.get('/trends/budget-ranges', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trips = await prisma.trip.findMany({
      select: {
        budget_items: { select: { amount: true } }
      }
    });

    const buckets = {
      'Budget (<$1000)': 0,
      'Mid-Range ($1000-$3000)': 0,
      'Luxury (>$3000)': 0
    };

    trips.forEach(trip => {
      const total = trip.budget_items.reduce((acc, item) => acc + item.amount, 0);
      if (total === 0) {
        // Skip trips with no budget tracking
        return;
      }
      if (total < 1000) buckets['Budget (<$1000)']++;
      else if (total <= 3000) buckets['Mid-Range ($1000-$3000)']++;
      else buckets['Luxury (>$3000)']++;
    });

    const results = Object.entries(buckets).map(([range, count]) => ({ range, count }));
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// 8. Users List
router.get('/users', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        _count: {
          select: { trips: true }
        }
      }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
