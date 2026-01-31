-- Migration: Add Google Calendar integration fields
-- Description: Adds fields to store Google Calendar event IDs and Meet links

-- Add Google Calendar fields to postulantes table
ALTER TABLE postulantes
ADD COLUMN IF NOT EXISTS google_event_id TEXT,
ADD COLUMN IF NOT EXISTS google_meet_link TEXT;

-- Create user_tokens table for storing Google OAuth tokens
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tokens
CREATE POLICY "Users can view their own tokens"
    ON user_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
    ON user_tokens
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
    ON user_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_postulantes_google_event ON postulantes(google_event_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);

-- Add comment
COMMENT ON TABLE user_tokens IS 'Stores Google OAuth tokens for calendar integration';
COMMENT ON COLUMN postulantes.google_event_id IS 'Google Calendar event ID for the interview';
COMMENT ON COLUMN postulantes.google_meet_link IS 'Google Meet link for the interview';
