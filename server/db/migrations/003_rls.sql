-- 003_rls.sql: Security hardening via Row Level Security (RLS)
--
-- ARCHITECTURE NOTE:
-- In SamvadAI, the client frontend NEVER talks to Supabase directly.
-- All operations are mediated through our Express backend, which authenticates via
-- the database role (service connection pooler) and enforces JWT, RBAC, and ownership checks.
--
-- By enabling Row Level Security on all tables without defining any public policies,
-- any accidental or malicious direct requests using Supabase's auto-generated REST API
-- or anon keys are completely blocked from reading or writing data.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Note: No policies are created for the anon or authenticated web roles,
-- ensuring the database is locked down from direct client-side Supabase PostgREST access.
