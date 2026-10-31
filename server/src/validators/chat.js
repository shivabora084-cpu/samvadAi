import { z } from 'zod';

export const startChatSchema = z.object({
  language: z.enum(['en', 'hi', 'ta']).optional().default('en')
});

export const sendMessageSchema = z.object({
  text: z.string().trim().min(1, 'Message text cannot be empty').max(1000, 'Message cannot exceed 1000 characters'),
  inputMode: z.enum(['voice', 'text']).default('text'),
  languageHint: z.string().optional().default('en')
});

export const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5)
});
