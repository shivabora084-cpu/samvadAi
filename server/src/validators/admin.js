import { z } from 'zod';

export const createKnowledgeSchema = z.object({
  title: z.string().trim().min(3, 'Title is required (min 3 chars)'),
  content: z.string().trim().min(10, 'Content is required (min 10 chars)'),
  category: z.string().trim().default('general'),
  tags: z.array(z.string()).default([]),
  language: z.enum(['en', 'hi', 'ta']).default('en'),
  active: z.boolean().default(true)
});

export const updateKnowledgeSchema = createKnowledgeSchema.partial();

export const updateTicketStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved'])
});
