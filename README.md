# Azurian · Prueba QA Automation

Playwright + Cucumber (Gherkin en español) + TypeScript estricto + Allure.
Cubre el CRUD de documentos tributarios en **UI** y **API**, con extras de validaciones y un flujo híbrido.

## Requisitos
- Node.js 18+ (usa `fetch` nativo), Java 8+ (solo para generar Allure con `allure-commandline`)
- Laboratorio levantado con Docker: `docker compose up --build` y `GET /api/health` → `200`

## Instalación y configuración
```bash
npm install
npx playwright install chromium
cp .env.example .env      # BASE_URL, credenciales; en Windows con puerto bloqueado usa http://localhost:3100
```

## Ejecución
| Qué | Comando |
| --- | --- |
| Suite completa | `npm test` |
| Solo API / solo UI | `npm run test:api` / `npm run test:ui` |
| Por operación | `npm run test:crear` · `test:leer` · `test:editar` · `test:eliminar` |
| Extras | `npm run test:extras` (`@validaciones`, `@hibrido`) |
| Un escenario por ID | `npx cucumber-js --tags @UI-CRUD-03` |
| Un escenario por nombre | `npx cucumber-js --name "API-CRUD-01"` |
| UI con navegador visible | `npm run test:headed` |
| Paralelo | `PARALLEL=4 npm test` |
| Chequeo de tipos | `npm run typecheck` |

## Reporte Allure
```bash
npm run allure:report     # genera allure-report/ y lo abre
```
Cada verificación adjunta **Esperado** y **Obtenido**; cada llamada API adjunta Request/Response (token enmascarado);
en UI, un fallo adjunta captura de pantalla y URL.

## Arquitectura
```
features/{api,ui}/*.feature     Gherkin declarativo (sin selectores ni URLs)
src/api/client/ApiClient.ts     cliente API tipado
src/api/steps, src/ui/steps     pasos delgados (llaman a cliente / Page Object / verificador)
src/ui/pages                    POM (+ labels.ts: único lugar con textos de la UI)
src/support                     World, hooks, datos únicos, verificadores, precondiciones compartidas
```
- **Aislamiento:** cada escenario genera su propio `runId` (48 documentos semilla propios), folio único y RUT único con DV válido (módulo 11). En UI se inyecta el mismo `runId` en `localStorage` (`azurian_lab_run_id`) antes de cargar el portal. Seguro para paralelismo.
- **Asincronía:** sin pausas fijas; auto-wait de Playwright, `expect` web-first y `waitForResponse` ligado a cada acción.
- **Filas UI:** se localizan por folio + RUT + monto (`getByRole('row').filter(...)`), nunca `first()`/`nth()`.
- **API:** comparación de cuerpo completo; `id` y fechas se validan por forma (UUID / ISO).
