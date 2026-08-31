# Domain

What the code is about: the words, the entities, and which invariants anything actually enforces.
Mechanisms are in [flows.md](flows.md), reasoning in [decisions.md](decisions.md).

Where a doc and the code disagree, the code wins and the doc is a bug.

## Glossary

The YAML format itself is documented publicly, and that is the authority for what a key means and
what values it takes: the [configuration YAML reference][ref] covers all sixteen top-level keys,
and the [glossary][gl] covers the product vocabulary. Read those for the format; read this for
what the *editor* adds, guarantees or fails to guarantee.

Three things below are here because the public docs do not cover them at all — **stages**, **`with`
groups** and **utility workflows** — so this table is their only definition.

[ref]: https://docs.bitrise.io/en/bitrise-ci/references/configuration-yaml-reference
[gl]: https://docs.bitrise.io/en/bitrise-ci/references/glossary#workflow-editor

| Term | Means |
|---|---|
| **active document** | The file `ymlDocument` points at. The whole config when single-file, the selected tab when modular. |
| **CVS** | A step's reference, packing library, id and version into one string. [Table](#reference-tables) |
| **entity index** | Precedence-ordered map of which file defines which entity. The only cross-file-aware structure. |
| **FileSlice** | One file's state in modular mode: path, document, saved document, editable flag. |
| **generator workflow** | A workflow that produces other workflows at runtime; the canvas draws placeholders for them. |
| **graph pipeline** | Has a `workflows` map and arbitrary `depends_on` edges. |
| **legacy trigger** | An entry in top-level `trigger_map`. Flat, prefixed keys, first-match-wins. |
| **merged tab** | Read-only preview of a modular config flattened. No slice backs it, so writes no-op. |
| **nodeId** | Backend-owned opaque key for a file. `path` is not unique, so never key by it. |
| **staged pipeline** | Has a `stages` list: an ordered sequence of full barriers. |
| **step bundle** | Named, reusable step sequence with its own inputs. Referenced as `bundle::<id>`. |
| **target-based trigger** | Declared on the workflow it fires, nested under its type. All matches fire. |
| **utility workflow** | Id starts with `_`. Convention only; the YAML has no concept of it. |
| **`with` group** | A step-list wrapper that runs its steps inside a container. |
| **`yml` / `ymlDocument`** | `ymlDocument` is the writable AST, `yml` a read-only object derived from it. |

## What the editor edits

One artifact: **`bitrise.yml`**, the CI config of a single Bitrise project. Modular configs make
that a tree of files merged into one.

The domain splits in two, and the split matters more than any single entity:

| | In the document | Outside it |
|---|---|---|
| **Entities** | workflows, pipelines, step bundles, containers, trigger map, app envs, tools, `meta` | secrets, stacks and machines, license pools, the step catalog |
| **Read via** | `BitriseYmlStore` selectors | React Query hooks |
| **Written via** | services calling `updateBitriseYmlDocument` | their own endpoints, immediately |
| **Saved** | all at once, one file, with a concurrency token | per operation |
| **Undo** | discard changes, re-parsing the saved document | none |

> **Rule.** The config names the outside-the-document things by bare string
> (`meta.bitrise.io.stack`, `$MY_SECRET` in an input) and **nothing resolves those references**. A
> `bitrise.yml` naming a secret that does not exist is not an error state anywhere in the editor.

The one exception is stacks: `prepareStackAndMachineSelectionData` flags an id missing from the
fetched catalog as `isInvalidStack` and renders it as an explicit invalid option. Nothing does the
equivalent for secrets, containers or license pools.

## The entity map

Every arrow is a plain string in the YAML with no referential integrity behind it.

```mermaid
flowchart TD
  TM["trigger_map<br/><i>legacy</i>"] -->|"workflow: / pipeline:"| WF
  PL["pipelines"] -->|"uses:, stage lists"| WF["workflows"]
  WF -->|"before_run / after_run"| WF
  WF -->|"steps[]"| SR["step reference<br/><i>a CVS key</i>"]
  SR -->|"execution_container, service_containers[]"| CN
  SR -->|"bundle::id"| SB["step_bundles"]
  SR -->|"with"| WG["with group"]
  SR -->|"script@2, git::, path::"| CAT["step catalog"]
  SB -->|"steps[]"| SR
  SB -->|"execution_container, service_containers[]"| CN["containers"]
  WG -->|"container:, services:"| CN
  WF -.->|"meta.bitrise.io.*"| EXT["stacks, machines,<br/>license pools"]
  SR -.->|"$VAR in inputs"| SEC["secrets"]
  style CAT stroke-dasharray: 4
  style EXT stroke-dasharray: 4
  style SEC stroke-dasharray: 4
```

Every edge label is the YAML key that carries the reference, which is what you grep when you
need to find or clean up every pointer to something. The map is the YAML schema, not the editor's
coverage: a `with` group's `services:` is a genuine container reference that no code path reads
or writes, so a cascade still has to clean it up. Dashed nodes live outside the document. A
`step_bundles` entry may reference another one, which is legal, recursive and
[unguarded](decisions.md#open-defects).

## Entities

| Entity | Identity | Lives at | Service |
|---|---|---|---|
| **Workflow** | map key | `workflows.<id>` | `WorkflowService` |
| **Pipeline** | map key | `pipelines.<id>` | `PipelineService` |
| **Step bundle** | map key | `step_bundles.<id>` | `StepBundleService` |
| **Step** | **positional**, its index | `…steps[i]` | `StepService`, `StepVariableService` |
| **Container** | map key | `containers.<id>` | `ContainerService` |
| **Trigger** (target-based) | position in the list | `workflows.<id>.triggers.<type>[]` | `TriggerService` |
| **Trigger** (legacy) | position in the list | `trigger_map[]` | `TriggerService` |
| **Env var** | `key` plus its source | `app.envs[]`, `workflows.<id>.envs[]` | `EnvVarService` |
| **Stage** | map key, legacy | `stages.<id>` | none |
| **Secret** | `key` | *not in the document.* Website mode: the monolith. CLI mode: `.bitrise.secrets.yml`, overridable with `BITRISE_SECRETS` | `SecretService` |
| **Stack / machine** | catalog id | `meta.bitrise.io.*` | `StackAndMachineService` |
| **File node** | opaque `nodeId` | the tree, not the YAML | `TreeService`, `FileTreeService` |

> **Rule.** **Position is identity for steps.** A step has no id; it is the *i*-th entry of a
> `steps[]` array, and its CVS key names a catalog coordinate rather than this occurrence. Two
> `script@1` steps in one workflow are indistinguishable except by index, so every step operation
> takes an index and any concurrent reorder invalidates one you were holding.

Nothing references a step, a trigger or a stage. Everything else is referenced by name.

## Naming

```
/^[A-Za-z0-9-_.]+$/     workflows · pipelines · containers · step bundles
```

Four services define that regex independently and four `validateName` functions repeat the same
three checks: non-empty, matches, unique. Validators return `string | boolean` — the error
message on failure, never `false`.

**Namespaces are per-collection**, so a workflow and a pipeline may share a name. Uniqueness is
only ever checked against the list the caller passes in, which in modular mode is the active
file's list.

**Renaming means rewriting every reference.** There is no indirection layer, which is exactly why
it is a service function and not a store field. See
[flows.md](flows.md#6-renaming-or-deleting-a-workflow) for the passes it takes.

## What is actually enforced

The most useful table here. Structural invariants inside one document hold. Every reference that
crosses a boundary is a bare string nothing validates.

| Invariant | Where | Strength |
|---|---|---|
| Entity exists before mutation | `getXOrThrowError` | **Enforced**, throws |
| Name charset and uniqueness | `validateName` | **At the form**, not the service |
| A reference target exists | `assertWorkflowReferenceable` | Workflow chains only |
| Deleting removes inbound edges | `deleteWorkflow`'s passes | Within the active document |
| No cycles in `before_run`/`after_run` | `getChainableWorkflows` | **Assumed.** The filter is built from the unguarded walk, so it throws on an already-cyclic config |
| No cycles in bundle nesting | `StepBundleList` filter | **Assumed**, same shape |
| Referenced container exists | nothing | **Not checked** |
| Referenced secret exists | nothing | **Not checked** |
| Referenced stack exists | `isInvalidStack` | Flagged, not blocked |
| Untouched YAML stays byte-identical | `YmlUtils` and the style vote | **Best-effort.** A mixed-style file loses its minority style |

## Two models, twice

Triggers and pipelines each carry a legacy and a current model, handled in opposite ways.

| | Triggers | Pipelines |
|---|---|---|
| Old | `trigger_map[]`, flat, **first-match-wins** | `stages: []`, ordered full barriers |
| New | `workflows.<id>.triggers.<type>[]`, all fire | `workflows: {}`, a `depends_on` DAG |
| Detection | which key exists | `isGraph = Boolean(pipeline.workflows)`, structural |
| Unification | one generic `Trigger<TConditionType>`, so one component set renders both | none, separate paths |
| Conversion | only when there is at most one legacy trigger per type | always, one-way |

Both are lossless in data and lossy in intent, which is
[why neither converts back](decisions.md#why-conversions-are-one-way).

## Modular mode narrows every rule

`ymlDocument` binds to the active tab's file, not the whole config
([how](flows.md#3-one-file-or-many), [why](decisions.md#why-cross-file-operations-are-incomplete)).
Every rule above that needs the whole config is therefore incomplete:

| Rule | Single-file | Modular |
|---|---|---|
| Name uniqueness | Global | Active file only, so two files may define the same workflow |
| Delete cascade | Every pass lands | References in other files are left dangling |
| Rename | Rewrites every reference | Other files keep the old name |
| "Used by N workflows" | Accurate | **Under**counts, so it reassures |
| Deleting an entity defined elsewhere | n/a | Throws, failing loudly rather than half-applying |

`EntityIndexService` is the one cross-file-aware piece, and `assertWorkflowReferenceable` is the
only service that reads it.

## Reference tables

Consult, don't read.

<details>
<summary><b>Step references (CVS)</b> — <code>parseStepCVS</code> is ordered dispatch, so reordering the branches changes behaviour</summary>

| Reference | Library | Id | Version |
|---|---|---|---|
| `script@1` / `script` | `bitrise`, from `default_step_lib_source` | `script` | `1` / none |
| `bundle::my-bundle` | `bundle` | `my-bundle` | none |
| `with` | `with` | `with` | none |
| `path::./steps/local@x` | `path` | `./steps/local` | none, `@x` is **discarded** |
| `git::https://…git@next` | `git` | the URL | `next` |
| `https://…bitrise-steplib.git::script@1` | `bitrise` | `script` | `1` |
| `https://custom…::baz@next` | `custom` | `baz` | `next` |

Only `bitrise`, `custom` and `git` carry a version. The bare form is context-dependent, resolving
against `default_step_lib_source`, which is why every predicate takes a `defaultStepLibrary`.

</details>

<details>
<summary><b>Step versions</b> — an empty version is a policy, not an absence</summary>

| In yml | Normalized | Resolves to | UI calls it |
|---|---|---|---|
| empty | empty | `3.0.1` | Always latest |
| `2` | `2.x.x` | `2.2.0` | Minor and patch updates |
| `2.1` | `2.1.x` | `2.1.9` | Patch updates only |
| `2.1.6` | `2.1.6` | `2.1.6` | Version in bitrise.yml |

> **Trap.** An empty version means *always latest*. Removing a pin changes what runs; it is not
> tidying.

</details>

<details>
<summary><b>Trigger conditions</b> — the two models differ only in vocabulary</summary>

| Concept | Legacy (`trigger_map`) | Target-based (`triggers:`) |
|---|---|---|
| Push branch | `push_branch` | `branch` |
| PR target | `pull_request_target_branch` | `target_branch` |
| PR source | `pull_request_source_branch` | `source_branch` |
| PR label | `pull_request_label` | `label` |
| PR comment | `pull_request_comment` | `comment` |
| Tag | `tag` | `name` |
| Commit message | `commit_message` | `commit_message` |
| Changed files | `changed_files` | `changed_files` |

Legacy keys are flat and prefixed because one object holds every condition kind. Target-based keys
nest under their trigger type, so prefixes would be redundant.
`LEGACY_TO_TARGET_BASED_CONDITION_MAP` is typed `Record<LegacyConditionType, …>`, so the compiler
enforces totality. No reverse map exists.

</details>

<details>
<summary><b>Tool versions</b> — a <code>tools:</code> value is a small language</summary>

| In the YAML | Means |
|---|---|
| `latest` | Newest published version |
| `installed` | Newest version already on the stack |
| `20:latest` | Newest published inside the `20` line |
| `20:installed` | Newest installed inside the `20` line |
| `unset` | Do not manage this tool here. Workflow scope only; `setTool` throws at root |
| `20.1.2` | Exactly that |
| `20:banana` | Exact and verbatim. An unrecognised suffix is not an error |

Keyword matching is case-insensitive, the prefix keeps its case, and the colon split uses
`indexOf(':') > 0`, so a leading colon never makes a prefix.

</details>

<details>
<summary><b>The three value layers</b> — used by steps, bundle instances and containers</summary>

`defaultValues` come from the catalog, `userValues` from `bitrise.yml`, `mergedValues` from both.

> **Trap.** Only `userValues` reaches the document. A field can look set in the UI while the YAML
> holds nothing, and writing a value equal to the default still adds a line.

A step bundle is a function: the definition declares `inputs` with defaults, a reference supplies
arguments. The service keeps the sides apart down to the method names, `addStepBundleInput` versus
`updateStepBundleInputInstanceValue`. Containers work the same way, one definition and many
references, each with its own `recreate` flag.

</details>

---

*Verified against the repo on 2026-08-20. Known gaps and defects are in
[decisions.md](decisions.md#open-defects).*
