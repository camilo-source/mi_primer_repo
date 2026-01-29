-- Migration: Enhanced Scheduling Flow
-- Run this in your Supabase SQL Editor

-- Add new columns to postulantes for email tracking
ALTER TABLE postulantes 
ADD COLUMN IF NOT EXISTS email_thread_id TEXT,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_reply_received_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS candidate_availability JSONB,
ADD COLUMN IF NOT EXISTS matched_slots JSONB,
ADD COLUMN IF NOT EXISTS selected_slot JSONB;

-- Update estado_agenda to include new states
-- Possible values: 'pending', 'sent', 'replied', 'matching', 'confirmed', 'rejected', 'cancelled'

-- Create table to store user's Google tokens (encrypted)
CREATE TABLE IF NOT EXISTS user_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expiry TIMESTAMPTZ,
    google_scopes TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own integrations
CREATE POLICY "Users can view own integrations" ON user_integrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON user_integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON user_integrations
    FOR UPDATE USING (auth.uid() = user_id);

-- Create table to log email activity
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES postulantes(id) ON DELETE CASCADE,
    email_type TEXT NOT NULL, -- 'invite', 'reminder', 'confirmation'
    gmail_message_id TEXT,
    gmail_thread_id TEXT,
    subject TEXT,
    body_preview TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    direction TEXT DEFAULT 'outbound' -- 'outbound' or 'inbound'
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email logs" ON email_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email logs" ON email_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_logs_thread ON email_logs(gmail_thread_id);
CREATE INDEX IF NOT EXISTS idx_postulantes_thread ON postulantes(email_thread_id);
