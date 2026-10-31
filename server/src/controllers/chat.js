import { conversationsRepo } from '../repositories/conversations.js';
import { messagesRepo } from '../repositories/messages.js';
import { orchestratorService } from '../services/orchestrator.js';
import { summarizerService } from '../services/summarizer.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const GREETINGS = {
  en: 'Hello! Welcome to City Care Hospital & Citizen Help Desk. How may I assist you today? You can speak or type in English, Hindi, or Tamil.',
  hi: 'नमस्ते! सिटी केयर अस्पताल और नागरिक सहायता केंद्र में आपका स्वागत है। मैं आज आपकी क्या सहायता कर सकता हूँ? आप बोलकर या लिखकर पूछ सकते हैं।',
  ta: 'வணக்கம்! சிட்டி கேர் மருத்துவமனை மற்றும் குடிமக்கள் உதவி மையத்திற்கு வரவேற்கிறோம். நான் உங்களுக்கு எவ்வாறு உதவ முடியும்? நீங்கள் தமிழில் பேசலாம் அல்லது தட்டச்சு செய்யலாம்.'
};

/**
 * Enforces ownership check between conversation and authenticated user / guest
 */
function assertConversationOwnership(conversation, user) {
  if (!conversation) {
    throw ApiError.notFound('Conversation not found');
  }
  if (user.role === 'admin') {
    return; // Admin has full access
  }
  if (user.isGuest) {
    if (conversation.guest_id !== user.guestId) {
      throw ApiError.forbidden('You do not have access to this conversation');
    }
  } else {
    if (conversation.user_id !== user.id) {
      throw ApiError.forbidden('You do not have access to this conversation');
    }
  }
}

export const startConversation = asyncHandler(async (req, res) => {
  const language = req.body.language || req.user?.preferred_language || 'en';
  const userId = req.user && !req.user.isGuest ? req.user.id : null;
  const guestId = req.user && req.user.isGuest ? req.user.guestId : null;

  const conversation = await conversationsRepo.create({
    userId,
    guestId,
    language
  });

  const greetingText = GREETINGS[language] || GREETINGS.en;

  // Persist initial greeting assistant message
  await messagesRepo.create({
    conversationId: conversation.id,
    role: 'assistant',
    text: greetingText,
    language,
    inputMode: 'text',
    intent: 'greeting',
    sentiment: 'positive',
    sentimentScore: 1.0,
    confidence: 1.0
  });

  res.status(201).json({
    success: true,
    conversationId: conversation.id,
    language,
    greeting: greetingText
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text, inputMode = 'text', languageHint = 'en' } = req.body;

  const conversation = await conversationsRepo.findById(id);
  assertConversationOwnership(conversation, req.user);

  if (conversation.status === 'resolved') {
    throw ApiError.badRequest('This conversation has ended. Please start a new session.');
  }

  const result = await orchestratorService.processTurn({
    conversationId: id,
    userText: text,
    inputMode,
    languageHint,
    userContext: req.user
  });

  res.status(200).json({
    success: true,
    ...result
  });
});

export const getConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const conversation = await conversationsRepo.findById(id);
  assertConversationOwnership(conversation, req.user);

  const messages = await messagesRepo.getAllForConversation(id);

  res.status(200).json({
    success: true,
    conversation,
    messages
  });
});

export const getMyConversations = asyncHandler(async (req, res) => {
  const userId = req.user && !req.user.isGuest ? req.user.id : null;
  const guestId = req.user && req.user.isGuest ? req.user.guestId : null;

  const conversations = await conversationsRepo.findByOwner(userId, guestId);

  res.status(200).json({
    success: true,
    conversations
  });
});

export const rateConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  const conversation = await conversationsRepo.findById(id);
  assertConversationOwnership(conversation, req.user);

  const updated = await conversationsRepo.update(id, { rating });

  res.status(200).json({
    success: true,
    message: 'Feedback rating saved',
    rating: updated.rating
  });
});

export const endConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const conversation = await conversationsRepo.findById(id);
  assertConversationOwnership(conversation, req.user);

  const messages = await messagesRepo.getAllForConversation(id);
  const intelligence = await summarizerService.generateConversationSummary(messages);

  const updated = await conversationsRepo.update(id, {
    status: 'resolved',
    summary: intelligence.summary,
    intents: intelligence.intents,
    resolution: intelligence.resolution,
    ended_at: new Date().toISOString()
  });

  res.status(200).json({
    success: true,
    message: 'Conversation closed successfully',
    conversation: updated
  });
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const conversation = await conversationsRepo.findById(id);
  assertConversationOwnership(conversation, req.user);

  await conversationsRepo.delete(id);

  res.status(200).json({
    success: true,
    message: 'Conversation deleted successfully'
  });
});
