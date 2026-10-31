# SamvadAI Architecture & System Design

SamvadAI is built with a voice-first, decoupled, layered architecture prioritizing ultra-low dialogue latency, zero-hallucination factual grounding, accessibility, and end-to-end data privacy.

---

## 1. High-Level Architecture Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as Citizen / Patient
    participant Client as React Client (Vercel)
    participant API as Express API (Render)
    participant Orchestrator as Dialogue Orchestrator
    participant Retrieval as RAG Retrieval Engine
    participant DB as Supabase PostgreSQL
    participant LLM as Google Gemini API
    participant Tools as Autonomous Tool Runner

    User->>Client: Speaks query (EN, HI, TA, Tanglish)
    alt Web Speech API Supported
        Client->>Client: Browser STT (Real-time interim ghost bubble)
    else Fallback Audio Upload
        Client->>API: POST /api/voice/transcribe (audio/webm)
        API->>LLM: Multimodal Audio Transcription
        LLM-->>API: Transcribed Text & Language
        API-->>Client: Final Transcript
    end

    Client->>API: POST /api/chat/:id/message { text, inputMode, lang }
    API->>Orchestrator: processTurn(conversationId, text)
    Orchestrator->>DB: Load last 10 messages from session
    DB-->>Orchestrator: Recent conversation history

    par Hybrid Retrieval
        Orchestrator->>Retrieval: Full-Text search (search_vector @@ simple)
        Retrieval->>DB: Query websearch_to_tsquery('simple')
        DB-->>Retrieval: Matching knowledge articles
    and Trigram Fallback (if < 2 results)
        Retrieval->>DB: Fuzzy search via pg_trgm similarity(title, content)
        DB-->>Retrieval: Fuzzy matched articles
    end
    Retrieval-->>Orchestrator: Grounded Knowledge Articles

    Orchestrator->>LLM: Generate structured turn (Strict system prompt + Grounding context)
    LLM-->>Orchestrator: JSON { reply, intent, sentiment, confidence, action, searchQuery }

    opt Action Required (Tools)
        Orchestrator->>Tools: executeTool(action, params)
        Tools->>DB: Transactional write (Appointment / Ticket / Escalation)
        DB-->>Tools: Confirmation record (e.g. SV-1042)
        Tools-->>Orchestrator: Localized confirmation text
    end

    opt Escalation Triggered (Low Confidence / Negative Sentiment)
        Orchestrator->>DB: Mark status = 'escalated'
        Orchestrator->>LLM: Generate 3-line duty officer handoff summary
        LLM-->>Orchestrator: Handoff summary text
    end

    Orchestrator->>DB: Persist user and assistant turns with latency & confidence
    Orchestrator-->>API: Turn response payload
    API-->>Client: 200 OK { reply, language, intent, sentiment, confidence, action, sources }

    Client->>Client: Render transcript bubble with source badges & chips
    Client->>User: Web SpeechSynthesis speaks reply in native regional voice
```

---

## 2. Database Entity-Relationship Diagram (Supabase PostgreSQL)

```mermaid
erDiagram
    users ||--o{ conversations : "owns"
    users ||--o{ tickets : "creates"
    users ||--o{ appointments : "books"
    conversations ||--o{ messages : "contains"
    conversations ||--o{ tickets : "originates"
    conversations ||--o{ appointments : "schedules"

    users {
        uuid id PK
        varchar name
        varchar email UK
        varchar password_hash
        varchar role
        varchar preferred_language
        timestamptz created_at
    }

    conversations {
        uuid id PK
        uuid user_id FK
        varchar guest_id
        varchar language
        varchar status
        text summary
        text[] intents
        numeric sentiment_avg
        jsonb sentiment_trend
        boolean escalated
        text escalation_summary
        text resolution
        int rating
        timestamptz started_at
        timestamptz ended_at
    }

    messages {
        uuid id PK
        uuid conversation_id FK
        varchar role
        text text
        varchar language
        varchar input_mode
        varchar intent
        varchar sentiment
        numeric sentiment_score
        numeric confidence
        uuid[] source_ids
        jsonb tool_calls
        int latency_ms
        timestamptz created_at
    }

    knowledge_entries {
        uuid id PK
        text title
        text content
        varchar category
        text[] tags
        varchar language
        boolean active
        tsvector search_vector
        timestamptz created_at
        timestamptz updated_at
    }

    tickets {
        uuid id PK
        varchar ticket_code UK
        uuid user_id FK
        varchar guest_id
        uuid conversation_id FK
        varchar subject
        text description
        varchar category
        varchar priority
        varchar status
        timestamptz created_at
    }

    appointments {
        uuid id PK
        uuid user_id FK
        varchar guest_id
        uuid conversation_id FK
        varchar name
        varchar phone
        varchar department
        timestamptz scheduled_at
        varchar status
        timestamptz created_at
    }
```

---

## 3. Grounding & Anti-Hallucination Design

SamvadAI prevents hallucinations through a 4-tier pipeline:

1. **Strict Context Boundaries:**
   The model is instructed:
   > *"Answer questions ONLY using facts provided in the KNOWLEDGE CONTEXT. If the information is not present or partial, state that you do not have that specific record and offer human escalation."*
2. **Deterministic Source Attribution:**
   Articles retrieved from PostgreSQL full-text search are injected with UUID tags (`[ID: ...]`). The model returns `usedSourceIds`, which are validated against the actual retrieved docs and rendered in the UI as clickable source badges (e.g., `From: OPD Timings and Registration`).
3. **Escalation Rules Engine:**
   - Confidence threshold: If model confidence < 0.35 on two consecutive turns, the system flags the interaction and routes to a human duty officer.
   - Sentiment trigger: If 3 consecutive turns register negative sentiment (-0.6 or lower), automated escalation triggers.
   - Explicit keyword: Direct requests ("transfer to human", "doctor se baat karni hai") initiate immediate handoff.
4. **Prompt-Injection Defense:**
   User conversational turns are treated strictly as data payloads inside delimiters, preventing users from overriding system instructions or revealing prompt context.
