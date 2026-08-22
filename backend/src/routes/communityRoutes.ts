import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/community/posts
router.get('/posts', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, sort, category } = req.query;

    let whereClause: any = {};
    
    if (search) {
      whereClause.content = { contains: search as string, mode: 'insensitive' };
    }

    if (category) {
      // If filtering by activity category, we need to join or filter
      whereClause.activity = {
        category: category as string
      };
    }

    let orderByClause: any = { created_at: 'desc' }; // default newest
    if (sort === 'oldest') {
      orderByClause = { created_at: 'asc' };
    }

    const posts = await prisma.communityPost.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        user: { select: { name: true, first_name: true, last_name: true, profile_photo_url: true } },
        trip: { select: { id: true, name: true } },
        activity: { select: { id: true, name: true, category: true, city: { select: { name: true } } } }
      }
    });

    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// POST /api/community/posts (Requires Auth)
router.post('/posts', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { content, image_url, trip_id, activity_id } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const newPost = await prisma.communityPost.create({
      data: {
        user_id: userId,
        content,
        image_url: image_url || null,
        trip_id: trip_id || null,
        activity_id: activity_id || null
      },
      include: {
        user: { select: { name: true, first_name: true, last_name: true, profile_photo_url: true } },
        trip: { select: { id: true, name: true } },
        activity: { select: { id: true, name: true, category: true, city: { select: { name: true } } } }
      }
    });

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/community/posts/:id
router.delete('/posts/:id', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Only owner or ADMIN can delete
    if (post.user_id !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden: You do not have permission to delete this post.' });
      return;
    }

    await prisma.communityPost.delete({ where: { id } });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
