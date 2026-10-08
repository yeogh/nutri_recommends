# Build & Error Log (`build.md`)

## Build Run #1 — Initial Compilation
- **Timestamp**: `2026-10-07T21:11:56-07:00`
- **Command**: `npm run build` (`tsc && vite build`)
- **Status**: `FAILED` (Exit code 2)
- **Error Log**:
  ```text
  [INFO] Starting build...

  > nutri-recommends@1.0.0 build
  > tsc && vite build

  server.ts(5,33): error TS7016: Could not find a declaration file for module './api/nutribalance.js'. '/api/nutribalance.js' implicitly has an 'any' type.
  server.ts(6,27): error TS7016: Could not find a declaration file for module './api/pantry.js'. '/api/pantry.js' implicitly has an 'any' type.
  server.ts(7,30): error TS7016: Could not find a declaration file for module './api/agent-chef.js'. '/api/agent-chef.js' implicitly has an 'any' type.
  [ERROR] Build failed: exit status 2
  ```
- **Root Cause**: `tsconfig.json` had `"strict": true` without `"allowJs": true`, causing TypeScript to reject importing `.js` Vercel serverless route modules inside `server.ts`. Additionally, the `.js` files in `/api` contained TypeScript parameter type annotations.
- **Resolution**:
  1. Added `"allowJs": true` to `tsconfig.json`.
  2. Converted `/api/*.js` files to pure ESM JavaScript without TypeScript type annotations.

---

## Build Run #2 — Post-Fix Verification
- **Timestamp**: `2026-10-07T21:12:54-07:00`
- **Command**: `npm run build` (`tsc && vite build`)
- **Status**: `SUCCEEDED`
- **Log**: `Build succeeded - the applet is compiled`

---

## Build Run #3 — Removing Pantry Persona & Agent Chef MCPs
- **Timestamp**: `2026-10-07T21:48:43-07:00`
- **Command**: `npm run build` (`tsc && vite build`)
- **Status**: `SUCCEEDED`
- **Log**: `Build succeeded - the applet is compiled`

---

## Build Run #4 — Adding `/api/health.js` Endpoint
- **Timestamp**: `2026-10-07T21:55:46-07:00`
- **Command**: `npm run build` (`tsc && vite build`)
- **Status**: `SUCCEEDED`
- **Log**: `Build succeeded - the applet is compiled`

---

## Build Run #5 — Keyless MCP Experiment & Checkpoint Revert
- **Timestamp**: `2026-10-07T23:36:56-07:00` & `2026-10-07T23:47:18-07:00`
- **Command**: `npm run build` (`tsc && vite build`)
- **Status**: `SUCCEEDED`
- **Log**: `Build succeeded - the applet is compiled`

---

## Build Run #6 — Spoonacular `complexSearch` & Gemini API Integration
- **Timestamp**: `2026-10-08T00:02:46-07:00`
- **Command**: `npm run build` (`tsc && vite build`)
- **Status**: `SUCCEEDED`
- **Log**: `Build succeeded - the applet is compiled`

---

## Runtime / API Error Handling Guardrails
All server-side routes (`/api/nutribalance.js`, `/api/spoonacular.js`, `/api/gemini.js`) implement strict pre-fetch and post-fetch checks:
1. **Missing or Empty API Key (`HTTP 503 Service Unavailable`)**:
   - Before calling upstream services, each route verifies that its required server-side environment variable (`SMITHERY_API_KEY`, `SPOONACULAR_API_KEY`, or `GEMINI_API_KEY`) exists and is non-empty.
   - If missing, the endpoint returns `503` immediately with a descriptive JSON error without calling the external service.
2. **Upstream Non-OK Status (`response.ok` Check)**:
   - After every `fetch`, `response.ok` is checked before reading the body to handle empty or non-JSON auth error responses gracefully.
3. **Network / Upstream Failure (`HTTP 502 Bad Gateway`)**:
   - Exceptions thrown during upstream calls are caught and returned as structured JSON `{ ok: false, source, error }` with status `502`.
