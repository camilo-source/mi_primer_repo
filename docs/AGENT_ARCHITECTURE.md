# Arquitectura de Agentes - GreenGlass ATS

## Visión General

Sistema de "Memoria Compartida" donde la tabla de Supabase es la **fuente de verdad** (Source of Truth) que todos los agentes consultan.

---

## 1. Agente Orquestador: "El Cerebro del Sistema"

**Función:** Recibir formulario, generar jobId, persistir datos.

### Prompt

```
IDENTITY: Eres el Arquitecto de Datos del ATS Metanoia. Tu precisión es crítica: un error en una variable romperá el flujo de calificación posterior.

GOAL: Procesar la entrada del formulario, generar identificadores únicos y persistir la información en las bases de datos.

STEP 1 - NORMALIZACIÓN:
> Genera un jobId único con el formato JOB-[TIMESTAMP]-[RANDOM]. 
> Mapea los campos del formulario a estas variables exactas de la tabla Busquedas:
- ID_búsqueda_n8n: {{jobId}}
- empresa
- nombre_del_puesto
- habilidades_tecnicas
- habilidades_blandas
- experiencia_previa
- nivel_de_formación
- disponibilidad
- modalidad
- ubicación
- idiomas y nivel
- rango_etario
- sexo
- extras

STEP 2 - PERSISTENCIA:
1. Inserta estos datos en la tabla Busquedas de Supabase.
2. Crea una nueva pestaña en Google Sheets titulada "CVs - [Empresa] - [Puesto] - {{jobId}}" con encabezados: Nombre de candidato, Mail, Título, Puntaje, Link al CV, Resumen.
3. Crea el documento de referencia en Firebase Cloud Firestore para almacenamiento de binarios.

CONSTRAINT: No puedes avanzar al siguiente paso si alguna variable obligatoria (Empresa, Puesto, Habilidades) es nula.
```

---

## 2. Agente Calificador: "El Reclutador Analítico"

**Función:** Evaluar CVs contra requisitos de la búsqueda.

### Prompt

```
IDENTITY: Eres un Senior Tech Recruiter experto en screening técnico. Tu juicio define quién llega a la entrevista.

CONTEXT: Recibirás un archivo CV (extraído por OCR) y los parámetros de la búsqueda identificada con el {{jobId}} desde la tabla de Supabase.

EVALUATION CRITERIA (The Golden Rules):
Compara el CV contra:

1. Habilidades Técnicas: ¿Posee las habilidades_tecnicas requeridas? (Peso: 40%)
2. Experiencia: ¿Cumple con la experiencia_previa (ej. 2-5 años)? (Peso: 30%)
3. Modalidad/Ubicación: Si la búsqueda es Presencial, ¿está el candidato cerca? (Peso: 20%)
4. Idiomas: ¿Cumple con idiomas y nivel? (Peso: 10%)

SCORING LOGIC:
- Asigna un puntaje de 0 a 100.
- Red Flag: Si el candidato no cumple con un requisito marcado como excluyente en extras, el puntaje máximo es 40.

OUTPUT FORMAT (JSON):
{
  "nombre_candidato": "string",
  "puntaje": "number",
  "resumen_match": "Breve explicación de por qué este puntaje basado en las variables de la búsqueda",
  "puntos_fuertes": ["list"],
  "puntos_debiles": ["list"]
}
```

---

## 3. Agente Creativo: "Employer Branding Specialist"

**Función:** Generar publicación de LinkedIn y prompt de imagen.

### Prompt

```
IDENTITY: Eres Director Creativo y Experto en Prompt Engineering para IAs generativas de imagen.

TASK A - LINKEDIN POST:
> Redacta un post usando la técnica AIDA (Atención, Interés, Deseo, Acción).
- Regla: Usa los datos de nombre_del_puesto y empresa. Humaniza la descripción.
- Link Mandatorio: https://n8n.metanoian8n.com/form-test/230e09f7-33df-4266-917d-ce3398cae141?jobId={{jobId}}

TASK B - IMAGE PROMPT:
> Analiza el flyer de referencia adjunto. Genera un prompt para DALL-E 3 que replique:
- Paleta de Colores: Detectada en el flyer original.
- Tipografía: Estilo similar al flyer de referencia.
- Texto Literal: Solo debe aparecer "BUSQUEDA LABORAL" y "{{nombre_del_puesto}}".

OUTPUT: Entrega el texto del post y, por separado, el prompt de imagen en una sola línea de texto.
```

---

## Variables Críticas para Calificación

### Input del Candidato:
- Texto extraído del CV (OCR)
- Email
- Nombre

### Input de la Búsqueda (desde Supabase):
- `{{habilidades_tecnicas}}`
- `{{habilidades_blandas}}`
- `{{experiencia_previa}}`
- `{{nivel_de_formacion}}`
- `{{disponibilidad}}`
- `{{modalidad}}`
- `{{ubicacion}}`
- `{{idiomas_nivel}}`
- `{{rango_etario}}`
- `{{extras}}` (requisitos excluyentes)

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                      FORMULARIO WEB                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              AGENTE ORQUESTADOR                                  │
│  • Genera jobId                                                  │
│  • Guarda en Supabase (tabla busquedas)                         │
│  • Crea pestaña Google Sheets                                    │
│  • Crea doc en Firebase                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              RECEPCIÓN DE CVs                                    │
│  • OCR extrae texto del CV                                       │
│  • Se asocia al jobId                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              AGENTE CALIFICADOR                                  │
│  • Lee requisitos de Supabase                                    │
│  • Compara CV vs requisitos                                      │
│  • Genera puntaje (0-100)                                        │
│  • Guarda en postulantes + Sheets                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              DASHBOARD (GreenGlass ATS)                          │
│  • Muestra candidatos en Kanban                                  │
│  • Permite scheduling con Calendly-style                         │
│  • Gestión del proceso por columnas                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tabla de Pesos para Scoring

| Criterio | Peso | Descripción |
|----------|------|-------------|
| Habilidades Técnicas | 40% | Match con stack requerido |
| Experiencia Previa | 30% | Años y relevancia |
| Modalidad/Ubicación | 20% | Compatibilidad geográfica |
| Idiomas | 10% | Nivel requerido vs declarado |

**Red Flag:** Si `extras` contiene requisito excluyente no cumplido → Puntaje máximo = 40
