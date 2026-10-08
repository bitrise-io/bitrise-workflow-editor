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

The forced YAML view fires only when the YAML doesn't parse, never on schema errors or
[aliases](#aliases-and-merge-keys-only-warn): the visual editor renders those, and the redirect is
one-way, so it would strand people on the YAML view.

In dev website mode the schema layer is skipped for cross-origin reasons, so there are no markers.

## Aliases and merge keys only warn

`getMapIn`/`getSeqIn` throw on an alias at the end of a path and return nothing past one, and
writing through an alias changes every place that shares the anchor. The Visual editor doesn't
support them, but a config with an alias or a `<<` merge key in any file still opens there: the YAML
page's alert and the view switch's tooltip say it's unsupported, and a page that can't show one
throws to the [error page](#render-errors-show-a-page-instead-of-retrying). An edit that throws from
an event handler leaves the document as it was, and the global error handler shows its toast. Unused
anchors warn about nothing. The YAML view keeps
aliases and merge keys as written.

## An alias with no anchor is a parse error

The parser accepts it, then every serialization throws, so `toDoc` reports it as the parse error it
is. A file loaded with parse errors opens like an invalid single-file config: by its raw text, with
an empty document standing in.

## The entity index reads around aliases

The store rebuilds the index on every file change, whatever the view, so it can't throw on an alias.
It indexes every key written in a file and skips a key that exists only behind an alias or a merge
key, so for such a file it's partial. A file that doesn't parse is read as far as yaml parsed it,
since the visual pages still mount while it isn't the open one.

Skipping a file that uses aliases, or the whole index, instead makes the index claim a readable file
defines nothing. Skipping it on the YAML view needs the store to know the view, and a router flag
flips after the first visual render, which then sees an empty index.

## The editor reads YAML differently from the CLI

Builds parse with Go's `yaml.v2` (YAML 1.1), the editor with `yaml` 2.x (YAML 1.2):

| Input | CLI (build) | Editor |
|---|---|---|
| `yes`, `on` | `true` | the string `"yes"` |
| `010` | `8` | `10` |
| `<<: *x`, `<<: {k: v}` | merged | a key named `<<` |
| a duplicate key | the last one wins | a parse error |
| `a: &x [*x]` | an error | a circular value, which `toDoc` reports as an error |

An anchor never crosses files in either. Until the editor reads like the CLI, trust the build over
the form.

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

"Edit as YAML" reloads the editor onto the YAML page, where most crashes can be fixed, and drops
unsaved changes without asking: the editor crashed, so keeping them isn't expected. It reloads
rather than resetting the boundary, because a crash in shared chrome would throw again. It keeps only
`?branch=` of the query, so switching back to Visual opens the default page, not the entity that
crashed.

## Tool versions resolve the way mise does

The CLI passes a `tools:` prefix to `mise latest`, so `ToolVersionUtils` mirrors mise, including
java's own matcher and python's PEP 440 prereleases. Check it against the mise the CLI pins, not a
local one: a newer mise can list a tool's versions differently even where it matches the same way.

The first catalog match wins, which assumes the catalog is mise's list reversed. The CLI sorts the
catalog instead, so elixir's `-otp-` builds and some java, python, ruby and erlang lines are out of
mise's order (BE-2245). Fix that in the catalog rather than sorting here: mise does not sort.

## A `latest-of` prefix is never empty

Bare `latest` and `:latest` read back as the absolute strategies, so `serializeToolVersion` throws on
a `latest-of` without a prefix. Until it has one, `ToolRow` holds the value as a draft and the YAML
keeps the last value it could write. A new row does not offer `latest-of`, since its draft would not
survive the row becoming a real one.

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
