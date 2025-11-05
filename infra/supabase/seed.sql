-- Seed file for local development
-- This creates test users and sample data for development purposes

-- Note: In local development, Supabase uses test keys that don't require secure secrets
-- The migration (0001_core_schema.sql) will automatically run first

-- Insert a test user profile (the user must exist in auth.users first via signup)
-- This is just a placeholder - actual user creation happens through the signup endpoint

-- You can add test data here if needed for local development
-- For example, to test with a specific user:
-- INSERT INTO public.profiles (id, email, name, default_currency)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', 'USD')
-- ON CONFLICT (id) DO NOTHING;

-- The default categories will be automatically seeded when a user signs up
-- due to the migration's idempotent category seeding logic