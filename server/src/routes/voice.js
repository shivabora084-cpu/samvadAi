import { Router } from 'express';
import multer from 'multer';
import { transcribeAudio, textToSpeech } from '../controllers/voice.js';
import { authenticate } from '../middleware/auth.js';
import { chatVoiceLimiter } from '../middleware/rateLimiter.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();

// Memory storage: Raw audio files are NEVER stored on disk
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/m4a', 'audio/x-m4a', 'audio/mp4'];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(ApiError.badRequest('Invalid audio format. Allowed: webm, wav, mp3, ogg, m4a'));
    }
  }
});

router.post('/transcribe', authenticate, chatVoiceLimiter, upload.single('audio'), transcribeAudio);
router.post('/tts', authenticate, chatVoiceLimiter, textToSpeech);

export default router;
