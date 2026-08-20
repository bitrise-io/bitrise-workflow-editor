# Architecture

How the editor is built: the layers, the store, and the cross-cutting mechanisms every feature sits on. Every claim was checked against the code.

## Contents

- [The layer map](#the-layer-map)
- [Modular YAML mode](#modular-yaml-mode)
- [YAML preservation](#yaml-preservation)
- [Saving and conflicts](#saving-and-conflicts)
- [The two modes](#the-two-modes)
- [Pages and dialogs](#pages-and-dialogs)
- [Component composition](#component-composition)
- [The fetch layer](#the-fetch-layer)
- [The editor and language service](#the-editor-and-language-service)
- [The Go side](#the-go-side)

---

## The layer map

Where code goes, what it may import, and the grep that proves it.

### Dependency direction

Arrows point *toward the thing being imported*. Nothing ever points back up.

```
  pages/ ────────┐
  components/ ───┼──▶ hooks/ ──▶ core/stores ──▶ core/services ──▶ core/models
                 │                                     │
                 └─────────────────────────────────────┴──▶ core/utils (YmlUtils, …)
                                                       core/api ──▶ core/models

  ├─ React lives here ─────────────┤├──── core/ : zero React, zero DOM ─────────┤
```

### The layers

| Layer | Files | Holds | May not |
|---|---|---|---|
| `core/models` | 15 | Internal TS types (`BitriseYml`, `Step`, `Workflow`) | , |
| `core/api` | 24 | HTTP clients; maps DTO → model | Be called from a component |
| `core/services` | 29 | Business logic + **all structured YAML mutation** | Import React |
| `core/stores` | 3 | Zustand vanilla stores; cross-app state | Import React |
| `core/utils` | 13 | `YmlUtils` (22 fns), runtime/page helpers | Import React |
| `hooks/` | 71 | Store selectors + React Query fetching | Hold business logic |
| `components/` | 202 | Rendering | Mutate YAML structurally |
| `pages/` | 127 | Thin composition; page store for dialog state | Grow past ~100 LOC at the entry file |

### The two representations, the load-bearing idea

> **Rule.** **Reads go through `yml`. Writes go through `ymlDocument`.** They are the same data in two forms, and only one of them is writable.

| Field | Form | Direction |
|---|---|---|
| `ymlDocument` | `yaml` `Document`. An AST that keeps comments, key order, formatting | **Write.** The source of truth. |
| `yml` | Plain JSON object | **Read only.** Derived from `ymlDocument` by a store subscriber. |

### The write path

```
component  ──▶  SomeService.doThing(args)
                    │
                    ├─ getXOrThrowError(id, doc)          validate the target exists
                    │
                    └─ updateBitriseYmlDocument(({ doc }) => { …mutate…; return doc })
                            │
                            ├─ store CLONES ymlDocument first   ← so services mutate freely
                            ├─ setState({ ymlDocument: next })
                            └─ subscriber re-derives  yml  +  hasChanges
```

#### Why the clone

A fresh object identity is what invalidates `YmlUtils`' `WeakMap` caches (keyed by `Document` identity) and what makes the subscriber's `equalityFn` (`a.ymlDocument === b.ymlDocument`) fire. Mutating in place would serve stale cached reads. In modular mode `updateFileDocument` clones *only* the touched file, so sibling slices keep their identity and their caches.

### The two mutation entry points

| Entry point | For | Called from |
|---|---|---|
| `updateBitriseYmlDocument(mutator)` | Structured, field-level edits | **Services only.** Zero `.tsx` callers. |
| `updateBitriseYmlDocumentByString(s)` | Whole-document replacement from raw text | UI, legitimately: the YAML editor, the diff dialog, the AI drawer. |

### Where does X go?

| You are writing… | It goes in |
|---|---|
| Logic that changes the YAML structure | `core/services` |
| A name/value validator | `core/services`. Returns `string \| boolean` |
| An HTTP call | `core/api`, wrapped by a hook |
| Reading YAML state into a component | A selector hook over `yml` |
| Fetching remote data | A React Query hook |
| Which dialog is open | The page store (complex pages) or `useDisclosure` (simple) |
| Anything touching `yaml` AST nodes | Nowhere directly. Use `YmlUtils` |

### Reading from the store

> **Rule.** Selector builds a **fresh** value → `useBitriseYmlStore`. Selector returns an **existing reference or primitive** → raw `useStore(bitriseYmlStore, …)`.

| Selector returns | Use | Why |
|---|---|---|
| Mapped / filtered / built object | `useBitriseYmlStore` | Plain `useStore` **infinite-loops on mount** via `useSyncExternalStore`, which compares snapshots by identity. It does not merely add extra renders |
| `s.tree`, `s.entityIndex`, `s.files[id]` | raw `useStore` | Stable reference; `Object.is` suffices and costs nothing |
| `s.selectedNodeId`, `s.hasChanges`, a comparison | raw `useStore` | Primitive |

`useBitriseYmlStore` wraps every selector in `hooks/useShallow.ts`, which despite the name is **deep** equality via `dequal`, not Zustand's one-level version. It returns the previous reference whenever the new result is deeply equal. That is what makes inline object-building selectors legal at all.

### Service conventions

- Pure functions, exported as one object: `export default { … }`. Never classes. (15/15 services conform.)
- Validate before mutating: `getXOrThrowError(id, doc)`.
- Validators return `true`, or an error *message string*, not `false`.
- Mutate only what's needed. Reordering or reformatting untouched YAML is a bug.
- Dependency order: `WorkflowService` and `StepService` are foundational; `PipelineService` and friends build on them.

### Drift this set found in `CLAUDE.md`

Every claim below was false when the audit ran on 2026-08-20. The first two have since been
fixed in `CLAUDE.md` and in `eslint.config.mjs`; they stay here as the record of what to watch
for, because a rule that is documented but not enforced is the failure mode that repeats.

| Claim | Reality when found | Status |
|---|---|---|
| `import/no-cycle: "error"` | **Not enabled anywhere.** Absent from `eslint.config.mjs`, from `@bitrise/eslint-plugin`, and from all three `eslint-plugin-import` configs that are extended. Cycles are prevented by convention only. | `CLAUDE.md` now says so |
| Import `useShallow` from `@/core/hooks/useShallow` | **That path does not exist.** The hook lives at `@/hooks/useShallow`, which is what all 4 real imports use. The ESLint `no-restricted-imports` message named the wrong path too, so the rule, if it ever fired, sent you nowhere. | Both fixed |
| Store file naming: `*.store.ts` | Mostly true, but `PipelinesPage.store.tsx` is `.tsx`. | Still true |
| (Omission) The store holds one document | `CLAUDE.md` never mentioned **modular YAML mode**, the `tree` / `files` / `FileSlice` / merged-config-tab machinery that is roughly half of `BitriseYmlStore.ts`. | It has a section now |

---

## Modular YAML mode

The multi-file config tree, the half of `BitriseYmlStore` that no document describes.

> **Note.** `CLAUDE.md` does not mention modular mode at all, and there is no design doc. The code comments are unusually good. Treat `BitriseYmlStore.ts` and `models/Tree.ts` as the de-facto spec, and this page as their index.

### The one idea

> **Rule.** `ymlDocument` is not *the config*. It is a **binding to the active tab's file**. Selecting a tab re-points it; every service keeps working, unaware that "the document" now means "one file of many".

That indirection is the whole trick. It is why multi-file editing shipped without rewriting the domain layer.

### Mode selection

| Question | Answer |
|---|---|
| What turns modular on? | Feature flag `enable-wfe-modular-yaml-editing` (default `false`), it only decides *which bootstrap API* runs. |
| What makes the store behave modularly? | **`state.tree !== undefined`**. Every branch in the store forks on this, not on the flag. |
| Flag on, config has no `include:`? | Falls back to plain single-file: `main.tsx` calls `initializeBitriseYmlDocument`, leaving `tree` undefined. |

### State shape

```
tree          TreeNode | undefined   structural skeleton, for traversal only
files         Record<nodeId, FileSlice>   ← THE source of truth for contents
entityIndex   EntityIndex            which file defines which entity, in merge order
selectedNodeId                       the active tab
openTabs      OpenTab[]              preview vs permanent, plus per-tab page memory
mergedYml / mergedYmlStale / savedMergedYml    read-only merged preview

FileSlice = { nodeId, path, source, commitSha, editable,
              ymlDocument, savedYmlDocument }
```

`nodeId` is opaque and backend-owned. `path` is *not* unique, so it can never be the key. `editable` is likewise backend-owned; the frontend never re-derives it.

### Write paths

| Function | Scope | Clones |
|---|---|---|
| `updateBitriseYmlDocument` | The active tab's file (via `editableActiveSlice`) | The active document |
| `updateFileDocument(nodeId, …)` | One named file, active or not | **Only that file**, siblings keep identity, and therefore their caches |
| `updateBitriseYmlDocumentByString` | The active tab's file, whole-text | Parses fresh |

#### Silent no-ops

> **Trap.** A write aimed at a read-only file or the merged tab is dropped with a
> `console.warn` in development only. In production a mis-gated dialog fails invisibly.

A mutation aimed at a read-only file (cross-repo include) or at the merged tab is **dropped**, with a `console.warn` in development only. The UI is expected to gate this already; the store's check is defence-in-depth. In production a mis-gated dialog fails invisibly.

### Precedence, the merge order

> **Rule.** An entity's definition list is ordered **highest precedence first**. Index `0` wins.

```
visit(node):
    record node's own entities          ← a node outranks the files it includes
    for child in reversed(node.includes):   ← a later include outranks an earlier sibling
        visit(child)
```

Both walks (`EntityIndexService.buildFromFiles` and `useDefaultStackDefinitions`) mirror the Go merger exactly. Both are cycle-guarded with a `seen` set, so a malformed payload can't hang the tab. The index is rebuilt from *live documents* on every `files` change, so cross-file detection is correct before saving, and not only after.

### The merged tab

- Id is the reserved constant `MERGED_CONFIG_NODE_ID = '__merged_config__'`. No `n_` prefix, so it cannot collide with a backend id.
- Read-only. No file slice backs it, so writes no-op by construction.
- `useMergedConfigSync` re-merges via the backend when the tab is active and stale. It compares a `JSON.stringify` of the requested tree against the current one and discards a result that an edit invalidated mid-flight.
- `savedMergedYml` is frozen while any file is dirty. It is the diff baseline.

### Cross-file hazards

> **Rule.** Every service operation reaches **exactly as far as the active document**. Any operation whose correctness depends on seeing the whole config is incomplete in modular mode.

| Operation | Single-file | Modular |
|---|---|---|
| `deleteWorkflow` (entity is local) | All 9 cleanup passes land | References in *other* files are left dangling |
| `deleteWorkflow` (entity is elsewhere) | n/a | Throws `… not found`. Fails loudly, does not half-apply |
| `renameWorkflow` | Rewrites chains + trigger map | Other files keep the *old* name; nothing defines it any more |
| "Used by N Workflows" | Accurate | Counts the active file only, **under**counts, so it reassures |

#### The review question

When you scope a data source down, audit every *safety signal* derived from it, not only every operation. Here the guard (`useDependantWorkflows`) and the hazard (`deleteWorkflow`) read the same narrowed view, so the guard cannot see the damage.

#### What exists vs. what's missing

Already present: `updateFileDocument(nodeId, …)` (cross-file writes), the live precedence-ordered entity index, all parsed file contents, and `/config/merge`. Missing: anything that *coordinates* them, and a policy decision. Silently edit unopened files, refuse, or warn? Note some referencing files may be `editable: false`, so "clean up everywhere" is not always available.

### The language-service seam

Files get a `bitrise://` model URI, byte-identical to what the language server composes when resolving `include:` edges, that exact-string match is what makes cross-file go-to-definition work.

- root → repo `.`; a local include inherits its includer's repo and ref; a cross-repo include uses its own, with precedence `commit > tag > branch`.
- The merged preview runs as a **separate** language-service workspace on the `bitrise-merged://` scheme, so its flattened symbols don't pollute the real one.
- `buildNodeUris` memoises in a `WeakMap` keyed by *tree identity*. Sound precisely because a keystroke clones `files` but never `tree`.

### Map of the code

| File | Holds |
|---|---|
| `core/models/Tree.ts` | Wire + internal types. Read the comments; they are the spec. |
| `core/services/TreeService.ts` | `walk`, `findNode`, `serializeTree`, source labels |
| `core/services/EntityIndexService.ts` | Precedence-ordered index built from live docs |
| `core/stores/BitriseYmlStore.ts` | Slices, tabs, binding, both subscribers |
| `hooks/useTree.ts` | Selectors: provenance, read-only view, model URIs |
| `hooks/useMergedConfigSync.ts` | The re-merge loop |
| `core/utils/lspModelUris.ts` | URI identity shared with the language server |
| `core/api/BitriseYmlApi.ts` | `/config/tree`, `/config/merge`, wire ↔ model mapping |

---

## YAML preservation

What survives a round-trip, and the rules that keep it that way.

> **Note.** `bitrise.yml` is a file the user owns, hand-edits and reviews in a diff. Every incidental reformat is noise in someone's pull request. This is a correctness property, not politeness.

### The three rules

1. **Never round-trip through JSON.** `toJSON` is for reading only. Serialising a plain object back to YAML destroys comments, key order and style.
2. **Never hand-build YAML strings.** No template literals, no string concatenation.
3. **Always go through `YmlUtils`.** 22 functions wrapping the `yaml` library; they operate on AST nodes, so unrelated bytes stay untouched.

### What `toYml` actually does

It is not a plain `stringify`. It walks the document's *source tokens* and infers the file's existing formatting by **majority vote**, then serialises to match.

| Setting | Inferred by |
|---|---|
| `indentSeq` | Counting block-seq items whose indent exceeds their parent map's. More indented than not → indented style. |
| `flowCollectionPadding` | Counting flow collections with a space inside the braces. Ties resolve to padded. |
| Tabs in scalars | Converted to `BLOCK_LITERAL`, tabs expanded to two spaces. |
| `version: '1.1'`, `schema: 'yaml-1.1'` | Fixed, not inferred. Keeps `yes`/`no`/`on`/`off` as booleans, matching the Go backend's parser. |

`toDoc` parses with `keepSourceTokens: true`, which is what makes the vote possible, and `stringKeys: true`.

### What survives

| Property | Survives an edit? |
|---|---|
| Comments | **Yes**, but a trailing comment may move onto its own line above the key |
| Key order | **Yes**; new keys append |
| Sequence indentation style | **Yes**, if the file is internally consistent |
| Flow-collection padding | **Yes**, by the same vote |
| `yes`/`no` booleans | **Yes**, not normalised to `true`/`false` |
| Quoting style of untouched scalars | Generally, yes |
| **Minority style in a mixed file** | **No**. See below |

### The mixed-file gotcha

> **Rule.** The vote is global, so in a file with mixed sequence styles, editing *anything* reformats the *minority*, including parts of the file you never touched.

```
before                          after editing workflow `a` only
──────                          ───────────────────────────────
workflows:                      workflows:
  a:                              a:
    steps:                          steps:
    - one: {}                       - one: {}
  b:                                title: A
    steps:                        b:
    - three: {}                     steps:
  c:                                - three: {}
    steps:                        c:
      - four: {}   ← indented        steps:
                                    - four: {}   ← silently flattened
```

Three flat sequences outvote one indented one, so `c` is rewritten. This is inherent to the design, not a bug, but it means "only touch what's needed" is **best-effort**, and a diff can legitimately contain hunks the user didn't cause.

### Reviewing a service for preservation

- Does it build any YAML text by hand? Reject.
- Does it read via `toJSON` and write the result back? Reject.
- Does it delete a parent container that still has siblings? Check the `keep` argument on `deleteByPath` / `deleteByValue` / `deleteByPredicate`, that is what stops a cleanup from removing an entire section.
- Does it set a value that was already equal? Prefer no write at all. An equal write can still restyle the node.

---

## Saving and conflicts

Concurrency tokens, and what the merge dialog does to your text.

### Concurrency tokens

| Mode | Token | Carried by |
|---|---|---|
| Single-file | `Bitrise-Config-Version` | Response header on GET, request header on POST |
| Modular | `commit_sha` | Per `TreeNode`; the store sets `version: ''` because a tree assembled from several refs has no single version |
| No version known | *none* | `version ? { header } : {}`, the save proceeds unchecked |

### The merge policy

> **Rule.** Three-way merge via `diff3Merge` (`node-diff3`): yours + remote against the common base. **No conflict markers.** Every conflicting region resolves to the **remote** side; your text is dropped from the buffer and a red decoration is the only record. You retype your change into the merged result.

> **Trap.** Dismissing the merge dialog without editing discards your work. No prompt,
> no undo, and a red decoration is the only record that your text was there.

Rationale: the buffer stays valid YAML, which markers would break. Cost: dismissing the dialog without editing discards your work, and nothing warns you first.

### Positioning decorations

The user edits the *merged output*, so decoration line numbers must count that buffer as it is assembled:

```
const conflictStartLine = rows.length + 1;   // running count of merged output
rows.push(...region.conflict.b);
```

`region.conflict.bIndex` and `oIndex` are offsets into the *remote* and *base* inputs. They coincide with the merged output only while no earlier region changes length, which is why a single-conflict case looks fine either way.

Deletion case: when the remote removed lines you had, `conflict.b` is empty, so there is nothing to highlight. The fixed version marks the boundary line, clamped to ≥ 1.

### Two implementations

| Copy | Used by | Positioning |
|---|---|---|
| `mergeYamls.ts` (exported) | Modular per-file dialog (flag-gated) | **Correct**. Merged-output line count |
| `ConfigMergeDialog.tsx` (inline) | Legacy single-file dialog. **Ships today** | **Buggy**, `bIndex`/`oIndex` |

#### Review reflex

When logic is duplicated for a migration, ask *which copy is shipping* before deciding where a fix belongs. A fix landed on the unshipped side reaches nobody.

---

## The two modes

CLI plugin vs. monolith iframe. What differs, and where the branch belongs.

### The mechanism

| Concern | How it's handled |
|---|---|
| Reaching the host | `WindowUtils.instance()` → `window.parent`. Standalone, `window.parent === window`, so **no branch is needed**. |
| Project / abilities / limits | `PageProps.*`, reading `instance().pageProps` injected by the host. `appSlug()` falls back to parsing `/app/:slug` from the URL in website mode. |
| Which mode | `RuntimeUtils.isWebsiteMode()` → `window.env.MODE`, set from Vite `loadEnv` at build time, default `CLI`. |
| Talking to the host | `postMessageToParent` / `onMessageFromParent`, both pinned to `window.location.origin`. The frame is **same-origin**. Direct `window.parent.pageProps` access would throw otherwise. |
| Navigation | Hash routing against the **parent's** location (`useHashLocation`). |

### Where a mode branch belongs

> **Rule.** Branch at the **edges**, where a request is formed, or where a feature is shown. Never in between.

| Layer | Branch? |
|---|---|
| `core/api/*` | **Yes**. Endpoint paths and some request bodies differ |
| Components | **Yes**, feature visibility (stacks & machines, some menus/notifications) |
| `core/analytics` | **Yes**, Segment identifies a known user only on the website |
| `core/services` | **No, zero occurrences** |
| `core/stores` | **No, zero occurrences** |

Wanting `isWebsiteMode()` inside a service means the branch belongs elsewhere, usually in the API client, or as a prop decided by the component that knows.

### Traps

- **`window.env` does not exist under Jest.** `spec/setup-jest.ts` doesn't stub it, so `RuntimeUtils.isProduction()` *throws* in unit tests. `BitriseYmlStore.warnInDev` wraps it in `try/catch` for exactly this reason. Don't call `RuntimeUtils` from anything a service test will reach without handling it.
- **This frame's own location is frozen.** The router only writes to the parent's hash, so `window.location` here stays at whatever it was on iframe load. That broke Intercom's page targeting; `useHashLocation` now mirrors the parent's hash locally before calling `Intercom('update')`. Read that comment before touching routing.
- **`parent`, not `top`.** They coincide today; `parent` is the correct relationship if nesting ever changes.

### Known erosion

`WindowUtils.location()` exists as the sanctioned way to read the host's URL and has **zero callers**. `window.parent.location.hash` appears 11 times across six production files, `useHashLocation`, `useSearchParams`, `useHashSearch`, `useFileTabs`, `useJumpToDefinition`, `Header.tsx`, `JumpToFileButton.tsx`, three of them the identical `recordActiveTabLocation(window.parent.location.hash)` line.

Every read is correct; the cost is that the boundary no longer localises change. Either route them through `WindowUtils` or delete the unused accessor. The current state gets the downsides of both.

---

## Pages and dialogs

Where UI state goes, and how to wire a drawer so it behaves.

### Store, or `useDisclosure`?

> **Rule.** A page needs its own Zustand store when its dialogs can **open each other** and share selection context. Otherwise use local `useDisclosure`.

| Page | Approach |
|---|---|
| Workflows, Pipelines, StepBundles | `*.store.ts` + `Drawers.tsx` |
| Containers, Triggers, Secrets, EnvVars, Stacks, Licenses, Yml | Local `useDisclosure` / `useState` |

Having dialogs, forms, or data fetching is *not* the trigger. Containers has all three and needs no store.

### Wiring a drawer

Three slots. Miss one and it breaks in a specific way.

```
{isDialogMounted(TYPE) && (
  <SomeDrawer
    isOpen={isDialogOpen(TYPE)}
    onClose={closeDialog}
    onCloseComplete={unmountDialog}
  />
)}
```

| Omit this | Symptom |
|---|---|
| `isDialogMounted` gate | Drawer's queries, context and form state stay alive while idle; reopening shows stale data |
| `isOpen` | No animation; the drawer pops in and out |
| `onCloseComplete` | Never unmounts, and a queued `_nextDialog` never fires, so dialog→dialog navigation silently dies |

### The lifecycle

```
openDialog(params)()          opened = T, mounted = T
        │
        ├─ if something already open:
        │     closeDialog()     opened = NONE, mounted unchanged   ← animating out
        │     _nextDialog = params
        │
onClose ──▶ closeDialog()       opened = NONE, mounted = T         ← animating out
        │
onCloseComplete ──▶ unmountDialog()
                      ├─ _nextDialog ? requestAnimationFrame(open it)
                      └─ else clear everything                      mounted = NONE
```

| Field | Controls |
|---|---|
| `mountedDialogType` | Whether the component is rendered. Outlives `opened`. |
| `openedDialogType` | The `isOpen` prop. Cleared immediately on close. |
| `_nextDialog` | Queued open request, replayed one frame after unmount. |

#### `openDialog` is a handler factory

```
<Panel onCreateWorkflow={openDialog({ type: CREATE_WORKFLOW })} />   // pass it
openDialog({ type: STEP_CONFIG, workflowId })();                     // call it
```

Forget the `()` in imperative code and nothing happens. Add it in JSX and the dialog opens during render.

### Known issues

- **Typo, 6 occurrences.** `unmountDialog`'s return branches write `nextDialog: undefined` instead of `_nextDialog`, in all three stores. Harmless, the replayed `openDialog` clears the real field a frame later, but it writes a junk key, and TypeScript does not catch it (branch-varying return shapes defeat excess-property checking).
- **Duplication.** The machine is copy-pasted across three stores, typo included. A generic `createDialogSlice<T>()` is the obvious factoring; the per-page payload shapes are what makes it non-trivial.
- **`CLAUDE.md` drift.** It calls pages "thin wrappers (~30-60 LOC)". Measured: 30-231, median ~88; only 4 of 10 are in the stated band (`SecretsPage.tsx` is 231). The principle holds, the number doesn't.

---

## Component composition

How data and permission reach a deeply nested card.

### The contexts

| Context | Carries |
|---|---|
| `WorkflowCard/contexts/WorkflowCardContext` | Step + workflow action callbacks, selection state. The important one. |
| `WorkflowConfig.context` | The workflow id being configured |
| `StepConfigDrawer.context` | Step data for the config drawer |
| `StepBundleConfig.context` | Step bundle id + data |
| `layouts/ConfigLoading.context` | Config load state |

**Naming note.** `CLAUDE.md` says `*.context.tsx`. Four match; `WorkflowCardContext.tsx` and `SortableWorkflowsContext.tsx` don't, so a `*.context.tsx` search misses the most important one.

### Capability by absence

> **Rule.** Cards render mutating controls based on **callback presence**, never a flag. To remove a capability from a whole subtree, withhold the callback at the context boundary.

```
if (isReadOnlyView) {
  return pick(methods, ['onSelectStep']);   // 12 step actions → 1
}
// useWorkflowActions: 8 → 2 (onEditWorkflow, onEditChainedWorkflow)
```

Nothing downstream checks a permission, so nothing downstream can forget to. The cost: absence carries no *reason*. You get a missing button, not a disabled one with an explanation.

`useIsReadOnlyView()` in `hooks/useTree.ts` is the single source of that decision.

#### Read-only sources

- The merged-config tab (no file slice backs it)
- Any node with `editable: false`, cross-repo or pinned-ref includes
- Local path-only includes stay **editable**; "included" ≠ read-only

#### Two layers of enforcement

1. **UI:** the card context withholds the callbacks.
2. **Store.** `editableActiveSlice` drops the mutation anyway, but warns in development only, so a leak is silent in production.

### Accessors

| Hook | Returns | Outside provider |
|---|---|---|
| `useSelection()` | `selectedStepIndices` + `isSelected(…)` | throws |
| `useStepActions()` | 12 actions, or 1 read-only | throws |
| `useWorkflowActions()` | 8 actions, or 2 read-only | throws |

Throwing is deliberate: an empty action set is indistinguishable from read-only, so a silent fallback would render a permanently inert card instead of failing loudly.

### Known issue: the provider memo is decorative

> **Trap.** `WorkflowCardContext` looks memoised and is not. It gives you structure,
> not re-render insulation, and no call site can fix it.

```
({ children, selectedStepIndices = [], selectionParent, ...methods }) => {
  const state = useMemo(() => ({ ...methods, selectedStepIndices, selectionParent }),
                        [methods, selectedStepIndices, selectionParent]);
```

`...methods` is rest destructuring. A new object every render, so the dependency never matches. The default `selectedStepIndices = []` has the same property.

So this context provides structure, not re-render insulation. If the workflow canvas profiles badly, start here. A fix belongs in the provider. Depend on `Object.values(methods)`, or stop rest-spreading and take a single stable `actions` prop.

---

## The fetch layer

The client contract and how to choose a cache policy.

### What `client.ts` owns

| Concern | Behaviour |
|---|---|
| CSRF | `X-CSRF-TOKEN` from cookie unless `excludeCSRF` |
| Timeout | 60s via `AbortController`; chains the caller's `signal` |
| Errors | Everything becomes `ClientError` with `status`, `response`, parsed `data` |
| Message | Body's `error_msg`/`error`, else a status-derived sentence |
| Empty body | `204` or `Content-Length: 0` → `undefined` |

The error body is read from `response.clone()`, JSON first then text, so a non-JSON error page doesn't destroy the response. `get` parses JSON directly; only the mutating verbs go through `parseResponse`, so a `GET` returning `204` would throw.

### Choosing a cache policy

> **Rule.** Ask what the data **is**, not how often it changes. Immutable → `Infinity`. Sensitive → `0` for both. Owned by the store → `Infinity`.

| Data | staleTime | gcTime |
|---|---|---|
| Step definitions | Infinity | Infinity |
| Algolia catalog | Infinity | 1 hour |
| CI config / tree / license pools / stacks | Infinity | default |
| **Secrets (list and value)** | **0** | **0** |

The distribution is bimodal. `Infinity` or `0`, almost nothing between.

#### `staleTime` is per-observer

> **Trap.** Two hooks sharing a `queryKey` but not a cache policy will fight: the one
> left on the default `staleTime: 0` refetches on mount regardless of the other.

Two hooks sharing a `queryKey` but not a policy will fight: the one with the default `staleTime: 0` refetches on mount regardless of the other. **Sharing a key obliges you to share the policy.** The only place this is documented is a comment in `useEnvVars`, mirroring `useStep`'s `['steps', …]` key.

#### Invalidation

Only three files touch the cache after a mutation. Secrets use `refetchQueries`, not `invalidateQueries`, with `gcTime: 0` there is no entry left to mark stale. Before adding a fourth, check whether the query should have been `Infinity` or `0` instead.

The YAML document is **not** in React Query. It is fetched once and owned by `BitriseYmlStore` thereafter.

#### Key conventions

Two coexist: path-derived (`[getYmlSettingsPath(slug)]`) and named literal (`['steps', {…}]`). Neither is wrong; the cost is no common prefix to invalidate against. Only `CI_CONFIG_TREE_QUERY_KEY` is exported as a constant.

---

## The editor and language service

One Monaco model per file, shared by the store, the schema and the language server.

### The one idea

> **Rule.** One Monaco model per config file, keyed by a `bitrise://` URI, **shared with the editor component**. Same URI ⇒ same model, so the language worker analyses exactly the text the user sees. The whole include tree is registered as one workspace, which is what makes cross-file go-to-definition resolve.

`useYmlLanguageServices` owns this. It is a single effect that configures the language services, reconciles the model set against the store, and registers a cross-file opener. Read it top to bottom. The comments in it are the design document.

### Reconciling models against the store

```
desiredModels()  no tree  -> [ the single root document ]
                 tree     -> one entry per file, uri = buildNodeUris(tree).get(nodeId)

reconcile(forceSync)
  upsert each desired model
  dispose owned models whose file left the tree, never one still attached to an editor
```

| Situation | Behaviour |
|---|---|
| Model does not exist | Create it |
| Content already equal | Do nothing |
| Model is attached to an editor | **Skip**. The user's keystrokes already flow to the store, and setting the value would clobber cursor and undo |
| …and this is a discard or external init | Sync anyway, deferred by one `requestAnimationFrame` so Monaco's in-flight work on an unmounting editor is not cancelled |

The effect's cleanup deliberately does **not** dispose models: async workers may be mid-flight, and React Strict Mode double-mounts. Models live for the whole app session.

### The serialization cache

```
const ymlStringByDocument = new WeakMap<Document, string>();
```

Serializing every include file on every keystroke would be wasteful, so the string is memoised by *document identity*. This is sound for exactly the reason the store clones only the edited file: on each keystroke one document is fresh and misses the cache, every sibling returns its cached string. A `WeakMap` needs no invalidation. The entry dies with the document. Same technique, same precondition, as `buildNodeUris` keyed on tree identity ([Reference 02](#the-language-service-seam)) and `YmlUtils`' own caches ([Reference 01](#the-layer-map)).

### Validation status tracks the root model only

> **Rule.** monaco-yaml registers the whole-config schema with `fileMatch: ['*']`, so it applies to *every* `bitrise://` model. An include fragment, a workflows-only module with no `format_version`. Therefore reports an `anyOf` error. Aggregating markers across all files would flip the config to *invalid* and bounce the user out of the visual editor for a config that is perfectly valid once merged.

So `onWorkspaceMarkerStatusChange` is given a thunk returning just the root model. The root model resolves cross-file references, so genuine cross-file breakage still surfaces; per-file syntax errors stay visible in each file's own editor. This status drives **save gating and the validation badge**. Not the editor-view redirect, which keys off a real parse failure via `useIsYmlParseError`.

#### Two debounce windows

```
first settle : 800ms     two marker owners (monaco-yaml's schema layer, and the
                          slower Bitrise LS) report at different times
after that   : 250ms     live valid/invalid feedback stays responsive
```

A single short window would surface a premature status and visibly toggle the Save button and the YAML/Visual switcher at load.

### Two flags, two failure modes

| Flag | Off means |
|---|---|
| `enable-wfe-modular-yaml-editing` | Single document, single model, no tree |
| `enable-wfe-bitrise-lsp-integration` | No Bitrise language server; editing falls back to plain monaco-yaml. Its worker queries Algolia (`steplib_steps`) on document change for diagnostics, completion and hover. The flag exists so that can be switched off without a deploy |

The cross-file opener is registered unconditionally, and that is safe: the only things that hand Monaco a cross-file target are the LS's definition, reference and link providers, which do not exist when the flag is off.

### Traps

- **No schema validation in dev website mode.** `configureForYaml` skips `configureMonacoYaml` entirely when `MODE === 'WEBSITE'` and `NODE_ENV !== 'production'`, because of cross-origin worker restrictions. A developer running `npm run start:website` gets no schema markers at all, and therefore a permanently *valid* status.
- **The schema is fetched from the internet.** `https://www.schemastore.org/bitrise.json?t=${Date.now()}`, an external dependency, with a cache-buster that defeats HTTP caching on every configure call.
- **Cross-file reveal polls.** `revealWhenReady` waits up to `REVEAL_MAX_ATTEMPTS = 60` animation frames (~1s) for the target editor to mount after a tab switch. Bounded so a blocked tab open cannot spin forever; generous so a large file still gets its range revealed instead of landing the user at line 1.
- `yamlVersion: '1.1'` here matches `schema: 'yaml-1.1'` in `YmlUtils.toYml`. If one moves, both must, otherwise `yes`/`no` mean different things to the editor and the serializer ([Reference 03](#yaml-preservation)).

### Map of the code

| File | Holds |
|---|---|
| `hooks/useYmlLanguageServices.ts` | Model reconciliation, marker subscription, cross-file opener |
| `core/utils/MonacoUtils.ts` | `configureForYaml`, the Bitrise LS wiring, env-var completion, marker aggregation |
| `core/utils/lspModelUris.ts` | `bitrise://` URI construction, the exact-string contract with the LS |
| `hooks/useModelValidationStatus.ts` | Per-model status for editors outside the store (diff, merge) |
| `pages/YmlPage/components/{YmlEditor,ModularYmlEditor}.tsx` | The editor views |
| `monaco-workers.ts`, `yaml.worker.ts` | Worker registration |

---

## The Go side

Small, and it barely changes. Worth an hour once, then you can mostly forget it.

In CLI mode the Go binary is the backend: it serves the built frontend, exposes `/api/*`, and
shells out to the Bitrise toolchain. In website mode none of it runs and the monolith answers
those calls instead. That is the whole reason the frontend branches on
`RuntimeUtils.isWebsiteMode()`.

> **Rule.** It reimplements nothing. Validation is the `bitrise` CLI, step metadata is
> `stepman`, include-tree merging is the CLI's `configmerge` package. The server is a thin HTTP
> shell over libraries that already exist, which is why it stays small, and why the frontend and
> the real CI agree on what a valid config is.

### Entry path

```
main.go -> cmd/root.go:36 (Cobra) -> apiserver.LaunchServer  (apiserver/api_server.go:43)
                                  -> SetupRoutes             (apiserver/routes.go:21, Gorilla Mux)
```

Check it with `go vet ./...` and `go test ./...`.

### How a save conflict is detected

There is no revision counter. The server SHA-256s the config file's contents and returns the hex
digest as the `Bitrise-Config-Version` header. A save sends that header back, and the write is
rejected when the hash no longer matches.

```go
// apiserver/service/bitrise_config.go:19
func AppendBitriseConfigVersionHeader(w http.ResponseWriter, contStr string) {
    hash := sha256.Sum256([]byte(contStr))
    w.Header().Set("Bitrise-Config-Version", hex.EncodeToString(hash[:]))
}
```

Content-addressed, stateless, and it survives a server restart. The modular tree uses the same
idea one level down: each `TreeNode` carries a `commitSha` that doubles as its conflict token.

### Where the defaults come from

`LaunchServer` resolves paths and ports through `utility.EnvString`, so each is an env var with a
fallback:

```go
// apiserver/api_server.go:59
config.BitriseYMLPath = utility.EnvString("BITRISE_CONFIG", "bitrise.yml")
```

`apiserver/config/config.go` is 22 lines and holds the constants rather than the env wiring:
`DefaultPort = "3645"`, `DefaultFrontendHost`, `DefaultFrontendPort = "4567"`,
`MinimalValidSecrets`, `MinimalValidBitriseYML`, plus the `BitriseYMLPath` and `SecretsYMLPath`
variables that `LaunchServer` fills in.

> **Trap.** A version bump breaks the dev loop. Vite hot-reloads `package.json` and starts
> serving at the new `/{version}/` path, but `go run main.go` keeps its compiled
> `version.VERSION`. The two disagree on the route prefix and every request 404s. Restart the Go
> process after pulling across a version-bump commit; the hot reload will not save you.

Static assets ship embedded through go.rice, so a stale rice-box serves a stale frontend. That is
also why the server can proxy to the Vite dev server instead when `USE_DEV_SERVER=true`.

### When to reach for it

It changes an order of magnitude less often than the TypeScript does. If a bug is in behaviour
the user sees, it is almost certainly on the frontend. Come here when validation messages, step
metadata or include resolution look wrong.
