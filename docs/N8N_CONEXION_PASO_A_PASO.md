# 🔗 CONEXIÓN PASO A PASO: POC 2 A + VIBE CODE ATS

## 📋 **RESUMEN**

Vamos a conectar tu workflow **POC 2 A** (que procesa CVs con IA) con el nuevo endpoint de **VIBE CODE ATS** para que los candidatos lleguen automáticamente a la base de datos.

---

## 🎯 **ARQUITECTURA COMPLETA**

```
TU POC 2 A ACTUAL                    +    NUEVOS NODOS VIBE CODE ATS
═══════════════════════              ═══════════════════════════════

[Tus nodos actuales]                      [Formatear Datos]
        │                                         │
        │                                         │
        ▼                                         ▼
[Último nodo de POC 2 A]  ──────►    [Enviar a VIBE CODE ATS]
   (salida derecha)                           │
                                               │
                                               ▼
                                          [Respuesta]
```

---

## 📍 **PASO A PASO - CONEXIÓN**

### **PASO 1: Identificar el último nodo de tu POC 2 A**

Buscá el **ÚLTIMO NODO** de tu workflow POC 2 A que tiene los candidatos procesados.

Probablemente sea uno de estos:
- ✅ Un nodo de **OpenAI** o **Anthropic**
- ✅ Un nodo de **Code** que procesa la respuesta de la IA
- ✅ Un nodo de **Set** que organiza los datos

**¿Cómo identificarlo?**
- Es el nodo que tiene la información de los candidatos
- Tiene campos como: nombre, email, score, habilidades, etc.

---

### **PASO 2: Agregar el nodo "Formatear Datos"**

1. **Hacé click** en el canvas de n8n (área vacía)
2. **Buscá** el nodo **"Code"**
3. **Arrastralo** al canvas, a la DERECHA del último nodo de POC 2 A
4. **Nombralo**: "Formatear para VIBE CODE"

#### **Configuración del nodo Code:**

```javascript
// 🎯 COPIAR ESTE CÓDIGO EN EL NODO CODE

const candidatos = [];

// Iterar sobre todos los candidatos procesados
for (const item of $input.all()) {
  const data = item.json;
  
  // IMPORTANTE: Ajustar estos campos según tu POC 2 A
  // Reemplazar con los nombres de campos que usa tu workflow
  candidatos.push({
    // REQUERIDOS
    nombre: data.nombre || data.name || data.candidato_nombre || "Sin nombre",
    email: data.email || data.correo || data.candidato_email || "sin-email@example.com",
    
    // OPCIONALES - Ajustar según tus campos
    telefono: data.telefono || data.phone || null,
    linkedin: data.linkedin || data.linkedin_url || null,
    cv_url: data.cv_url || data.resume_url || null,
    resumen_ia: data.resumen || data.summary || data.analisis || null,
    score_ia: parseInt(data.score) || parseInt(data.puntuacion) || 0,
    habilidades: Array.isArray(data.habilidades) 
      ? data.habilidades 
      : (data.skills || data.tecnologias || "").split(',').map(s => s.trim()).filter(Boolean),
    experiencia_anos: parseInt(data.experiencia) || parseInt(data.years) || 0,
    ubicacion: data.ubicacion || data.location || null
  });
}

// IMPORTANTE: Obtener el ID de la búsqueda
// Opción 1: Si viene del trigger
const searchId = $('Webhook').first().json.search_id;

// Opción 2: Si lo definiste manualmente (reemplazar con tu UUID)
// const searchId = "tu-uuid-de-busqueda-aqui";

// Opción 3: Si viene de un nodo anterior
// const searchId = $('Nombre del Nodo').first().json.id_busqueda_n8n;

return [{
  json: {
    id_busqueda_n8n: searchId,
    candidatos: candidatos
  }
}];
```

---

### **PASO 3: Conectar POC 2 A con "Formatear Datos"**

#### **CONEXIÓN:**

1. **Hacé click** en el **círculo de salida DERECHO** del último nodo de POC 2 A
   ```
   [Último nodo POC 2 A]  ●────►
                         ↑
                    ESTE CÍRCULO
   ```

2. **Arrastrá** la línea hasta el **círculo de entrada IZQUIERDO** del nodo "Formatear para VIBE CODE"
   ```
   ────►  ●  [Formatear para VIBE CODE]
          ↑
     ESTE CÍRCULO
   ```

3. **Soltá** el mouse

✅ **Deberías ver una línea conectando ambos nodos**

---

### **PASO 4: Agregar el nodo "HTTP Request"**

1. **Hacé click** en el canvas
2. **Buscá** el nodo **"HTTP Request"**
3. **Arrastralo** a la DERECHA del nodo "Formatear para VIBE CODE"
4. **Nombralo**: "Enviar a VIBE CODE ATS"

#### **Configuración del HTTP Request:**

**Authentication:**
```
None
```

**Method:**
```
POST
```

**URL:**
```
https://tu-dominio.vercel.app/api/n8n/webhook
```
⚠️ **IMPORTANTE:** Reemplazar `tu-dominio.vercel.app` con tu dominio real

**Send Headers:**
```
✅ Activar
```

**Headers:**
```
Name: Content-Type
Value: application/json
```

**Send Body:**
```
✅ Activar
```

**Body Content Type:**
```
JSON
```

**JSON:**
```
={{ $json }}
```

---

### **PASO 5: Conectar "Formatear Datos" con "HTTP Request"**

#### **CONEXIÓN:**

1. **Hacé click** en el **círculo de salida DERECHO** del nodo "Formatear para VIBE CODE"
   ```
   [Formatear para VIBE CODE]  ●────►
   ```

2. **Arrastrá** hasta el **círculo de entrada IZQUIERDO** del nodo "Enviar a VIBE CODE ATS"
   ```
   ────►  ●  [Enviar a VIBE CODE ATS]
   ```

✅ **Deberías ver la conexión**

---

### **PASO 6: (Opcional) Agregar nodo de respuesta**

Si tu POC 2 A tiene un webhook trigger, agregá un nodo de respuesta:

1. **Buscá** el nodo **"Respond to Webhook"**
2. **Arrastralo** a la DERECHA del nodo "Enviar a VIBE CODE ATS"
3. **Conectá** la salida derecha de "Enviar a VIBE CODE ATS" con la entrada izquierda de "Respond to Webhook"

---

## 🎨 **DIAGRAMA VISUAL COMPLETO**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TU POC 2 A ACTUAL                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Webhook/Trigger] ──► [Leer CVs] ──► [Procesar con IA]           │
│                                              │                      │
│                                              │                      │
└──────────────────────────────────────────────┼──────────────────────┘
                                               │
                                               │ CONECTAR AQUÍ
                                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NUEVOS NODOS VIBE CODE ATS                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│         ┌──────────────────────────┐                               │
│         │  Formatear para          │                               │
│    ●───►│  VIBE CODE               │───►●                          │
│         │  (Code Node)             │                               │
│         └──────────────────────────┘                               │
│                                      │                              │
│                                      │                              │
│                                      ▼                              │
│         ┌──────────────────────────┐                               │
│         │  Enviar a                │                               │
│    ●───►│  VIBE CODE ATS           │───►●                          │
│         │  (HTTP Request)          │                               │
│         └──────────────────────────┘                               │
│                                      │                              │
│                                      │                              │
│                                      ▼                              │
│         ┌──────────────────────────┐                               │
│         │  Respond to Webhook      │                               │
│    ●───►│  (Opcional)              │                               │
│         └──────────────────────────┘                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 **IDENTIFICAR CONEXIONES EN N8N**

### **Círculos de conexión:**

```
        ENTRADA          NODO          SALIDA
           ↓               ↓              ↓
          ●  ┌─────────────────────┐  ●
             │                     │
             │   Nombre del Nodo   │
             │                     │
          ●  └─────────────────────┘  ●
           ↑                            ↑
      IZQUIERDA                     DERECHA
```

### **Regla de conexión:**

```
SIEMPRE:  Salida Derecha (●) ──► Entrada Izquierda (●)
```

---

## ⚙️ **CONFIGURACIÓN IMPORTANTE**

### **En el nodo "Formatear para VIBE CODE":**

Necesitás ajustar esta línea según cómo obtenés el `id_busqueda_n8n`:

```javascript
// OPCIÓN 1: Si viene del webhook trigger
const searchId = $('Webhook').first().json.search_id;

// OPCIÓN 2: Si lo definís manualmente (para testing)
const searchId = "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d";

// OPCIÓN 3: Si viene de un nodo específico (reemplazar "Nombre del Nodo")
const searchId = $('Nombre del Nodo').first().json.id_busqueda_n8n;
```

**¿Cuál usar?**
- Si estás testeando: **OPCIÓN 2** (poner un UUID real de tu DB)
- Si viene de un webhook: **OPCIÓN 1**
- Si viene de otro nodo: **OPCIÓN 3**

---

## 🧪 **TESTING**

### **PASO 1: Obtener un ID de búsqueda real**

1. Abrí VIBE CODE ATS
2. Creá una búsqueda de prueba
3. Copiá el `id_busqueda_n8n` (UUID)

### **PASO 2: Configurar en n8n**

1. Pegá el UUID en el nodo "Formatear para VIBE CODE"
2. Guardá el workflow

### **PASO 3: Ejecutar test**

1. Click en **"Execute Workflow"** en n8n
2. Verificá que todos los nodos se ejecuten ✅
3. Verificá la respuesta del nodo "Enviar a VIBE CODE ATS"

### **PASO 4: Verificar en VIBE CODE ATS**

1. Abrí el dashboard
2. Buscá la búsqueda que creaste
3. Deberías ver los candidatos insertados ✨

---

## ❌ **TROUBLESHOOTING**

### **Error: "Búsqueda no encontrada"**
- ✅ Verificá que el UUID sea correcto
- ✅ Verificá que la búsqueda exista en la DB

### **Error: "Falta id_busqueda_n8n"**
- ✅ Verificá la línea `const searchId = ...` en el nodo Code
- ✅ Asegurate de que el nodo anterior tenga ese campo

### **Error: "Array de candidatos vacío"**
- ✅ Verificá que el nodo anterior tenga datos
- ✅ Verificá los nombres de campos en el nodo Code

### **No se conectan los nodos**
- ✅ Arrastrá desde el círculo DERECHO del nodo origen
- ✅ Soltá en el círculo IZQUIERDO del nodo destino

---

## 📝 **CHECKLIST FINAL**

Antes de activar en producción:

- [ ] ✅ Último nodo de POC 2 A identificado
- [ ] ✅ Nodo "Formatear para VIBE CODE" agregado
- [ ] ✅ Nodo "Enviar a VIBE CODE ATS" agregado
- [ ] ✅ Conexiones realizadas correctamente
- [ ] ✅ URL del webhook configurada
- [ ] ✅ `id_busqueda_n8n` configurado
- [ ] ✅ Campos de candidatos mapeados
- [ ] ✅ Test ejecutado exitosamente
- [ ] ✅ Candidatos visibles en VIBE CODE ATS

---

## 🎯 **RESUMEN RÁPIDO**

```
1. Último nodo POC 2 A (salida derecha ●)
   │
   ▼
2. Formatear para VIBE CODE (entrada izquierda ●)
   │
   │ (salida derecha ●)
   ▼
3. Enviar a VIBE CODE ATS (entrada izquierda ●)
   │
   │ (salida derecha ●)
   ▼
4. Respond to Webhook (entrada izquierda ●)
```

---

**¡Listo! Con estos pasos deberías poder conectar tu POC 2 A con VIBE CODE ATS!** 🎉

¿Necesitás ayuda con algún paso específico? 😊
