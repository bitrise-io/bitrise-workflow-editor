# Decisions and traps

Why some parts look odd, and what breaks if you "fix" them. Everything else, read the code.

## The YAML is an AST, not an object

`bitrise.yml` is a file people review in pull requests, so every incidental reformat is noise in
someone's diff. The store holds the `yaml` `Document`, and every edit is node surgery through
`YmlUtils`. Never round-trip through JSON, and never hand-build YAML strings.

It is best-effort. `toYml` picks indentation and flow padding by majority vote over the file, so an
edit in a mixed-style file reformats the minority style, including lines nobody touched.

## The store clones before every mutation

`YmlUtils` caches by document identity, and the store's subscriber fires on
`a.ymlDocument !== b.ymlDocument`. Mutating in place serves stale cached reads and skips the
re-render, silently and only sometimes. In modular mode only the touched file is cloned, so the
other files keep their caches.

## `useShallow` is deep

`useSyncExternalStore` compares snapshots by identity, so a selector that builds a fresh object
makes the page hang on mount. `@/hooks/useShallow` returns the previous reference when the result
is deeply equal, which is what makes object-building selectors safe in `useBitriseYmlStore`. Fix a
slow selector by selecting less, not with `useMemo`.

## Cross-file operations stop at the active file

Multi-file editing works by pointing the document at the active file, so every service kept
working unchanged. The cost is that a delete or rename leaves references in other files dangling
or stale, and "used by N workflows" undercounts, so the warning reassures you at the wrong moment.
The pieces for a fix exist (`updateFileDocument`, the entity index); the missing part is a policy
for files that are read-only.

`ContainerService` is the pattern to copy: it validates against the whole-config index, writes to
the active file, and its readers return `undefined` for another file's entity instead of throwing
mid-render.

## Save conflicts resolve to the remote side

Conflict markers aren't valid YAML, and the merged buffer has to stay parseable for the editor to
work. So every conflict takes the remote side, and a red decoration is the only record of your
version. Dismissing the dialog without editing discards your work.

## Monaco models are shared with the language worker

One model per file, keyed by a `bitrise://` URI, shared by the editor and the language worker, so
the include tree is one workspace and cross-file go-to-definition works. Effect cleanup never disposes
models, because workers may be mid-flight and StrictMode double-mounts. A model is disposed only
when its file leaves the tree and no editor has it open.

Validation status watches the **root model only**. The whole-config schema matches every model, so
an include fragment reports errors for keys it was never meant to have.

The forced YAML view fires only when the YAML can't be parsed, never on schema errors: the visual
editor renders those fine, and the redirect is one-way, so it would strand people on the YAML view.

In dev website mode the schema layer is skipped for cross-origin reasons, so there are no markers.

## Capability is expressed by absence

Cards show mutating controls only when they receive the callback. To make a subtree read-only,
withhold the callbacks at the context boundary; `useStepActions` and `useWorkflowActions` already
do this for read-only views. Components that call `useIsReadOnlyView()` directly are the ones that
can forget.

## Conversions are one-way

Legacy triggers are first-match-wins and target-based ones all fire, so conversion is offered only
with at most one legacy trigger per type. Stages become a full edge set between neighbouring
stages, which is faithful but not what anyone would write. Neither converts back.

## Services have no orchestrator

A delete's cascade (triggers, env vars, pipeline edges) is sequenced by the caller. An orchestrator
would have to know every cascade in the domain, and it would go stale silently.

## Render errors show a page instead of retrying

Datadog's `ErrorBoundary` at the root reports the error and shows a full error page. It never
retries: that re-renders the tree that just threw, which is how the alias crash reached ~3.9k
Datadog events per session.

"Edit as YAML" reloads the page, because the config loader sits under the boundary and would load
the saved file over the edits. So with unsaved changes the download leads and Edit as YAML confirms
first. The download is the latest document that parses.

## Things that fail somewhere else

- **A new YAML key fails at save**, not at compile time: the Go server validates with the `bitrise`
  library pinned in `go.mod`. Check the CLI's schema knows the key before building UI for it.
  Modular configs are validated merged, not per file.
- **A page gets its own store** only when its dialogs open each other while sharing selection.
  A drawer needs `isOpen`, `onClose` and `onCloseComplete`; without the last it never unmounts.
- **A shared `queryKey` needs a shared policy.** `staleTime` is per observer, so two hooks on one
  key with different values disagree about freshness. `gcTime` is per query and the longest one
  wins, so a single `Infinity` observer keeps the data cached for everyone.
- **Zustand stores reset between tests** through `spec/__mocks__/zustand.ts`, with no `jest.mock`
  anywhere to hint at it.
- **`TEST_BITRISE_YML` only exists in Storybook.** It type-checks and lints in a spec, then throws
  when the test runs.
- **The CLI-mode Go server stops itself** when no browser tab holds `/api/connection` open.
- **`PageProps.appSlug()` is `''` in CLI mode**, so queries gated on the project slug never fire.
