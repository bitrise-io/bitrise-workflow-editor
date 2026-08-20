# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@./node_modules/@bitrise/bitkit-v2/AGENTS.md

## Project overview

Bitrise Workflow Editor, a React and Go application for editing CI/CD workflow configurations
(bitrise.yml). It runs as a Bitrise CLI plugin (the default) or as a website inside the Bitrise
monolith. The AngularJS to React migration is still in progress.

Three companion documents, in the order you want them:

- [docs/README.md](docs/README.md) is the index. Start there if the repo is new to you.
- [docs/DOMAIN.md](docs/DOMAIN.md) is the domain model: entities, identity, the references between them,
  and which invariants anything actually enforces. Read it before designing anything that adds
  an entity, a reference between entities, or a cascade.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/SUBSYSTEMS.md](docs/SUBSYSTEMS.md)
  hold the verified detail: the cross-cutting mechanisms, then one section per feature area.
  Every claim was checked against this repo with the command that checked it.

This file covers where code goes. `docs/DOMAIN.md` covers what the code is about.

## Common commands

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

Go API server:

```bash
go vet ./...             # Vet Go code
go test ./...            # Go tests
```

Setup: `bitrise run setup` installs the Node and Go dependencies.

## Architecture

### Frontend (`source/javascripts/`)

- **Framework:** React 18 + TypeScript (strict mode), built with Vite
- **UI:** `@bitrise/bitkit-v2` (new, Chakra UI v3) for new components. `@bitrise/bitkit` (legacy,
  Chakra UI v2) is still present but on the way out. Use v2 for all new work, and migrate v1
  components to v2 in any file you touch
- **State:** Zustand. `BitriseYmlStore` holds the YAML document in two representations.
  `ymlDocument` is a `yaml` AST and is the writable source of truth. `yml` is a plain object, read
  only, re-derived by a store subscriber. Reads go through `yml`, writes go through `ymlDocument`
- **Data fetching:** TanStack React Query
- **Routing:** wouter (lazy-loaded pages)
- **YAML editing:** Monaco Editor + monaco-yaml + custom `@bitrise/languageserver`
- **Graph visualization:** XYFlow + dagre (pipeline/workflow graphs)
- **Drag and drop:** dnd-kit
- **Path alias:** `@/` maps to `source/javascripts/`

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

- **`core/` is framework-agnostic.** No React, no DOM. Pure TypeScript only
  - **`models/`** holds the internal application types used throughout the app
  - **`api/`** holds API client functions that take DTOs and map them to internal models. Services
    and hooks consume them. Components never call them directly
  - **`services/`** holds business logic operating on models. They need thorough unit tests
    covering happy paths, edge cases, error conditions, and different YAML formats where that
    applies
  - **`stores/`** holds the Zustand stores, mainly `BitriseYmlStore`, which coordinate state
    across the app
- **YAML preservation.** A service that modifies YAML must not make unnecessary changes or
  reorder existing fields. Touch only what you need. Never round-trip through JSON (`toJSON` is
  for reading), never hand-build YAML strings, always go through `YmlUtils`. This is best-effort:
  `toYml` infers `indentSeq` and `flowCollectionPadding` by majority vote over the file's source
  tokens, so editing anything in a mixed-style file reformats the minority, including parts
  nobody touched
- **Component architecture.** Hooks manage API calls and local state. Components render
- **Two modes.** `MODE=CLI` (plugin, the default) and `MODE=WEBSITE`. Runtime behavior branches
  through `PageProps` and `RuntimeUtils`. **Branch at the edges only**: in `core/api` for endpoint
  paths and request shapes, in components for feature visibility, in `core/analytics`. There are
  zero occurrences in `core/services` and `core/stores` today. Wanting `isWebsiteMode()` inside a
  service means the branch belongs somewhere else. Mode is sometimes a capability difference
  rather than a URL swap. `SecretApi.getSecretValue` returns `undefined` in CLI mode because no
  local endpoint exists

### Service conventions

- Services are pure functions exported through one `export default { ... }`, never classes
- **Mutation pattern.** Services mutate YAML through
  `updateBitriseYmlDocument(({doc}) => { ...; return doc })`. The store clones the document before
  calling, so mutate `doc` directly
- **Two write entry points, and only two.** `updateBitriseYmlDocument(mutator)` handles structured
  field-level edits and services alone call it. There are zero `.tsx` callers today; keep it that
  way. `updateBitriseYmlDocumentByString(text)` replaces the whole document from raw text, and the
  UI calls it legitimately from the YAML editor, the diff dialog and the AI drawer
- **`keep` arguments are load-bearing.** `YmlUtils.deleteByPath`, `deleteByValue` and
  `deleteByPredicate` take an ancestor path that must survive even when emptied. Omit it and a
  cleanup removes a whole section. Removing the last workflow of a pipeline takes the pipeline's
  `workflows` key with it
- **Validation pattern.** Call `getXOrThrowError(id, doc)` before any mutation, so a stale id
  fails at the top instead of writing half a change
- **Validate functions** return `string | boolean`. `true` on success, the error message string on
  failure
- Services never import React. They live in `core/`, which is framework-agnostic
- **Dependency direction.** `WorkflowService` and `StepService` are foundational and depend on no
  other service. The rest build on them, so `PipelineService` uses `WorkflowService` and
  `StepService`
- **Cross-service operations.** Some user actions touch several services. Deleting a workflow
  means removal, trigger cleanup and env var cleanup. No orchestrator exists, so the store or the
  calling code sequences those calls. Check for cascade effects before you change a mutating
  service

### Modular YAML mode

A config can be split across several files linked by `include:`. Roughly half of
`BitriseYmlStore.ts` exists to serve this, and it is the part most likely to surprise you.

- **`ymlDocument` is a binding to the active tab's file, not "the config".** Selecting a tab
  re-points it. That indirection is why multi-file editing shipped without modifying a single
  pre-existing domain service. Don't undo it by teaching services about files
- **Mode is `state.tree !== undefined`**, not the feature flag. `enable-wfe-modular-yaml-editing`
  (default off) only picks which bootstrap API runs. A flagged-on config with no `include:` falls
  back to single-file
- **Key state.** `files` (`Record<nodeId, FileSlice>`) is the source of truth for contents, `tree`
  is the structural skeleton, and `entityIndex` records which file defines which entity, in
  precedence order, highest first. `nodeId` is backend-owned and opaque. `path` is not unique, so
  never key by it. `editable` is backend-owned too; never re-derive it
- **`updateFileDocument(nodeId, …)` clones only the touched file**, so sibling slices keep their
  identity and their `YmlUtils` caches
- **Every service operation reaches exactly as far as the active document.** `deleteWorkflow`
  leaves cross-file references dangling, `renameWorkflow` leaves them stale, and "used by N
  workflows" undercounts, because the guard reads the same narrowed view as the hazard. See
  [docs/DOMAIN.md §8](docs/DOMAIN.md#8-modular-mode-narrows-every-rule)
- A mutation aimed at a read-only file or the merged tab is dropped, with a `console.warn` in
  development only, so a mis-gated dialog fails invisibly in production
- The merged tab uses the reserved id `MERGED_CONFIG_NODE_ID = '__merged_config__'` and is
  read-only by construction, because no file slice backs it
- Read the comments in `core/models/Tree.ts` and `BitriseYmlStore.ts`. They are the de-facto spec.
  There is no design doc

### Saving and conflicts

- **Optimistic concurrency.** Single-file sends the `Bitrise-Config-Version` header from the GET
  response. Modular carries a per-node `commit_sha`. With no version known the save proceeds
  unchecked
- **Conflict policy.** A three-way merge through `diff3Merge`, with no conflict markers. Every
  conflicting region resolves to the remote side. Your text drops out of the buffer and a red
  decoration is the only record. The buffer stays valid YAML; the cost is that dismissing the
  dialog without editing silently discards your work
- Count decoration line numbers against the merged output as it is assembled, not against
  `conflict.bIndex` or `oIndex`. Those are offsets into the remote and base inputs, and they
  coincide with the output only while no earlier region changes length

### Hook conventions

- **Store selectors** are thin hooks wrapping `useBitriseYmlStore` with `useShallow`, such as
  `useWorkflows` and `useContainers`
- **Which store hook to use.** This is a correctness rule, not an optimisation:
  - Selector builds a fresh value, meaning a mapped, filtered or constructed object or array, so
    use `useBitriseYmlStore`. Raw `useStore` here infinite-loops on mount. It does not merely
    re-render more than it needs to
  - Selector returns an existing reference or a primitive, such as `s.tree`, `s.files[id]`,
    `s.hasChanges` or a comparison, so raw `useStore(bitriseYmlStore, …)` is fine and cheaper
  - `useBitriseYmlStore` wraps every selector in `@/hooks/useShallow`, which despite the name is
    deep equality through `dequal`, not Zustand's one-level version. That is what makes inline
    object-building selectors legal at all. It costs a `dequal` walk over the selected slice on
    every store update, so fix a slow selector by selecting less, not by adding `useMemo`
  - ESLint enforces the fresh-value case through `no-restricted-syntax` in `eslint.config.mjs`
- **Data fetching hooks** use TanStack React Query with an explicit `staleTime` and `gcTime`.
  Choose the policy from what the data is, not from how often it changes. The distribution is
  deliberately bimodal: immutable or store-owned data gets `Infinity`, sensitive data gets `0` for
  both. `staleTime` is per-observer, so two hooks sharing a `queryKey` but not a policy will
  fight. Sharing a key obliges you to share the policy
- Hooks stay thin. Delegate business logic to services rather than writing it inline

### Page conventions

- **A page needs its own Zustand store when its dialogs can open each other and share selection
  context.** That is the trigger, not "has dialogs" or "fetches data". Containers has both and
  needs no store. Today Workflows, Pipelines and StepBundles have a `*.store.ts` plus
  `Drawers.tsx`. Containers, Triggers, Secrets, EnvVars, Stacks, Licenses and Yml use local
  `useDisclosure` or `useState`
- Pages are thin composition over canvas panels, config panels and drawers. Entry files run 30 to
  231 LOC, median around 88, so treat "thin" as the intent rather than a band to measure against
- **Wiring a drawer takes three slots.** Each omission fails differently:
  ```tsx
  {isDialogMounted(TYPE) && (
    <SomeDrawer isOpen={isDialogOpen(TYPE)} onClose={closeDialog} onCloseComplete={unmountDialog} />
  )}
  ```
  Without the `isDialogMounted` gate the drawer's queries, context and form state stay alive while
  idle. Without `isOpen` there is no animation. Without `onCloseComplete` it never unmounts, and a
  queued dialog-to-dialog navigation silently dies
- `openDialog` is a handler factory. Pass `openDialog({type})` in JSX, call `openDialog({type})()`
  imperatively. Forget the `()` and nothing happens. Add it in JSX and the dialog opens during
  render

### Runtime and tooling

- **MSW mocks.** API mocks for tests and stories live in `.mswMocks.ts` files
- **Feature flags.** LaunchDarkly, with local overrides in `ld.local.json`, read through the
  `useFeatureFlag()` hook
- **YAML validation.** The Go server validates. The store tracks invalid YAML state separately

### Unified editor (`components/unified-editor/`)

- The largest component subsystem, 119 files, covering workflow, step and pipeline configuration UI
- React context carries entity IDs and step data to nested components
- `WorkflowCardContext` carries action callbacks, meaning step actions, workflow actions and
  selection, to deeply nested card components
- **Capability by absence.** Cards render mutating controls based on callback presence, never a
  permission flag. To make a whole subtree read-only, withhold the callbacks at the context
  boundary: `useStepActions` drops from 12 to 1, `useWorkflowActions` from 8 to 2. Nothing
  downstream checks a permission, so nothing downstream can forget to. The cost is that absence
  carries no reason. You get a missing button rather than a disabled one with an explanation
- The accessor hooks `useSelection`, `useStepActions` and `useWorkflowActions` throw outside their
  provider, deliberately. An empty action set is indistinguishable from read-only, so a silent
  fallback would render a permanently inert card
- The `WorkflowCardContext` provider's `useMemo` is decorative. It depends on a rest-spread of
  `...methods`, so a new object every render means the dependency never matches. It provides
  structure, not re-render insulation. A fix belongs in the provider, not the call site
- `FloatingDrawer` is the standard drawer wrapper, opened through the page store's `openDialog`
  and `closeDialog`
- Step editing flow: click, page store opens the dialog, the drawer mounts, the context provider
  fetches data, the tabs render config

## File naming conventions

- Components: `PascalCase.tsx`
- Stores: `*.store.ts`
- Context providers: `*.context.tsx`, except `WorkflowCardContext.tsx` and
  `SortableWorkflowsContext.tsx`, so a `*.context.tsx` search misses the most important one
- Constants: `*.const.ts`
- Tests: `*.spec.ts` / `*.spec.tsx`
- Stories: `*.stories.tsx`
- MSW mocks: `*.mswMocks.ts`

## Lint rules to know

- ESLint flat config in `eslint.config.mjs`, using `@bitrise/eslint-plugin`
- Import `useShallow` from `@/hooks/useShallow`, a deep-equal wrapper rather than Zustand's, never
  from `zustand/shallow`
- `no-restricted-syntax` rejects raw `useStore(bitriseYmlStore, …)` with a selector that builds a
  fresh object or array. Use `useBitriseYmlStore`, per the hook conventions above
- The `TEST_BITRISE_YML` global is restricted to spec, story and mock files
- **No circular-import rule is enabled.** `import/no-cycle` is absent from `eslint.config.mjs`,
  from `@bitrise/eslint-plugin`, and from every extended `eslint-plugin-import` config. Convention
  is the only thing preventing cycles, so respect the dependency direction yourself

## Testing

- **Jest** transforms with `@swc/jest`. The global `yaml` is available in tests, from
  `spec/setup-jest.ts`. identity-obj-proxy mocks CSS and SVG
- **`window.env` does not exist under Jest.** `spec/setup-jest.ts` doesn't stub it, so
  `RuntimeUtils.isProduction()` throws in unit tests. `BitriseYmlStore.warnInDev` wraps it in
  try/catch for exactly this reason. Don't call `RuntimeUtils` from anything a service test will
  reach without handling that
- Calling a store setter outside `act()` silently doesn't flush, and a test written that way can
  report a confident false pass
- **Playwright** config lives in `playwright.config.ts` and supports Chromium, Firefox and WebKit
- **Storybook** uses the MSW addon for API mocking. Stories sit next to their components

## Important notes

- The dev server is at `localhost:4000/{version}`, with the version from package.json
- go.rice (rice-box) embeds the Go static assets
- **Version bumps** touch `package.json` and `version/version.go`. Vite hot-reloads
  `package.json` and starts serving at the new `/{version}/` path, or
  `/{urlPrefix}/{version}/`, but `go run main.go` keeps its already-compiled binary with the old
  `version.VERSION` constant. The two then disagree on the route prefix and requests 404. After
  pulling or rebasing across a version-bump commit, restart the `workflow-editor` service so Go
  recompiles against the new constant. Don't rely on Vite's hot-reload here
- Husky pre-commit hooks run lint-staged
- The app runs inside an iframe on the Bitrise website. Routing uses hash-based location through
  `useHashLocation`, and `WindowUtils` talks to the parent window. `WindowUtils.instance()` is
  `window.parent`, which equals `window` when standalone, so most host access needs no mode branch
  at all. This frame's own `window.location` never changes, because the router writes the parent's
  hash, which is why `useHashLocation` mirrors it locally before calling `Intercom('update')`.
  Read that comment before touching routing
- `BitriseYmlStore` always clones the YAML document before mutations. `YmlUtils` caching depends
  on it, since the WeakMap is keyed by document identity
- `YmlUtils` wraps the `yaml` library in around 30 functions. Use it for all YAML node operations
  instead of manipulating nodes directly
- Services throw for sync errors. Components show user-facing notifications through
  `createBitkitToast` from `@bitrise/bitkit-v2`, or the legacy `useToast` from `@bitrise/bitkit`
