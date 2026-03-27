import { z } from 'zod';

export const scoreSchema = z.object({
  score: z.number().int().min(1).max(45),
  played_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export const charitySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  long_description: z.string().optional(),
  logo_url: z.string().url().optional().nullable(),
  banner_url: z.string().url().optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const drawConfigSchema = z.object({
  draw_month: z.string().regex(/^\d{4}-\d{2}-01$/, 'Must be first day of month'),
  mode: z.enum(['random', 'algorithmic']),
});

export const charityContributionSchema = z.object({
  charity_id: z.string().uuid(),
  contribution_pct: z.number().min(10).max(100),
});

export const proofUploadSchema = z.object({
  proof_image_url: z.string().url(),
});

export const verifyWinnerSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().optional(),
});
