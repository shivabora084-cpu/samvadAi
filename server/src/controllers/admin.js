import { knowledgeRepo } from '../repositories/knowledge.js';
import { ticketsRepo } from '../repositories/tickets.js';
import { appointmentsRepo } from '../repositories/appointments.js';
import { conversationsRepo } from '../repositories/conversations.js';
import { messagesRepo } from '../repositories/messages.js';
import { analyticsRepo } from '../repositories/analytics.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ================= KNOWLEDGE BASE =================
export const listKnowledge = asyncHandler(async (req, res) => {
  const { category, language, search, page = 1, limit = 20 } = req.query;
  const result = await knowledgeRepo.list({ category, language, search, page, limit });
  res.status(200).json({ success: true, ...result });
});

export const getKnowledgeById = asyncHandler(async (req, res) => {
  const item = await knowledgeRepo.findById(req.params.id);
  if (!item) throw ApiError.notFound('Knowledge article not found');
  res.status(200).json({ success: true, knowledge: item });
});

export const createKnowledge = asyncHandler(async (req, res) => {
  const created = await knowledgeRepo.create(req.body);
  res.status(201).json({ success: true, knowledge: created });
});

export const updateKnowledge = asyncHandler(async (req, res) => {
  const updated = await knowledgeRepo.update(req.params.id, req.body);
  if (!updated) throw ApiError.notFound('Knowledge article not found');
  res.status(200).json({ success: true, knowledge: updated });
});

export const deleteKnowledge = asyncHandler(async (req, res) => {
  const success = await knowledgeRepo.delete(req.params.id);
  if (!success) throw ApiError.notFound('Knowledge article not found');
  res.status(200).json({ success: true, message: 'Knowledge article removed' });
});

// ================= TICKETS =================
export const listTickets = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 20 } = req.query;
  const result = await ticketsRepo.list({ status, category, search, page, limit });
  res.status(200).json({ success: true, ...result });
});

export const updateTicketStatus = asyncHandler(async (req, res) => {
  const updated = await ticketsRepo.updateStatus(req.params.id, req.body.status);
  if (!updated) throw ApiError.notFound('Ticket not found');
  res.status(200).json({ success: true, ticket: updated });
});

// ================= APPOINTMENTS =================
export const listAppointments = asyncHandler(async (req, res) => {
  const { status, department, search, page = 1, limit = 20 } = req.query;
  const result = await appointmentsRepo.list({ status, department, search, page, limit });
  res.status(200).json({ success: true, ...result });
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const updated = await appointmentsRepo.cancel(req.params.id);
  if (!updated) throw ApiError.notFound('Appointment not found');
  res.status(200).json({ success: true, appointment: updated });
});

// ================= CONVERSATIONS =================
export const listConversations = asyncHandler(async (req, res) => {
  const { status, language, search, page = 1, limit = 20 } = req.query;
  const result = await conversationsRepo.list({ status, language, search, page, limit });
  res.status(200).json({ success: true, ...result });
});

export const getConversationDetail = asyncHandler(async (req, res) => {
  const conversation = await conversationsRepo.findById(req.params.id);
  if (!conversation) throw ApiError.notFound('Conversation not found');

  const messages = await messagesRepo.getAllForConversation(req.params.id);

  res.status(200).json({
    success: true,
    conversation,
    messages
  });
});

// ================= ANALYTICS =================
export const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const overview = await analyticsRepo.getOverview();
  res.status(200).json({ success: true, data: overview });
});

export const getAnalyticsTimeseries = asyncHandler(async (req, res) => {
  const timeseries = await analyticsRepo.getTimeseries();
  res.status(200).json({ success: true, data: timeseries });
});

export const getAnalyticsLanguages = asyncHandler(async (req, res) => {
  const languages = await analyticsRepo.getLanguageDistribution();
  res.status(200).json({ success: true, data: languages });
});

export const getAnalyticsIntents = asyncHandler(async (req, res) => {
  const intents = await analyticsRepo.getIntentDistribution();
  res.status(200).json({ success: true, data: intents });
});

export const getAnalyticsSentiment = asyncHandler(async (req, res) => {
  const sentiment = await analyticsRepo.getSentimentDistribution();
  res.status(200).json({ success: true, data: sentiment });
});

export const getAnalyticsTopUnanswered = asyncHandler(async (req, res) => {
  const unanswered = await analyticsRepo.getTopUnanswered();
  res.status(200).json({ success: true, data: unanswered });
});
