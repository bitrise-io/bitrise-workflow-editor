# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@./node_modules/@bitrise/bitkit-v2/AGENTS.md

## Project Overview

Bitrise Workflow Editor — a React + Go application for editing CI/CD workflow configurations (bitrise.yml). Runs as a Bitrise CLI plugin (default) or as a website integrated with the Bitrise monolith. Transitioning from AngularJS to React.

## Common Commands

```bash
npm start                # Dev server + local Go API on port 4000
npm run start:website    # Dev server in website mode (requires monolith running on :3000)
npm run build            # Vite production build
npm run lint             # ESLint (cached)
npm run lint:fix         # ESLint autofix
npm test                 # Jest unit tests
npm test -- --testPathPattern="path/to/file"  # Run single test file
npm run test:smoke       # Playwright E2E tests
npm run storybook        # Storybook on port 6006
```

**Go API server:**
```bash
go vet ./...             # Vet Go code
go test ./...            # Go tests
```

**Setup:** `bitrise run setup` (installs Node + Go deps)

## Architecture

### Frontend (`source/javascripts/`)

- **Framework:** React 18 + TypeScript (strict mode), built with Vite
- **UI:** `@bitrise/bitkit-v2` (new, Chakra UI v3) for new components; `@bitrise/bitkit` (legacy, Chakra UI v2) still present but being replaced — use v2 for all new work, and migrate v1 components to v2 in any file you touch
- **State:** Zustand — `BitriseYmlStore` is the central store holding the YAML document
- **Data fetching:** TanStack React Query
- **Routing:** wouter (lazy-loaded pages)
- **YAML editing:** Monaco Editor + monaco-yaml + custom `@bitrise/languageserver`
- **Graph visualization:** XYFlow + dagre (pipeline/workflow graphs)
- **Drag & drop:** dnd-kit
- **Path alias:** `@/` → `source/javascripts/`

### Key directories

```
source/javascripts/
  core/
    api/           # API clients (BitriseYmlApi, StepApi, EnvVarsApi, etc.)
    stores/        # Zustand stores (BitriseYmlStore is the main one)
    models/        # TypeScript types for BitriseYml, Step, Workflow, etc.
    services/      # Domain logic (StepService, PipelineService, etc.)
  hooks/           # React hooks (useCiConfig, useSecrets, useFeatureFlag, etc.)
  components/      # Shared + unified-editor components
  pages/           # WorkflowsPage, PipelinesPage, TriggersPage, etc.

apiserver/         # Go HTTP server (Gorilla Mux), serves API + embedded static assets
cmd/               # Go CLI (Cobra)
spec/              # Test files (Jest unit + Playwright E2E)
```

### Patterns

- **`core/` is framework-agnostic** — no React or DOM dependencies. Pure TypeScript only
  - **`models/`** — internal application types used throughout the app
  - **`api/`** — API client functions that work with DTOs and map them to internal models. Consumed by services and hooks, never called directly from components
  - **`services/`** — business logic operating on models. Must have thorough unit tests covering happy paths, edge cases, error conditions, and different YAML formats where applicable
  - **`stores/`** — Zustand stores (mainly `BitriseYmlStore`). Coordinate state across the app
- **YAML preservation:** Service functions that modify YAML must not make unnecessary changes or reorder existing fields — only touch what's needed
- **Component architecture:** hooks manage API calls and local state; components focus on rendering
- **Two modes:** `MODE=CLI` (plugin, default) and `MODE=WEBSITE` — runtime behavior branches via `PageProps`/`RuntimeUtils` and environment checks

### Service Conventions

- All services are **pure functions** exported via `export default { ... }`, not classes
- **Mutation pattern:** services mutate YAML via `updateBitriseYmlDocument(({doc}) => { ...; return doc })` — the store clones the document before calling, so services mutate `doc` directly
- **Validation pattern:** `getXOrThrowError(id, doc)` before any mutation to ensure the target exists
- **Validate functions** return `string | boolean` — `true` on success, error message string on failure
- Services **never import React** — they live in `core/` which is framework-agnostic
- **Dependency direction:** `WorkflowService` and `StepService` are foundational (no service deps); others build on top (`PipelineService` → `WorkflowService` + `StepService`, etc.)
- **Cross-service operations:** Some user actions (e.g., deleting a workflow) touch multiple services (removal + trigger cleanup + env var cleanup). There's no explicit orchestrator — the store or calling code coordinates these calls. Be aware of cascading effects when modifying service functions

### Hook Conventions

- **Store selectors** are thin hooks wrapping `useBitriseYmlStore` with `useShallow` (e.g., `useWorkflows`, `useContainers`)
- **Data fetching hooks** use TanStack React Query (`useQuery`/`useMutation`) with proper `staleTime`/`gcTime`
- Hooks should be **thin wrappers** — delegate business logic to services rather than implementing it inline

### Page Conventions

- **Complex pages** (Workflows, Pipelines, StepBundles) use a page-specific Zustand store for dialog/selection state + a `Drawers.tsx` component for dialog rendering
- **Simple pages** use local hooks (`useDisclosure`, `useState`) — no page store needed
- Pages are **thin wrappers** (~30-60 LOC) composing canvas panels, config panels, and drawers

### Runtime & Tooling

- **MSW mocks:** API mocks for tests/stories use `.mswMocks.ts` files
- **Feature flags:** LaunchDarkly with local overrides in `ld.local.json`; access via `useFeatureFlag()` hook
- **YAML validation:** Done server-side (Go); invalid YAML state tracked separately in store

### Unified-Editor (`components/unified-editor/`)

- Largest component subsystem (119 files) — handles workflow/step/pipeline configuration UI
- Uses **React context** for passing entity IDs and step data to nested components
- Uses **`WorkflowCardContext`** for passing action callbacks (step actions, workflow actions, selection) to deeply nested card components
- **`FloatingDrawer`** is the standard drawer wrapper — opened via page store's `openDialog`/`closeDialog`
- Step editing flow: click → page store opens dialog → Drawer mounts → context provider fetches data → tabs render config

## File Naming Conventions

- Components: `PascalCase.tsx`
- Stores: `*.store.ts`
- Context providers: `*.context.tsx`
- Constants: `*.const.ts`
- Tests: `*.spec.ts` / `*.spec.tsx`
- Stories: `*.stories.tsx`
- MSW mocks: `*.mswMocks.ts`

## Lint Rules to Know

- `import/no-cycle: "error"` — no circular imports
- Import `useShallow` from `@/core/hooks/useShallow`, not from `zustand/shallow`
- `TEST_BITRISE_YML` global is restricted to spec/story/mock files only
- ESLint flat config in `eslint.config.mjs` using `@bitrise/eslint-plugin`

## Testing

- **Jest:** Uses `@swc/jest` for transforms. Global `yaml` is available in tests (from `spec/setup-jest.ts`). CSS/SVG mocked via identity-obj-proxy.
- **Playwright:** Config in `playwright.config.ts`. Supports Chromium, Firefox, WebKit.
- **Storybook:** MSW addon for API mocking. Stories colocated with components.

## Important Notes

- Dev server available at `localhost:4000/{version}` (version from package.json)
- Go static assets are embedded via go.rice (rice-box)
- **Version bumps** (`package.json` + `version/version.go`): Vite hot-reloads `package.json` and starts serving at the new `/{version}/` (or `/{urlPrefix}/{version}/`) path, but the Go `go run main.go` process keeps its already-compiled binary with the old `version.VERSION` constant. The two then disagree on the route prefix and requests 404. After pulling/rebasing across a version-bump commit, restart the `workflow-editor` service (don't rely on Vite's hot-reload) so Go recompiles against the new constant.
- Husky pre-commit hooks run lint-staged
- The app runs inside an **iframe** on the Bitrise website — routing uses hash-based location (`useHashLocation`) and communicates with the parent window via `WindowUtils`
- `BitriseYmlStore` always **clones the YAML document before mutations** — this is critical for `YmlUtils` caching to work correctly (WeakMap keyed by document identity)
- `YmlUtils` is a comprehensive YAML manipulation library (~30 functions) wrapping the `yaml` library — use it for all YAML node operations instead of manipulating nodes directly
- Error handling in services uses **throw** for sync errors; toasts via `createBitkitToast` from `@bitrise/bitkit-v2` for user-facing notifications in components (legacy: `useToast` from `@bitrise/bitkit`)