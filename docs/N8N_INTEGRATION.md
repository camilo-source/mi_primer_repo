# 🔗 INTEGRACIÓN N8N CON VIBE CODE ATS

## 📋 **RESUMEN**

Este documento explica cómo conectar n8n con VIBE CODE ATS para que los candidatos procesados por IA lleguen automáticamente a la base de datos.

---

## 🎯 **ENDPOINT API**

### **URL del Webhook:**
```
POST https://tu-dominio.vercel.app/api/n8n/webhook
```

### **Headers requeridos:**
```json
{
  "Content-Type": "application/json"
}
```

### **Body esperado:**
```json
{
  "id_busqueda_n8n": "uuid-de-la-busqueda",
  "candidatos": [
    {
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "telefono": "+54 11 1234-5678",
      "linkedin": "https://linkedin.com/in/juanperez",
      "cv_url": "https://storage.com/cv.pdf",
      "resumen_ia": "Desarrollador Full Stack con 5 años de experiencia...",
      "score_ia": 85,
      "habilidades": ["React", "Node.js", "TypeScript"],
      "experiencia_anos": 5,
      "ubicacion": "Buenos Aires, Argentina"
    }
  ]
}
```

---

## 🔧 **CONFIGURACIÓN EN N8N**

### **Paso 1: Crear el Workflow**

1. Abrí n8n
2. Creá un nuevo workflow
3. Nombralo: **"VIBE CODE ATS - Procesar Candidatos"**

---

### **Paso 2: Agregar Nodos**

#### **Nodo 1: Webhook Trigger** (Opcional - si querés iniciar desde n8n)
```
Tipo: Webhook
Método: POST
Path: /start-processing
```

#### **Nodo 2: HTTP Request - Obtener Búsqueda**
```
Tipo: HTTP Request
Método: GET
URL: https://tu-dominio.vercel.app/api/searches/{{ $json.search_id }}
Authentication: None
```

#### **Nodo 3: Procesar CVs con IA** (Tu lógica actual)
```
Tipo: OpenAI / Anthropic / Custom
Prompt: "Analiza este CV y extrae..."
```

#### **Nodo 4: Formatear Datos**
```
Tipo: Code (JavaScript)
Código:
```

```javascript
// Formatear candidatos para VIBE CODE ATS
const candidatos = [];

for (const item of $input.all()) {
  candidatos.push({
    nombre: item.json.nombre || "Sin nombre",
    email: item.json.email || "sin-email@example.com",
    telefono: item.json.telefono || null,
    linkedin: item.json.linkedin || null,
    cv_url: item.json.cv_url || null,
    resumen_ia: item.json.resumen || null,
    score_ia: item.json.score || 0,
    habilidades: item.json.habilidades || [],
    experiencia_anos: item.json.experiencia || 0,
    ubicacion: item.json.ubicacion || null
  });
}

return [{
  json: {
    id_busqueda_n8n: $('Webhook Trigger').item.json.search_id,
    candidatos: candidatos
  }
}];
```

#### **Nodo 5: HTTP Request - Enviar a VIBE CODE ATS** ⭐
```
Tipo: HTTP Request
Método: POST
URL: https://tu-dominio.vercel.app/api/n8n/webhook
Headers:
  Content-Type: application/json
Body:
  {{ $json }}
```

---

## 📊 **EJEMPLO COMPLETO DE WORKFLOW N8N**

```
┌─────────────────┐
│  Webhook/Cron   │ (Trigger)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Get Search     │ (HTTP Request)
│  from VIBE CODE │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Read CVs       │ (Google Drive/Email/etc)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Process with   │ (OpenAI/Anthropic)
│  AI             │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Format Data    │ (Code Node)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send to        │ (HTTP Request)
│  VIBE CODE ATS  │ ⭐ ESTE ES EL IMPORTANTE
└─────────────────┘
```

---

## 🎨 **CÓDIGO DEL NODO HTTP REQUEST FINAL**

### **Configuración del Nodo:**

```json
{
  "name": "Enviar a VIBE CODE ATS",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.1,
  "position": [1200, 300],
  "parameters": {
    "method": "POST",
    "url": "https://tu-dominio.vercel.app/api/n8n/webhook",
    "authentication": "none",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": []
    },
    "options": {
      "response": {
        "response": {
          "responseFormat": "json"
        }
      }
    },
    "jsonBody": "={{ $json }}"
  }
}
```

---

## 🧪 **TESTING**

### **Opción 1: Usar Postman/Insomnia**

```bash
POST https://tu-dominio.vercel.app/api/n8n/webhook
Content-Type: application/json

{
  "id_busqueda_n8n": "tu-uuid-aqui",
  "candidatos": [
    {
      "nombre": "Test User",
      "email": "test@example.com",
      "score_ia": 90,
      "habilidades": ["JavaScript", "React"]
    }
  ]
}
```

### **Opción 2: Usar curl**

```bash
curl -X POST https://tu-dominio.vercel.app/api/n8n/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id_busqueda_n8n": "tu-uuid-aqui",
    "candidatos": [
      {
        "nombre": "Test User",
        "email": "test@example.com",
        "score_ia": 90,
        "habilidades": ["JavaScript", "React"]
      }
    ]
  }'
```

### **Opción 3: Desde n8n**

1. Agregá un nodo **"Execute Workflow Trigger"**
2. Hacé click en **"Test workflow"**
3. Verificá la respuesta

---

## ✅ **RESPUESTAS DEL API**

### **Éxito (200):**
```json
{
  "success": true,
  "message": "3 candidatos procesados exitosamente",
  "data": {
    "busqueda_id": "uuid-de-la-busqueda",
    "busqueda_titulo": "Desarrollador Full Stack",
    "candidatos_insertados": 3,
    "candidatos": [
      {
        "id": 1,
        "nombre": "Juan Pérez",
        "email": "juan@example.com",
        "score": 85
      }
    ]
  }
}
```

### **Error - Búsqueda no encontrada (404):**
```json
{
  "success": false,
  "error": "Búsqueda no encontrada: uuid-invalido"
}
```

### **Error - Datos inválidos (400):**
```json
{
  "success": false,
  "error": "Falta id_busqueda_n8n"
}
```

### **Error - Servidor (500):**
```json
{
  "success": false,
  "error": "Error interno del servidor",
  "details": "mensaje de error detallado"
}
```

---

## 🔐 **SEGURIDAD (OPCIONAL)**

Si querés agregar autenticación al webhook:

### **Opción 1: API Key**

Agregá en el header:
```
X-API-Key: tu-clave-secreta
```

### **Opción 2: Bearer Token**

```
Authorization: Bearer tu-token-jwt
```

### **Implementación:**

Modificá `api/n8n/webhook.ts`:

```typescript
// Al inicio del handler
const apiKey = req.headers['x-api-key'];
if (apiKey !== process.env.N8N_API_KEY) {
  return res.status(401).json({
    success: false,
    error: 'No autorizado'
  });
}
```

Y agregá en `.env`:
```
N8N_API_KEY=tu-clave-super-secreta
```

---

## 📝 **CAMPOS DE CANDIDATO**

### **Campos Requeridos:**
- ✅ `nombre` (string)
- ✅ `email` (string)

### **Campos Opcionales:**
- `telefono` (string)
- `linkedin` (string - URL)
- `cv_url` (string - URL)
- `resumen_ia` (string - texto largo)
- `score_ia` (number - 0-100)
- `habilidades` (array de strings)
- `experiencia_anos` (number)
- `ubicacion` (string)

---

## 🚀 **FLUJO COMPLETO**

1. **Usuario crea búsqueda** en VIBE CODE ATS
2. **Se genera `id_busqueda_n8n`** (UUID)
3. **n8n recibe el ID** (puede ser vía webhook o manualmente)
4. **n8n procesa CVs** con IA
5. **n8n formatea datos** según el schema
6. **n8n envía POST** a `/api/n8n/webhook`
7. **API valida datos** y búsqueda
8. **API inserta candidatos** en Supabase
9. **API actualiza estado** de búsqueda a "activa"
10. **Usuario ve candidatos** en el dashboard ✨

---

## 🎯 **PRÓXIMOS PASOS**

1. ✅ Deployar el endpoint (ya está en `/api/n8n/webhook.ts`)
2. ⚙️ Configurar workflow en n8n
3. 🧪 Testear con datos de prueba
4. 🚀 Activar en producción
5. 📊 Monitorear logs

---

## 📞 **SOPORTE**

Si tenés problemas:

1. Verificá los logs en Vercel
2. Verificá que el `id_busqueda_n8n` existe en la DB
3. Verificá el formato del JSON
4. Verificá que Supabase esté accesible

---

**¡Listo para conectar n8n con VIBE CODE ATS!** 🎉

---

**Creado con ❤️ para VIBE CODE ATS**
