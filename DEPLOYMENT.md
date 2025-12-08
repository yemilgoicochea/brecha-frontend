# Deployment Guide - Brecha Frontend

## Archivos de Configuración por Ambiente

La aplicación utiliza archivos de `environment` separados para cada ambiente:

- **`src/environments/environment.ts`** - Desarrollo local (default)
- **`src/environments/environment.staging.ts`** - Staging
- **`src/environments/environment.prod.ts`** - Producción

Cada archivo contiene la URL del API para ese ambiente:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000'  // ← Cambiar aquí según el ambiente
};
```

## Build por Ambiente

### Desarrollo (default)
```bash
npm start
# o
ng serve
```
Usa `environment.ts` → `http://127.0.0.1:8000`

### Staging
```bash
ng build --configuration=staging
```
Usa `environment.staging.ts` → URL configurada

### Producción
```bash
ng build --configuration=production
```
Usa `environment.prod.ts` → URL configurada

## Cambiar URLs de API

Para cambiar la URL del API según el ambiente, editar:

1. **Desarrollo:** `src/environments/environment.ts`
   ```typescript
   apiUrl: 'http://127.0.0.1:8000'
   ```

2. **Staging:** `src/environments/environment.staging.ts`
   ```typescript
   apiUrl: 'https://api-staging.tudominio.com:8000'
   ```

3. **Producción:** `src/environments/environment.prod.ts`
   ```typescript
   apiUrl: 'https://api.tudominio.com:8000'
   ```

## Deploy en Cloud Run / Docker

```bash
# Build para producción
ng build --configuration=production

# Build Docker
docker build -t brecha-frontend:v1.0.0 .

# Push a Google Container Registry
docker tag brecha-frontend:v1.0.0 gcr.io/tu-proyecto/brecha-frontend:v1.0.0
docker push gcr.io/tu-proyecto/brecha-frontend:v1.0.0

# Deploy en Cloud Run
gcloud run deploy brecha-frontend \
  --image gcr.io/tu-proyecto/brecha-frontend:v1.0.0 \
  --region us-central1
```

## Verificación

Para verificar qué URL está usando la aplicación:

1. Abrir el navegador en la app
2. Abrir DevTools (F12) → Console
3. Escribir: `window.localStorage.getItem('apiUrl')`
4. O: Ir a Network y verificar las peticiones a `/api/v1/classify`




