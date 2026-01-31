-- Refresh schema cache and ensure columns exist
-- This migration addresses the "Could not find the 'estado' column" error
-- 1. Reload the schema cache (indirectly by altering the table, even if no-op)
NOTIFY pgrst,
'reload schema';
-- 2. Explicitly add the column if it's missing (it might be missing despite previous migrations)
ALTER TABLE public.postulantes
ADD COLUMN IF NOT EXISTS estado text DEFAULT 'nuevo';
-- 3. Ensure other critical columns for application exist
ALTER TABLE public.postulantes
ADD COLUMN IF NOT EXISTS telefono text,
    ADD COLUMN IF NOT EXISTS linkedin text,
    ADD COLUMN IF NOT EXISTS cv_url text,
    ADD COLUMN IF NOT EXISTS score_ia integer,
    ADD COLUMN IF NOT EXISTS source text DEFAULT 'direct';
-- 4. Re-apply the public insert policy to be absolutely sure
DROP POLICY IF EXISTS "Public Candidates Insert" ON public.postulantes;
CREATE POLICY "Public Candidates Insert" ON public.postulantes FOR
INSERT TO public WITH CHECK (true);
-- 5. Grant permissions (just in case)
GRANT INSERT ON public.postulantes TO anon;
GRANT INSERT ON public.postulantes TO authenticated;
GRANT USAGE ON SEQUENCE postulantes_id_seq TO anon;
-- If using serial (though we use UUID)