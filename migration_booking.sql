-- Migration: Add booking token to postulantes
ALTER TABLE postulantes 
ADD COLUMN IF NOT EXISTS booking_token TEXT UNIQUE;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_postulantes_booking_token ON postulantes(booking_token);
