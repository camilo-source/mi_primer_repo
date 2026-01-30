# 🔄 FLUJO COMPLETO DEL SISTEMA VIBE CODE ATS

## 📋 **RESUMEN EJECUTIVO**

Este documento explica el flujo completo desde que se crea una búsqueda hasta que los candidatos aparecen en el dashboard en tiempo real.

---

## 🎯 **ARQUITECTURA DEL FLUJO**

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASO 1: CREAR BÚSQUEDA                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Usuario en Dashboard → Click "Nueva Búsqueda"                 │
│                                                                 │
│  /search/new                                                    │
│  ├─ Formulario: Título, descripción, requisitos                │
│  └─ Submit → Crea registro en tabla "busquedas"                │
│                                                                 │
│  RESULTADO: id_busqueda_n8n (UUID generado)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              PASO 2: GENERAR URL DE POSTULACIÓN                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  URL generada automáticamente:                                 │
│  https://tu-dominio.com/apply/{id_busqueda_n8n}                │
│                                                                 │
│  Esta URL se comparte con candidatos (email, LinkedIn, etc.)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           PASO 3: CANDIDATO LLENA FORMULARIO PÚBLICO            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Candidato accede a /apply/{id_busqueda_n8n}                   │
│                                                                 │
│  Formulario incluye:                                            │
│  ├─ Nombre                                                      │
│  ├─ Email                                                       │
│  ├─ Teléfono                                                    │
│  ├─ LinkedIn                                                    │
│  ├─ CV (upload o URL)                                           │
│  └─ Información adicional                                       │
│                                                                 │
│  Submit → Envía datos a n8n POC 2.0 A                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              PASO 4: N8N POC 2.0 A PROCESA                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Workflow n8n recibe:                                           │
│  {                                                              │
│    "id_busqueda_n8n": "uuid-de-la-busqueda",                   │
│    "nombre": "Juan Pérez",                                      │
│    "email": "juan@example.com",                                 │
│    "cv_url": "https://...",                                     │
│    ...                                                          │
│  }                                                              │
│                                                                 │
│  Procesamiento:                                                 │
│  1. Extrae texto del CV                                         │
│  2. Agente IA analiza perfil                                    │
│  3. Genera resumen y score (0-100)                              │
│  4. Extrae habilidades y experiencia                            │
│                                                                 │
│  Output del agente IA:                                          │
│  {                                                              │
│    "resumen_ia": "Desarrollador Full Stack...",                 │
│    "score_ia": 85,                                              │
│    "habilidades": ["React", "Node.js", "TypeScript"],           │
│    "experiencia_anos": 5                                        │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│         PASO 5: N8N ENVÍA A VIBE CODE ATS WEBHOOK               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HTTP Request POST:                                             │
│  URL: https://tu-dominio.vercel.app/api/n8n/webhook            │
│                                                                 │
│  Body:                                                          │
│  {                                                              │
│    "id_busqueda_n8n": "uuid-de-la-busqueda",                   │
│    "candidatos": [                                              │
│      {                                                          │
│        "nombre": "Juan Pérez",                                  │
│        "email": "juan@example.com",                             │
│        "telefono": "+54 11 1234-5678",                          │
│        "linkedin": "https://linkedin.com/in/juanperez",         │
│        "cv_url": "https://storage.com/cv.pdf",                  │
│        "resumen_ia": "Desarrollador Full Stack con 5 años...",  │
│        "score_ia": 85,                                          │
│        "habilidades": ["React", "Node.js", "TypeScript"],       │
│        "experiencia_anos": 5,                                   │
│        "ubicacion": "Buenos Aires, Argentina"                   │
│      }                                                          │
│    ]                                                            │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           PASO 6: WEBHOOK GUARDA EN SUPABASE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Archivo: api/n8n/webhook.ts                                    │
│                                                                 │
│  Validaciones:                                                  │
│  ✅ Verifica que id_busqueda_n8n existe en tabla "busquedas"   │
│  ✅ Valida estructura de candidatos                             │
│  ✅ Valida campos requeridos (nombre, email)                    │
│                                                                 │
│  Inserción en tabla "postulantes":                              │
│  ├─ id_busqueda_n8n (FK a busquedas)                           │
│  ├─ nombre, email, telefono, linkedin                           │
│  ├─ cv_url, resumen_ia, score_ia                                │
│  ├─ habilidades (array), experiencia_anos                       │
│  ├─ estado: "nuevo" (inicial)                                   │
│  └─ created_at: timestamp actual                                │
│                                                                 │
│  Actualiza tabla "busquedas":                                   │
│  └─ estado: "activa"                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│        PASO 7: DASHBOARD SE ACTUALIZA EN TIEMPO REAL            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Página: /search/{id_busqueda_n8n}                             │
│  Archivo: src/pages/SearchDetail.tsx                            │
│                                                                 │
│  Supabase Realtime Subscription:                                │
│  ├─ Escucha cambios en tabla "postulantes"                      │
│  ├─ Filtra por id_busqueda_n8n                                  │
│  └─ Actualiza UI automáticamente                                │
│                                                                 │
│  Cuando llega nuevo candidato:                                  │
│  1. Supabase emite evento "INSERT"                              │
│  2. Frontend recibe candidato nuevo                             │
│  3. Se agrega a la lista de candidatos                          │
│  4. Aparece en tabla/kanban con animación                       │
│  5. Se ordena por score_ia (mayor a menor)                      │
│                                                                 │
│  Visualización:                                                 │
│  ├─ Vista Kanban: Cards por estado                              │
│  └─ Vista Tabla: Filas ordenadas por score                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ **ESTRUCTURA DE BASE DE DATOS**

### **Tabla: busquedas**
```sql
CREATE TABLE busquedas (
  id_busqueda_n8n UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  requisitos TEXT,
  estado TEXT DEFAULT 'draft', -- draft, active, inactive, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Tabla: postulantes**
```sql
CREATE TABLE postulantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_busqueda_n8n UUID REFERENCES busquedas(id_busqueda_n8n) ON DELETE CASCADE,
  
  -- Datos del candidato
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  linkedin TEXT,
  cv_url TEXT,
  ubicacion TEXT,
  
  -- Análisis de IA
  resumen_ia TEXT,
  score_ia INTEGER, -- 0-100
  habilidades TEXT[], -- Array de strings
  experiencia_anos INTEGER,
  
  -- Estado del proceso
  estado_agenda TEXT DEFAULT 'pending', -- pending, sent, replied, confirmed, rejected
  fecha_entrevista TIMESTAMPTZ,
  comentarios_admin TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 **FLUJO DE DATOS EN TIEMPO REAL**

### **Configuración de Supabase Realtime**

En `SearchDetail.tsx`:

```typescript
useEffect(() => {
  if (!id) return;

  // Suscripción a cambios en tiempo real
  const channel = supabase
    .channel(`postulantes:${id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'postulantes',
        filter: `id_busqueda_n8n=eq.${id}`
      },
      (payload) => {
        console.log('🆕 Nuevo candidato:', payload.new);
        
        // Agregar candidato a la lista
        setCandidates(prev => [...prev, payload.new as Candidate]);
        
        // Mostrar notificación
        addToast(`Nuevo candidato: ${payload.new.nombre}`, 'success');
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'postulantes',
        filter: `id_busqueda_n8n=eq.${id}`
      },
      (payload) => {
        console.log('✏️ Candidato actualizado:', payload.new);
        
        // Actualizar candidato en la lista
        setCandidates(prev => 
          prev.map(c => c.id === payload.new.id ? payload.new as Candidate : c)
        );
      }
    )
    .subscribe();

  // Cleanup
  return () => {
    supabase.removeChannel(channel);
  };
}, [id]);
```

---

## 📊 **ORDENAMIENTO Y FILTRADO**

### **Ordenamiento automático por score**

```typescript
const sortedCandidates = useMemo(() => {
  return [...candidates].sort((a, b) => {
    // Ordenar por score (mayor a menor)
    return (b.score_ia || 0) - (a.score_ia || 0);
  });
}, [candidates]);
```

### **Filtrado por estado**

```typescript
const filteredCandidates = useMemo(() => {
  if (statusFilter === 'all') return sortedCandidates;
  
  return sortedCandidates.filter(c => c.estado_agenda === statusFilter);
}, [sortedCandidates, statusFilter]);
```

---

## 🎨 **VISUALIZACIÓN EN DASHBOARD**

### **Vista Kanban (por estado)**

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  PENDIENTE  │   ENVIADO   │ RESPONDIDO  │ CONFIRMADO  │
├─────────────┼─────────────┼─────────────┼─────────────┤
│             │             │             │             │
│  [Card 1]   │  [Card 3]   │  [Card 5]   │  [Card 7]   │
│  Score: 95  │  Score: 88  │  Score: 92  │  Score: 90  │
│             │             │             │             │
│  [Card 2]   │  [Card 4]   │  [Card 6]   │             │
│  Score: 87  │  Score: 85  │  Score: 89  │             │
│             │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### **Vista Tabla (ordenada por score)**

```
┌─────┬──────────────┬───────┬────────────┬───────────┬──────────┐
│ #   │ Nombre       │ Score │ Estado     │ Email     │ Acciones │
├─────┼──────────────┼───────┼────────────┼───────────┼──────────┤
│ 1   │ Juan Pérez   │  95   │ Pendiente  │ juan@...  │ [📅][✏️] │
│ 2   │ Ana García   │  92   │ Respondido │ ana@...   │ [📅][✏️] │
│ 3   │ Luis Martín  │  90   │ Confirmado │ luis@...  │ [📅][✏️] │
│ 4   │ María López  │  89   │ Respondido │ maria@... │ [📅][✏️] │
│ 5   │ Pedro Ruiz   │  88   │ Enviado    │ pedro@... │ [📅][✏️] │
└─────┴──────────────┴───────┴────────────┴───────────┴──────────┘
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **Backend (Ya implementado)**
- [x] Tabla `busquedas` creada
- [x] Tabla `postulantes` creada
- [x] Webhook `/api/n8n/webhook` funcionando
- [x] Validaciones de datos
- [x] Inserción en batch

### **Frontend (Implementar)**
- [ ] Supabase Realtime en `SearchDetail.tsx`
- [ ] Ordenamiento automático por score
- [ ] Notificaciones de nuevos candidatos
- [ ] Animaciones de entrada de nuevos candidatos
- [ ] Contador de candidatos en tiempo real

### **N8N (Configurar)**
- [ ] Workflow POC 2.0 A configurado
- [ ] Nodo HTTP Request apuntando al webhook
- [ ] Formateo de datos según estructura esperada
- [ ] Testing con candidatos de prueba

---

## 🧪 **TESTING DEL FLUJO COMPLETO**

### **Paso 1: Crear búsqueda de prueba**
```bash
# En Dashboard
1. Click "Nueva Búsqueda"
2. Título: "Desarrollador Full Stack - Test"
3. Submit
4. Copiar id_busqueda_n8n generado
```

### **Paso 2: Configurar n8n**
```javascript
// En nodo "Formatear para VIBE CODE"
const searchId = "uuid-copiado-del-paso-1";
```

### **Paso 3: Enviar candidato de prueba**
```bash
# Ejecutar workflow n8n manualmente
# O usar curl:
curl -X POST https://tu-dominio.vercel.app/api/n8n/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id_busqueda_n8n": "uuid-de-la-busqueda",
    "candidatos": [{
      "nombre": "Test Candidate",
      "email": "test@example.com",
      "score_ia": 85
    }]
  }'
```

### **Paso 4: Verificar en Dashboard**
```bash
1. Abrir /search/{id_busqueda_n8n}
2. Debería aparecer el candidato automáticamente
3. Verificar que está ordenado por score
4. Verificar que aparece notificación
```

---

## 🚀 **PRÓXIMOS PASOS**

1. **Implementar Realtime** en `SearchDetail.tsx`
2. **Agregar ordenamiento** automático por score
3. **Agregar notificaciones** de nuevos candidatos
4. **Testing** completo del flujo
5. **Documentar** URL de postulación pública

---

**¡El sistema está casi completo! Solo falta implementar el Realtime para que los candidatos aparezcan automáticamente.** 🎉
