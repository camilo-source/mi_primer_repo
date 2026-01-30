---
description: Plan de implementación para búsqueda en el Dashboard
---

# 🔍 PLAN DE IMPLEMENTACIÓN: BÚSQUEDA EN DASHBOARD

## 📋 **OBJETIVO**

Implementar una funcionalidad de búsqueda y filtrado en el Dashboard de VIBE CODE ATS que permita:
- Buscar búsquedas por título
- Filtrar por estado (activo, inactivo, etc.)
- Experiencia visual premium con animaciones
- Búsqueda en tiempo real (debounced)

---

## 🎯 **ARQUITECTURA DE LA SOLUCIÓN**

```
┌─────────────────────────────────────────────────────────────────┐
│                        DASHBOARD HEADER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [🔍 Buscar búsquedas...]  [Estado: Todos ▼]  [Demo] [+ Nueva] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LÓGICA DE FILTRADO                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. searchQuery (string) - Texto de búsqueda                   │
│  2. statusFilter (string) - Estado seleccionado                │
│  3. filteredSearches - Búsquedas filtradas                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GRID DE BÚSQUEDAS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Card 1]  [Card 2]  [Card 3]                                  │
│  [Card 4]  [Card 5]  [Card 6]                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ **COMPONENTES A MODIFICAR/CREAR**

### **1. Dashboard.tsx** (Modificar)
- Agregar estado para `searchQuery`
- Agregar estado para `statusFilter`
- Implementar función `filteredSearches` (useMemo)
- Agregar barra de búsqueda en el header
- Agregar dropdown de filtros

### **2. SearchBar.tsx** (Crear nuevo componente)
- Input con glass effect
- Icono de búsqueda
- Clear button
- Debounce automático
- Animaciones de focus

### **3. FilterDropdown.tsx** (Crear nuevo componente)
- Dropdown con opciones de estado
- Glass effect
- Animaciones
- Contador de resultados

---

## 📝 **PASO A PASO DE IMPLEMENTACIÓN**

### **FASE 1: Crear componente SearchBar**

**Archivo:** `src/components/ui/SearchBar.tsx`

**Características:**
- Input con liquid glass effect
- Icono de búsqueda (Search de lucide-react)
- Botón para limpiar (X)
- Placeholder animado
- Debounce de 300ms
- Animación de focus con glow

**Props:**
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
```

---

### **FASE 2: Crear componente FilterDropdown**

**Archivo:** `src/components/ui/FilterDropdown.tsx`

**Características:**
- Dropdown con glass effect
- Lista de opciones de estado
- Contador de resultados por estado
- Animación de apertura/cierre
- Click outside para cerrar

**Props:**
```typescript
interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; count?: number }>;
  className?: string;
}
```

---

### **FASE 3: Modificar Dashboard.tsx**

**Cambios necesarios:**

1. **Agregar estados:**
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
```

2. **Implementar filtrado con useMemo:**
```typescript
const filteredSearches = useMemo(() => {
  return searches.filter(search => {
    // Filtro por texto
    const matchesSearch = search.titulo
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    // Filtro por estado
    const matchesStatus = statusFilter === 'all' || 
                         search.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
}, [searches, searchQuery, statusFilter]);
```

3. **Agregar barra de búsqueda en el header:**
```tsx
<div className="flex gap-3 items-center">
  <SearchBar
    value={searchQuery}
    onChange={setSearchQuery}
    placeholder="Buscar búsquedas..."
  />
  
  <FilterDropdown
    value={statusFilter}
    onChange={setStatusFilter}
    options={[
      { value: 'all', label: 'Todos', count: searches.length },
      { value: 'active', label: 'Activos', count: activeCount },
      { value: 'inactive', label: 'Inactivos', count: inactiveCount }
    ]}
  />
  
  {/* Botones existentes */}
</div>
```

4. **Usar filteredSearches en el render:**
```tsx
{filteredSearches.map((search) => (
  // ... card de búsqueda
))}
```

---

## 🎨 **DISEÑO VISUAL**

### **SearchBar:**
```css
- Background: liquid-glass
- Border: glow-border-static
- Focus: glow-border (animado)
- Placeholder: text-muted con fade-in
- Icon: emerald-500 con animate-pulse en focus
- Clear button: hover:bg-red-500/10
```

### **FilterDropdown:**
```css
- Button: liquid-glass con badge de contador
- Dropdown: liquid-glass-card con backdrop-blur
- Options: hover:bg-emerald-500/10
- Selected: bg-emerald-500/20 con checkmark
- Animation: slide-down + fade-in
```

### **Resultados:**
```css
- Sin resultados: Empty state con animación
- Contador: "Mostrando X de Y búsquedas"
- Highlight: Texto coincidente en bold
```

---

## 🔄 **FLUJO DE USUARIO**

1. **Usuario escribe en SearchBar:**
   - Debounce de 300ms
   - Actualiza `searchQuery`
   - Re-calcula `filteredSearches`
   - Anima las cards (fade-in)

2. **Usuario selecciona filtro:**
   - Abre dropdown con animación
   - Click en opción
   - Cierra dropdown
   - Re-calcula `filteredSearches`
   - Anima las cards

3. **Usuario limpia búsqueda:**
   - Click en X del SearchBar
   - Resetea `searchQuery`
   - Muestra todas las búsquedas

---

## 📊 **ESTADOS DE LA UI**

### **Estado 1: Sin búsqueda activa**
```
[🔍 Buscar búsquedas...]  [Estado: Todos (12)]  [Demo] [+ Nueva]

Mostrando 12 búsquedas

[Card 1]  [Card 2]  [Card 3]
[Card 4]  [Card 5]  [Card 6]
```

### **Estado 2: Búsqueda activa con resultados**
```
[🔍 "desarrollador" ✕]  [Estado: Activos (5)]  [Demo] [+ Nueva]

Mostrando 3 de 12 búsquedas

[Card 1]  [Card 2]  [Card 3]
```

### **Estado 3: Sin resultados**
```
[🔍 "xyz123" ✕]  [Estado: Todos (12)]  [Demo] [+ Nueva]

┌─────────────────────────────────────────┐
│         🔍                              │
│   No se encontraron búsquedas          │
│   que coincidan con "xyz123"           │
│                                         │
│   [Limpiar búsqueda]                   │
└─────────────────────────────────────────┘
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **Fase 1: Componentes Base**
- [ ] Crear `SearchBar.tsx`
- [ ] Implementar debounce en SearchBar
- [ ] Agregar animaciones de focus
- [ ] Crear `FilterDropdown.tsx`
- [ ] Implementar lógica de apertura/cierre
- [ ] Agregar animaciones de dropdown

### **Fase 2: Integración en Dashboard**
- [ ] Agregar estados `searchQuery` y `statusFilter`
- [ ] Implementar `filteredSearches` con useMemo
- [ ] Calcular contadores por estado
- [ ] Agregar SearchBar al header
- [ ] Agregar FilterDropdown al header
- [ ] Reemplazar `searches` por `filteredSearches` en render

### **Fase 3: UX y Polish**
- [ ] Agregar contador "Mostrando X de Y"
- [ ] Implementar empty state para sin resultados
- [ ] Agregar animaciones de entrada/salida de cards
- [ ] Implementar highlight de texto coincidente
- [ ] Testing en mobile
- [ ] Testing de performance con muchas búsquedas

### **Fase 4: Testing**
- [ ] Probar búsqueda por título
- [ ] Probar filtro por estado
- [ ] Probar combinación de búsqueda + filtro
- [ ] Probar limpiar búsqueda
- [ ] Probar con 0 búsquedas
- [ ] Probar con 100+ búsquedas

---

## 🚀 **MEJORAS FUTURAS (OPCIONAL)**

1. **Búsqueda avanzada:**
   - Buscar por ID
   - Buscar por fecha de creación
   - Buscar por cantidad de candidatos

2. **Ordenamiento:**
   - Por fecha (más reciente/antiguo)
   - Por título (A-Z)
   - Por cantidad de candidatos

3. **Guardado de preferencias:**
   - Recordar último filtro usado
   - Guardar en localStorage

4. **Keyboard shortcuts:**
   - `/` para focus en búsqueda
   - `Esc` para limpiar
   - Arrow keys para navegar filtros

---

## 📦 **DEPENDENCIAS**

**Nuevas:**
- Ninguna (usar las existentes)

**Existentes a usar:**
- `lucide-react` - Iconos (Search, X, Filter, Check)
- `react` - useState, useMemo, useRef
- `framer-motion` (opcional) - Animaciones avanzadas

---

## 🎯 **RESULTADO ESPERADO**

Una experiencia de búsqueda y filtrado:
- ✨ **Fluida** - Debounce y animaciones suaves
- ⚡ **Rápida** - useMemo para optimización
- 🎨 **Premium** - Glass effects y glows
- 😊 **Intuitiva** - UX clara y directa
- 📱 **Responsive** - Funciona en mobile

---

## 📝 **NOTAS DE IMPLEMENTACIÓN**

### **Debounce:**
```typescript
// Usar useEffect con setTimeout
useEffect(() => {
  const timer = setTimeout(() => {
    // Ejecutar búsqueda
  }, 300);
  
  return () => clearTimeout(timer);
}, [searchQuery]);
```

### **Click Outside:**
```typescript
// Usar useRef + useEffect
const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleClick = (e: MouseEvent) => {
    if (!dropdownRef.current?.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };
  
  document.addEventListener('mousedown', handleClick);
  return () => document.removeEventListener('mousedown', handleClick);
}, []);
```

### **Performance:**
```typescript
// Usar useMemo para evitar re-cálculos
const filteredSearches = useMemo(() => {
  // Lógica de filtrado
}, [searches, searchQuery, statusFilter]);
```

---

**¡Listo para implementar!** 🚀

Este plan te guiará paso a paso para agregar la funcionalidad de búsqueda al dashboard manteniendo el diseño premium y dopaminístico de VIBE CODE ATS.
