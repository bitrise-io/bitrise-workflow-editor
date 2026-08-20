# The domain model

Companion to [CLAUDE.md](../CLAUDE.md). That file says where code goes. This one says what the code
is about: the entities, their identity, the references between them, and which invariants
anything actually enforces.

Every claim here was checked against the code with a runnable command. Where a stated rule and
the code disagree, the code wins and the disagreement gets written down rather than smoothed
over. If a fact stops being true, this file is wrong. Fix it.

New to the codebase? Start with [README.md](README.md), then come back
here. The mechanisms behind every claim below are in [ARCHITECTURE.md](ARCHITECTURE.md)
and [SUBSYSTEMS.md](SUBSYSTEMS.md).

---

## 1. What the editor edits

One artifact: **`bitrise.yml`**, the CI configuration of a single Bitrise project. In modular
mode that artifact is a *tree of files* merged into one config. See
[modular scoping](#8-modular-mode-narrows-every-rule).

The domain splits in two, and the split matters more than any single entity:

| | In the document | Outside the document |
|---|---|---|
| **Entities** | workflows, pipelines, step bundles, containers, trigger map, app envs, tools, `meta` | secrets, stacks and machines, license pools, the step catalog |
| **Read via** | `BitriseYmlStore` selector hooks | React Query hooks |
| **Written via** | services calling `updateBitriseYmlDocument` | their own API endpoints, immediately |
| **Saved** | all at once, as one file, with a concurrency token | per operation |
| **Undo** | discard changes, which re-parses the saved document | none |

The config references the outside-the-document things by bare name (`meta.bitrise.io.stack`,
`$MY_SECRET` inside a step input) and, with one exception, **nothing resolves those references**.
A `bitrise.yml` naming a secret that does not exist is not an error state anywhere in the editor.

> The exception is stacks. `StackAndMachineService.prepareStackAndMachineSelectionData` sets
> `isInvalidStack` / `isInvalidMachineType` when the id in the YAML isn't in the fetched catalog,
> and the selector renders it as an explicit invalid option. Nothing does the equivalent for
> secrets. Verified: no file under `core/services/` or `core/api/` imports `useSecrets` or
> `SecretApi`. The only consumers are the secrets page and the insert-variable popover.

---

## 2. The entity map

Arrows are references by name. Every one of them is a plain string in the YAML with no
referential integrity behind it.

```
                          ┌──────────────┐
                          │ trigger_map  │  legacy, flat, first-match-wins
                          └──────┬───────┘
                                 │ workflow: / pipeline:
        triggers: (target-based) │
   ┌──────────────┐              ▼
   │  pipelines   │──── uses: ───▶┌──────────────┐──── before_run / after_run ──┐
   │              │               │  workflows   │◀─────────────────────────────┘
   │  staged  ▸ stages[].workflows│              │
   │  graph   ▸ workflows{}.uses  └──────┬───────┘
   └──────────────┘                      │ steps[]
                                         ▼
                          ┌──────────────────────────────┐
                          │  step reference (a CVS key)  │
                          └───┬──────────┬───────────┬───┘
                              │          │           │
                bundle::<id>  │      with│           │  script@2 · git::… · path::…
                              ▼          ▼           ▼
                     ┌──────────────┐  ┌────────┐  ┌──────────────┐
                     │ step_bundles │  │  with  │  │ step catalog │  (outside the doc)
                     └──────┬───────┘  └───┬────┘  └──────────────┘
                            │ steps[]      │ container: / services:
                            └──────────────┼──────────────┐
                                           ▼              ▼
                                    ┌──────────────┐  ┌──────────────┐
                                    │  containers  │  │  containers  │
                                    └──────────────┘  └──────────────┘

  outside the document, referenced by bare name and never resolved:
      secrets · stacks and machines · license pools   (meta.bitrise.io.*, $VAR in inputs)
```

A `step_bundles` entry may reference another one. That is legal, recursive, and unguarded. See
[SUBSYSTEMS.md](SUBSYSTEMS.md#step-bundles).

---

## 3. Entities

| Entity | Identity | Lives at | Service | Referenced by |
|---|---|---|---|---|
| **Workflow** | map key under `workflows:` | `workflows.<id>` | `WorkflowService` | pipelines (`uses`, stage lists), other workflows (`before_run`/`after_run`), `trigger_map` |
| **Pipeline** | map key under `pipelines:` | `pipelines.<id>` | `PipelineService` | `trigger_map`, target-based triggers |
| **Step bundle** | map key under `step_bundles:` | `step_bundles.<id>` | `StepBundleService` | workflow `steps[]`, other bundles' `steps[]`, as `bundle::<id>` |
| **Step** | positional, the index in a `steps[]` array | `…steps[i]` | `StepService`, `StepVariableService` | nothing. Steps are never referenced |
| **Container** | map key under `containers:` | `containers.<id>` | `ContainerService` | `execution_container`, `service_containers[]` on steps, bundles and `with` groups |
| **Trigger (target-based)** | position in `workflows.<id>.triggers.<type>[]` | inside its owner | `TriggerService` | nothing |
| **Trigger (legacy)** | position in `trigger_map[]` | top level | `TriggerService` | nothing |
| **Env var** | `key`, plus its `source` (`app` or a workflow) | `app.envs[]`, `workflows.<id>.envs[]` | `EnvVarService` | text interpolation only |
| **Stage** | map key under `stages:` | top level, legacy | none | staged pipelines |
| **Secret** | `key` | *not in the document* | `SecretService` | `$KEY` in any input, unresolved |
| **Stack / machine** | catalog id | `meta.bitrise.io.stack` and friends | `StackAndMachineService` | project default, per-workflow override |
| **File node** (modular) | backend-owned opaque `nodeId` | the tree, not the YAML | `TreeService`, `FileTreeService` | `include:` edges |

**Position is identity for steps.** A step has no id. It is the *i*-th entry of a `steps[]`
array, and its CVS key names a coordinate in a catalog, not this particular occurrence. Two
`script@1` steps in one workflow are indistinguishable except by index. Every step operation
therefore takes an index, and any concurrent reorder invalidates a held one.

---

## 4. Identity and naming

```
/^[A-Za-z0-9-_.]+$/     workflows · pipelines · containers · step bundles
```

Four services define that regex independently (`WORKFLOW_NAME_REGEX`, `PIPELINE_NAME_REGEX`,
`CONTAINER_NAME_REGEX`, `STEP_BUNDLE_REGEX`) and four `validateName` functions repeat the same
three checks: non-empty, matches, unique. `sanitizeName` strips everything outside the class.

- **Namespaces are per-collection.** A workflow and a pipeline may share a name. Uniqueness is
  only ever checked against the list of names the caller passes in, which in modular mode is the
  *active file's* list. See §8.
- **A leading underscore makes a utility workflow.** `isUtilityWorkflow` is
  `id.startsWith('_')` and nothing more. It affects presentation and where a workflow may be
  attached. The YAML has no concept of it.
- **Renaming means rewriting every reference.** `renameWorkflow` re-keys the map and rewrites
  chains and the trigger map. There is no indirection layer, so a rename is a many-place edit,
  which is exactly why it is a service function and not a store field.
- **Validators return `string | boolean`.** `true` for valid, the *error message* for invalid.
  Never `false`.

---

## 5. References and cascades

`deleteWorkflow` is the reference implementation of removing an entity. Nine passes, each one a
class of inbound edge:

```
deleteByPath      workflows.<id>                                   the definition
deleteByPath      stages.*.workflows.*.<id>                        legacy stage membership
deleteByPath      pipelines.*.stages.*.*.workflows.*.<id>          inline stage membership
deleteByPath      pipelines.*.workflows.<id>            keep ↑     graph node
deleteByValue     workflows.*.after_run[*]                         chain edge
deleteByValue     workflows.*.before_run[*]                        chain edge
deleteByValue     pipelines.*.workflows.*.depends_on[*]            graph edge
deleteByPredicate trigger_map[*] where workflow == id              legacy trigger
deleteByPredicate pipelines.*.stages.*.* now-empty                 empty stage cleanup
deleteByPredicate pipelines.*.workflows.* where uses == id
                    …and recursively their own depends_on edges
```

Two things to take from it:

1. **The count of passes is the count of edge kinds.** Adding a new way to reference a workflow
   means adding a tenth pass. Nothing enumerates the edges for you, so grep for the field name.
2. **`keep` is load-bearing.** The last argument to `deleteByPath`, `deleteByValue` and
   `deleteByPredicate` names an ancestor that must survive even when emptied. Omit it and
   removing the last workflow from a pipeline removes the pipeline's `workflows` key.

Deletes cascade. Creates do not validate, with one exception: `addChainedWorkflow` and friends
call `assertWorkflowReferenceable`, which accepts a target defined in *another file* via the
entity index. That is the one place a service consults cross-file state.

---

## 6. The recurring shapes

These four shapes appear across several entities. Learn them once.

### The three value layers

`defaultValues` / `userValues` / `mergedValues`. Used by steps, by step bundle instances
(`ymlInstanceToStepBundle`), and by containers, where `Container = { id, userValues }`.

**Only `userValues` is in the YAML.** The UI renders `mergedValues`, so a field can look set
while the document holds nothing, and writing a value equal to the default still adds a line.

### CVS, the step reference grammar

A step's key encodes library, id and version in one string. `parseStepCVS` is **ordered
dispatch**. Specific prefixes first, bare form last, so reordering the branches changes
behaviour.

| Reference | Library | Id | Version |
|---|---|---|---|
| `script@1` / `script` | `bitrise` (from `default_step_lib_source`) | `script` | `1` / none |
| `bundle::my-bundle` | `bundle` | `my-bundle` | none |
| `with` | `with` | `with` | none |
| `path::./steps/local@x` | `path` | `./steps/local` | none, `@x` is **discarded** |
| `git::https://…git@next` | `git` | the URL | `next` |
| `https://…bitrise-steplib.git::script@1` | `bitrise` | `script` | `1` |
| `https://custom…::baz@next` | `custom` | `baz` | `next` |

Only `bitrise`, `custom` and `git` carry a version (`canUpdateVersion`). The bare form is
context-dependent. It resolves against `default_step_lib_source`, which is why every predicate
takes a `defaultStepLibrary` argument.

### The version model

| In yml | Normalized | Resolves to | UI calls it |
|---|---|---|---|
| empty | empty | `3.0.1` | Always latest |
| `2` | `2.x.x` | `2.2.0` | Minor and patch updates |
| `2.1` | `2.1.x` | `2.1.9` | Patch updates only |
| `2.1.6` | `2.1.6` | `2.1.6` | Version in bitrise.yml |

**An empty version is not "unset". It is the policy *always latest*.** Removing a pin changes
build behaviour. It is not tidying.

### Definition versus instance

A step bundle is a function. The definition declares `inputs`, which are parameters with
defaults, and a reference supplies arguments. The service keeps the two sides apart down to the
method names: `addStepBundleInput` declares, `updateStepBundleInputInstanceValue` passes.
Containers work the same way, one definition and many references, each with its own `recreate`
flag.

<a name="step-bundle"></a>
**Hazard.** `getStepBundleChain` recurses with no cycle guard. A self-referencing or mutually
recursive bundle throws `RangeError: Maximum call stack size exceeded`. `TreeService.walk` and
`EntityIndexService.buildFromFiles` are both guarded. This one isn't. The UI filter that prevents
*creating* a cycle is itself built from `getStepBundleChains`, so on an already-cyclic config the
guard is what throws. Chains also do not dedup: a diamond yields `["top","l","leaf","r","leaf"]`,
which is fine for `includes()` and wrong if counted.

---

## 7. Two models, twice

The domain carries a legacy and a current model for two things at once, and handles them in
opposite ways.

| | Triggers | Pipelines |
|---|---|---|
| Old | `trigger_map[]`, flat, prefixed keys, **first-match-wins** | `stages: []`, an ordered sequence of full barriers |
| New | `workflows.<id>.triggers.<type>[]`, nested, all fire | `workflows: {}`, an arbitrary `depends_on` DAG |
| Detection | by which key exists | `isGraph = Boolean(pipeline.workflows)`, structural, no type field |
| Unification | one generic `Trigger<TConditionType>`. Only the *condition vocabulary* differs, so one component set renders both | none, separate code paths |
| Conversion | offered only when there is at most 1 legacy trigger per type (`canConvertSafely`) | always available, one-way |

Both conversions are lossless in data and lossy in intent:

- Triggers. The condition mapping is total, since the map is typed
  `Record<LegacyConditionType, …>` and the compiler enforces it. The *evaluation model* is not.
  Two legacy push triggers become two independent target-based triggers that both fire, where
  before only the first ran. Hence the one-per-type rule.
- Pipelines. A stage boundary becomes a complete bipartite edge set, m×n edges rather than m+n.
  Faithful, and it preserves an over-specification the author never chose. They used stages
  because stages were the tool. No reverse conversion exists, because graph is strictly more
  expressive.

---

## 8. Modular mode narrows every rule

**`ymlDocument` is not *the config*. It is a binding to the active tab's file.** Selecting a tab
re-points it, and every service keeps working, unaware. That indirection is why multi-file
editing shipped without touching a single pre-existing domain service.

The consequence for the domain model is one sentence:

> **Every service operation reaches exactly as far as the active document.** Any rule whose
> correctness depends on seeing the whole config is incomplete in modular mode.

| Rule | Single-file | Modular |
|---|---|---|
| Name uniqueness | Global | Active file only, so two files may define the same workflow |
| `deleteWorkflow` cascade | All 9 passes land | References in *other* files are left dangling |
| `renameWorkflow` | Rewrites every reference | Other files keep the old name |
| "Used by N workflows" | Accurate | Counts the active file, so it **under**counts and reassures |
| Deleting an entity defined elsewhere | n/a | Throws `… not found`, failing loudly rather than half-applying |

The one cross-file-aware piece is `EntityIndexService`, a precedence-ordered map of which file
defines which entity, rebuilt from live documents on every `files` change, so cross-file
detection is correct before saving. Precedence runs highest first: a node outranks the files it
includes, and a later include outranks an earlier sibling.

`assertWorkflowReferenceable` is the only service that reads it. Everything else reads the same
narrowed view as the operation it guards, including `useDependantWorkflows`, the guard that is
supposed to warn you before a destructive delete. It cannot see the damage.

Mode is decided by `state.tree !== undefined`, not by the feature flag
(`enable-wfe-modular-yaml-editing`, default off). The flag only picks which bootstrap API runs.
A flagged-on config with no `include:` falls back to plain single-file.

---

## 9. What is actually enforced

| Invariant | Where | Strength |
|---|---|---|
| Entity exists before mutation | `getXOrThrowError(id, doc)` | **Enforced**, throws |
| Name matches the charset, is unique in its list | `validateName` | **Enforced at the form**, not at the service |
| A reference target exists | `assertWorkflowReferenceable` | Enforced for workflow chains only |
| Deleting an entity removes inbound edges | `deleteWorkflow`'s 9 passes | Enforced *within the active document* |
| No cycles in `before_run`/`after_run` | `getChainableWorkflows` | **Assumed.** The picker filter is itself built from the unguarded walk, so it throws on an already-cyclic config |
| No cycles in step bundle nesting | `StepBundleList` filter | **Assumed.** Throws on an already-cyclic config |
| Referenced container exists | nothing | **Not checked** |
| Referenced secret exists | nothing | **Not checked** |
| Referenced stack exists | `isInvalidStack` | Flagged in the selector, not blocked |
| Unchanged YAML stays byte-identical | `YmlUtils` plus the style vote | **Best-effort.** A mixed-style file gets its minority reformatted |

The pattern: structural invariants inside one document are enforced. Every reference that
crosses a boundary, to another file or to another Bitrise resource, is a bare string that
nothing validates.

---

## 10. Model-level gaps worth knowing

Each of these was reproduced against the repo, not inferred.

1. **Cross-file cascade.** Delete and rename don't reach other files. The pieces exist,
   `updateFileDocument` and the live entity index. What's missing is coordination and a policy
   decision, complicated by referencing files that may be `editable: false`.
2. **Two unguarded recursions, same shape.** `getStepBundleChain` (see SUBSYSTEMS.md) and
   `getBeforeRunChain`/`getAfterRunChain` both recurse with no `seen` set, so a self-referencing
   or mutually recursive workflow or bundle throws `RangeError`. In both cases the UI filter that
   prevents *creating* a cycle is built from the same unguarded walk, so on an already-cyclic
   config the guard is what dies. `TreeService.walk` and `EntityIndexService.buildFromFiles` are
   guarded and say so. These four functions are not.
3. **Chaining accepts cross-file targets. Reordering rejects them.** `addChainedWorkflow`
   validates with `assertWorkflowReferenceable`, which is entity-index aware.
   `setChainedWorkflows` validates with `getWorkflowOrThrowError`, which sees the active document
   only. Reproduced: chain a workflow from another module file, then drag to reorder, and it
   throws. `ContainerService` is the counter-example. It validates against the aggregated index
   and degrades reads to `undefined` rather than throwing during render.
4. **UI state in `core/models`.** `Secret.isKeyChangeable`, `isEditing` and `isSaved` are marked
   "UI only fields" in the source, which puts view state in a layer that must stay
   framework-agnostic.
5. **Secrets have no concurrency token.** In CLI mode, update and delete read the whole
   collection, modify it, and write it back, with none of the `Bitrise-Config-Version` machinery.
   Overlapping edits are last-writer-wins across every secret.
6. **`hasVersionUpgrade` ignores your pin.** It asks whether *any* newer version exists, not one
   within your range, so a step deliberately held at `2` shows a permanent upgrade badge because
   `3.0.1` exists.

---

Per-area detail lives in the reference set: workflows, env vars, containers, stacks and
machines, tools, steps and CVS, triggers, pipelines, step bundles, secrets, and the editor and
language service. All of it is in [SUBSYSTEMS.md](SUBSYSTEMS.md).

*Verified against the repo on 2026-08-20. The command behind each claim is in the lesson set
this document was distilled from.*
