# 🚀 VIBE CODE ATS - Arquitectura Profesional MVP 1.0

## 📊 Visión General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VIBE CODE ATS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│   │   LANDING   │───▶│  DASHBOARD  │───▶│  CREAR      │───▶│   WEBHOOK   │  │
│   │    PAGE     │    │   PANEL     │    │  BÚSQUEDA   │    │   A n8n     │  │
│   └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘  │
│                                                                    │         │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │         │
│   │  CANDIDATO  │◀───│  LINKEDIN   │◀───│    n8n      │◀───────────┘         │
│   │   POSTULA   │    │    POST     │    │  WORKFLOW   │                      │
│   └──────┬──────┘    └─────────────┘    └─────────────┘                      │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐    ┌─────────────┐                                         │
│   │  SUPABASE   │───▶│  RECLUTADOR │                                         │
│   │  STORAGE    │    │    REVISA   │                                         │
│   └─────────────┘    └─────────────┘                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo Detallado

### FASE 1: Creación de Búsqueda (VIBE CODE ATS)

```
Usuario (Reclutador)
        │
        ▼
┌───────────────────┐
│  /search/new      │
│  Formulario 3     │
│  pasos            │
├───────────────────┤
│ Paso 1: Info Emp. │
│ Paso 2: Requisitos│
│ Paso 3: Detalles  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Guardar en       │
│  Supabase         │
│  (tabla busquedas)│
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  POST Webhook     │
│  a n8n MVP 1.0    │
└───────────────────┘
```

### FASE 2: Generación de Publicación (n8n)

```
┌───────────────────────────────────────────────────────────────────┐
│                         n8n MVP 1.0                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Webhook                                                         │
│      │                                                            │
│      ▼                                                            │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │ GENERA TEXTO (Gemini AI)                                │    │
│   │ - Analiza datos de la empresa                           │    │
│   │ - Crea texto de LinkedIn atractivo                      │    │
│   │ - Incluye link de postulación                           │    │
│   └────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │ Code in JavaScript                                      │    │
│   │ - Formatea texto plano                                  │    │
│   │ - Genera versión HTML                                   │    │
│   └────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │ Send a message (Gmail)                                  │    │
│   │ - Notifica al reclutador                                │    │
│   └────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │ GENERA PROMPT IMAGEN (Gemini AI)                        │    │
│   │ - Analiza el flyer de referencia                        │    │
│   │ - Genera prompt para crear imagen                       │    │
│   └────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │ PUBLICACION (Gemini Image)                              │    │
│   │ - Genera imagen del flyer                               │    │
│   └────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │ POSTEA IMAGEN + LINK (LinkedIn API)                     │    │
│   │ - Publica en LinkedIn de la empresa                     │    │
│   └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### FASE 3: Postulación de Candidatos (VIBE CODE ATS)

```
Candidato ve post en LinkedIn
        │
        ▼
┌───────────────────┐
│  /apply/:jobId    │
│  Formulario       │
│  nativo           │
├───────────────────┤
│ - Nombre          │
│ - Email           │
│ - Teléfono        │
│ - LinkedIn        │
│ - CV (Upload)     │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Supabase Storage │
│  (bucket: cvs)    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  tabla postulantes│
│  con referencia   │
│  a CV             │
└───────────────────┘
```

---

## 📦 Payload del Webhook (VIBE CODE → n8n)

```typescript
interface WebhookPayload {
  // Identificadores
  id_busqueda: string;           // UUID único de la búsqueda
  user_id?: string;              // ID del usuario que crea (futuro auth)
  
  // Datos de la Empresa
  empresa: string;               // "NOMBRE DE LA EMPRESA"
  rubro: string;                 // "RUBRO DE LA EMPRESA"
  descripcion_empresa: string;   // "DESCRIPCIÓN DE LA EMPRESA"
  
  // Datos del Puesto
  nombre_puesto: string;         // Título del puesto
  descripcion_puesto: string;    // "DESCRIBA EL PUESTO"
  
  // Requisitos Técnicos
  habilidades_tecnicas: string[];  // Array de skills técnicas
  habilidades_blandas: string[];   // Array de soft skills
  experiencia_previa: string;      // "0-2 años", "3-5 años", etc.
  nivel_formacion: string;         // "Secundario", "Universitario", etc.
  
  // Condiciones Laborales
  disponibilidad: string;        // "Full Time", "Part Time", etc.
  modalidad: string;             // "Presencial", "Remoto", "Híbrido"
  ubicacion: string;             // Ciudad/País
  idiomas: string[];             // ["Inglés B2", "Portugués A1"]
  
  // Extras
  extras: string;                // Beneficios, notas adicionales
  
  // URL de Postulación (generado por VIBE CODE)
  application_url: string;       // https://vibe-code.app/apply/{id}
  
  // Flyer de Referencia (opcional - URL de imagen)
  flyer_url?: string;            // URL de imagen para generar flyer
}
```

---

## 🛠️ Implementación en VIBE CODE ATS

### 1. Función para enviar al Webhook

```typescript
// src/lib/n8nWebhook.ts

const N8N_WEBHOOK_URL = 'https://n8n.metanoian8n.com/webhook/68440768-004a-4aa8-9127-f3130b99d6ca';

export interface SearchPayload {
  id_busqueda: string;
  empresa: string;
  rubro: string;
  descripcion_empresa: string;
  nombre_puesto: string;
  descripcion_puesto: string;
  habilidades_tecnicas: string[];
  habilidades_blandas: string[];
  experiencia_previa: string;
  nivel_formacion: string;
  disponibilidad: string;
  modalidad: string;
  ubicacion: string;
  idiomas: string[];
  extras: string;
  application_url: string;
  flyer_url?: string;
}

export async function triggerN8nWorkflow(payload: SearchPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error triggering n8n workflow:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}
```

### 2. Integración en SearchNew.tsx

```typescript
// En handleSubmit, después de guardar en Supabase:

// Disparar workflow de n8n
const webhookPayload: SearchPayload = {
  id_busqueda: data.id_busqueda_n8n,
  empresa: formData.empresa,
  rubro: formData.rubro || 'Tecnología',
  descripcion_empresa: formData.descripcion_empresa || '',
  nombre_puesto: formData.titulo,
  descripcion_puesto: formData.descripcion || formData.titulo,
  habilidades_tecnicas: formData.habilidades_requeridas,
  habilidades_blandas: formData.habilidades_blandas || [],
  experiencia_previa: `${formData.experiencia_minima}-${formData.experiencia_maxima} años`,
  nivel_formacion: formData.nivel_formacion || 'Cualquiera',
  disponibilidad: formData.disponibilidad || 'Full Time',
  modalidad: formData.modalidad || 'Cualquiera',
  ubicacion: formData.ubicacion || '',
  idiomas: formData.idiomas || [],
  extras: formData.extras || '',
  application_url: `${window.location.origin}/apply/${data.id_busqueda_n8n}`,
  flyer_url: formData.flyer_url, // Si subieron un flyer
};

const webhookResult = await triggerN8nWorkflow(webhookPayload);
if (!webhookResult.success) {
  console.warn('Webhook failed, but search was saved:', webhookResult.error);
  // No bloqueamos el flujo si el webhook falla
}
```

---

## 🔧 Configuración de n8n MVP 1.0

### Nodo Webhook - Datos esperados:

El webhook recibe un POST con el payload JSON descrito arriba.

### Nodo GENERA TEXTO - Prompt actualizado:

```
[IDENTITY & OBJECTIVE]
Eres un Senior Talent Acquisition Specialist y experto en Employer Branding...

[INPUT DATA]
DATOS DE LA EMPRESA:
Nombre Empresa: {{ $json.empresa }}
Rubro: {{ $json.rubro }}
Descripción Empresa: {{ $json.descripcion_empresa }}

DATOS DEL PUESTO:
Puesto: {{ $json.nombre_puesto }}
Descripción: {{ $json.descripcion_puesto }}
Habilidades Técnicas: {{ $json.habilidades_tecnicas.join(', ') }}
Habilidades Blandas: {{ $json.habilidades_blandas.join(', ') }}
Experiencia: {{ $json.experiencia_previa }}
Nivel Formación: {{ $json.nivel_formacion }}
Disponibilidad: {{ $json.disponibilidad }}
Modalidad: {{ $json.modalidad }}
Ubicación: {{ $json.ubicacion }}
Idiomas: {{ $json.idiomas.join(', ') }}
Extras: {{ $json.extras }}

LINK FORMULARIO (Mandatorio): {{ $json.application_url }}

[GENERAR AHORA]
...
```

### Nodo Code in JavaScript1 - Normalización:

```javascript
const input = $input.first().json;

return [{
  json: {
    company_name: input.empresa,
    company_industry: input.rubro,
    job_title: input.nombre_puesto,
    location: input.ubicacion,
    work_mode: input.modalidad,
    application_url: input.application_url
  }
}];
```

---

## 📋 Checklist de Implementación

### VIBE CODE ATS:
- [ ] Crear `src/lib/n8nWebhook.ts`
- [ ] Actualizar `SearchNew.tsx` para disparar webhook
- [ ] Agregar campo para subir flyer de referencia
- [ ] Agregar campo descripción de empresa
- [ ] Agregar campo rubro de empresa

### Supabase:
- [ ] Ejecutar `migration_storage_cvs.sql`
- [ ] Agregar campos a tabla `busquedas`:
  - `rubro TEXT`
  - `descripcion_empresa TEXT`
  - `flyer_url TEXT`

### n8n:
- [ ] Importar MVP 1.0.json
- [ ] Actualizar prompts con nuevas variables
- [ ] Configurar credenciales (Gmail, LinkedIn, Gemini)
- [ ] Activar workflow

---

## 🔒 Consideraciones de Seguridad

1. **Rate Limiting**: Implementar límite de requests al webhook
2. **Validación**: Validar payload antes de enviar
3. **Retry Logic**: Reintentar si el webhook falla
4. **Logs**: Guardar logs de cada webhook enviado

---

## 📈 Métricas a Trackear

1. **Búsquedas creadas** por día/semana
2. **Webhooks exitosos** vs fallidos
3. **Posts publicados** en LinkedIn
4. **Candidatos** que postulan por búsqueda
5. **Tiempo promedio** de generación de contenido

---

## 🚀 Próximos Pasos (Roadmap)

1. **Fase 1 (Actual)**: MVP funcionando
2. **Fase 2**: Autenticación de usuarios
3. **Fase 3**: Multi-organización
4. **Fase 4**: Analytics y reportes
5. **Fase 5**: Integración con ATS externos

