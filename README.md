# SamvadAI — Voice & Conversational Intelligence Platform
**Voice-first, multilingual conversational assistant and agent intelligence dashboard for healthcare and public services.**

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6-purple.svg)](https://vitejs.dev/)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-emerald.svg)](https://supabase.com/)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://aistudio.google.com/)

---

## 1. Problem Statement
Small hospitals, clinics, local government help desks, and service businesses in multilingual regions like India receive large volumes of repetitive calls and chats in several languages (Tamil, Hindi, English, and code-mixed speech like "Tanglish"). Human agents are overloaded, wait times are long, answers are inconsistent between agents, after-hours queries go unanswered, and people who are less literate or less comfortable typing are effectively excluded because most tools are text-only and English-only.

## 2. Solution Overview
SamvadAI is a voice-first, multilingual conversational assistant plus an agent intelligence dashboard. A customer speaks or types in their own language (English, हिन्दी, தமிழ், or code-mixed Tanglish); the system transcribes, understands intent and sentiment, answers strictly from the organization's verified knowledge base, performs actions (book appointments, create support tickets, check live status), replies in the user's language by voice (TTS) and text, and escalates to a human agent with an automated 3-line handoff summary when needed. Healthcare and civic administrators receive real-time analytics on citizen demand, sentiment trends, and language distributions.

---

## 3. Key Features

1. **Voice Conversation:** Push-to-talk and continuous hands-free dialogue; real-time interim speech ghost bubbles; regional spoken voice replies with barge-in interruption.
2. **Multilingual & Code-Mixed:** Native support for English, Hindi (हिन्दी), Tamil (தமிழ்), and code-mixed speech (e.g. Tanglish). Auto language detection per message.
3. **Zero-Hallucination Grounding (RAG):** Answers exclusively from admin-managed FAQ/policy entries via PostgreSQL full-text search with trigram fuzzy fallback. Never invents policies or prices.
4. **Autonomous Structured Tool Calls:**
   - `book_appointment`: Multi-turn voice collection of patient name, phone, department, and slot.
   - `create_ticket`: Generates support tickets with human-friendly codes (e.g., `SV-1042`).
   - `get_ticket_status`: Live status tracking by ticket code.
   - `escalate_to_human`: Routes to human duty officers with a 3-line AI summary.
5. **Real-Time Sentiment & Intent Detection:** Turn-by-turn intent chips (`#timings`, `#appointments`, `#insurance`) and sentiment scoring (`positive`, `neutral`, `negative`).
6. **Smart Escalation Engine:** Triggers on repeated low confidence (<0.35), 3 consecutive negative sentiments, or explicit requests.
7. **Post-Conversation Intelligence:** Automatically synthesizes session summaries, intent tags, resolution state, and average satisfaction scores.
8. **Admin Intelligence Dashboard:** Interactive time series volume charts, language donuts, sentiment breakdowns, top intents bar charts, and a "Knowledge Gap Radar" (top unanswered questions -> 1-click add to knowledge base).
9. **Accessibility First:** High-contrast calm teal/indigo palette, large accessible mic button, spacebar keybinding, screen-reader live regions, and text fallback for microphone denial.
10. **Enterprise Security & Privacy:** Row Level Security (RLS) enabled on all tables; zero client-side database or AI keys; masked phone numbers in admin views; raw voice audio is never stored on disk.

---

## 4. Architecture & Technical Design

### High-Level Flow
```mermaid
sequenceDiagram
    autonumber
    actor User as Citizen / Patient
    participant Client as React Client (Vercel)
    participant API as Express API (Render)
    participant DB as Supabase PostgreSQL
    participant LLM as Google Gemini API
    participant Tools as Autonomous Tools

    User->>Client: Speaks query (EN, HI, TA, Tanglish)
    Client->>Client: Web Speech API STT (Live ghost bubble)
    Client->>API: POST /api/chat/:id/message
    API->>DB: Fetch last 10 messages from session
    API->>DB: PostgreSQL Full-Text & Trigram search (knowledge_entries)
    API->>LLM: Strict System Prompt + Grounded Context + User Query
    LLM-->>API: JSON { reply, intent, sentiment, confidence, action }
    opt Action Required
        API->>Tools: executeTool(action) -> Write to DB
        Tools-->>API: Localized confirmation
    end
    API->>DB: Persist turns, latency, confidence, sources
    API-->>Client: 200 OK Response
    Client->>User: Spoken voice reply via Web SpeechSynthesis
```

---

## 5. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, React Router 7, Tailwind CSS, Recharts, Lucide Icons, Axios |
| **Speech STT / TTS** | Web Speech API (`SpeechRecognition` & `SpeechSynthesis`), `MediaRecorder` fallback |
| **Backend API** | Node.js (v20+), Express.js, JWT (`jsonwebtoken`), `bcryptjs`, Zod, Helmet, CORS, Express-Rate-Limit, Multer |
| **Database** | **Supabase PostgreSQL** via `pg` (Session Connection Pooler), Row Level Security (RLS) |
| **AI Integration** | Google Gemini API (`@google/generative-ai`, `gemini-2.5-flash`), swappable provider abstraction |
| **Testing** | Vitest, Supertest |
| **Hosting & Deploy** | Vercel (Client), Render (Backend Web Service), Supabase (Database) |

---

## 6. Repository Structure

```
samvadai/
├── README.md                               # Project documentation
├── .gitignore                              # Git exclusion rules (ignores .env and node_modules)
├── docs/
│   ├── architecture.md                     # System architecture & ER diagram
│   ├── api.md                              # Complete REST API specifications
│   ├── deployment.md                       # Supabase + Render + Vercel deployment guide
│   ├── test-matrix.md                      # Multilingual pass/fail test matrix
│   ├── demo-script.md                      # 4-minute rehearsed presentation script
│   ├── submission.md                       # Hackathon submission summary
│   └── samvadai.postman_collection.json    # Postman API test collection
├── client/                                 # React + Vite frontend
│   ├── index.html, vite.config.js, tailwind.config.js
│   ├── vercel.json                         # Single-page app routing rewrite
│   ├── .env.example                        # VITE_API_URL template
│   └── src/
│       ├── main.jsx, App.jsx, index.css
│       ├── api/axios.js                    # Axios instance with JWT interceptor
│       ├── context/AuthContext.jsx         # User & guest session management
│       ├── hooks/                          # Voice & conversation hooks
│       ├── components/                     # Voice, UI, and admin chart components
│       └── pages/                          # Landing, Login, Chat, History, Admin pages
└── server/                                 # Express.js backend
    ├── package.json, render.yaml
    ├── .env.example                        # Server environment variables template
    ├── db/
    │   ├── migrate.js                      # Migration runner tracking schema_migrations
    │   └── migrations/                     # 001_init.sql, 002_indexes.sql, 003_rls.sql
    ├── tests/                              # Vitest & Supertest automated test suite
    └── src/
        ├── server.js, app.js
        ├── config/ (env.js, db.js)         # Zod validated env, connection pooler
        ├── middleware/                     # Auth, RBAC, Zod validate, rate limiters
        ├── repositories/                   # Parameterized PostgreSQL data access
        ├── routes/, controllers/           # Auth, Chat, Voice, Admin routes
        ├── services/                       # Orchestrator, RAG retrieval, Tools, AI providers
        └── seed/seed.js                    # Idempotent hospital database seed script
```

---

## 7. Local Development Quickstart (< 5 Minutes)

### Prerequisites
- Node.js v20.x or higher
- A Supabase PostgreSQL database URL (or local PostgreSQL instance)
- A Google AI Studio API key (`GEMINI_API_KEY`)

### Step 1: Clone and Configure Environment Files
```bash
git clone https://github.com/your-username/samvadai.git
cd samvadai

# Setup backend env
cp server/.env.example server/.env

# Setup frontend env
cp client/.env.example client/.env
```

### Step 2: Configure `server/.env`
Open `server/.env` and insert your credentials:
```ini
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
JWT_SECRET=super_secure_random_jwt_secret_at_least_32_characters_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
GEMINI_MODEL=gemini-2.5-flash
SEED_ADMIN_PASSWORD=Admin@Samvad2025!
```

### Step 3: Install Dependencies, Migrate & Seed
```bash
# 1. Install & setup backend
cd server
npm install
npm run migrate    # Applies SQL migrations to Supabase
npm run seed       # Seeds hospital FAQs, admin user, and demo conversations

# 2. Install frontend dependencies
cd ../client
npm install
```

### Step 4: Run Development Servers
In terminal 1 (Backend):
```bash
cd server
npm run dev        # Starts Express server on http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd client
npm run dev        # Starts Vite dev server on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser.

---

## 8. Demo Credentials

| Role | Email | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Hospital Admin** | `admin@samvadai.com` | `Admin@Samvad2025!` | Full dashboard, analytics, knowledge manager, ticket management |
| **Registered Patient** | `priya@example.com` | `Priya@123` | Voice chat, appointments, past conversation history |
| **Guest Mode** | *(None)* | *(None)* | Instant voice access directly from the landing page |

---

## 9. Production Deployment Summary
Full step-by-step instructions with troubleshooting are documented in [docs/deployment.md](./docs/deployment.md).

- **Database:** Provisioned on **Supabase** (free tier). Schema deployed via `npm run migrate`. Row Level Security (RLS) is enabled on all tables.
- **Backend:** Deployed to **Render** as a Web Service. Configured via `render.yaml` with automated health checks at `/api/health`.
- **Frontend:** Deployed to **Vercel** with single-page application rewrites via `client/vercel.json`.

---

## 10. Security & Privacy Highlights
- **Zero Client-Side Secrets:** Neither the Gemini API key nor the Supabase database connection string is present in the client bundle.
- **Row Level Security (RLS):** Enabled on all Supabase tables without public access policies, preventing unauthorized client-side PostgREST access.
- **Zero Audio Storage:** Spoken audio is transcribed in-flight via Web Speech or memory buffers; raw audio files are never stored on disk.
- **Patient Privacy:** Phone numbers in administrative appointment lists are automatically masked (`98765*****`).
- **SQL Injection Defense:** All queries utilize parameterized placeholders (`$1, $2`).
- **Rate Limiting:** General API is capped at 100 req/15min; voice and chat endpoints are restricted to 30 req/min.

---

## 11. Future Roadmap
- **Telephony & IVR Integration:** Inbound phone calls via Twilio / Exotel SIP trunking for basic feature phones.
- **WhatsApp Voice Notes:** Integration with WhatsApp Business API to process audio notes and reply with voice memos.
- **Vector Embeddings (Semantic RAG):** Supabase `pgvector` hybrid search combining dense embeddings with sparse BM25 text search.
- **Additional Indian Regional Languages:** Telugu, Bengali, Kannada, and Marathi support.

---

## 12. License
This project is open-source and licensed under the [MIT License](LICENSE).
