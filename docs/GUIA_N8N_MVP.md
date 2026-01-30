# 📋 Guía de Configuración - n8n MVP 1.0

## 🎯 Objetivo

Configurar el workflow de n8n para que reciba datos desde VIBE CODE ATS y genere automáticamente publicaciones en LinkedIn.

---

## 📥 Payload que recibe el Webhook

El webhook de n8n recibe un POST con este JSON:

```json
{
  "id_busqueda": "uuid-de-la-busqueda",
  
  "empresa": "Nombre de la Empresa",
  "rubro": "Tecnología",
  "descripcion_empresa": "Descripción de la empresa...",
  
  "nombre_puesto": "Senior Frontend Developer",
  "descripcion_puesto": "Descripción del puesto...",
  
  "habilidades_tecnicas": ["React", "TypeScript", "Node.js"],
  "habilidades_blandas": ["Comunicación", "Liderazgo"],
  "experiencia_previa": "3-5 años",
  "nivel_formacion": "Universitario",
  
  "disponibilidad": "Full Time",
  "modalidad": "Remoto",
  "ubicacion": "Buenos Aires, Argentina",
  "idiomas": ["Inglés B2", "Portugués A1"],
  
  "extras": "Beneficios adicionales...",
  
  "application_url": "https://mi-primer-repo-seven.vercel.app/apply/uuid"
}
```

---

## 🔧 Configuración de Nodos

### 1. Webhook (Entrada)

- **HTTP Method:** POST
- **Path:** `68440768-004a-4aa8-9127-f3130b99d6ca`
- **Response Mode:** When Last Node Finishes

---

### 2. GENERA TEXTO (IA de Contenido)

**Modelo:** Google Gemini Chat Model

**Prompt actualizado:**

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

---

### 3. Code in JavaScript (Formateo)

```javascript
const textoCrudo = $input.first().json.output;

// Texto plano (para copiar y pegar)
const textoPlano = textoCrudo.replace(/\\n/g, '\n');

// Texto HTML (para el email)
const textoHTML = '<p>' + textoCrudo
  .replace(/\\n\\n/g, '</p><p>')
  .replace(/\\n/g, '<br>')
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') +
'</p>';

return [{
  textoPlano,
  textoHTML
}];
```

---

### 4. Code in JavaScript1 (Normalización para imagen)

```javascript
const input = $input.first().json;
const webhook = $('Webhook').first().json;

return [{
  json: {
    company_name: webhook.empresa,
    company_industry: webhook.rubro,
    job_title: webhook.nombre_puesto,
    location: webhook.ubicacion,
    work_mode: webhook.modalidad,
    application_url: webhook.application_url
  }
}];
```

---

### 5. Send a message (Gmail)

- **To:** camilo@metanoia.net.ar (o configurar dinámicamente)
- **Subject:** `URGENTE!!! Publicación de {{ $('Webhook').item.json.empresa }}, {{ $('Webhook').item.json.nombre_puesto }}`
- **Body:** `{{ $json.textoPlano }}`

---

### 6. GENERA PROMPT IMAGEN

**Prompt para generar el prompt de imagen:**

```
[IDENTITY & OBJECTIVE]
Eres un Director de Arte y Experto en Ingeniería de Prompts...

[INPUT DATA - JOB DETAILS]
Nombre Empresa: {{ $('Webhook').item.json.empresa }}
Rubro: {{ $('Webhook').item.json.rubro }}
Puesto (Título Principal): {{ $('Webhook').item.json.nombre_puesto }}
Ubicación: {{ $('Webhook').item.json.ubicacion }}
Modalidad: {{ $('Webhook').item.json.modalidad }}

[GENERAR AHORA]
...
```

---

### 7. PUBLICACION (Generación de Imagen)

- **Resource:** Image
- **Model:** gemini-3-pro-image-preview
- **Prompt:** `={{ $json.output }}`

---

### 8. POSTEA IMAGEN + LINK (LinkedIn)

- **Post As:** Organization
- **Organization:** (ID de tu organización en LinkedIn)
- **Text:** `={{ $('Code in JavaScript').item.json.textoPlano }}`
- **Share Media Category:** IMAGE

---

## 🔗 Conexiones entre nodos

```
Webhook
    │
    ▼
GENERA TEXTO ◄── Google Gemini Chat Model
    │
    ▼
Code in JavaScript
    │
    ▼
Send a message (Gmail)
    │
    ▼
GENERA PROMPT IMAGEN ◄── Google Gemini Chat Model3
    │
    ▼
PUBLICACION (Generate Image)
    │
    ▼
POSTEA IMAGEN + LINK (LinkedIn)
```

---

## ⚠️ Notas Importantes

1. **Activar el workflow** después de configurar
2. **Verificar credenciales** de Gmail, LinkedIn y Gemini
3. **Probar con webhook test** antes de producción
4. La URL del webhook debe coincidir con `VITE_N8N_MVP_WEBHOOK_URL`

---

## 🧪 Testing

Para probar el webhook manualmente:

```bash
curl -X POST https://n8n.metanoian8n.com/webhook/68440768-004a-4aa8-9127-f3130b99d6ca \
  -H "Content-Type: application/json" \
  -d '{
    "id_busqueda": "test-123",
    "empresa": "Test Company",
    "rubro": "Tecnología",
    "descripcion_empresa": "Empresa de testing",
    "nombre_puesto": "Developer Test",
    "descripcion_puesto": "Testing position",
    "habilidades_tecnicas": ["React", "Node"],
    "habilidades_blandas": ["Comunicación"],
    "experiencia_previa": "2-4 años",
    "nivel_formacion": "Universitario",
    "disponibilidad": "Full Time",
    "modalidad": "Remoto",
    "ubicacion": "Argentina",
    "idiomas": ["Español Nativo"],
    "extras": "",
    "application_url": "https://example.com/apply/test-123"
  }'
```
