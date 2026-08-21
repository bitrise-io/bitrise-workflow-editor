# Conventions

How to write code here. Mechanism lives in [flows.md](flows.md), rationale in
[decisions.md](decisions.md), vocabulary in [domain.md](domain.md).

## What you are writing with

| | |
|---|---|
| Framework | React 18 + TypeScript (strict), built with Vite |
| UI | `@bitrise/bitkit-v2` (Chakra v3) for all new work. `@bitrise/bitkit` (Chakra v2) is legacy; migrate v1 components to v2 in any file you touch |
| State | Zustand, `BitriseYmlStore` |
| Data fetching | TanStack React Query |
| Routing | wouter, lazy-loaded pages |
| YAML editing | Monaco + monaco-yaml + `@bitrise/languageserver` |
| Graphs | XYFlow + dagre |
| Drag and drop | dnd-kit |
| Path alias | `@/` maps to `source/javascripts/` |

## Where things live

```
source/javascripts/
  core/            no React, no DOM. Lint enforces it
    models/        internal types
    api/           HTTP clients: DTO in, model out. Components never call these
    services/      business logic over models. All structured YAML mutation
    stores/        Zustand stores, mainly BitriseYmlStore
    utils/         YmlUtils and friends
  hooks/           store selectors and React Query wrappers
  components/      shared and unified-editor
  pages/           thin composition

apiserver/         Go HTTP server (Gorilla Mux), API plus embedded assets
cmd/               Go CLI (Cobra)
spec/              Jest unit and Playwright E2E
```

### Where does this go?

| You are writing | It goes in |
|---|---|
| Logic that changes the YAML structure | `core/services` |
| A name or value validator | `core/services`, returning `string \| boolean` |
| An HTTP call | `core/api`, wrapped by a hook |
| Reading YAML state into a component | a selector hook over `yml` |
| Fetching remote data | a React Query hook |
| Which dialog is open | the page store, or `useDisclosure` on simple pages |
| A mode difference | `core/api` or the component. Never a service |
| Anything touching `yaml` AST nodes | nowhere directly. Use `YmlUtils` |

## Layer rules

**`core/` is framework-agnostic.** No React, no DOM, so services test in plain Jest with no
renderer. Lint enforces it.

**Dependency direction.** `WorkflowService` and `StepService` are foundational and depend on no
other service. Everything else builds on them.

**Branch on runtime mode at the edges only.** `MODE=CLI` is the plugin default, `MODE=WEBSITE` is
the monolith iframe. Branch in `core/api` for endpoint paths and request shapes, in components for
feature visibility, in `core/analytics`. Lint rejects it in `core/services` and `core/stores`.
Wanting `isWebsiteMode()` inside a service means the branch belongs somewhere else. Mode is
sometimes a capability difference rather than a URL swap: `SecretApi.getSecretValue` returns
`undefined` in CLI mode because no local endpoint exists.

## Services

Pure functions exported through one `export default { … }`, never classes.

```ts
function renameWorkflow(id: string, newName: string) {
  updateBitriseYmlDocument(({ doc }) => {
    getWorkflowOrThrowError(id, doc);          // validate before you touch anything
    YmlUtils.updateKeyByPath(doc, ['workflows', id], newName);
    return doc;                                 // the store already cloned it
  });
}
```

- **Validate first.** `getXOrThrowError(id, doc)` so a stale id fails at the top instead of
  writing half a change.
- **Validators return `string | boolean`.** The message on failure, not `false`, so they drop
  straight into react-hook-form.
- **Two write entry points.** `updateBitriseYmlDocument(mutator)` for structured edits, services
  only, lint-enforced. `updateBitriseYmlDocumentByString(text)` to replace the whole document from
  raw text, which the YAML editor, diff dialog and AI drawer use legitimately.
- **`keep` arguments are load-bearing.** `YmlUtils.deleteByPath` and friends take an ancestor that
  must survive being emptied. Omit it and removing the last workflow from a pipeline takes the
  pipeline's `workflows` key with it.
- **Never round-trip through JSON.** `toJSON` is for reading. Never hand-build YAML strings.
- **No orchestrator exists.** Deleting a workflow means removal, trigger cleanup and env var
  cleanup, sequenced by the store or the calling component. Check for cascades before changing a
  mutating service.
- Services need real tests: happy paths, edge cases, error conditions, and different YAML shapes
  for the same semantic input.

## Hooks

Thin. Business logic belongs in a service.

**Which store hook.** This is correctness, not tuning.

| Your selector returns | Use |
|---|---|
| A fresh object or array | `useBitriseYmlStore` |
| A primitive or existing reference (`s.tree`, `s.hasChanges`) | raw `useStore(bitriseYmlStore, …)`, cheaper |

Raw `useStore` with a fresh value hangs the page on mount rather than merely re-rendering. Lint
catches the common shapes; a value built inside a block body is still on you. Fix a slow selector
by selecting less, never by adding `useMemo`.

**React Query.** Always set `staleTime` and `gcTime` explicitly, chosen from what the data *is*
rather than how often it changes. The distribution is deliberately bimodal: immutable or
store-owned gets `Infinity`, sensitive gets `0` for both. `staleTime` is per-observer, so two
hooks sharing a `queryKey` and not a policy will fight. Sharing a key obliges you to share the
policy.

## Pages and dialogs

A page gets its own Zustand store when its dialogs can open **each other** and share selection
context. Not because it has dialogs, and not because it fetches. Containers has both and needs no
store. Workflows, Pipelines and StepBundles have `*.store.ts` plus `Drawers.tsx`; the rest use
`useDisclosure`.

Wiring a drawer takes three slots, and each omission fails differently:

```tsx
{isDialogMounted(TYPE) && (
  <SomeDrawer isOpen={isDialogOpen(TYPE)} onClose={closeDialog} onCloseComplete={unmountDialog} />
)}
```

No `isDialogMounted` and its queries, context and form state stay alive while idle. No `isOpen`
and there is no animation. No `onCloseComplete` and it never unmounts, killing dialog-to-dialog
navigation silently.

`openDialog` is a handler factory: pass `openDialog({type})` in JSX, call `openDialog({type})()`
imperatively. Forget the `()` and nothing happens; add it in JSX and the dialog opens during
render.

## Components

Hooks manage API calls and local state. Components render.

In `components/unified-editor/`, React context carries entity ids and step data down, and
`WorkflowCardContext` carries the action callbacks. **Capability is expressed by absence**: to
make a subtree read-only, withhold the callbacks at the context boundary rather than passing a
permission flag. The accessor hooks throw outside their provider on purpose.

`FloatingDrawer` is the standard drawer wrapper, opened through the page store.

## Naming

| Pattern | Is |
|---|---|
| `PascalCase.tsx` | a component |
| `*Service.ts` | domain logic, in `core/services` |
| `*Api.ts` | an API client, in `core/api` |
| `*.store.ts` | a page-scoped Zustand store |
| `*.context.tsx` | a context provider, except `WorkflowCardContext.tsx` and `SortableWorkflowsContext.tsx` |
| `*.const.ts` | constants |
| `*.spec.ts(x)` | a colocated Jest test |
| `*.stories.tsx` | a colocated Storybook story |
| `*.mswMocks.ts` | MSW handlers for tests and stories |

## Lint

Flat config in `eslint.config.mjs`, using `@bitrise/eslint-plugin`. Four rules encode things the
docs used to only assert:

```
core/ may not import react or react-dom        .tsx may not call updateBitriseYmlDocument
useShallow comes from @/hooks/useShallow       raw useStore may not build a fresh value
```

`TEST_BITRISE_YML` is restricted to spec, story and mock files. **No circular-import rule is
enabled** — `import/no-cycle` is absent from every config, so direction is a convention you
uphold rather than a check that catches you.

## Testing

- **Jest** transforms with `@swc/jest`. The global `yaml` comes from `spec/setup-jest.ts`.
  identity-obj-proxy mocks CSS and SVG.
- **`window.env` does not exist under Jest**, so `RuntimeUtils.isProduction()` throws in unit
  tests. `BitriseYmlStore.warnInDev` wraps it in try/catch for exactly that reason. Don't call
  `RuntimeUtils` from anything a service test reaches without handling it.
- **Calling a store setter outside `act()` does not flush**, and a test written that way reports a
  confident false pass.
- **Playwright** config is in `playwright.config.ts`, running Chromium, Firefox and WebKit.
- **Storybook** uses the MSW addon. Stories sit next to their components.

## Feature flags and mocks

LaunchDarkly, with local overrides in `ld.local.json`, read through `useFeatureFlag()`. API mocks
for tests and stories live in `.mswMocks.ts` files.
