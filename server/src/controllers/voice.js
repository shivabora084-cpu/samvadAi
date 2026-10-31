import { aiProvider } from '../services/ai/aiProvider.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const transcribeAudio = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No audio file uploaded');
  }

  const { languageHint = 'en' } = req.body;
  const mimeType = req.file.mimetype;

  // Buffer is in memory, sent directly to Gemini multimodal transcription
  const transcriptionResult = await aiProvider.transcribeAudio(
    req.file.buffer,
    mimeType,
    languageHint
  );

  res.status(200).json({
    success: true,
    text: transcriptionResult.text,
    language: transcriptionResult.language
  });
});

export const textToSpeech = asyncHandler(async (req, res) => {
  if (!env.TTS_PROVIDER) {
    return res.status(501).json({
      success: false,
      message: 'Server-side TTS is not enabled. Client should use browser SpeechSynthesis API.'
    });
  }

  // Placeholder for future dedicated cloud TTS provider integration
  res.status(501).json({
    success: false,
    message: `Provider '${env.TTS_PROVIDER}' is not configured on backend. Client should use Web SpeechSynthesis API.`
  });
});
