# 🎯 CONEXIÓN ESPECÍFICA PARA TU POC 2.0 B

## 📸 **ANÁLISIS DE TU WORKFLOW**

Según la imagen que compartiste, tu workflow tiene:

```
1. FORM PARA CARGAR CV
2. Create a row (Google Sheets)
3. PASAR CV A TEXTO (Anthropic)
4. CALIFICAR BÚSQUEDA (Anthropic)
5. Gemini 2.5 Flash Lite
6. JSON Output Parser
7. Webhook Trigger
8. Formatear Datos
9. Enviar a VIBE CODE ATS
10. Respond to Webhook
```

---

## ✅ **PUNTO DE CONEXIÓN EXACTO**

### **NODO DE ORIGEN:**
```
"JSON Output Parser"
```
Este es el **ÚLTIMO NODO** de tu procesamiento de IA.

### **CONEXIÓN:**

```
┌──────────────────────────┐
│  JSON Output Parser      │
│                          │
│  ●  ●  ●  ●  ●  ●  ●  ●  │ ← Círculos de salida
└──────────────────────────┘
                        ↑
                        │
                 USAR ESTE (derecha)
                        │
                        │
                        ▼
┌──────────────────────────┐
│  ●  ●  ●  ●  ●  ●  ●  ●  │ ← Círculos de entrada
│                          │
│  Formatear Datos         │
│  (NUEVO - Code Node)     │
└──────────────────────────┘
  ↑
  │
CONECTAR AQUÍ (izquierda)
```

---

## 🔧 **PASOS EXACTOS**

### **PASO 1: Agregar nodo "Code"**

1. Click en el canvas (área vacía)
2. Buscar **"Code"**
3. Arrastrarlo a la **DERECHA** de "JSON Output Parser"
4. Nombrarlo: **"Formatear Datos"**

### **PASO 2: Configurar el nodo Code**

Copiar este código en el nodo:

```javascript
// 🎯 FORMATEAR DATOS PARA VIBE CODE ATS

const candidatos = [];

// Iterar sobre todos los candidatos procesados
for (const item of $input.all()) {
  const data = item.json;
  
  // AJUSTAR según los campos que devuelve tu JSON Output Parser
  candidatos.push({
    // REQUERIDOS
    nombre: data.nombre || data.name || data.candidato || "Sin nombre",
    email: data.email || data.correo || "sin-email@example.com",
    
    // OPCIONALES - Ajustar según tu output
    telefono: data.telefono || data.phone || null,
    linkedin: data.linkedin || data.linkedin_url || null,
    cv_url: data.cv_url || data.resume_url || null,
    
    // DATOS DE IA (de Anthropic/Gemini)
    resumen_ia: data.resumen || data.summary || data.analisis || null,
    score_ia: parseInt(data.score) || parseInt(data.calificacion) || parseInt(data.puntuacion) || 0,
    
    // HABILIDADES
    habilidades: Array.isArray(data.habilidades) 
      ? data.habilidades 
      : Array.isArray(data.skills)
      ? data.skills
      : (data.tecnologias || "").split(',').map(s => s.trim()).filter(Boolean),
    
    // EXPERIENCIA
    experiencia_anos: parseInt(data.experiencia) || parseInt(data.years) || 0,
    
    // UBICACIÓN
    ubicacion: data.ubicacion || data.location || data.ciudad || null
  });
}

// IMPORTANTE: Obtener el ID de la búsqueda
// OPCIÓN 1: Si viene del Webhook Trigger
const searchId = $('Webhook Trigger').first().json.search_id || $('Webhook Trigger').first().json.id_busqueda_n8n;

// OPCIÓN 2: Para testing, usar un UUID real de tu DB
// const searchId = "PEGAR-UUID-AQUI";

return [{
  json: {
    id_busqueda_n8n: searchId,
    candidatos: candidatos
  }
}];
```

### **PASO 3: Conectar "JSON Output Parser" con "Formatear Datos"**

1. **Click** en el círculo de salida **DERECHO** de "JSON Output Parser"
2. **Arrastrá** hasta el círculo de entrada **IZQUIERDO** de "Formatear Datos"
3. **Soltá**

✅ Deberías ver una línea conectándolos

---

### **PASO 4: Agregar nodo "HTTP Request"**

1. Click en el canvas
2. Buscar **"HTTP Request"**
3. Arrastrarlo a la **DERECHA** de "Formatear Datos"
4. Nombrarlo: **"Enviar a VIBE CODE ATS"**

### **PASO 5: Configurar HTTP Request**

**Authentication:** None

**Method:** POST

**URL:**
```
https://tu-dominio.vercel.app/api/n8n/webhook
```
⚠️ Reemplazar con tu dominio real de Vercel

**Send Headers:** ✅ Activar

**Headers:**
```
Name: Content-Type
Value: application/json
```

**Send Body:** ✅ Activar

**Body Content Type:** JSON

**JSON:**
```
={{ $json }}
```

### **PASO 6: Conectar "Formatear Datos" con "Enviar a VIBE CODE ATS"**

1. **Click** en el círculo de salida **DERECHO** de "Formatear Datos"
2. **Arrastrá** hasta el círculo de entrada **IZQUIERDO** de "Enviar a VIBE CODE ATS"
3. **Soltá**

✅ Deberías ver la conexión

---

### **PASO 7: (Opcional) Conectar con "Respond to Webhook"**

Si ya tenés un nodo "Respond to Webhook":

1. **Click** en el círculo de salida **DERECHO** de "Enviar a VIBE CODE ATS"
2. **Arrastrá** hasta el círculo de entrada **IZQUIERDO** de "Respond to Webhook"
3. **Soltá**

Si no lo tenés, agregalo:
1. Buscar **"Respond to Webhook"**
2. Arrastrarlo a la derecha
3. Conectarlo

---

## 🎨 **DIAGRAMA COMPLETO DE TU WORKFLOW**

```
TU POC 2.0 B ACTUAL                    NUEVOS NODOS
═══════════════════                    ════════════

┌─────────────────┐
│ FORM PARA       │
│ CARGAR CV       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create a row    │
│ (Google Sheets) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PASAR CV A      │
│ TEXTO           │
│ (Anthropic)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ CALIFICAR       │
│ BÚSQUEDA        │
│ (Anthropic)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gemini 2.5      │
│ Flash Lite      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ JSON Output     │
│ Parser          │ ●─────────────┐
└─────────────────┘               │
                                  │
                                  │ NUEVA CONEXIÓN
                                  │
                                  ▼
                        ┌─────────────────┐
                        │ Formatear       │
                        │ Datos           │
                        │ (Code)          │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Enviar a        │
                        │ VIBE CODE ATS   │
                        │ (HTTP Request)  │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Respond to      │
                        │ Webhook         │
                        └─────────────────┘
```

---

## 🧪 **TESTING**

### **PASO 1: Obtener ID de búsqueda**

1. Ir a VIBE CODE ATS
2. Crear una búsqueda de prueba
3. Copiar el `id_busqueda_n8n` (UUID)

### **PASO 2: Configurar en el nodo Code**

En el nodo "Formatear Datos", reemplazar:

```javascript
// De esto:
const searchId = $('Webhook Trigger').first().json.search_id;

// A esto (para testing):
const searchId = "PEGAR-TU-UUID-AQUI";
```

### **PASO 3: Ejecutar test**

1. Click en **"Execute Workflow"**
2. Verificar que todos los nodos se ejecuten ✅
3. Ver la respuesta del nodo "Enviar a VIBE CODE ATS"

Deberías ver algo como:

```json
{
  "success": true,
  "message": "1 candidatos procesados exitosamente",
  "data": {
    "busqueda_id": "tu-uuid",
    "candidatos_insertados": 1
  }
}
```

### **PASO 4: Verificar en VIBE CODE ATS**

1. Abrir el dashboard
2. Buscar la búsqueda que creaste
3. ¡Deberías ver el candidato insertado! ✨

---

## ⚠️ **IMPORTANTE**

### **Mapeo de campos:**

El nodo "JSON Output Parser" devuelve ciertos campos. Necesitás ajustar el código del nodo "Formatear Datos" para que coincidan.

**Ejemplo:**

Si tu JSON Output Parser devuelve:
```json
{
  "candidato_nombre": "Juan Pérez",
  "candidato_email": "juan@example.com",
  "puntuacion_final": 85
}
```

Entonces en el nodo Code, ajustá:
```javascript
nombre: data.candidato_nombre || "Sin nombre",
email: data.candidato_email || "sin-email@example.com",
score_ia: parseInt(data.puntuacion_final) || 0,
```

---

## 📝 **CHECKLIST**

- [ ] ✅ Nodo "Formatear Datos" agregado
- [ ] ✅ Código copiado y ajustado
- [ ] ✅ Nodo "Enviar a VIBE CODE ATS" agregado
- [ ] ✅ URL configurada con tu dominio
- [ ] ✅ Headers configurados
- [ ] ✅ Conexión: JSON Output Parser → Formatear Datos
- [ ] ✅ Conexión: Formatear Datos → Enviar a VIBE CODE ATS
- [ ] ✅ Conexión: Enviar a VIBE CODE ATS → Respond to Webhook
- [ ] ✅ UUID de búsqueda configurado
- [ ] ✅ Test ejecutado exitosamente
- [ ] ✅ Candidatos visibles en VIBE CODE ATS

---

**¡Listo! Con estos pasos deberías poder conectar tu POC 2.0 B con VIBE CODE ATS!** 🎉

¿Necesitás ayuda con algún paso específico? 😊
