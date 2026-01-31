-- Migration to add source tracking
ALTER TABLE postulantes
ADD COLUMN IF NOT EXISTS source TEXT;