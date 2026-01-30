# 🎯 PLAN DE MEJORA - VIBE CODE ATS

## Fecha: 30/01/2026
## Estado: EN PLANIFICACIÓN

---

# 📋 FASE 1: CAMBIOS VISUALES Y ESTÉTICOS

## 1.A - FILTRO DEL DASHBOARD (Ordenamiento)
**Estado:** 🔴 Pendiente
**Prioridad:** Alta
**Ubicación:** `src/components/ui/FilterDropdown.tsx` + `src/pages/Dashboard.tsx`

### Cambios requeridos:
El filtro actual filtra por estado. Necesitamos crear un **segundo dropdown** para ordenamiento:

| Opción | Descripción |
|--------|-------------|
| Más reciente primero | Ordena por `created_at` DESC |
| Más antiguo primero | Ordena por `created_at` ASC |
| Más importantes primero | Ordena por `favorito` DESC + `created_at` DESC |

### Archivos a modificar:
- [ ] `src/components/ui/SortDropdown.tsx` (NUEVO)
- [ ] `src/pages/Dashboard.tsx` - Agregar estado `sortOrder` y lógica de ordenamiento

---

## 1.B - FUNCIÓN DE "ME GUSTA" EN BÚSQUEDAS
**Estado:** 🔴 Pendiente
**Prioridad:** Alta
**Ubicación:** DB + Frontend

### Base de datos:
```sql
ALTER TABLE public.busquedas 
ADD COLUMN IF NOT EXISTS favorito BOOLEAN DEFAULT FALSE;
```

### Cambios frontend:
- [ ] Agregar icono de corazón/estrella en las cards de búsqueda
- [ ] Función `toggleFavorite(id)` para marcar/desmarcar
- [ ] Ordenamiento "más importantes primero" usa este campo

---

## 1.C - PANTALLA DE INICIO (Landing)
**Estado:** 🔴 Pendiente
**Prioridad:** Alta
**Ubicación:** `src/pages/Landing.tsx`

### Layout propuesto:
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              🌟 VIBE CODE ATS                   │  ← Grande, arriba del todo
│     Sistema de Reclutamiento Inteligente        │
│                                                 │
│         ┌─────────────────────────────┐         │
│         │   🔵 Continuar con Google   │         │  ← Botón prominente
│         └─────────────────────────────┘         │
│                                                 │
│  Al iniciar sesión aceptás los permisos de:    │
│  ☐ Gmail API (envío de correos)                │
│  ☐ Google Calendar API (programar entrevistas) │
│                                                 │
│        [Features Cards: IA, Calendar, etc]      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Cambios técnicos:
- [ ] Mover título "VIBE CODE ATS" al tope
- [ ] Mover botón de Google justo debajo del título
- [ ] Agregar texto sobre permisos de Gmail y Calendar API
- [ ] Modificar flow de OAuth para solicitar scopes adicionales:
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/calendar`

---

## 1.D - CAMBIAR "DASHBOARD" A "PANEL DE CONTROL"
**Estado:** 🔴 Pendiente
**Prioridad:** Media
**Ubicación:** Múltiples archivos

### Archivos a modificar:
- [ ] `src/pages/Dashboard.tsx` - Cambiar título h1
- [ ] `src/components/layout/Sidebar.tsx` - Cambiar label de "Dashboard" a "Panel de Control"
- [ ] `src/lib/constants.ts` - Actualizar constantes

---

## 1.E - SIDEBAR: TÍTULO Y LOGO
**Estado:** 🔴 Pendiente
**Prioridad:** Media
**Ubicación:** `src/components/layout/Sidebar.tsx`

### Problemas actuales:
1. Texto "VIBE CODE" se ve borroso (por gradiente + tamaño)
2. Cuando colapsa, no muestra nada (debería mostrar "V")
3. No está centrado

### Cambios:
```tsx
// Estado colapsado: mostrar solo "V" centrado
{collapsed ? (
  <span className="font-bold text-2xl text-emerald-500 mx-auto">V</span>
) : (
  <span className="font-bold text-xl text-center w-full">
    VIBE CODE <span className="text-emerald-500">ATS</span>
  </span>
)}
```

---

## 1.F - FORMULARIO DE BÚSQUEDA EXTENDIDO 🔴 CRÍTICO
**Estado:** 🔴 Pendiente
**Prioridad:** CRÍTICA
**Ubicación:** DB + `src/pages/SearchNew.tsx` + `src/pages/SearchDetail.tsx`

### Problema actual:
El formulario de creación de búsqueda solo recoge `titulo` y `descripcion`, pero **no recopila los requisitos específicos** que la IA necesita para calificar candidatos.

### Solución: Formulario extendido

#### Base de datos - Nuevas columnas en `busquedas`:
```sql
ALTER TABLE public.busquedas 
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS habilidades_requeridas TEXT[], -- Array de skills
ADD COLUMN IF NOT EXISTS experiencia_minima INTEGER, -- Años mínimos
ADD COLUMN IF NOT EXISTS experiencia_maxima INTEGER, -- Años máximos
ADD COLUMN IF NOT EXISTS modalidad TEXT, -- remoto, presencial, hibrido
ADD COLUMN IF NOT EXISTS ubicacion TEXT,
ADD COLUMN IF NOT EXISTS salario_min INTEGER,
ADD COLUMN IF NOT EXISTS salario_max INTEGER,
ADD COLUMN IF NOT EXISTS idiomas JSONB, -- {"ingles": "B2", "portugues": "A1"}
ADD COLUMN IF NOT EXISTS requisitos_excluyentes TEXT[], -- Red flags si no cumple
ADD COLUMN IF NOT EXISTS requisitos_deseables TEXT[]; -- Nice to have
```

#### Campos del formulario:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Título | Text | Nombre del puesto |
| Descripción | Textarea | Descripción detallada |
| Habilidades Técnicas | Tags/Chips | React, Node.js, Python, etc. |
| Experiencia | Range (min-max) | 2-5 años |
| Modalidad | Select | Remoto/Presencial/Híbrido |
| Ubicación | Text | Ciudad, País |
| Rango Salarial | Range (min-max) | Opcional |
| Idiomas | Multi-select + nivel | Inglés B2, Portugués A1 |
| Requisitos Excluyentes | Tags | Lo que DEBE tener |
| Requisitos Deseables | Tags | Nice to have |

#### Panel de Control de Búsqueda:
- [ ] Mostrar todos los requisitos en una sección "Perfil del Puesto"
- [ ] Permitir editar requisitos
- [ ] Mostrar match % de candidatos vs requisitos

---

## 1.G - CALIFICACIÓN IA CONTEXTUAL 🔴 CRÍTICO
**Estado:** 🔴 Pendiente
**Prioridad:** CRÍTICA
**Ubicación:** n8n Workflow + Prompt de IA

### Problema actual:
La IA califica CVs con un prompt **genérico y hardcodeado** para "Senior Frontend Developer". 
**NO usa los requisitos específicos de cada búsqueda.**

### Solución: IA Dinámica

#### Flujo mejorado:
```
1. Candidato sube CV en formulario n8n
   ↓
2. n8n obtiene requisitos de la búsqueda desde Supabase
   ↓
3. IA recibe: CV + Requisitos específicos
   ↓
4. IA califica basándose en ESA búsqueda específica
   ↓
5. Score + Resumen se guardan en ATS
```

#### Cambios en n8n:

**PASO 1 - Agregar nodo Supabase antes de la IA:**
```
Webhook Form → Supabase (Get búsqueda by ID) → Formatear Prompt → IA Califica → HTTP ATS
```

**PASO 2 - Prompt dinámico:**
```javascript
// En nodo Code: Construir prompt dinámico
const busqueda = $('Get Busqueda').first().json;
const cvText = $('PASA CV A TEXTO').first().json.text;

const prompt = `
<job_requirements>
Título: ${busqueda.titulo}
Descripción: ${busqueda.descripcion}
Habilidades requeridas: ${busqueda.habilidades_requeridas?.join(', ')}
Experiencia: ${busqueda.experiencia_minima}-${busqueda.experiencia_maxima} años
Modalidad: ${busqueda.modalidad}
Ubicación: ${busqueda.ubicacion}
Requisitos excluyentes: ${busqueda.requisitos_excluyentes?.join(', ')}
Requisitos deseables: ${busqueda.requisitos_deseables?.join(', ')}
</job_requirements>

<cv>
${cvText}
</cv>

Evalúa este CV según los requisitos del puesto...
`;

return [{ json: { prompt } }];
```

**PASO 3 - Scoring basado en requisitos:**
| Criterio | Peso |
|----------|------|
| Habilidades técnicas match | 40% |
| Experiencia en rango | 30% |
| Modalidad compatible | 15% |
| Idiomas requeridos | 10% |
| Requisitos deseables bonus | +5% extra |

#### Archivos a modificar:
- [ ] `migration_busquedas_extended.sql` - Agregar columnas
- [ ] `src/pages/SearchNew.tsx` - Formulario extendido
- [ ] `src/pages/SearchDetail.tsx` - Mostrar requisitos
- [ ] n8n: Agregar nodo Supabase para leer búsqueda
- [ ] n8n: Modificar prompt del agente IA

---

# 📋 FASE 2: ANÁLISIS DE OPTIMIZACIÓN

## 2.1 - RENDIMIENTO DEL FRONTEND

### ✅ Ya implementado:
- `useMemo` para filtrado de búsquedas
- Lazy loading de componentes heavy

### ⚠️ A optimizar:
| Área | Problema | Solución |
|------|----------|----------|
| Realtime | Múltiples subscripciones | Centralizar en context |
| Images | Sin lazy loading | Agregar `loading="lazy"` |
| Bundle | Sin code splitting | Usar `React.lazy()` para páginas |
| CSS | Estilos duplicados | Revisar y consolidar |

---

## 2.2 - RENDIMIENTO DEL BACKEND (Webhooks)

### ✅ Ya implementado:
- Service role key para bypass RLS
- Manejo de errores

### ⚠️ A optimizar:
| Área | Problema | Solución |
|------|----------|----------|
| Validación | Falta sanitización | Agregar validation con Zod |
| Rate Limiting | Sin protección | Agregar rate limits |
| Logging | Console.log básico | Implementar logging estructurado |
| Timeout | Sin manejo | Agregar timeout handling |

---

## 2.3 - BASE DE DATOS

### ✅ Ya implementado:
- RLS policies
- Índices básicos

### ⚠️ A optimizar:
```sql
-- Índices para mejorar queries frecuentes
CREATE INDEX IF NOT EXISTS idx_postulantes_busqueda 
ON postulantes(id_busqueda_n8n);

CREATE INDEX IF NOT EXISTS idx_postulantes_score 
ON postulantes(score_ia DESC);

CREATE INDEX IF NOT EXISTS idx_busquedas_user_created 
ON busquedas(user_id, created_at DESC);

-- Índice para favoritos
CREATE INDEX IF NOT EXISTS idx_busquedas_favorito 
ON busquedas(favorito, created_at DESC);
```

---

## 2.4 - FLUJO N8N → ATS

### ✅ Funcionando:
- Webhook recibe datos
- Guarda en Supabase
- Realtime actualiza dashboard

### ⚠️ A optimizar:
| Área | Mejora |
|------|--------|
| Retry | Agregar lógica de reintentos en n8n |
| Validación | Validar score_ia entre 0-100 |
| Duplicados | Verificar email duplicado antes de insertar |
| Notificaciones | Enviar notificación al recruiter cuando llega candidato |

---

## 2.5 - SEGURIDAD

### ✅ Ya implementado:
- RLS en todas las tablas
- Auth con Supabase

### ⚠️ A optimizar:
| Área | Acción |
|------|--------|
| Webhook | Agregar secret token para validación |
| CORS | Restringir orígenes permitidos |
| Rate Limit | Limitar requests por IP |
| Secrets | Rotar service role key periódicamente |

---

# 📋 FASE 3: FEATURES PENDIENTES

## 3.1 - Sistema de Entrevistas
- [ ] Integración completa con Google Calendar
- [ ] Generación de links de booking para candidatos
- [ ] Recordatorios automáticos por email

## 3.2 - Notificaciones
- [ ] Emails automáticos cuando llega candidato
- [ ] Notificaciones in-app con Supabase Realtime
- [ ] Recordatorios de entrevistas

## 3.3 - Reportes y Analytics
- [ ] Dashboard con métricas (candidatos/día, scores promedio)
- [ ] Exportar datos a CSV/Excel
- [ ] Gráficos de funnel de reclutamiento

---

# ⏱️ CRONOGRAMA SUGERIDO

| Fase | Duración | Prioridad |
|------|----------|-----------|
| 1.A - Filtro ordenamiento | 1h | Alta |
| 1.B - Favoritos | 1h | Alta |
| 1.C - Landing redesign | 2h | Alta |
| 1.D - Panel de Control | 30min | Media |
| 1.E - Sidebar fix | 30min | Media |
| 2.x - Optimizaciones | 2-3h | Media |
| 3.x - Features | TBD | Baja |

---

# 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Ejecutar migración** para agregar columna `favorito`
2. **Crear SortDropdown** componente
3. **Modificar Landing.tsx** con nuevo layout
4. **Actualizar Sidebar** con logo mejorado
5. **Cambiar textos** Dashboard → Panel de Control

---

**¿Comenzamos con la FASE 1?**
