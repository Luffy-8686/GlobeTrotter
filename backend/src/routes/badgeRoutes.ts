import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all badges, and indicate which ones the current user has earned
router.get('/', authenticate, async (req: any, res: any, next: any) => {
  try {
    const allBadges = await prisma.badge.findMany();
    const userBadges = await prisma.userBadge.findMany({
      where: { user_id: req.user.userId }
    });
    
    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
    
    const badgesWithStatus = allBadges.map(b => {
       const ub = userBadges.find(x => x.badge_id === b.id);
       return {
         ...b,
         earned: earnedBadgeIds.has(b.id),
         earned_at: ub ? ub.earned_at : null
       };
    });
    
    res.json(badgesWithStatus);
  } catch(e) {
    next(e);
  }
});

export default router;
