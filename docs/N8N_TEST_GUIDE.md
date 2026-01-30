# 🧪 SCRIPT DE TEST - N8N INTEGRATION

## PASO 1: OBTENER UUID DE BÚSQUEDA

### Opción A: Desde Supabase Dashboard
1. Ir a: https://supabase.com/dashboard
2. Seleccionar tu proyecto
3. Ir a "Table Editor" → "busquedas"
4. Copiar un `id_busqueda_n8n` existente

### Opción B: Crear búsqueda de prueba
Ejecutar este SQL en Supabase:

```sql
INSERT INTO busquedas (
    id_busqueda_n8n,
    titulo,
    descripcion,
    estado,
    created_at
) VALUES (
    gen_random_uuid(),
    'TEST - Desarrollador Full Stack',
    'Búsqueda de prueba para testing n8n',
    'borrador',
    NOW()
)
RETURNING id_busqueda_n8n, titulo;
```

**Copiar el UUID que devuelve** ✅

---

## PASO 2: CONFIGURAR NODO "Formatear Datos" EN N8N

1. Abrir n8n
2. Click en el nodo **"Formatear Datos"**
3. Buscar esta línea:

```javascript
const searchId = $('Webhook Trigger').first().json.search_id;
```

4. **Reemplazarla** por (pegando tu UUID):

```javascript
const searchId = "PEGAR-TU-UUID-AQUI";
```

**Ejemplo:**
```javascript
const searchId = "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d";
```

5. Click en **"Save"** o **"Guardar"**

---

## PASO 3: VERIFICAR NODO "Enviar a VIBE CODE ATS"

1. Click en el nodo **"Enviar a VIBE CODE ATS"**
2. Verificar que la URL sea correcta:

```
https://tu-dominio.vercel.app/api/n8n/webhook
```

⚠️ **IMPORTANTE:** Reemplazar `tu-dominio.vercel.app` con tu dominio real

**Ejemplos de URLs válidas:**
```
https://mi-primer-repo-seven.vercel.app/api/n8n/webhook
https://vibe-code-ats.vercel.app/api/n8n/webhook
```

3. Verificar Headers:
```
Content-Type: application/json
```

4. Verificar Body:
```
={{ $json }}
```

---

## PASO 4: EJECUTAR EL WORKFLOW

1. En n8n, click en el botón **"Execute Workflow"** (arriba a la derecha)
2. Esperar a que se ejecuten todos los nodos
3. Todos los nodos deberían tener un ✅ verde

---

## PASO 5: VERIFICAR RESPUESTA

1. Click en el nodo **"Enviar a VIBE CODE ATS"**
2. Ver el **Output** (pestaña de salida)

### ✅ Respuesta Exitosa:
```json
{
  "success": true,
  "message": "1 candidatos procesados exitosamente",
  "data": {
    "busqueda_id": "tu-uuid",
    "busqueda_titulo": "TEST - Desarrollador Full Stack",
    "candidatos_insertados": 1,
    "candidatos": [
      {
        "id": 123,
        "nombre": "Juan Pérez",
        "email": "juan@example.com",
        "score": 85
      }
    ]
  }
}
```

### ❌ Respuesta con Error:

**Error: "Búsqueda no encontrada"**
```json
{
  "success": false,
  "error": "Búsqueda no encontrada: uuid-invalido"
}
```
→ **Solución:** Verificar que el UUID sea correcto

**Error: "Falta id_busqueda_n8n"**
```json
{
  "success": false,
  "error": "Falta id_busqueda_n8n"
}
```
→ **Solución:** Verificar el código del nodo "Formatear Datos"

**Error: "Array de candidatos vacío"**
```json
{
  "success": false,
  "error": "Array de candidatos vacío"
}
```
→ **Solución:** Verificar que el nodo anterior tenga datos

---

## PASO 6: VERIFICAR EN VIBE CODE ATS

1. Ir a: https://tu-dominio.vercel.app/dashboard
2. Buscar la búsqueda que usaste (por título)
3. Click en la búsqueda
4. **¡Deberías ver el candidato insertado!** ✨

---

## 🔍 DEBUGGING

### Ver logs en Vercel:

1. Ir a: https://vercel.com/dashboard
2. Seleccionar tu proyecto
3. Click en "Logs"
4. Buscar logs del endpoint `/api/n8n/webhook`

### Ver datos en Supabase:

```sql
-- Ver candidatos insertados recientemente
SELECT 
    c.id_candidato,
    c.nombre,
    c.email,
    c.score_ia,
    c.created_at,
    b.titulo as busqueda_titulo
FROM candidatos c
JOIN busquedas b ON c.id_busqueda_n8n = b.id_busqueda_n8n
ORDER BY c.created_at DESC
LIMIT 10;
```

---

## 📋 CHECKLIST DE TEST

- [ ] ✅ UUID de búsqueda obtenido
- [ ] ✅ UUID pegado en nodo "Formatear Datos"
- [ ] ✅ URL verificada en nodo "Enviar a VIBE CODE ATS"
- [ ] ✅ Workflow ejecutado
- [ ] ✅ Todos los nodos con ✅ verde
- [ ] ✅ Respuesta exitosa (success: true)
- [ ] ✅ Candidato visible en VIBE CODE ATS
- [ ] ✅ Datos correctos en Supabase

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DEL TEST

Si el test es exitoso:

1. **Revertir el cambio temporal:**
   
   Cambiar de:
   ```javascript
   const searchId = "tu-uuid-fijo";
   ```
   
   A:
   ```javascript
   const searchId = $('Webhook Trigger').first().json.search_id;
   ```

2. **Activar el workflow** para producción

3. **Configurar el trigger** (webhook, cron, etc.)

4. **Monitorear** los primeros candidatos reales

---

## 🆘 AYUDA

Si algo no funciona:

1. **Verificar logs** en Vercel
2. **Verificar datos** en Supabase
3. **Verificar output** de cada nodo en n8n
4. **Compartir el error** para ayuda específica

---

**¡Listo para empezar el test!** 🚀

**¿Ya tenés un UUID de búsqueda o necesitás que te ayude a crear uno?** 😊
