# SamvadAI — 4-Minute Video Demo Script
**Theme: Voice & Conversational Intelligence Platform**

---

### [0:00 - 0:30] Problem & Hook (The "Why")
**Visual:** Camera on speaker, transition to SamvadAI Landing Page hero banner with animated microphone and multilingual language pills.
**Speaker (Voiceover):**
> *"Small hospitals, community clinics, and local government help desks in multilingual countries receive thousands of repetitive inquiries every day in English, Hindi, and regional languages like Tamil.
>
> Human agents are overwhelmed, call wait times stretch into hours, and for citizens who are less literate or uncomfortable typing, English-only text chatbots are completely inaccessible.
>
> Introducing **SamvadAI** — a voice-first, multilingual conversational platform that allows anyone to speak naturally in their mother tongue, receive grounded spoken answers from verified knowledge bases, book appointments by voice, and seamlessly escalate to human agents when needed."*

---

### [0:30 - 1:30] Live Voice Demo (English, Hindi & Tamil Grounded FAQs)
**Visual:** Click **"Try Voice Assistant as Guest"** on the landing page. The clean, accessible chat interface appears.

**Action 1 (English FAQ):**
- Tap the center microphone button.
- **Speak:** *"What time does the OPD open tomorrow morning, and what is the registration fee?"*
- **Visual:** The live ghost bubble transcribes in real-time. The microphone waveform animates.
- **Assistant replies (spoken aloud & displayed):**
  > *"Outpatient Department (OPD) operates Monday to Saturday from 8:00 AM to 1:00 PM and 2:00 PM to 5:00 PM. General physician registration fee is ₹100. Sunday OPD remains closed, but Emergency is open 24/7."*
- **Highlight:** Point out the **Source Badge** (`[From: OPD Timings and Registration]`), intent chip (`#timings`), and sentiment chip (`Positive`).

**Action 2 (Tamil FAQ):**
- Switch language selector to **தமிழ் (Tamil)** or speak naturally in Tamil.
- **Speak:** *"என் ரத்தப் பரிசோதனை ரிப்போர்ட் எப்போது கிடைக்கும்?"*
- **Assistant replies in native spoken Tamil:**
  > *"பொதுவான ரத்தப் பரிசோதனை முடிவுகள் 4 மணி நேரத்திற்குள் தயாராகிவிடும். நீங்கள் இணையதளம் மூலமாகவோ அல்லது கவுண்டர் 4-ல் காலை 8 மணி முதல் இரவு 8 மணி வரை பெற்றுக்கொள்ளலாம்."*

**Action 3 (Hindi FAQ):**
- Switch language to **हिन्दी (Hindi)**.
- **Speak:** *"क्या आपके अस्पताल में आयुष्मान भारत कार्ड से इलाज होता है?"*
- **Assistant replies in native spoken Hindi:**
  > *"हाँ, हमारे अस्पताल में आयुष्मान भारत (PM-JAY) कार्ड स्वीकार किया जाता है। आप कमरा नंबर 102 में टीपीए हेल्पडेस्क से संपर्क कर सकते हैं।"*

---

### [1:30 - 2:15] Autonomous Tool Execution (Multi-Turn Voice Booking)
**Visual:** Stay in Chat interface. Demonstrate push-to-talk or toggle **Hands-Free Mode**.

**Speaker (Voiceover):**
> *"SamvadAI isn't just an FAQ bot; it performs real-world actions through autonomous structured tool calls."*

- **Speak:** *"I would like to book a doctor appointment."*
- **Assistant:** *"I can help book an appointment. Please provide your full name."*
- **Speak:** *"Priya Patel."*
- **Assistant:** *"Thank you Priya. Please share your phone number and which medical department you wish to visit."*
- **Speak:** *"Phone number is 9876543210, and I need Cardiology."*
- **Assistant (executes `book_appointment` tool):**
  > *"Your appointment has been confirmed with Cardiology on tomorrow at 10:00 AM."*
- **Visual:** An interactive **Appointment Confirmation Card** appears directly in the chat with department, scheduled time, and status badge (`Booked`).

---

### [2:15 - 2:45] Zero-Hallucination & Smart Human Escalation
**Visual:** Demonstrate what happens when an unknown question or negative sentiment arises.

**Action 1 (Zero-Hallucination Guard):**
- **Speak:** *"Can I bring my pet dog for a dental root canal surgery?"*
- **Assistant:**
  > *"I do not have specific hospital information on that topic. Would you like me to connect you to a human help desk executive?"*
- **Highlight:** The confidence score drops to `25%`. The assistant refuses to hallucinate policies outside its grounded database.

**Action 2 (Emergency Escalation & Handoff Summary):**
- **Speak:** *"My father has acute chest pain and we have been waiting 40 minutes in casualty without any doctor!"*
- **Visual:** The system immediately detects high-priority negative sentiment.
- **Assistant:**
  > *"I deeply apologize for this severe delay. For life-threatening emergencies, please alert the casualty desk or call 044-24567890. I have escalated this conversation to our senior duty officer."*
- **Visual:** An **Escalated Banner** renders showing the 3-line AI handoff summary:
  1. *Issue: Acute chest pain patient waiting in casualty triage.*
  2. *State: High urgency, distressed family member.*
  3. *Action: Immediate Duty Medical Officer intervention requested.*

---

### [2:45 - 3:45] Admin Intelligence Dashboard
**Visual:** Click **Logout** → Sign in as Admin (`admin@samvadai.com`). Navigate to `/admin`.

**Speaker (Voiceover):**
> *"Every single spoken conversation feeds into our Conversational Intelligence Dashboard, giving healthcare administrators visibility into citizen needs."*

1. **Overview Stat Cards:** Show Total Conversations, Resolution Rate (80%+), Escalation Rate, and Average Turnaround Latency (~850ms).
2. **Analytics Charts:**
   - **Volume Time Series:** 14-day trends of citizen calls.
   - **Language Donut:** Proportion of English vs Hindi vs Tamil callers.
   - **Intent Distribution:** Top questions (#timings, #insurance, #appointments).
3. **Knowledge Gap Radar ("Top Unanswered Questions"):**
   - Show the query: *"Do you provide pet grooming and veterinary dental surgery?"*
   - Click the button: **"Add to Knowledge Base"**.
   - **Visual:** Redirects to `/admin/knowledge` with the form pre-filled. Add the verified hospital policy, click **Publish**, and the assistant is immediately updated without redeploying!
4. **Logs & Appointments:**
   - Open `/admin/conversations` to view full transcripts and sentiment trends.
   - Open `/admin/appointments` to view the newly booked Cardiology appointment with privacy-masked phone numbers (`98765*****`).

---

### [3:45 - 4:15] Architecture, Security & Production Deployment
**Visual:** Display `docs/architecture.md` diagram and live deployment URLs.

**Speaker (Voiceover):**
> *"SamvadAI is built with enterprise security standards:
> - **Frontend:** React with Vite, Tailwind CSS, and Web Speech API deployed on **Vercel** over HTTPS.
> - **Backend:** Node.js, Express, and JWT RBAC deployed on **Render** Web Service.
> - **Database:** **Supabase PostgreSQL** accessed exclusively through pooled connection strings with **Row Level Security (RLS)** fully enabled. No keys or direct database access are exposed to the client.
> - **AI Layer:** Google Gemini 2.5 Flash running behind a swappable provider abstraction, with Postgres full-text simple search and trigram fuzzy fallback for cross-lingual retrieval."*

---

### [4:15 - 4:30] Closing & Future Roadmap
**Visual:** Return to Landing Page.
**Speaker (Voiceover):**
> *"SamvadAI bridges the digital and linguistic divide for millions of citizens who prefer speaking over typing. Our future scope includes direct telephony integration via Twilio or Exotel, WhatsApp voice notes, and pgvector embeddings on Supabase.
>
> Thank you for exploring SamvadAI — empowering voice conversations for everyone."*
