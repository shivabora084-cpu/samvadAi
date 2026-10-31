import { Router } from 'express';
import {
  listKnowledge,
  getKnowledgeById,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  listTickets,
  updateTicketStatus,
  listAppointments,
  cancelAppointment,
  listConversations,
  getConversationDetail,
  getAnalyticsOverview,
  getAnalyticsTimeseries,
  getAnalyticsLanguages,
  getAnalyticsIntents,
  getAnalyticsSentiment,
  getAnalyticsTopUnanswered
} from '../controllers/admin.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { createKnowledgeSchema, updateKnowledgeSchema, updateTicketStatusSchema } from '../validators/admin.js';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Knowledge management
router.get('/knowledge', listKnowledge);
router.post('/knowledge', validate({ body: createKnowledgeSchema }), createKnowledge);
router.get('/knowledge/:id', getKnowledgeById);
router.put('/knowledge/:id', validate({ body: updateKnowledgeSchema }), updateKnowledge);
router.delete('/knowledge/:id', deleteKnowledge);

// Tickets management
router.get('/tickets', listTickets);
router.patch('/tickets/:id/status', validate({ body: updateTicketStatusSchema }), updateTicketStatus);

// Appointments management
router.get('/appointments', listAppointments);
router.patch('/appointments/:id/cancel', cancelAppointment);

// Conversations management
router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversationDetail);

// Analytics intelligence
router.get('/analytics/overview', getAnalyticsOverview);
router.get('/analytics/timeseries', getAnalyticsTimeseries);
router.get('/analytics/languages', getAnalyticsLanguages);
router.get('/analytics/intents', getAnalyticsIntents);
router.get('/analytics/sentiment', getAnalyticsSentiment);
router.get('/analytics/top-unanswered', getAnalyticsTopUnanswered);

export default router;
