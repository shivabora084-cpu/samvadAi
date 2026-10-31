import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

let genAIInstance = null;

const getGenAI = () => {
  if (!genAIInstance) {
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.includes('dummy')) {
      logger.warn('GEMINI_API_KEY is not configured or dummy; AI calls will use fallback simulation.');
    }
    genAIInstance = new GoogleGenerativeAI(env.GEMINI_API_KEY || 'AIzaSyDummyKey');
  }
  return genAIInstance;
};

export const geminiProvider = {
  async generateJSON({ system, messages, schema }) {
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.includes('dummy')) {
      return getSimulatedResponse(messages);
    }

    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: system,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    // Format chat history for Gemini (user / model)
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();
    return JSON.parse(responseText);
  },

  async generateText({ system, prompt }) {
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.includes('dummy')) {
      return 'SamvadAI automated summary: Conversation resolved with standard guidance.';
    }

    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: system,
      generationConfig: {
        temperature: 0.2
      }
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  },

  async transcribeAudio(buffer, mime = 'audio/webm', langHint = 'en') {
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.includes('dummy')) {
      return {
        text: 'Hello, what are the OPD timings tomorrow?',
        language: langHint || 'en'
      };
    }

    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const audioPart = {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: mime
      }
    };

    const prompt = `Transcribe the spoken audio verbatim in its native script (English, Hindi, or Tamil). Language hint: ${langHint}.
Return JSON only:
{
  "text": "exact transcription",
  "language": "en" | "hi" | "ta"
}`;

    const result = await model.generateContent([prompt, audioPart]);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  }
};

/**
 * Intelligent local simulation fallback when API key is not present or offline
 */
function getSimulatedResponse(messages) {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  const userText = lastUserMsg ? lastUserMsg.text.toLowerCase() : '';

  // Language detection
  const isHindi = /[\u0900-\u097F]/.test(userText);
  const isTamil = /[\u0B80-\u0BFF]/.test(userText) || userText.includes('enna') || userText.includes('eppadi');
  const detectedLanguage = isTamil ? 'ta' : isHindi ? 'hi' : 'en';

  if (userText.includes('opd') || userText.includes('timing') || userText.includes('समय') || userText.includes('நேரம்')) {
    const replies = {
      en: 'OPD runs Monday to Saturday from 8:00 AM to 1:00 PM and 2:00 PM to 5:00 PM. Emergency is open 24/7.',
      hi: 'ओपीडी सोमवार से शनिवार सुबह 8:00 से दोपहर 1:00 और 2:00 से 5:00 बजे तक खुली है। इमरजेंसी 24 घंटे खुली है।',
      ta: 'புறநோயாளிகள் பிரிவு (OPD) திங்கள் முதல் சனி வரை காலை 8:00 முதல் மாலை 5:00 மணி வரை இயங்கும். அவசர சிகிச்சை 24 மணி நேரமும் செயல்படும்.'
    };
    return {
      detectedLanguage,
      reply: replies[detectedLanguage],
      intent: 'faq',
      sentiment: 'neutral',
      sentimentScore: 0.1,
      confidence: 0.95,
      usedSourceIds: [],
      action: { type: 'none', params: {} },
      needsMoreInfo: [],
      searchQuery: 'opd timings'
    };
  }

  if (userText.includes('appointment') || userText.includes('book') || userText.includes('मिलना') || userText.includes('பதிவு')) {
    const replies = {
      en: 'I can help book an appointment. Please provide your full name, phone number, and department.',
      hi: 'मैं अपॉइंटमेंट बुक करने में सहायता कर सकता हूँ। कृपया अपना नाम, फोन नंबर और विभाग बताएं।',
      ta: 'முன்பதிவு செய்ய நான் உதவுகிறேன். தயவுசெய்து உங்கள் பெயர், தொலைபேசி எண் மற்றும் பிரிவை தெரிவிக்கவும்.'
    };
    return {
      detectedLanguage,
      reply: replies[detectedLanguage],
      intent: 'book_appointment',
      sentiment: 'positive',
      sentimentScore: 0.5,
      confidence: 0.92,
      usedSourceIds: [],
      action: { type: 'book_appointment', params: {} },
      needsMoreInfo: ['name', 'phone', 'department', 'datetime'],
      searchQuery: 'appointment booking'
    };
  }

  if (userText.includes('ticket') || userText.includes('status') || userText.includes('शिकायत') || userText.includes('புகார்')) {
    return {
      detectedLanguage,
      reply: detectedLanguage === 'ta'
        ? 'உங்கள் புகார் எண் (Ticket Code) இருந்தால் தெரிவிக்கவும்.'
        : detectedLanguage === 'hi'
        ? 'कृपया अपना टिकट कोड बताएं ताकि मैं स्थिति जांच सकूं।'
        : 'Please provide your ticket code (e.g., SV-1001) to check the status.',
      intent: 'ticket_status',
      sentiment: 'neutral',
      sentimentScore: 0.0,
      confidence: 0.9,
      usedSourceIds: [],
      action: { type: 'none', params: {} },
      needsMoreInfo: ['ticketCode'],
      searchQuery: 'ticket status'
    };
  }

  // Default fallback
  const fallbackReplies = {
    en: 'I do not have specific hospital information on that topic. Would you like me to connect you to a human help desk executive?',
    hi: 'मेरे पास इस विषय पर विशिष्ट जानकारी उपलब्ध नहीं है। क्या आप हमारे हेल्प डेस्क से बात करना चाहेंगे?',
    ta: 'இந்த தலைப்பில் என்னிடம் தகவல் இல்லை. நீங்கள் மனித உதவி அதிகாரியை தொடர்பு கொள்ள விரும்புகிறீர்களா?'
  };

  return {
    detectedLanguage,
    reply: fallbackReplies[detectedLanguage],
    intent: 'unknown',
    sentiment: 'neutral',
    sentimentScore: 0.0,
    confidence: 0.25,
    usedSourceIds: [],
    action: { type: 'none', params: {} },
    needsMoreInfo: [],
    searchQuery: userText.slice(0, 30)
  };
}
