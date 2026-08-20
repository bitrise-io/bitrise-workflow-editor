# Flows

Seven paths through the app, chosen by what the codebase actually touches: the mutation entry
point has ~575 call sites, modular mode is the most-worked-on area of the last year, and
`WorkflowService` and `StepService` are the two services everything else reaches for.

Read [DOMAIN.md](DOMAIN.md) first if the words `workflow`, `pipeline`, `step bundle` and
`CVS` don't yet mean specific things to you.

| Flow | Start reading at |
|---|---|
| [1. Editing the config](#1-editing-the-config) | `core/stores/BitriseYmlStore.ts` |
| [2. Reading the config](#2-reading-the-config) | `hooks/useBitriseYmlStore.ts` |
| [3. One file or many](#3-one-file-or-many) | `core/models/Tree.ts` |
| [4. Saving](#4-saving) | `hooks/useSaveCiConfig.ts` |
| [5. Adding a step](#5-adding-a-step) | `core/services/StepService.ts` |
| [6. Renaming or deleting a workflow](#6-renaming-or-deleting-a-workflow) | `core/services/WorkflowService.ts` |
| [7. The YAML tab](#7-the-yaml-tab) | `hooks/useYmlLanguageServices.ts` |

---

## 1. Editing the config

Every typed UI in the app funnels into one function. Learn this and most of the codebase stops
being surprising.

```mermaid
flowchart LR
  C["Component<br/><i>onChange</i>"] --> S["Service<br/><i>WorkflowService.renameWorkflow</i>"]
  S --> G{"getXOrThrowError<br/>target exists?"}
  G -- no --> T["throw"]
  G -- yes --> U["updateBitriseYmlDocument(mutator)"]
  U --> K["store clones ymlDocument"]
  K --> M["mutator edits the clone<br/><i>via YmlUtils</i>"]
  M --> N["setState({ ymlDocument })"]
  N --> D["subscriber re-derives<br/><i>yml</i> and <i>hasChanges</i>"]
  D --> R["selector hooks re-render"]
```

The store keeps the config twice. `ymlDocument` is a `yaml` AST that remembers comments, key
order and formatting, and it is the writable one. `yml` is a plain object derived from it, and it
is read-only. Reads go through `yml`, writes go through `ymlDocument`.

The clone is not defensive habit. `YmlUtils` caches by document identity in a `WeakMap`, and the
store's subscriber compares `a.ymlDocument === b.ymlDocument`. Mutating in place would serve
stale cached reads and skip the re-render.

**Two entry points, and only two.** `updateBitriseYmlDocument(mutator)` is for structured edits
and only services call it, which a lint rule enforces. `updateBitriseYmlDocumentByString(text)`
replaces the whole document from raw text, and the UI calls it legitimately from the YAML editor,
the diff dialog and the AI drawer.

Why it matters: [YAML must survive a round-trip](DECISIONS.md#why-the-yaml-is-an-ast-not-an-object).

---

## 2. Reading the config

```mermaid
flowchart TD
  A["Selector returns…"] --> B{"a fresh object<br/>or array?"}
  B -- yes --> C["useBitriseYmlStore(fn)<br/><i>deep-equal useShallow</i>"]
  B -- "no, a primitive or<br/>an existing reference" --> D["useStore(bitriseYmlStore, fn)<br/><i>cheaper, Object.is</i>"]
  C --> E["renders when the slice<br/>actually changed"]
  D --> E
  F["raw useStore with a<br/>fresh value"] --> G["infinite render loop<br/>on mount"]
  style F fill:#F6E7D8,stroke:#A9520C
  style G fill:#F6E7D8,stroke:#A9520C
```

`useBitriseYmlStore` wraps every selector in `@/hooks/useShallow`, which despite the name is deep
equality via `dequal`, not Zustand's one-level version. That is what makes inline object-building
selectors legal at all.

Get this wrong and the page hangs rather than merely re-rendering too much, because
`useSyncExternalStore` compares snapshots by identity and a fresh object is never identical. A
lint rule catches the common shapes; a fresh value built inside a block body is still on you.

Why it matters: [the wrapper is a precondition, not a tuning knob](DECISIONS.md#why-useshallow-is-deep).

---

## 3. One file or many

A config can be one `bitrise.yml` or a tree of files linked by `include:`. Roughly half of
`BitriseYmlStore` exists to serve the second case.

```mermaid
flowchart TD
  B["bootstrap"] --> F{"feature flag<br/>enable-wfe-modular-yaml-editing"}
  F -- off --> S["initializeBitriseYmlDocument<br/><i>tree stays undefined</i>"]
  F -- on --> T["GET /config/tree"]
  T --> N{"any include: edges?"}
  N -- no --> S
  N -- yes --> M["tree + files{nodeId: FileSlice}<br/>+ entityIndex"]
  S --> A["ymlDocument"]
  M --> A
  A --> X["every service, unchanged"]
```

> **The trick.** `ymlDocument` is not *the config*. It is a binding to the active tab's file.
> Selecting a tab re-points it, and every service keeps working without knowing files exist.
> That indirection is why multi-file editing shipped without modifying a single pre-existing
> domain service.

Mode is decided by `state.tree !== undefined`, never by the flag. `files` holds the contents,
`tree` is the structural skeleton, and `entityIndex` records which file defines which entity in
precedence order, highest first. `nodeId` is backend-owned and opaque; `path` is not unique, so
never key by it.

Why it matters, and what it costs:
[scope narrowed, guards not](DECISIONS.md#why-cross-file-operations-are-incomplete).

---

## 4. Saving

```mermaid
sequenceDiagram
  participant U as You
  participant FE as Editor
  participant BE as Server
  FE->>BE: GET config
  BE-->>FE: yml + Bitrise-Config-Version (sha256 of contents)
  U->>FE: edits
  FE->>BE: POST yml + the same version header
  alt hash still matches
    BE-->>FE: saved, new version
  else someone else saved first
    BE-->>FE: conflict
    FE->>FE: diff3Merge(yours, remote, base)
    FE-->>U: merged buffer, conflicts resolved to remote
  end
```

There is no revision counter. The server SHA-256s the file's contents and hands back the digest;
a save replays it and is rejected when the hash has moved. Content-addressed, stateless, and it
survives a server restart. The modular tree does the same one level down with a per-node
`commitSha`.

> **Trap.** The merge writes **no conflict markers**. Every conflicting region resolves to the
> remote side, your text is dropped from the buffer, and a red decoration is the only record.
> Dismiss the dialog without editing and your work is gone, with no prompt and no undo.

Why it works that way: [markers would break the YAML](DECISIONS.md#why-conflicts-resolve-to-remote).

---

## 5. Adding a step

```mermaid
flowchart LR
  P["'script@1'"] --> Q["parseStepCVS<br/><i>ordered dispatch</i>"]
  Q --> L["library + id + version"]
  L --> A["StepApi / Algolia"]
  A --> V["defaultValues<br/><i>from step.yml</i>"]
  Y["bitrise.yml"] --> W["userValues<br/><i>the only layer on disk</i>"]
  V --> G["mergedValues"]
  W --> G
  G --> UI["what the drawer renders"]
```

A step's key encodes library, id and version in one string, and `parseStepCVS` is ordered
dispatch: specific prefixes first, bare form last, so reordering the branches changes behaviour.
The bare form resolves against `default_step_lib_source`, which is why every predicate takes a
`defaultStepLibrary`.

Only `userValues` reaches the document. A field can look set in the UI while the YAML holds
nothing, and writing a value equal to the default still adds a line.

> **Trap.** An empty version is not "unset", it is the policy *always latest*. Removing a pin
> changes what runs; it is not tidying.

Steps have no id. A step is the *i*-th entry of a `steps[]` array, so every operation takes an
index and any concurrent reorder invalidates one you were holding.

---

## 6. Renaming or deleting a workflow

The reference implementation for removing anything, because a workflow is the entity everything
else points at.

```mermaid
flowchart TD
  D["deleteWorkflow(id)"] --> A["the definition<br/><i>workflows.id</i>"]
  D --> B["stage membership<br/><i>2 shapes</i>"]
  D --> C["graph node<br/><i>pipelines.*.workflows.id</i>"]
  D --> E["chain edges<br/><i>before_run, after_run</i>"]
  D --> F["graph edges<br/><i>depends_on</i>"]
  D --> G["legacy triggers<br/><i>trigger_map</i>"]
  D --> H["nodes that use: it<br/><i>and their own inbound edges</i>"]
  D --> I["stages left empty"]
```

Nine passes, one per class of inbound edge. Rename mirrors it one for one. The count of passes is
the count of edge kinds, so a tenth way to reference a workflow needs a tenth pass and nothing
enumerates them for you: grep the field name.

The `keep` argument on `YmlUtils.deleteByPath` and friends names an ancestor that must survive
being emptied. Omit it and removing the last workflow from a pipeline takes the pipeline's
`workflows` key with it.

> **Trap.** In modular mode every pass reaches only as far as the active file. Other files keep
> the old name or a dangling reference, and "used by N workflows" undercounts, so the guard
> reassures you at exactly the wrong moment.

---

## 7. The YAML tab

```mermaid
flowchart TD
  ST["BitriseYmlStore<br/><i>files</i>"] --> RC["reconcile()"]
  RC --> MD["one Monaco model per file<br/><i>bitrise:// URI</i>"]
  MD --> ED["the editor you type in"]
  MD --> LS["monaco-yaml + Bitrise LS"]
  LS --> MK["markers"]
  MK --> RM{"root model only"}
  RM --> VS["validation status<br/><i>save gating, badge</i>"]
  ED -. "keystrokes" .-> ST
```

Same URI means same model, so the language worker analyses exactly the text you see, and the
whole include tree registers as one workspace, which is what makes cross-file go-to-definition
resolve.

Validation status watches the **root model only**. monaco-yaml registers the whole-config schema
with `fileMatch: ['*']`, so an include fragment with no `format_version` reports an `anyOf` error;
aggregating would flip a perfectly valid config to invalid and bounce you out of the visual
editor.

> **Trap.** In dev website mode the schema layer is skipped entirely for cross-origin reasons, so
> you get no markers and a permanently valid status.

Why it is built this way:
[one model, shared](DECISIONS.md#why-the-editor-shares-models-with-the-worker).
