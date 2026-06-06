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

El frontend tiene dos tipos de pruebas independientes:

| Tipo | Herramienta | Propósito | Requiere servidor |
|------|-------------|-----------|-------------------|
| Unitarios / componente | Jest + Angular TestBed | Lógica interna, servicios, guards | No |
| E2E (End-to-End) | Cypress | Flujos completos en navegador real | Sí (Angular en :4200) |

---

### 1. Tests unitarios (Jest)

No requieren ningún servidor. Los servicios HTTP se mockean con `HttpTestingController`.

| Archivo | Qué prueba |
|---------|------------|
| `auth.service.spec.ts` | Login, logout, registro, isAdmin |
| `auth.guard.spec.ts` | Redirige a `/login` si no autenticado |
| `admin.guard.spec.ts` | Redirige a `/dashboard` si no es admin |
| `auth.interceptor.spec.ts` | Agrega `Bearer token` en cada request |
| `admin.service.spec.ts` | CRUD sectores, gaps, niveles de gobierno |
| `services/classification.service.spec.ts` | submit, polling, historial, retry |
| `classifier-page.component.spec.ts` | Formulario, submit, navegación, errores |
| `history.component.spec.ts` | Lista, ordenamiento, expand, retry |
| `gap-cards.component.spec.ts` | Tarjetas, colores por confianza, porcentajes |

```bash
# Ejecutar todos los tests unitarios
npm test

# Modo watch (re-ejecuta al guardar)
npm run test:watch

# Solo tests de integración
npm run test:integration
```

---

### 2. Tests E2E (Cypress)

Abren un navegador real contra la app corriendo en `localhost:4200`. Las llamadas al API se interceptan con `cy.intercept()` — el backend no necesita estar corriendo.

| Archivo | Qué prueba |
|---------|------------|
| `cypress/e2e/01-auth.cy.ts` | Login exitoso/fallido, logout, registro, enlaces |
| `cypress/e2e/02-guards.cy.ts` | Rutas protegidas redirigen correctamente |
| `cypress/e2e/03-classify.cy.ts` | Formulario, submit 202, navegación a historial, errores |
| `cypress/e2e/04-history.cy.ts` | Lista vacía, estados (pending/completed), expand, retry |

```bash
# 1. Levantar la app Angular (terminal 1)
ng serve

# 2. Cypress — UI interactiva (terminal 2, recomendado para desarrollo)
npm run test:e2e
# → abre el navegador Cypress en http://localhost:4200

# 3. Cypress — headless (CI / sin UI)
npm run test:e2e:run
```

## Despliegue

El frontend se despliega como sitio estático. La URL del API de producción se configura en `src/app/config/api.config.ts` o via variables de entorno al momento del build.
