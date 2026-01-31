-- ============================================
-- MIGRACIÓN COMPLETA: GreenGlass ATS
-- Arquitectura de Agentes con Memoria Compartida
-- ============================================

-- 1. ACTUALIZAR TABLA BUSQUEDAS (Variables del Agente Orquestador)
-- =================================================================

ALTER TABLE busquedas 
ADD COLUMN IF NOT EXISTS empresa TEXT,
ADD COLUMN IF NOT EXISTS nombre_del_puesto TEXT,
ADD COLUMN IF NOT EXISTS habilidades_tecnicas TEXT[],
ADD COLUMN IF NOT EXISTS habilidades_blandas TEXT[],
ADD COLUMN IF NOT EXISTS experiencia_previa TEXT,
ADD COLUMN IF NOT EXISTS nivel_de_formacion TEXT,
ADD COLUMN IF NOT EXISTS disponibilidad TEXT,
ADD COLUMN IF NOT EXISTS modalidad TEXT,
ADD COLUMN IF NOT EXISTS ubicacion TEXT,
ADD COLUMN IF NOT EXISTS idiomas_nivel JSONB,
ADD COLUMN IF NOT EXISTS rango_etario TEXT,
ADD COLUMN IF NOT EXISTS sexo TEXT,
ADD COLUMN IF NOT EXISTS extras JSONB;

-- Comentarios para documentación
COMMENT ON COLUMN busquedas.habilidades_tecnicas IS 'Array de habilidades técnicas requeridas (Peso: 40%)';
COMMENT ON COLUMN busquedas.experiencia_previa IS 'Rango de experiencia requerida ej: "2-5 años" (Peso: 30%)';
COMMENT ON COLUMN busquedas.modalidad IS 'Presencial, Remoto, Híbrido (Peso: 20%)';
COMMENT ON COLUMN busquedas.idiomas_nivel IS 'JSON con idiomas requeridos ej: {"ingles": "B2", "portugues": "A2"}';
COMMENT ON COLUMN busquedas.extras IS 'Requisitos excluyentes y adicionales (Red Flags si no se cumplen)';


-- 2. ACTUALIZAR TABLA POSTULANTES (Output del Agente Calificador)
-- =================================================================

ALTER TABLE postulantes 
ADD COLUMN IF NOT EXISTS puntaje INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS puntos_fuertes TEXT[],
ADD COLUMN IF NOT EXISTS puntos_debiles TEXT[],
ADD COLUMN IF NOT EXISTS cv_texto_extraido TEXT,
ADD COLUMN IF NOT EXISTS cv_link TEXT,
ADD COLUMN IF NOT EXISTS booking_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS selected_slot JSONB;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_postulantes_puntaje ON postulantes(puntaje DESC);
CREATE INDEX IF NOT EXISTS idx_postulantes_booking_token ON postulantes(booking_token);

COMMENT ON COLUMN postulantes.puntaje IS 'Puntaje de 0-100 calculado por el Agente Calificador';
COMMENT ON COLUMN postulantes.puntos_fuertes IS 'Array de fortalezas identificadas por IA';
COMMENT ON COLUMN postulantes.puntos_debiles IS 'Array de debilidades identificadas por IA';
COMMENT ON COLUMN postulantes.cv_texto_extraido IS 'Texto del CV extraído por OCR';


-- 3. TABLA AVAILABILITY (Para el sistema Calendly-style)
-- =================================================================

CREATE TABLE IF NOT EXISTS public.availability (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.clientes(id) NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  is_booked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own availability" ON public.availability;
CREATE POLICY "Users can manage own availability"
  ON public.availability FOR ALL
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );


-- 4. RESETEAR ESTADOS PARA PRUEBAS
-- =================================================================

-- Opcional: Resetear candidatos existentes al estado inicial
-- UPDATE postulantes 
-- SET estado_agenda = 'pending', booking_token = NULL 
-- WHERE estado_agenda IN ('sent', 'contacted', 'replied');


-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
