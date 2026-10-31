-- 001_init.sql: Core schema for SamvadAI platform
-- Enables UUID generation and sets up initial tables

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ticket sequence for user-friendly ticket codes (e.g., SV-1042)
CREATE SEQUENCE IF NOT EXISTS ticket_code_seq START WITH 1001;

-- Immutable helper to safely include tags in generated tsvector
CREATE OR REPLACE FUNCTION immutable_array_to_string(arr text[], sep text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
$$ SELECT array_to_string(arr, sep); $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_id VARCHAR(100),
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated')),
  summary TEXT,
  intents TEXT[] DEFAULT '{}',
  sentiment_avg NUMERIC(3, 2) DEFAULT 0.0,
  sentiment_trend JSONB DEFAULT '[]'::jsonb,
  escalated BOOLEAN NOT NULL DEFAULT FALSE,
  escalation_summary TEXT,
  resolution TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMPTZ
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  text TEXT NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  input_mode VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (input_mode IN ('voice', 'text')),
  intent VARCHAR(100),
  sentiment VARCHAR(50),
  sentiment_score NUMERIC(3, 2),
  confidence NUMERIC(3, 2),
  source_ids UUID[] DEFAULT '{}',
  tool_calls JSONB DEFAULT '[]'::jsonb,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base entries (with simple text search configuration for Hindi/Tamil/English)
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('simple'::regconfig, coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(immutable_array_to_string(tags, ' '), ''))
  ) STORED
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code VARCHAR(50) UNIQUE NOT NULL DEFAULT ('SV-' || nextval('ticket_code_seq')::text),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_id VARCHAR(100),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_id VARCHAR(100),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
