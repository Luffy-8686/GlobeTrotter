import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const signupSchema = z.object({
  body: z.object({
    name: z.string().optional(), // Fallback
    first_name: z.string().min(2, 'First name must be at least 2 characters').optional(),
    last_name: z.string().min(2, 'Last name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    additional_info: z.string().optional(),
    profile_photo_url: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

router.post('/signup', authLimiter, validateRequest(signupSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, first_name, last_name, email, password, phone, city, country, additional_info, profile_photo_url } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    // Use first_name + last_name for legacy name if not provided directly
    const computedName = name || `${first_name || ''} ${last_name || ''}`.trim() || email.split('@')[0];

    const user = await prisma.user.create({
      data: { 
        name: computedName, 
        first_name, 
        last_name, 
        email, 
        password_hash,
        phone,
        city,
        country,
        additional_info,
        profile_photo_url
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email, 
        role: user.role,
        profile_photo_url: user.profile_photo_url
      } 
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, validateRequest(loginSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email, 
        role: user.role, 
        profile_photo_url: user.profile_photo_url 
      } 
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true, profile_photo_url: true, language_preference: true, created_at: true }
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    language_preference: z.string().optional(),
    profile_photo_url: z.string().url().optional().or(z.literal(''))
  }),
});

router.put('/me', authenticate, validateRequest(updateProfileSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, language_preference, profile_photo_url } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { 
        ...(name && { name }),
        ...(language_preference && { language_preference }),
        ...(profile_photo_url !== undefined && { profile_photo_url: profile_photo_url || null }),
      },
      select: { id: true, name: true, email: true, role: true, profile_photo_url: true, language_preference: true }
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
