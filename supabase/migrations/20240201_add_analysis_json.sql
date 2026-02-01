-- Add JSONB column to store full AI analysis (Radar Chart data)
alter table postulantes
add column if not exists analisis_json jsonb;