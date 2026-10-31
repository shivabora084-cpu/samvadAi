-- 002_indexes.sql: Performance & full-text search indexes

-- Enable pg_trgm for fuzzy string matching fallback
CREATE EXTENSION IF NOT EXISTS "pgtrgm";

-- Full-text search index on generated search_vector
CREATE INDEX IF NOT EXISTS idx_knowledge_search_vector ON knowledge_entries USING GIN (search_vector);

-- Trigram fuzzy indexes for typo tolerance and partial matches
CREATE INDEX IF NOT EXISTS idx_knowledge_title_trgm ON knowledge_entries USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_knowledge_content_trgm ON knowledge_entries USING GIN (content gin_trgm_ops);

-- Messages indexes for fast conversation transcript retrieval
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages (conversation_id, created_at ASC);

-- Conversations indexes for dashboard filtering and timeline queries
CREATE INDEX IF NOT EXISTS idx_conversations_started_at ON conversations (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations (status);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_guest_id ON conversations (guest_id);

-- Tickets & Appointments indexes
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments (scheduled_at ASC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);
