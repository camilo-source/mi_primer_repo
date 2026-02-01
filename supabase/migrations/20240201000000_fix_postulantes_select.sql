-- Enable RLS on the table (ensure it's on)
ALTER TABLE public.postulantes ENABLE ROW LEVEL SECURITY;
-- Policy: Allow ANONYMOUS users to INSERT (Apply)
DROP POLICY IF EXISTS "Public Candidates Insert" ON public.postulantes;
CREATE POLICY "Public Candidates Insert" ON public.postulantes FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
-- Policy: Allow AUTHENTICATED users (Recruiters) to SELECT (View Dashboard)
DROP POLICY IF EXISTS "Authenticated Users Select Candidates" ON public.postulantes;
CREATE POLICY "Authenticated Users Select Candidates" ON public.postulantes FOR
SELECT TO authenticated USING (true);
-- Policy: Allow AUTHENTICATED users to UPDATE (Change status, add comments)
DROP POLICY IF EXISTS "Authenticated Users Update Candidates" ON public.postulantes;
CREATE POLICY "Authenticated Users Update Candidates" ON public.postulantes FOR
UPDATE TO authenticated USING (true) WITH CHECK (true);
-- Ensure the 'estado' column exists (redundancy check)
ALTER TABLE public.postulantes
ADD COLUMN IF NOT EXISTS estado text DEFAULT 'nuevo';
ALTER TABLE public.postulantes
ADD COLUMN IF NOT EXISTS cv_url text;