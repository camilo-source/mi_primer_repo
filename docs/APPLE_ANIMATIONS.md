# 🍎 ANIMACIONES ESTILO APPLE
## VIBE CODE ATS - Ultra Premium Animations

---

## ✨ **ANIMACIONES IMPLEMENTADAS**

Hemos agregado **16 animaciones estilo Apple** ultra suaves y dopaminísticas, con las mismas curvas de easing que usa Apple en sus productos.

---

## 🎯 **CURVAS DE EASING APPLE**

### **Curvas Disponibles:**
```css
--ease-apple: cubic-bezier(0.4, 0.0, 0.2, 1)        /* Estándar Apple */
--ease-apple-in: cubic-bezier(0.4, 0.0, 1, 1)       /* Entrada */
--ease-apple-out: cubic-bezier(0.0, 0.0, 0.2, 1)    /* Salida */
--ease-apple-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)  /* Rebote */
--ease-apple-smooth: cubic-bezier(0.25, 0.1, 0.25, 1)   /* Suave */
```

### **Uso en Tailwind:**
```tsx
<div className="transition-all duration-300 ease-apple">
  Contenido
</div>
```

---

## 🎬 **ANIMACIONES DISPONIBLES**

### **1. Fade In** 🌟
Aparición suave con fade

```tsx
<div className="animate-apple-fade-in">
  ¡Hola!
</div>
```

**Uso:** Textos, imágenes, cards que aparecen

---

### **2. Scale In** 📏
Aparición con escala (efecto zoom)

```tsx
<div className="animate-apple-scale-in">
  <Card />
</div>
```

**Uso:** Modales, popovers, tooltips

---

### **3. Slide Up** ⬆️
Deslizamiento desde abajo

```tsx
<div className="animate-apple-slide-up">
  <Notification />
</div>
```

**Uso:** Notificaciones, toasts, mensajes

---

### **4. Slide Down** ⬇️
Deslizamiento desde arriba

```tsx
<div className="animate-apple-slide-down">
  <Dropdown />
</div>
```

**Uso:** Dropdowns, menús desplegables

---

### **5. Slide Left** ⬅️
Deslizamiento desde la derecha

```tsx
<div className="animate-apple-slide-left">
  <Sidebar />
</div>
```

**Uso:** Sidebars, paneles laterales

---

### **6. Slide Right** ➡️
Deslizamiento desde la izquierda

```tsx
<div className="animate-apple-slide-right">
  <Panel />
</div>
```

**Uso:** Paneles, navegación

---

### **7. Bounce** 🎾
Rebote satisfactorio

```tsx
<button className="animate-apple-bounce">
  Click Me
</button>
```

**Uso:** Botones al hacer click, confirmaciones

---

### **8. Spring** 🌸
Efecto de resorte

```tsx
<div className="animate-apple-spring">
  <Icon />
</div>
```

**Uso:** Iconos, badges, indicadores

---

### **9. Rotate In** 🔄
Rotación con entrada

```tsx
<div className="animate-apple-rotate-in">
  <Logo />
</div>
```

**Uso:** Logos, iconos especiales

---

### **10. Blur In** 🌫️
Aparición con desenfoque

```tsx
<div className="animate-apple-blur-in">
  <Image />
</div>
```

**Uso:** Imágenes, backgrounds, overlays

---

### **11. Glow Pulse** ✨
Pulso brillante continuo

```tsx
<div className="animate-apple-glow-pulse">
  <Badge>Nuevo</Badge>
</div>
```

**Uso:** Badges, notificaciones, llamadas a la acción

---

### **12. Float** 🎈
Flotación suave

```tsx
<div className="animate-apple-float">
  <Icon />
</div>
```

**Uso:** Iconos flotantes, decoraciones

---

### **13. Shimmer** ✨
Brillo deslizante

```tsx
<div className="apple-shimmer">
  Cargando...
</div>
```

**Uso:** Estados de carga, placeholders

---

### **14. Spin** 🔄
Rotación continua

```tsx
<div className="animate-apple-spin">
  <Loader />
</div>
```

**Uso:** Loaders, spinners

---

### **15. Ping** 📍
Efecto de radar

```tsx
<div className="animate-apple-ping">
  <Dot />
</div>
```

**Uso:** Indicadores de estado, notificaciones

---

### **16. Skeleton** 💀
Efecto de carga skeleton

```tsx
<div className="apple-skeleton h-20 w-full rounded-lg">
</div>
```

**Uso:** Placeholders de carga

---

## 🎨 **EFECTOS DE HOVER ESTILO APPLE**

### **1. Hover Básico**
```tsx
<div className="apple-hover">
  Pasa el mouse
</div>
```
**Efecto:** Levanta 2px + sombra suave

---

### **2. Hover Scale**
```tsx
<button className="apple-hover-scale">
  Hover Me
</button>
```
**Efecto:** Escala a 1.05x

---

### **3. Hover Glow**
```tsx
<div className="apple-hover-glow">
  Brilla al pasar
</div>
```
**Efecto:** Agrega glow brillante

---

### **4. Hover Lift**
```tsx
<div className="apple-hover-lift">
  Levita
</div>
```
**Efecto:** Levanta 4px + escala 1.02x + sombra grande

---

## 🖱️ **EFECTO DE PRESS**

```tsx
<button className="apple-press">
  Presioname
</button>
```
**Efecto:** Escala a 0.96x al hacer click (feedback táctil)

---

## 📊 **COMPONENTES ESPECIALES**

### **Progress Bar Animado**
```tsx
<div className="apple-progress h-2 bg-emerald-500 rounded-full">
  {/* Shimmer automático */}
</div>
```

### **Skeleton Loader**
```tsx
<div className="apple-skeleton h-40 w-full rounded-xl">
  {/* Animación de carga */}
</div>
```

---

## 🎯 **EJEMPLOS COMPLETOS**

### **Card con Animación**
```tsx
<div className="liquid-glass-card apple-scale-in apple-hover-lift">
  <h3 className="text-xl font-bold gradient-text">
    Juan Pérez
  </h3>
  <p className="text-muted">Full Stack Developer</p>
  
  <div className="mt-4 flex gap-2">
    <button className="apple-press apple-hover-glow px-4 py-2 bg-emerald-500 rounded-lg">
      Agendar
    </button>
  </div>
</div>
```

### **Notificación Toast**
```tsx
<div className="animate-apple-slide-up liquid-glass p-4 rounded-lg">
  <div className="flex items-center gap-3">
    <div className="animate-apple-ping w-2 h-2 bg-emerald-500 rounded-full" />
    <p>¡Entrevista agendada exitosamente!</p>
  </div>
</div>
```

### **Modal con Overlay**
```tsx
{/* Overlay */}
<div className="animate-apple-fade-in fixed inset-0 bg-black/50 backdrop-blur-sm" />

{/* Modal */}
<div className="animate-apple-scale-in liquid-glass-card max-w-md mx-auto">
  <h2 className="text-2xl font-bold gradient-text">
    Confirmar Acción
  </h2>
  <p className="mt-4 text-muted">
    ¿Estás seguro que querés continuar?
  </p>
  
  <div className="mt-6 flex gap-3">
    <button className="apple-press apple-hover flex-1 px-4 py-2 rounded-lg border">
      Cancelar
    </button>
    <button className="apple-press apple-hover-glow flex-1 px-4 py-2 bg-emerald-500 rounded-lg">
      Confirmar
    </button>
  </div>
</div>
```

### **Lista con Stagger**
```tsx
{items.map((item, index) => (
  <div 
    key={item.id}
    className="animate-apple-slide-up apple-hover-lift"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <Card data={item} />
  </div>
))}
```

### **Button con Feedback Completo**
```tsx
<button className="
  apple-press 
  apple-hover-lift 
  px-6 py-3 
  bg-gradient-to-r from-emerald-500 to-emerald-600 
  rounded-xl 
  text-white 
  font-semibold
  transition-all duration-300 ease-apple
  hover:shadow-lg hover:shadow-emerald-500/50
">
  <span className="flex items-center gap-2">
    <Sparkles className="w-5 h-5 animate-apple-float" />
    Comenzar Ahora
  </span>
</button>
```

### **Loading State**
```tsx
<div className="space-y-4">
  <div className="apple-skeleton h-12 w-full rounded-lg" />
  <div className="apple-skeleton h-12 w-3/4 rounded-lg" />
  <div className="apple-skeleton h-12 w-1/2 rounded-lg" />
</div>
```

### **Badge con Glow**
```tsx
<span className="
  animate-apple-glow-pulse 
  px-3 py-1 
  bg-emerald-500/20 
  border border-emerald-500/50 
  rounded-full 
  text-emerald-500 
  text-sm 
  font-semibold
">
  Nuevo
</span>
```

---

## 🎨 **COMBINACIONES RECOMENDADAS**

### **Para Cards:**
```tsx
className="liquid-glass-card apple-scale-in apple-hover-lift"
```

### **Para Botones:**
```tsx
className="apple-press apple-hover-glow transition-all duration-300 ease-apple"
```

### **Para Modales:**
```tsx
className="animate-apple-scale-in liquid-glass-card"
```

### **Para Notificaciones:**
```tsx
className="animate-apple-slide-up apple-hover"
```

### **Para Imágenes:**
```tsx
className="animate-apple-blur-in apple-hover-scale"
```

---

## ⚡ **TIPS DE PERFORMANCE**

### **1. Usar `will-change` para animaciones frecuentes:**
```tsx
<div className="apple-hover" style={{ willChange: 'transform' }}>
  Contenido
</div>
```

### **2. Limitar animaciones en mobile:**
```tsx
<div className="md:animate-apple-scale-in">
  {/* Solo anima en desktop */}
</div>
```

### **3. Usar `prefers-reduced-motion`:**
```css
@media (prefers-reduced-motion: reduce) {
  .apple-scale-in {
    animation: none;
  }
}
```

---

## 🎯 **CUÁNDO USAR CADA ANIMACIÓN**

| Animación | Uso Ideal |
|-----------|-----------|
| `apple-fade-in` | Textos, contenido general |
| `apple-scale-in` | Modales, popovers, tooltips |
| `apple-slide-up` | Notificaciones, toasts |
| `apple-slide-down` | Dropdowns, menús |
| `apple-bounce` | Confirmaciones, éxitos |
| `apple-spring` | Iconos, badges |
| `apple-blur-in` | Imágenes, backgrounds |
| `apple-glow-pulse` | CTAs, badges importantes |
| `apple-float` | Decoraciones, iconos |
| `apple-shimmer` | Estados de carga |
| `apple-skeleton` | Placeholders |

---

## 🌟 **RESULTADO FINAL**

Con estas animaciones, tu app tendrá:

- ✨ **Suavidad estilo Apple** - Mismas curvas de easing
- ⚡ **Feedback instantáneo** - Respuesta visual inmediata
- 🎨 **Dopamina garantizada** - Animaciones satisfactorias
- 🚀 **Performance óptimo** - GPU-accelerated
- 💚 **Consistencia total** - Mismo look & feel

---

**¡VIBE CODE ATS ahora se siente como un producto de Apple!** 🍎✨

---

**Creado con ❤️ para VIBE CODE ATS**
