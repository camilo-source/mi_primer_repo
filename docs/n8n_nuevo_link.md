# Configuración del nodo "agrega el link" en POC 2.0 A

## Expresión correcta para el campo `applicationFormLink`:

```javascript
={{
  "https://mi-primer-repo-seven.vercel.app/apply/" + $json.ID_busqueda_n8n
}}
```

## Explicación:
- La URL ahora apunta a nuestra página nativa `/apply/:jobId`
- Ya no usamos el formulario de n8n
- El ID viene del nodo anterior (Guardar_datos_de_busqueda)

## Verificación:
Después de ejecutar, el OUTPUT debería mostrar algo como:
```
applicationFormLink = https://mi-primer-repo-seven.vercel.app/apply/JOB-mil1a67hd-FN47LP
```

## Flujo completo:
1. Reclutador crea búsqueda en VIBE CODE ATS
2. n8n (POC 2.0 A) genera contenido y publica en LinkedIn
3. LinkedIn post tiene link a: `/apply/:jobId`
4. Candidato abre el link
5. Ve formulario nativo de VIBE CODE ATS
6. Sube CV → Se guarda en Supabase Storage
7. Datos del candidato van a tabla `postulantes`
