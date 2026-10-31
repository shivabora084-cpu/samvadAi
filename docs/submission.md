# SamvadAI — Hackathon Project Submission

---

### 1. Problem Statement (~80 words)
Small hospitals, clinics, local government help desks, and service businesses in multilingual regions like India receive large volumes of repetitive calls and chats in several languages (Tamil, Hindi, English, and code-mixed speech like "Tanglish"). Human agents are overloaded, wait times are long, answers are inconsistent between agents, after-hours queries go unanswered, and people who are less literate or less comfortable typing are effectively excluded because most tools are text-only and English-only.

---

### 2. Solution Description (~200 words)
SamvadAI is a voice-first, multilingual conversational assistant and intelligence platform engineered to bridge the accessibility and linguistic divide for healthcare and citizen services. Powered by Google Gemini API and Supabase PostgreSQL, SamvadAI allows citizens to speak or type naturally in English, Hindi, Tamil, or code-mixed Tanglish.

The platform utilizes a zero-hallucination lightweight RAG pipeline: incoming speech is transcribed via browser Web Speech API (with multimodal Gemini audio fallback), analyzed for intent and sentiment, and grounded exclusively against the organization's verified PostgreSQL knowledge base using full-text and trigram fuzzy search. When answers are absent, the assistant transparently admits it and initiates smart human escalation with an automated 3-line handoff summary.

Beyond static Q&A, SamvadAI autonomously executes structured tool calls—enabling users to book outpatient appointments, generate support tickets, and check live status directly through natural dialogue. Simultaneously, healthcare administrators access an intelligence dashboard featuring real-time analytics on call volumes, sentiment trends, regional language distributions, and an actionable "Knowledge Gap Radar" that converts unanswered citizen queries into verified knowledge base entries with a single click.

---

### 3. Key Links & Submission Assets

| Asset | Link / Reference |
| :--- | :--- |
| **GitHub Repository** | [https://github.com/your-username/samvadai](https://github.com/your-username/samvadai) *(Replace with your GitHub repo URL)* |
| **Live Deployed Web App (Vercel)** | [https://samvadai-client.vercel.app](https://samvadai-client.vercel.app) *(Replace with your Vercel URL)* |
| **Live Backend API (Render)** | [https://samvadai-backend.onrender.com](https://samvadai-backend.onrender.com) *(Replace with your Render URL)* |
| **Demo Video (4 Minutes)** | [https://youtu.be/your-demo-video-id](https://youtu.be/your-demo-video-id) *(Replace with your YouTube/Loom video link)* |
| **Postman / Bruno API Collection** | [`docs/samvadai.postman_collection.json`](./samvadai.postman_collection.json) |

---

### 4. Demo Credentials for Judges & Evaluators

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Hospital Administrator** | `admin@samvadai.com` | `Admin@Samvad2025!` | Full Dashboard, Analytics, Logs, Knowledge Manager, Tickets, Appointments |
| **Registered Patient** | `priya@example.com` | `Priya@123` | Voice Chat, History, Booking, Ticket Status |
| **Guest Mode** | *(No credentials required)* | *(Instant click on Landing Page)* | Instant multilingual voice assistant session |
