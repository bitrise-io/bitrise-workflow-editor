# Subsystems

One section per feature area, each covering its model, its service surface, and its traps. Every claim was checked against the code.

## Contents

- [Workflows](#workflows)
- [Steps, CVS and versions](#steps-cvs-and-versions)
- [Step bundles](#step-bundles)
- [Pipelines](#pipelines)
- [Triggers](#triggers)
- [Containers](#containers)
- [Env vars](#env-vars)
- [Secrets](#secrets)
- [Stacks, machines and license pools](#stacks-machines-and-license-pools)
- [Tools](#tools)

---

## Workflows

The entity everything else points at, and the two things that go wrong when it does.

### The shape

```
WorkflowModel = { title?, summary?, description?,
                  before_run?: string[], after_run?: string[],
                  steps?: Steps, envs?: EnvModel, tools?: Tools,
                  triggers?: TriggersModel, meta?: Meta,
                  timeout_in_minutes?: number, priority?: number,
                  status_report_name?: string }
```

Note what is *not* here: no id field. The id is the map key, which is why renaming is a nine-place rewrite rather than a field assignment.

> **Note.** `/^[A-Za-z0-9-_.]+$/`, unique within the list the caller passes in. A leading underscore makes it a **utility workflow**. `isUtilityWorkflow` is `id.startsWith('_')` and nothing more. The YAML has no concept of it; it changes presentation and where the workflow may be attached.

### Chains

`before_run` and `after_run` are lists of workflow ids. Resolution is recursive and interleaved. Each chained workflow contributes its *own* before-chain, then itself, then its after-chain:

```
getWorkflowChain(w, id) = [ ...getBeforeRunChain(w, id), id, ...getAfterRunChain(w, id) ]

for each entry in before_run/after_run:
    ...getBeforeRunChain(entry)   entry   ...getAfterRunChain(entry)
```

| Input | Result |
|---|---|
| Target missing from `workflows` | Silently skipped, `{a: {before_run: ['ghost']}}` yields `["a"]` |
| Diamond (two paths to one leaf) | `["leaf","l","leaf","r","top"]`, **no dedup**. Fine for `includes()`, wrong if counted |
| Self-reference | `RangeError: Maximum call stack size exceeded` |
| Mutual recursion | The same |

> **Trap.** `getBeforeRunChain` / `getAfterRunChain` have **no cycle guard**, the same defect as `getStepBundleChain`, in the foundational service rather than a leaf one. And the same trap closes behind it: `getChainableWorkflows` is what stops you *creating* a cycle, but it builds its filter from `getAllWorkflowChains`, which walks every workflow. On an already-cyclic config **the guard is what throws**.

> **Reproduced.** All four rows above, plus `getChainableWorkflows(w, 'safe')` throwing `RangeError` because an unrelated workflow elsewhere in the map is self-referencing. A cycle can arrive through the YAML tab or a modular include. Neither passes through the picker. See [Reference 12](#chains) for the bundle twin.

### Who uses a workflow

| Function | Answers |
|---|---|
| `getDependantWorkflows` | Every workflow whose chain contains this id, excluding itself |
| `getChainableWorkflows` | The inverse. Every workflow whose chain does *not* reach this id, i.e. safe to attach |
| `countInPipelines` | Distinct pipelines referencing it, counted across three shapes: graph `workflows` keys, inline `pipelines.*.stages`, and the top-level `stages` map |
| `getUsedByText` | The sentence, "Not used by other Workflow" / "Used by 1 Workflow" / "Used by N Workflows" |

All four read the plain `Workflows` object, which in modular mode is the active file only. They therefore **undercount**. See [Reference 02](ARCHITECTURE.md#cross-file-hazards).

### Mutations

| Function | Notes |
|---|---|
| `createWorkflow(id, baseId?)` | With `baseId`, deep-`clone()`s the source node, so comments and formatting come along. Throws if the id exists |
| `renameWorkflow(id, newName)` | Nine rewrite passes (below) |
| `deleteWorkflow(ids)` | Nine deletion passes. See [Reference 01](ARCHITECTURE.md#the-layer-map) and the domain model |
| `updateWorkflowField(id, field, value)` | A falsy value **deletes the key** rather than writing an empty one |
| `addChainedWorkflow` | Validates with `assertWorkflowReferenceable`, cross-file aware |
| `removeChainedWorkflow` | Takes both the id and the index, and verifies they agree before deleting |
| `setChainedWorkflows` | Replaces the whole list; empties the key when the list ends up empty |

```
renameWorkflow: every place an id can appear
  workflows.<id>                                        the definition key
  stages.*.workflows.*.<id>                             legacy stage membership
  pipelines.*.workflows.<id>                            graph node key
  pipelines.*.stages.*.*.workflows.*.<id>               inline stage membership
  trigger_map.*.workflow            (by value)          legacy trigger target
  workflows.*.after_run.*           (by value)          chain edge
  workflows.*.before_run.*          (by value)          chain edge
  pipelines.*.workflows.*.uses      (by value)          graph node source
  pipelines.*.workflows.*.depends_on.* (by value)       graph edge
```

Delete mirrors it one-for-one, except that a node whose `uses` equals the id is removed entirely (and its own inbound `depends_on` edges cleaned up) rather than renamed. The count of passes is the count of edge kinds: a tenth way to reference a workflow needs a tenth pass, and nothing enumerates them for you.

### The cross-file asymmetry

> **Trap.** Adding a chained workflow accepts a cross-file target. Reordering that same chain rejects it.

```
addChainedWorkflow  -> assertWorkflowReferenceable(id, doc)   // falls back to the entity index
setChainedWorkflows -> getWorkflowOrThrowError(id, doc)       // active document only
```

> **Reproduced.** With `entityIndex.workflows['cross-file-wf']` populated, `addChainedWorkflow` writes the reference happily; the next `setChainedWorkflows` over the same list throws `Workflow cross-file-wf not found`. `setChainedWorkflows` is wired to drag-reorder in `WorkflowCanvasPanel` and `WorkflowNode`, so the path is: chain a workflow from another module file, drag it, get an error toast.

Contrast `ContainerService.addContainerReference`, which consults `entityIndex.containers` when a tree exists and whose readers deliberately return `undefined` for cross-file sources. See [Reference 16](#the-one-service-that-handles-cross-file-properly). Containers got the cross-file treatment; workflow chains got it in one function out of two.

---

## Steps, CVS and versions

The reference grammar and the version model, as lookup tables.

### Three layers of values

| Field | Source | In the YAML? |
|---|---|---|
| `defaultValues` | The step's `step.yml`, from the API | No |
| `userValues` | `bitrise.yml` overrides | **Yes, only this** |
| `mergedValues` | Defaults + user values | No (what the UI renders) |

A field can look set in the UI while the document holds nothing. Writing a value equal to the default still adds a line.

### CVS parse table

The shape is roughly `collection::id@version`, with the collection prefix optional.

```
reference                                                library  id                                     version
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
with                                                     with     with                                   ∅
bundle::my-bundle                                        bundle   my-bundle                              ∅
path::./steps/local                                      path     ./steps/local                          ∅
path::./steps/local@ignored                              path     ./steps/local                          ∅   ← dropped
git::https://github.com/…/steps-script.git@next          git      https://github.com/…/steps-script.git  next
git::git@github.com:…/steps-script.git@next              git      git@github.com:…/steps-script.git      next
https://github.com/…/bitrise-steplib.git::script@1       bitrise  script                                 1
https://custom.step/foo/bar-steplib.git::baz@next        custom   baz                                    next
git@custom.step:foo/bar-steplib.git::baz@next            custom   baz                                    next
script@1                                                 bitrise  script                                 1
script                                                   bitrise  script                                 ∅
```

- `parseStepCVS` is **ordered dispatch**, specific prefixes first, bare form last. Reordering the branches changes behaviour.
- For `git` and `path`, **`id` is the URL**.
- `path::` silently discards any `@version`.
- SSH `git::` URLs contain their own `@`; the parser special-cases `parts[0] === 'git'`. Naive `split('@')` is wrong here.
- The **bare form is context-dependent**: it resolves against `default_step_lib_source`. That's why every predicate takes `defaultStepLibrary`.

#### Which types carry a version

`canUpdateVersion` → `bitrise`, `custom`, `git` only. Not `bundle`, `with`, or `path`.

### Version model

```
available: 2.1.6, 2.1.7, 2.1.9, 2.2.0, 3.0.1

in yml    normalized   resolves to   the UI calls it
──────────────────────────────────────────────────────────────
∅         ∅            3.0.1         "Always latest"
2         2.x.x        2.2.0         "Minor and patch updates"
2.1       2.1.x        2.1.9         "Patch updates only"
2.1.6     2.1.6        2.1.6         "Version in bitrise.yml"
```

| Field | Meaning |
|---|---|
| `version` | Literally what's in the YAML (denormalized) |
| `normalizedVersion` | The semver range form the UI reasons in |
| `resolvedVersion` | What it resolves to against today's available versions |
| `latestVersion` | Newest available overall |

`denormalizeVersion` is `replace(/\.x/g, '')`; the round trip `2 → 2.x.x → 2` is lossless for every real input.

> **Rule.** An empty version is not "unset". It is the explicit policy **always latest**. Removing a pin changes behaviour; it is not tidying.

#### The upgrade badge

> **Trap.** `hasVersionUpgrade` asks whether *any* newer version exists, not one inside
> your range, so a step deliberately held at `2` wears a permanent upgrade badge.

`hasVersionUpgrade` resolves the pin, then asks whether *any* available version is greater. Not whether one exists within your range. A step pinned to `2` (resolving `2.2.0`) reports an upgrade because `3.0.1` exists. It cannot be cleared while you deliberately stay on an older major. Drives the badge in `StepCard` and `StepConfigDrawer`.

---

## Step bundles

Definition versus instance, and the recursion with no cycle guard.

### Definition vs instance

| Definition (`step_bundles.<id>`) | Instance (a reference) |
|---|---|
| `updateStepBundleField` | `updateStepBundleInstanceField` |
| `addStepBundleInput` / `deleteStepBundleInput` | `updateStepBundleInputInstanceValue` |

Think function signature vs call. `inputs` are parameters with defaults; an instance supplies arguments. `ymlInstanceToStepBundle` materialises the same three-layer shape as a step, `defaultValues` / `userValues` / `mergedValues`, so only `userValues` reaches the YAML.

Definition keys: `title, summary, description, envs, inputs, steps, is_always_run, run_if, execution_container, service_containers`.

References use `bundle::<id>`. `idToCvs` is idempotent; `cvsToId` strips the prefix.

### Chains

```
getStepBundleChain(bundles, 'outer')  →  ["outer", "middle", "inner"]     self first, depth-first
getStepBundleChain(bundles, 'top')    →  ["top", "l", "leaf", "r", "leaf"] no dedup
```

A bundle reachable by two paths is listed once per path. Fine for `includes()` containment checks; wrong if treated as a set or counted.

> **Trap.** `getStepBundleChain` has **no cycle guard**. A self-referencing or mutually recursive bundle throws `RangeError: Maximum call stack size exceeded`. Contrast `TreeService.walk` and `EntityIndexService.buildFromFiles`, which are both guarded and say so.

#### Why the guard doesn't save you

`StepBundleList` prevents *creating* a cycle by filtering out any bundle whose chain already reaches the one being edited, but it builds that filter with `getStepBundleChains(stepBundles)`, which walks every bundle. On an already-cyclic config the guard throws before it can exclude anything. Cycles can arrive via the YAML tab or a modular include, neither of which goes through the selector.

Stale comment beside the filter: *"a chain never lists itself"*. Chains do, `ids.unshift(id)`. The code is correct; the first filter clause is redundant, not load-bearing.

#### What a user sees

The app's Datadog `ErrorBoundary` uses `PassThroughFallback`, which calls `resetError()` in an effect and renders `null`. Built for transient errors; a persistent throw resets straight back into itself.

---

## Pipelines

Staged versus graph, and what the one-way conversion costs you.

### Two models

| Model | Key | Expresses |
|---|---|---|
| Staged | `stages: []` | An ordered sequence of full barriers |
| Graph | `workflows: {}` | Arbitrary `depends_on` DAG |

> **Rule.** Detection is **structural**: `isGraph = Boolean(pipeline.workflows)`. No type field, no flag. `{ workflows: {} }` is a graph; `{}` is staged.

### Staged → graph

```
stages:                              workflows:
  - build:  [compile, lint]            compile: {}
  - test:   [unit, ui]                 lint:    {}
      abort_on_fail: true              unit:    { depends_on: [compile, lint], abort_on_fail: true }
  - ship:   [deploy]          ──▶      ui:      { depends_on: [compile, lint], abort_on_fail: true }
                                       deploy:  { depends_on: [unit, ui] }
```

- A stage boundary becomes a **complete bipartite edge set**, *m*×*n* edges, not *m*+*n*.
- Stage-level `abort_on_fail` is copied onto every member workflow; `should_always_run` becomes `'workflow' | 'off'`.
- Converting an existing graph returns the same object (identity short-circuit).
- Detection in practice: `isGraph({workflows:{}})` is true, `isGraph({stages:[]})` and `isGraph({})` are false.

**No reverse conversion exists** (there is no `convertToStagedPipeline`). Graph is strictly more expressive. A graph where `deploy` depends on `unit` but not `ui` has no staged form.

Caveat worth flagging in review: authors used stages because stages were the tool available, so a faithful conversion preserves an *over-specification*, edges the author never needed.

### Canvas layout

```
graph.setGraph({ align: 'UL', rankdir: 'LR', marginx: CANVAS_PADDING, … });
dagre.layout(graph, { disableOptimalOrderHeuristic: true });
position = { x: x - width / 2, y: y - height / 2 };
```

- **Dagre reports centres; XYFlow positions by top-left.** Hence the halving. Omit it and every node sits uniformly half a box off, which reads as a padding bug.
- Three node kinds: workflow, placeholder, and a placeholder for workflows a *generator* workflow produces at runtime.
- Nodes with `data.fixed` are still added to the dagre graph (so they influence others' layout) but their computed position is discarded. Manual placement wins.

---

## Triggers

Two models, one shape, and when conversion is safe.

### The shared shape

```
Trigger<TConditionType> = { uniqueId, index, source, triggerType, isActive,
                             conditions: Condition<TConditionType>[], isDraftPr?, priority? }

LegacyTrigger      = Trigger<LegacyConditionType>
TargetBasedTrigger = Trigger<TargetBasedConditionType>
```

Only the condition vocabulary is parameterised, so one set of components renders both and the models cannot drift structurally.

### Condition key mapping

| Concept | Legacy (`trigger_map`) | Target-based (`triggers:`) |
|---|---|---|
| Push branch | `push_branch` | `branch` |
| PR target | `pull_request_target_branch` | `target_branch` |
| PR source | `pull_request_source_branch` | `source_branch` |
| PR label | `pull_request_label` | `label` |
| PR comment | `pull_request_comment` | `comment` |
| Tag | `tag` | `name` |
| Commit message | `commit_message`, same in both |  |
| Changed files | `changed_files`, same in both |  |

Legacy keys are flat and prefixed (one object holds every condition kind); target-based keys are nested under their trigger type, so prefixes would be redundant. `LEGACY_TO_TARGET_BASED_CONDITION_MAP` is typed `Record<LegacyConditionType, …>`, so the compiler enforces totality. No reverse map exists.

### Conversion rules

> **Rule.** The one-click conversion appears only when there is **at most one legacy trigger per type**, max three total. `canConvertSafely` returns `false` otherwise and the component renders `null`, with no explanation to the user.

**Why.** `trigger_map` is first-match-wins (stated in the editor's own copy: "only the first matching trigger will be executed"). Target-based triggers are independent per workflow and all fire. Two push triggers converted would run two builds where one ran before. The condition mapping is lossless; the evaluation model is not.

Conversion drops `isLastCommitOnly`, which is correct. `last_commit` is a target-based-only concept and never appears on a legacy trigger.

The action: convert each, `addTrigger` each, then `updateTriggerMap(undefined)` to delete the legacy block.

---

## Containers

One map, two roles, and the only service that gets cross-file right.

### One section, both roles

```
containers:
  postgres-13:
    type: service          <- the role lives on the definition
    image: postgres:13
    ports: ["5432:5432"]
    envs: [...]
    credentials: { username, password, server? }
    options: "--cpus 2"
```

> **Rule.** Execution and service containers share the single top-level `containers:` map. Which role a container plays is its `type` field, and that decides *which reference field* a consumer writes. Not where the definition is stored.

> **Trap.** `BitriseYml` also declares `services?: Services`, typed identically to `containers`. The editor never reads or writes it, zero non-spec references to `['services']` anywhere in `source/javascripts`. If a config has one, the editor is blind to it.

### The reference grammar

```
execution_container: postgres-13                       <- scalar, at most one
execution_container:
  postgres-13: { recreate: true }                      <- or a single-key map

service_containers:
  - redis                                              <- a list, many allowed
  - postgres-13: { recreate: true }
```

`parseContainerReference` accepts both shapes and normalises to `{ id, recreate }`, with `recreate` defaulting to `false` unless the value is literally `true`. Adding a duplicate service container throws; the execution field just overwrites, because there is only ever one.

### Six places a reference can sit

```
workflows.*.steps.*.*.execution_container
workflows.*.steps.*.*.service_containers.*
step_bundles.*.steps.*.*.execution_container
step_bundles.*.steps.*.*.service_containers.*
step_bundles.*.execution_container            <- on the bundle definition itself
step_bundles.*.service_containers.*
```

The bundle-definition rows are why `getContainerReferenceFromInstance` takes a `stepIndex` of `-1` as a sentinel meaning "the bundle itself, not a step inside it". `deleteContainer` walks all six, in both the by-value and by-key forms, each with `keep` set to the owning step so an emptied reference list does not take the step with it.

### Only what is set gets written

```
cleanContainerData -> { type, image }              always
                      + ports        if non-empty
                      + credentials  if any field is truthy, empties filtered out
                      + envs         if non-empty
                      + options      if truthy
```

Same instinct as env vars' `is_expand`: the document records what the user chose, not the shape of the form. `filterCredentials` drops blank fields individually, so a half-filled credentials block becomes a partial map rather than one with empty strings.

### The one service that handles cross-file properly

> **Note.** `addContainerReference` validates the container id against `entityIndex.containers` when a tree exists, and against the active document when it does not. The read helpers return `undefined` for a cross-file source instead of throwing, with a source comment saying why: *throwing crashes the card during render*.

```
const containerExists = state.tree
  ? Boolean(state.entityIndex.containers?.[containerId])
  : Boolean(YmlUtils.getMapIn(state.ymlDocument, ['containers', containerId]));
```

Two habits here that the rest of the codebase does not have consistently: **validate against the aggregated index, write to the active file**, and **read paths degrade to empty, write paths fail loudly**. Compare [Reference 14](#the-cross-file-asymmetry), where one of the two chain mutators got this treatment and the other did not.

What is still missing: `deleteContainer` cascades over the active document only, so a container deleted in one file leaves dangling references in its siblings, the general modular gap from [Reference 02](ARCHITECTURE.md#cross-file-hazards).

### Validation

| Function | Rule |
|---|---|
| `validateName` | `/^[A-Za-z0-9-_.]+$/` plus uniqueness, the same regex as workflows and pipelines, defined again locally |
| `validatePorts` / `sanitizePort` | Port mapping shape; empty list passes |
| `updateContainerId` | Throws if the new id exists, then re-keys |

---

## Env vars

A list, not a map, and the one place the editor writes only what differs from the default.

### The shape

```
EnvModel = EnvironmentItemModel[]
EnvironmentItemModel = Record<string, unknown> & { opts?: EnvironmentItemOptionsModel }

app:
  envs:
  - MY_KEY: some value        <- one single-key map per entry
  - OTHER: value
      opts:
        is_expand: false      <- the sibling key that isn't the variable
```

**Order matters and identity is positional**, exactly as with steps: an env var is the *i*-th entry of a list, not an entry in a map. Every mutation therefore takes an index, and `reorder` exists as a first-class operation.

### Two sources, and one of them is a display string

| Source | Path | `EnvVar.source` becomes |
|---|---|---|
| `EnvVarSource.App` | `app.envs` | `"Project envs"` |
| `EnvVarSource.Workflows` | `workflows.<id>.envs` | `"Workflow: <id>"` |

> **Trap.** `EnvVar.source` is a sentence, not an id. It is built for the dropdown group label and cannot be parsed back. Code that needs to know *where* an env var lives passes `source` + `sourceId` separately as an `at` argument; the field on the model is display-only.

`getAll()` with no arguments concatenates project envs and every workflow's envs; `getAll(Workflows, '*')` gets just the workflow ones. That merged list is what the insert-variable popover offers.

### is_expand: written only when false

```
toYml(envVar)          -> { [key]: value }
                          + opts.is_expand = false   ONLY when isExpand === false

updateIsExpand(true)   -> deleteByPath(env, ['opts', 'is_expand'])
updateIsExpand(false)  -> setIn(env, ['opts', 'is_expand'], false)
```

> **Reproduced.** Turning expansion on removes the key; turning it off writes `is_expand: false`. So the YAML records only the non-default, and the model is tri-state, `true`, `false`, or `undefined` for "not specified".

> **Note.** This is the opposite of steps, where writing a value equal to the default still adds a line ([Reference 08](#three-layers-of-values)). Two subsystems, two answers to the same question. Env vars are the ones that keep the diff clean.

### Key validation

```
/^[a-zA-Z_]([a-zA-Z0-9_]+)?$/i
```

Shell-variable rules, and **deliberately different from every entity name** in the config. No dashes, no dots, and it cannot start with a digit.

| Input | Result |
|---|---|
| `A`, `_` | Valid. The repeat group is optional |
| `MY-VAR`, `MY.VAR` | Rejected, legal as a workflow name, illegal here |
| `1VAR` | Rejected |

> All five verified. Nothing checks a `$REFERENCE` inside a step input against this list, or against the secrets list. See [Reference 13](#secrets).

### The keep argument, made visible

```
remove(at)  -> deleteByPath(doc, path, at.source === App ? [] : ['workflows', sourceId])
```

| Removing the last… | Leaves behind |
|---|---|
| workflow env (`wf` has nothing else) | `wf: {}`. The workflow survives |
| project env (`app` has nothing else) | nothing, `app:` is removed too |
| project env (`app` has a `title`) | `app: { title }`, siblings save it |

> **Reproduced, all three.** The asymmetry is deliberate and reads correctly: a workflow is an entity that should not vanish because you emptied one of its lists; `app:` is a bag of settings with nothing to preserve once it is empty.

### Two small things

- `reorder` replaces `envs.items` wholesale after asserting the index count matches, so a partial reorder is impossible by construction.
- `getEnvPath` takes a fourth `key` parameter that no caller passes, and its guard is `if (index && key)`, which would skip index `0` if anyone ever did. Dead code with a latent truthiness bug; delete it rather than fix it.

---

## Secrets

Three ways secrets differ from everything else in the app.

### 1 · Never cached

`useSecrets` and `useSecretValue` both use `staleTime: 0, gcTime: 0`, the only zero-cache queries in the app. The value is evicted when the last observer unmounts. Consequence: deletion uses `refetchQueries`, not `invalidateQueries`, because there's no entry left to mark stale.

### 2 · Mode changes what is possible, not only the URL

| Operation | Website | CLI |
|---|---|---|
| `getSecrets` | Monolith endpoint | Local endpoint, different DTO |
| `getSecretValue` | Returns the value | **Returns `undefined`. No endpoint exists** |
| `updateSecret` | PATCH or POST by `isSaved` | Read all → merge → POST all |
| `deleteSecret` | DELETE the item | Read all → filter → POST all |
| Code-signing secrets | Three parallel fetches | Short-circuits to `[]` |

> **Trap.** CLI writes are read-modify-write over the whole collection with **no concurrency token**. None of the `Bitrise-Config-Version` machinery from Reference 06 applies. Overlapping edits are last-writer-wins across every secret.

### 3 · Protection is irreversible

| Layer | Effect |
|---|---|
| `SecretApi` return | `value: secret.isProtected ? '' : secret.value`, blanked before reaching state |
| `useSecretValue` | `enabled: !secret.isProtected && isShown`, never fetched again |
| `SecretCard` | Show/hide button replaced by a lock icon |
| Form submit | Turning protection *on* routes through a confirm callback; other edits save directly |

### Model mapping

```
monolith                              → Secret
  name                                → key
  expand_in_step_inputs               → isExpand
  exposed_for_pull_requests           → isExpose
  scope === 'workspace'               → isShared
  is_protected                        → isProtected

local (CLI)
  opts.meta['bitrise.io'].is_protected → isProtected
```

`isKeyChangeable`, `isEditing`, `isSaved` are marked "UI only fields" in the source. View state living in a `core/models` type, which the layer map says should be framework-agnostic.

---

## Stacks, machines and license pools

Four keys under `meta`, and the only reference to the world outside the config that the editor checks.

### Where it lives

```
meta:
  bitrise.io:
    stack: osx-xcode-16
    machine_type_id: g2.mac.large
    stack_rollback_version: "16.0"
    license_pool_id: abc-123

workflows:
  build:
    meta:
      bitrise.io:
        stack: linux-ubuntu-24      <- same four keys, workflow scope
```

`getMetaPath` is the whole scoping mechanism: it returns `['meta','bitrise.io']` and `unshift`s `['workflows', id]` for the workflow scope. Two scopes, one code path, the same trick as [tools](#tools).

> **Rule.** An empty value **deletes the key**; the editor never writes `stack: ''`. The `keep` argument is the path minus its last two segments, so clearing the last field removes `bitrise.io` and `meta` but never the workflow.

### Choosing a stack can change your machine

`changeStackAndMachine` is a pure function that recomputes *both* values from the new stack. The machine you had may not exist on the stack you just picked, so it falls through a chain:

```
machineTypeId =
    the current machine, if it exists on the new stack
    else the project default machine, if it exists there
    else the OS default for the new stack's OS
    else the first machine the stack offers
    else ''                       (only when no fallback options are supplied)
```

The stack itself is not defaulted the same way. An unknown `stackId` resolves to `''`, and the project stack is used only to work out the OS. Worth knowing in review: a change of stack is never *only* a change of stack.

### Invalid ids are shown, not blocked

```
isInvalidStack       = !!selectedStackId       && !selectedStack
isInvalidMachineType = !!selectedMachineTypeId && !selectedMachineType
```

`prepareStackAndMachineSelectionData` compares the id in the YAML against the fetched catalog and, when it does not resolve, synthesises an option with `status: 'unknown'`, `os: 'unknown'` so the selector can render it as an explicit invalid choice rather than snapping to something else without saying so.

> **Note.** This is the **single place** where the editor resolves a reference from the config into a resource that lives outside the config. Secrets, license pools and container images all get written as bare strings that nothing checks. See the domain model's enforcement table.

### Two naming conventions

| Predicate | Implementation |
|---|---|
| `isSelfHostedStack` | `stack.id.startsWith('agent')` |
| `isUtilityWorkflow` | `id.startsWith('_')` |

Two string-prefix conventions carrying real behaviour, neither expressed in a type. Grep for the prefix, not for the concept.

### License pools

```
LicensePool = { id, name, description?, kind, envVarName,
                licenses: { id, value }[], createdAt, modifiedAt }
LicensePoolKind.UNITY = 'LICENSE_KIND_UNITY'
```

Pools are a workspace resource fetched over the API; the config stores only `license_pool_id`, written by `updateLicensePoolId` through the same `updateFieldValue` path as stack and machine. The pool's own `envVarName` is how the licence reaches the build, which means a pool rename that changes that name is invisible to the config, because the config never mentions it.

One kind exists today. The enum is there so a second one does not become a boolean.

### Scope validation

```
validateSourceId(source, sourceId, doc)
  Workflow scope + no sourceId  -> throws 'sourceId is required when source is Workflow'
  Workflow scope + sourceId     -> WorkflowService.getWorkflowOrThrowError(sourceId, doc)
```

Active-document only, so setting a stack on a workflow defined in another module file throws rather than writing to the wrong place, the loud-failure half of the modular story ([Reference 02](ARCHITECTURE.md#cross-file-hazards)).

---

## Tools

A one-line version string with four meanings, and the only entity whose identity is alias-resolved.

### The shape

```
tools:
  nodejs: "22"           project scope
  golang: latest

workflows:
  build:
    tools:
      nodejs: unset      workflow scope only
```

A `Record<string, string>` at the root or on a workflow, with the same scope-path trick as [stacks and machines](#stacks-machines-and-license-pools). The value is a small language, not a version.

### The version grammar

| In the YAML | Parses to | Means |
|---|---|---|
| `latest` | `{ strategy: 'latest-released' }` | Newest published version |
| `installed` | `{ strategy: 'latest-installed' }` | Newest version already on the stack |
| `20:latest` | `{ 'latest-released', prefix: '20' }` | Newest published inside the `20` line |
| `20:installed` | `{ 'latest-installed', prefix: '20' }` | Newest installed inside the `20` line |
| `unset` | `{ strategy: 'unset' }` | Do not manage this tool here |
| `20.1.2` | `{ strategy: 'exact', version: '20.1.2' }` | Exactly that |
| `20:banana` | `{ strategy: 'exact', version: '20:banana' }` | Exact, verbatim. An unrecognised suffix is not an error |

> **All seven verified.** The keyword match is case-insensitive (`raw.toLowerCase()`) but the *prefix* keeps its original case, and `exact` keeps the raw string untouched. The colon split uses `indexOf(':') > 0`, so a leading colon never makes a prefix.

> **Rule.** `unset` is **workflow-scope only**. `setTool` throws *Cannot use "unset" strategy at root scope*. It exists to opt one workflow out of a project default, so at the root it would mean nothing.

> Reproduced: `setTool('nodejs', 'unset', '', { type: 'root' })` throws.

### Identity is alias-resolved

```
resolveToolName(catalog, 'node')   -> 'nodejs'
resolveToolName(catalog, 'go')     -> 'golang'

validateToolId(id, initialId, existingIds, catalog)
  duplicate if  existingIds.some(e => resolveToolName(e) === resolveToolName(id))
```

> **Note.** Every other entity's uniqueness check is plain string equality. Tools resolve through the catalog's `aliases` first, so `node` and `nodejs` collide even though the strings differ. Two consequences: uniqueness depends on a **fetched catalog**, and with the catalog absent the check quietly degrades to string equality (`resolveToolName` falls back to the id).

`aliases` is typed optional with a comment saying the API is expected to always send it. Treat its absence as a real state, not a theoretical one.

### Switching strategies

```
nextVersionOnStrategyChange(prev, next, version)
  both prev and next are prefix strategies  -> keep the version
  anything else                             -> ''
```

Moving between `latest` and `installed` keeps your `20`; moving to or from `exact` clears the field, because a prefix and a full version are not interchangeable text. Small function, and it is the whole reason the version box does not carry nonsense across a radio-button change.

### The catalog

```
ToolCatalog   = { tools: { name, aliases? }[] }        which tools Bitrise publishes
ToolVersions  = { toolId, versions: { version, isSemver }[] }   per-tool version list
```

Two API resources. `isVersionInCatalog` and `getVersionOptions` drive the picker; a version not in the catalog is still writable. The catalog informs the UI, it does not gate the document. `getAvailableToolIdOptions` subtracts what the scope already declares so the add-tool list never offers a duplicate.
