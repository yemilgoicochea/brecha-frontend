# Brecha Frontend

Aplicación web en Angular 19 para el clasificador de proyectos públicos de Invierte.pe (SNPMGI, Perú). Permite a los usuarios enviar proyectos para clasificación automática por indicadores de brecha y consultar el historial de resultados.

## Tecnologías

- Angular 19
- Angular Material 19
- TailwindCSS
- TypeScript

## Prerequisitos

- Node.js 20+
- Angular CLI 19

```bash
npm install -g @angular/cli
```

## Configuración local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar la URL del API
# Editar src/app/config/api.config.ts
# Por defecto apunta a http://127.0.0.1:8080 (brecha-ai-service-py local)
```

## Ejecutar

```bash
# Desarrollo
ng serve
# → http://localhost:4200

# Build producción
ng build
# → dist/brecha-frontend/
```

## Páginas

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/login` | Iniciar sesión | Público |
| `/register` | Registrar cuenta | Público |
| `/dashboard` | Panel principal | Autenticado |
| `/classify` | Clasificar proyecto | Autenticado |
| `/history` | Historial de análisis | Autenticado |
| `/admin/sectors` | Gestión de sectores | Admin |
| `/admin/gaps` | Gestión de indicadores de brecha | Admin |

## Estructura del proyecto

```
src/app/
├── features/
│   ├── auth/          # Login y registro
│   ├── classifier/    # Formulario de clasificación e historial
│   ├── dashboard/     # Panel principal
│   └── admin/         # Gestión de sectores y brechas
├── core/
│   ├── guards/        # AuthGuard, AdminGuard
│   └── interceptors/  # HTTP interceptors (JWT)
├── services/
│   ├── classification.service.ts  # API classify, history, retry
│   └── admin.service.ts
├── models/            # Interfaces TypeScript
├── config/
│   └── api.config.ts  # URL base del API
└── app.routes.ts      # Rutas principales
```

## Flujo de clasificación

1. Usuario ingresa título del proyecto en `/classify`
2. Frontend llama `POST /api/v1/classify` → recibe `query_id`
3. Hace polling a `GET /api/v1/query/{query_id}` hasta que `status = completed`
4. Muestra los indicadores de brecha clasificados con score de confianza
5. El historial en `/history` permite ver todas las consultas y reintentar las que no tuvieron resultados

## Tests

El frontend actualmente no tiene tests automatizados. Angular CLI incluye soporte para:

| Tipo | Tecnología | Estado |
|------|-----------|--------|
| Unit tests | Karma + Jasmine | No implementado |
| E2E tests | A elección (Cypress, Playwright) | No implementado |

Áreas pendientes de cubrir:
- `ClassificationService` (submit, polling, retry, history)
- `AuthGuard` y `AdminGuard`
- Componentes `HistoryComponent` y `ClassifierPageComponent`

```bash
# Unit tests (cuando existan)
ng test

# E2E tests (cuando existan)
ng e2e
```

## Despliegue

El frontend se despliega como sitio estático. La URL del API de producción se configura en `src/app/config/api.config.ts` o via variables de entorno al momento del build.
