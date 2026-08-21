# Decisions and traps

The half you cannot get by reading the code: why it is built this way, and what will cost you an
afternoon. Everything here is either a rationale that lives in nobody's head any more, or a
hazard that was reproduced with a throwaway test rather than inferred.

Mechanics live in [flows.md](flows.md). Vocabulary lives in [domain.md](domain.md).

## Why the YAML is an AST, not an object

`bitrise.yml` is a file the user owns, hand-edits and reviews in a diff. Every incidental
reformat is noise in someone's pull request, so this is a correctness property rather than
politeness.

A plain object cannot carry comments, key order or quoting style, so the store holds the `yaml`
`Document` and every mutation is node surgery through `YmlUtils`. Three rules follow. Never
round-trip through JSON, `toJSON` is for reading. Never hand-build YAML strings. Always go
through `YmlUtils`.

It is best-effort, not a guarantee. `toYml` infers sequence indentation and flow padding by
**majority vote** over the file's source tokens, so editing one workflow in a mixed-style file
reformats the minority, including parts nobody touched. A diff can legitimately contain hunks the
user did not cause.

`schema: 'yaml-1.1'` is fixed rather than inferred, which keeps `yes` and `no` as booleans and
matches the Go parser.

## Why the store clones before every mutation

`YmlUtils` memoises by document identity in a `WeakMap`, and the store's subscriber fires on
`a.ymlDocument !== b.ymlDocument`. Mutating in place would serve stale cached reads and skip the
re-render, silently and only sometimes.

In modular mode `updateFileDocument` clones **only the touched file**, so sibling slices keep
their identity and their caches. The same precondition makes `buildNodeUris` safe to memoise on
tree identity, because a keystroke clones `files` and never `tree`.

## Why useShallow is deep

React's `useSyncExternalStore` compares snapshots by identity. A selector that builds a fresh
object returns a new reference every call, so the store looks changed on every render and the
component loops until React gives up. That is a hang on mount, not a slow render.

`@/hooks/useShallow` wraps `dequal` and returns the previous reference when the new result is
deeply equal, which is the only reason inline object-building selectors are legal at all. It
costs a deep walk of the selected slice on every store update, so fix a slow selector by
selecting less, never by adding `useMemo`.

Zustand's own one-level `useShallow` is not enough here and a lint rule blocks importing it.

## Why cross-file operations are incomplete

Multi-file editing shipped by making `ymlDocument` a binding to the active tab's file rather than
the whole config. Every service kept working untouched, which is why the feature landed without a
domain-layer rewrite. The bill arrives at the boundary.

> **Trap.** Every service operation reaches exactly as far as the active document. `deleteWorkflow`
> leaves references in sibling files dangling. `renameWorkflow` leaves them stale. Any rule whose
> correctness needs the whole config is incomplete in modular mode.

The sharper version, and the transferable lesson: **when you narrow a data source, audit every
safety signal derived from it, not just every operation.** `useDependantWorkflows` is the guard
meant to warn before a destructive delete, and it reads the same narrowed view as the hazard, so
it undercounts and reassures at exactly the wrong moment.

The pieces for a fix already exist: `updateFileDocument` writes to any file, and `entityIndex` is
a live, precedence-ordered map of which file defines what. What is missing is coordination and a
policy decision, complicated by referencing files that may be `editable: false`.

`ContainerService` is the counter-example worth copying. It validates against the aggregated index
and writes to the active file, and its readers return `undefined` for a cross-file source instead
of throwing, because throwing crashes the card mid-render. Read paths degrade to empty, write
paths fail loudly.

> **Trap.** `addChainedWorkflow` accepts a cross-file target through `assertWorkflowReferenceable`.
> `setChainedWorkflows`, which drag-reorder calls, validates with `getWorkflowOrThrowError` and
> rejects the same id. Chain a workflow from another module file, drag it, get an error.

## Why conflicts resolve to remote

The merge produces a buffer the user then edits, and conflict markers are not valid YAML. Keeping
the buffer parseable is what lets the visual editor and the language server keep working, so
every conflicting region takes the remote side and your text is dropped.

> **Trap.** Dismissing the dialog without editing discards your work. No prompt, no undo, and a red
> decoration is the only record it was ever there.

Positioning those decorations has to count the **merged output** as it is assembled, not
`conflict.bIndex` or `oIndex`, which are offsets into the remote and base inputs. They coincide
only while no earlier region changes length, which is why a single-conflict case looks correct
either way.

> **Trap.** Two implementations exist. `mergeYamls.ts` is correct and gated behind the modular
> flag; the inline copy in `ConfigMergeDialog.tsx` has the offset bug and is the one that ships.
> When logic is duplicated for a migration, ask which copy is live before deciding where a fix goes.

## Why the editor shares models with the worker

One Monaco model per file, keyed by a `bitrise://` URI, shared between the editor component and
the language worker. Same URI means the worker analyses exactly the text on screen, and the whole
include tree registers as one workspace, which is what makes cross-file go-to-definition resolve.
Those URIs are byte-identical to what the language server composes for `include:` edges; the
match is by exact string.

Validation status tracks the root model only, and the reason is not laziness: the whole-config
schema matches every model, so an include fragment reports an error for the `format_version` it
was never supposed to have. Aggregating would flip a valid config to invalid and bounce the user
out of the visual editor. The root model still resolves cross-file references, so genuine
breakage surfaces. [The mechanism](flows.md#7-the-yaml-tab).

Models are deliberately never disposed on cleanup, because async workers may be mid-flight and
Strict Mode double-mounts.

**The forced YAML view is not wired to that status, on purpose.** `InvalidYmlRedirect` fires only
when the config cannot be *parsed*, because the visual editor then has no tree to render. Schema
and marker errors on a well-formed config deliberately do not trigger it: the visual editor
renders those fine, and the redirect is one-way, so gating it on marker status would strand
people on the YAML view with no way back. Anyone "fixing" the redirect to also fire on an invalid
status will reintroduce that.

> **Trap.** In dev website mode the schema layer is skipped for cross-origin reasons, so there are
> no markers at all and the status is permanently valid.

## Why capability is expressed by absence

Cards render mutating controls based on **callback presence**, never a permission flag. To make a
subtree read-only, withhold the callbacks at the context boundary. Every member of `StepActions`
and `WorkflowActions` is optional for exactly this reason, and the fully read-only case renders
`<WorkflowCardContextProvider>` with no props at all.

Nothing downstream checks a permission, so nothing downstream can forget to. The cost is that
absence carries no reason: you get a missing button rather than a disabled one with an
explanation.

They throw outside their provider for the same reason: an empty action set is indistinguishable
from read-only, so a silent fallback would render a permanently inert card instead of failing.

> **Trap.** The `WorkflowCardContext` provider's `useMemo` depends on a rest-spread, so the
> dependency is a new object every render and the memo never holds. It gives you structure, not
> re-render insulation, and no call site can fix it.

## Why conversions are one-way

Neither migration offers a way back. The data maps cleanly; the intent does not.

**Triggers.** The condition mapping is total and the compiler enforces it. The evaluation model is
not: `trigger_map` is first-match-wins, target-based triggers all fire. Two legacy push triggers
would become two builds where one ran before, so conversion is offered only when there is at most
one legacy trigger per type.

**Pipelines.** A stage boundary becomes a complete bipartite edge set, m×n edges rather than m+n.
Faithful, and it preserves an over-specification the author never chose, because they used stages
since stages were the tool. Graph is strictly more expressive, so no reverse conversion exists.

## Why services look the way they do

[Pure in the narrow sense](conventions.md#services) — no React, no DOM, no instance state — so
they run under plain Jest with no renderer, which is what makes the YAML round-trip test in
[conventions.md](conventions.md#testing) possible at all.

Validators return the error message rather than `false` because they feed react-hook-form
directly. Mutators validate first so a stale id fails at the top instead of writing half a change.

There is no orchestrator, and that is a choice rather than an omission. One would have to know
every cascade in the domain, which is exactly the knowledge that goes stale. A caller sequencing
explicit calls fails visibly when a new cascade is added; a silent orchestrator would not.

## Why a page gets its own store

The trigger is dialogs that can open **each other** while sharing selection context, not "has
dialogs" or "fetches data". Containers has both and needs no store.

A drawer needs three pieces of state, not one boolean, because it has to survive its own close
animation and hand over to a queued successor. Miss `onCloseComplete` and it never unmounts, and
dialog-to-dialog navigation dies silently.

## Start from the symptom

Debugging arrives holding an error, not a subsystem.

| What you see | What it is |
|---|---|
| The page hangs on mount, update-depth error | A raw `useStore(bitriseYmlStore, …)` selector building a fresh object. [Why](#why-useshallow-is-deep) |
| An edit does nothing, no error anywhere | The write was aimed at a read-only file or the merged tab. It warns in development only. [Why](#why-cross-file-operations-are-incomplete) |
| Every request 404s after a pull | A version bump. Vite serves the new path, the Go process kept the old compiled constant. Restart it. |
| A save came back and your changes are gone | The merge resolved conflicts to remote and you dismissed the dialog. [Why](#why-conflicts-resolve-to-remote) |
| Conflict highlights sit on the wrong lines | The shipping dialog positions them with `bIndex`/`oIndex` instead of the merged output. [Why](#why-conflicts-resolve-to-remote) |
| `RangeError`, enormous stack, on load | A cycle in `before_run`/`after_run` or in `bundle::` nesting. The guard walks every entity, so it throws before it can exclude anything. |
| The YAML tab shows no errors at all, ever | Dev website mode skips the schema layer for cross-origin reasons. [Why](#why-the-editor-shares-models-with-the-worker) |
| A diff contains hunks you did not cause | The style vote reformatted the minority in a mixed-style file. [Why](#why-the-yaml-is-an-ast-not-an-object) |
| A step shows an upgrade badge you cannot clear | `hasVersionUpgrade` ignores your pin and compares against the newest version overall. |
| Dragging a chained workflow throws "not found" | It came from another module file. Adding accepts cross-file ids; reordering does not. [Why](#why-cross-file-operations-are-incomplete) |
| A card renders with no buttons and no explanation | Capability is withheld, not disabled. [Why](#why-capability-is-expressed-by-absence) |
| `RuntimeUtils` throws in a unit test | `window.env` does not exist under Jest. |
| A feature silently does nothing in the CLI plugin | `PageProps.appSlug()` returns `''` there, so every query gated on `enabled: !!projectSlug` never fires. |
| `window is not defined` in a hook or component test | Jest's `testEnvironment` is `node`. Add an `@jest-environment jsdom` docblock. |
| A refactor passes lint and tests but does not compile | Nothing type-checks. Run `npx tsc --noEmit`. |

## Open defects

Reproduced, not inferred. Each one is a real bug someone will hit.

| What | Where | Status |
|---|---|---|
| Cross-file delete and rename leave dangling or stale references | modular mode | ticketed |
| `getStepBundleChain` recurses with no cycle guard, and the UI filter that prevents cycles is built from the same walk, so it throws first | `StepBundleService` | ticketed |
| `getBeforeRunChain` / `getAfterRunChain` have the identical defect | `WorkflowService` | open |
| Chaining accepts a cross-file workflow, reordering rejects it | `WorkflowService` | open |
| The shipping merge dialog positions conflict decorations with the wrong offsets | `ConfigMergeDialog.tsx` | open |
| `hasVersionUpgrade` resolves your pin and then compares against every published version rather than the ones the pin allows, so a step held at `2` wears a permanent badge. A spec asserts the current behaviour, so a fix breaks a passing test | `VersionUtils` | open |
| Secrets writes in CLI mode are read-all, modify, write-all with no concurrency token, so overlapping edits are last-writer-wins | `SecretApi` | open |
| Two `services:` keys are typed and neither is read or written: the root `BitriseYml.services`, and `WithModel.services`, which is a real container reference the editor ignores | `core/models` | open |
| UI-only fields (`isEditing`, `isSaved`) live in the `Secret` model, inside framework-agnostic `core/` | `core/models/Secret.ts` | open |

## A note on rot

This set exists because an audit found `CLAUDE.md` asserting three rules the code never obeyed,
including a lint rule that was never enabled. Anything a machine can check is therefore a lint
rule rather than a sentence, and a count appears only when you can re-derive it by opening one
file. A number nobody can reproduce reads as precision and is not.

`README.md` is human-facing and is not part of this set. It has drifted: it still announces an
AngularJS-to-React transition that finished in May 2025, and describes webpack, karma, jasmine and
`npm run e2e:*` scripts that no longer exist. Read it as history.

Where a doc and the code disagree, the code wins and the doc is a bug.
