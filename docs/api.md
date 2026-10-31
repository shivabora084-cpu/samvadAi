# SamvadAI API Reference

Base URL (Local): `http://localhost:5000/api`
Base URL (Production): `https://<your-render-service>.onrender.com/api`

All protected endpoints require the HTTP Authorization header:
```http
Authorization: Bearer <jwt-token>
```

---

## 1. System Health

### `GET /api/health`
Checks database connectivity and AI service readiness.
- **Auth:** None
- **Response 200 OK:**
```json
{
  "status": "ok",
  "db": "up",
  "timestamp": "2026-10-31T06:00:00.000Z",
  "provider": "gemini"
}
```

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a new customer user account.
- **Body:**
```json
{
  "name": "Priya Patel",
  "email": "priya@example.com",
  "password": "Password123!",
  "preferredLanguage": "hi"
}
```
- **Response 201 Created:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "787c8cb1-807c-473d-82d2-5a210ff24b81",
    "name": "Priya Patel",
    "email": "priya@example.com",
    "role": "customer",
    "preferred_language": "hi"
  }
}
```

### `POST /api/auth/login`
Authenticates a registered customer or administrator.
- **Body:**
```json
{
  "email": "admin@samvadai.com",
  "password": "Admin@Samvad2025!"
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "e67b2cb1-807c-473d-82d2-5a210ff24a02",
    "name": "Dr. Ramesh Sharma (Admin)",
    "email": "admin@samvadai.com",
    "role": "admin",
    "preferred_language": "en"
  }
}
```

### `POST /api/auth/guest`
Generates a short-lived guest session JWT for instant voice usage without login.
- **Body:**
```json
{
  "preferredLanguage": "ta"
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Guest session created",
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "isGuest": true,
    "guestId": "guest_a4968d06-dbe0-449b-9a84-0a68840212a4",
    "role": "guest",
    "preferred_language": "ta"
  }
}
```

### `GET /api/auth/me`
Fetches current authenticated profile (User or Guest).
- **Auth:** Bearer Token

---

## 3. Conversational AI (`/api/chat`)

### `POST /api/chat/start`
Initializes a new multi-turn conversation session with a localized greeting.
- **Auth:** Bearer Token (User or Guest)
- **Body (optional):**
```json
{
  "language": "hi"
}
```
- **Response 201 Created:**
```json
{
  "success": true,
  "conversationId": "3bf782c5-10ac-4158-b12a-3507119ff311",
  "language": "hi",
  "greeting": "नमस्ते! सिटी केयर अस्पताल और नागरिक सहायता केंद्र में आपका स्वागत है। मैं आज आपकी क्या सहायता कर सकता हूँ?"
}
```

### `POST /api/chat/:id/message`
Processes a user spoken or typed turn through the dialogue orchestrator.
- **Auth:** Bearer Token (Owner verified)
- **Body:**
```json
{
  "text": "What time does the OPD open tomorrow?",
  "inputMode": "voice",
  "languageHint": "en"
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "messageId": "23d8c11e-2895-4679-b883-9b4e724018e6",
  "reply": "OPD operates Monday to Saturday from 8:00 AM to 1:00 PM and 2:00 PM to 5:00 PM. Emergency care is open 24/7.",
  "language": "en",
  "intent": "faq",
  "sentiment": "neutral",
  "sentimentScore": 0.1,
  "confidence": 0.98,
  "action": null,
  "needsMoreInfo": [],
  "escalated": false,
  "sources": [
    {
      "id": "18cf3ea2-7f28-4e56-91e0-6316efd64522",
      "title": "OPD Timings and Registration",
      "category": "timings"
    }
  ],
  "latencyMs": 840
}
```

### `GET /api/chat/:id`
Retrieves conversation details and full message transcript.
- **Auth:** Bearer Token (Owner verified or Admin)

### `GET /api/chat/mine`
Retrieves conversation history belonging to current user or guest session.

### `POST /api/chat/:id/rating`
Submits a 1-5 star user feedback rating.
- **Body:** `{ "rating": 5 }`

### `POST /api/chat/:id/end`
Closes active conversation and triggers automated summarization.

---

## 4. Voice Processing (`/api/voice`)

### `POST /api/voice/transcribe`
Fallback speech-to-text service via multimodal audio input.
- **Auth:** Bearer Token
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `audio`: binary audio file (webm, wav, mp3, ogg, m4a, max 10MB)
  - `languageHint`: (optional: `en`, `hi`, `ta`)
- **Response 200 OK:**
```json
{
  "success": true,
  "text": "मुझे डॉक्टर से मिलना है",
  "language": "hi"
}
```

---

## 5. Admin Endpoints (`/api/admin` or `/api`)

All endpoints in this section require an `admin` role JWT token.

### Knowledge Management
- `GET /api/knowledge`: List articles (filters: `category`, `language`, `search`, `page`, `limit`)
- `POST /api/knowledge`: Create article `{ title, content, category, tags, language, active }`
- `GET /api/knowledge/:id`: Get article details
- `PUT /api/knowledge/:id`: Update article
- `DELETE /api/knowledge/:id`: Delete article

### Support Tickets
- `GET /api/tickets`: List tickets (filters: `status`, `category`, `search`)
- `PATCH /api/tickets/:id/status`: Update status `{ "status": "open" | "in_progress" | "resolved" }`

### Outpatient Appointments
- `GET /api/appointments`: List appointments (filters: `status`, `department`, `search`)
- `PATCH /api/appointments/:id/cancel`: Cancel an appointment

### Conversations
- `GET /api/conversations`: Filterable paginated session logs
- `GET /api/conversations/:id`: Full session transcript with escalation summaries

### Intelligence & Analytics
- `GET /api/analytics/overview`: High-level metrics (totals, resolution %, escalation %, avg latency)
- `GET /api/analytics/timeseries`: 14-day volume time series
- `GET /api/analytics/languages`: Regional language breakdown
- `GET /api/analytics/intents`: Top requested intent distribution
- `GET /api/analytics/sentiment`: Turn-by-turn sentiment classification
- `GET /api/analytics/top-unanswered`: Unanswered/low-confidence queries for knowledge gap closure
