# 🔧 Configuración de Google Cloud para Email Scheduling

Esta guía te ayudará a configurar las APIs de Google necesarias para el sistema de scheduling por email.

## 📋 Requisitos Previos

- Cuenta de Google
- Acceso a [Google Cloud Console](https://console.cloud.google.com)
- Proyecto en Supabase configurado

---

## 🚀 Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Click en el selector de proyectos (arriba a la izquierda)
3. Click "NUEVO PROYECTO"
4. Nombre: `GreenGlass ATS` (o el nombre que prefieras)
5. Click "CREAR"

---

## 🔌 Paso 2: Habilitar APIs

En la consola de Google Cloud, ve a "APIs y Servicios" > "Biblioteca" y habilita:

1. **Gmail API** - Para enviar y leer emails
2. **Google Calendar API** - Para crear eventos de entrevista
3. **Google+ API** (para OAuth básico)

---

## 🔐 Paso 3: Configurar OAuth Consent Screen

1. Ve a "APIs y Servicios" > "Pantalla de consentimiento OAuth"
2. Selecciona "Externo" (a menos que tengas Google Workspace)
3. Completa la información:
   - **Nombre de la app**: GreenGlass ATS
   - **Email de soporte**: tu email
   - **Logo**: opcional
   - **Dominios autorizados**: tu-dominio.vercel.app
4. En "Scopes", agrega:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/calendar.events`
   - `openid`
   - `email`
   - `profile`

---

## 🔑 Paso 4: Crear Credenciales OAuth

1. Ve a "APIs y Servicios" > "Credenciales"
2. Click "CREAR CREDENCIALES" > "ID de cliente OAuth"
3. Tipo: **Aplicación web**
4. Nombre: `GreenGlass Web Client`
5. **URIs de redirección autorizados**:
   - `http://localhost:5173/auth/google/callback` (desarrollo)
   - `https://tu-app.vercel.app/auth/google/callback` (producción)
   - Tu URL de Supabase: `https://XXXXX.supabase.co/auth/v1/callback`
6. Click "CREAR"
7. **GUARDA** el Client ID y Client Secret

---

## ⚙️ Paso 5: Configurar Variables de Entorno

### En tu archivo `.env.local`:

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com

# Para las API routes de Vercel (en Vercel Dashboard > Settings > Environment Variables)
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=https://tu-app.vercel.app/auth/google/callback

# Supabase (ya deberías tener estos)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Gemini AI (para generar emails)
GEMINI_API_KEY=tu-gemini-api-key
```

### En Vercel (Settings > Environment Variables):

Agrega las mismas variables pero sin el prefijo `VITE_` para las que van al backend.

---

## 🔄 Paso 6: Configurar Supabase Auth

1. Ve a tu proyecto de Supabase > Authentication > Providers
2. Habilita **Google**
3. Ingresa tu Client ID y Client Secret
4. En "Authorized Client IDs", agrega tu Client ID
5. **Importante**: Agrega los scopes adicionales en la configuración avanzada:
   ```
   email profile openid https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.events
   ```

---

## 🗄️ Paso 7: Ejecutar Migraciones de Base de Datos

En Supabase SQL Editor, ejecuta:

```sql
-- Primero el archivo migration_email_scheduling.sql
```

---

## 🎉 Paso 8: Probar

1. Inicia sesión en tu app
2. Al hacer login con Google, deberías ver los permisos adicionales
3. Crea una búsqueda demo
4. Click en "Organizar Reunión" en un candidato
5. Deberías ver el flujo completo funcionando

---

## 🐛 Troubleshooting

### "Access blocked: Authorization Error"
- Verifica que los URIs de redirección coincidan exactamente
- Asegúrate de que la app esté en modo "Testing" con tu email como tester

### "Invalid_scope" 
- Los scopes deben estar exactamente como se muestran arriba
- Verifica en OAuth Consent Screen que estén agregados

### "Token refresh failed"
- El refresh token puede haber expirado
- El usuario debe volver a autorizar la app

---

## 📧 Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Click en "Get API Key"
3. Crea una nueva API key
4. Agrégala como `GEMINI_API_KEY` en tus variables de entorno

---

## 🔒 Notas de Seguridad

- **NUNCA** commits el archivo `.env.local` 
- Usa variables de entorno de Vercel para producción
- El `SUPABASE_SERVICE_ROLE_KEY` solo debe usarse en el backend
- Revisa los tokens de acceso periódicamente
