import { Router } from 'express';
import {
  startConversation,
  sendMessage,
  getConversation,
  getMyConversations,
  rateConversation,
  endConversation,
  deleteConversation
} from '../controllers/chat.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { chatVoiceLimiter } from '../middleware/rateLimiter.js';
import { startChatSchema, sendMessageSchema, ratingSchema } from '../validators/chat.js';

const router = Router();

// All chat operations require authentication (either registered JWT or guest token)
router.use(authenticate);

router.post('/start', validate({ body: startChatSchema }), startConversation);
router.get('/mine', getMyConversations);
router.get('/:id', getConversation);
router.post('/:id/message', chatVoiceLimiter, validate({ body: sendMessageSchema }), sendMessage);
router.post('/:id/rating', validate({ body: ratingSchema }), rateConversation);
router.post('/:id/end', endConversation);
router.delete('/:id', deleteConversation);

export default router;
