# Modular YAML — read-only merged views, per-file grouping, tab-close discard

> Untracked working plan. Each screen ships as its own PR, branches **stacked** on
> top of each other so work continues without waiting for merges.

## Core model (decided)

Two distinct presentations of every affected page, driven by the active tab:

| Active tab | Behaviour |
|---|---|
| **Effective config (merged)** | Entities **grouped by source file** (one title + table/card block per module file that defines any), **fully read-only**, each item/group gets a **jump-to-definition** arrow. |
| **Single module-file tab** (e.g. `workflows.yml`) | The **normal, editable** page, **filtered** to only the entities defined in that file. "No difference on the UI" beyond the filter. |

The merged tab already reports read-only via `useIsReadOnlyView()` (true for merged
config + cross-file nodes). The new work per page is: (a) per-file **grouping** in
merged view, (b) **filtering** to `selectedNodeId` in single-file view, (c) **jump
arrows** wired to the entity index, (d) extending read-only treatment where a page
doesn't yet honor it.

Source-of-truth state already present in `BitriseYmlStore`:
- `selectedNodeId` — active tab (or `MERGED_CONFIG_NODE_ID`).
- `files: Record<nodeId, FileSlice>` — per-file live `ymlDocument` + `path` + dirty baseline.
- `entityIndex` — `{ kind: { id: [{nodeId}, …] } }`, highest-precedence-first; live-rebuilt on edits via `EntityIndexService.buildFromFiles`.
- Hooks: `useIsReadOnlyView()`, `useEntityIndex()`, `useCrossFileEntity(kind,id)`, `useDefiningFilePath(kind,id)`, `useJumpToDefinition()`.

Jump-arrow targets:
- **Workflow-scoped** entities (triggers, workflow env vars, per-workflow stacks) → jump to the owning **workflow/pipeline definition** — already in the index, multi-file picker already works.
- **Top-level** entities (containers/services, project `app.envs`) → **not yet indexed**. Per the decision we add a real **multi-file picker**, which requires extending the entity index on **both** the FE and the Rails backend.

---

## Backend prerequisite (bitrise-website / Rails monolith)

The entity index is produced server-side and consumed by the editor. To give
containers/services and project env vars a multi-file jump picker, extend it.

**Files:**
- `components/ci/app/lib/modular_yml/entity_index_builder.rb` — the builder. Today `INDEXED_KINDS = %w[workflows pipelines step_bundles]`; `record` reads `contents[kind]` as a Hash keyed by id and appends `{ node_id: }` in highest-precedence-first walk order.
- `components/ci/app/lib/modular_yml/config_tree_builder.rb` — serializes `entity_index:` into the bootstrap + save responses.
- `components/ci/spec/lib/modular_yml/entity_index_builder_spec.rb` — spec coverage.

**Changes:**
1. **`containers`** — a top-level **map keyed by id**, identical shape to existing kinds.
   Add it to `INDEXED_KINDS` → the existing `record` loop indexes it with zero further
   logic. (Execution *and* service containers both live in this one `containers` map,
   discriminated by a `type: execution|service` field on each entry — see "Resolved
   decisions". There is **no** separate `services` index kind.)
2. **Project env vars (`app.envs`)** — an **array** under `app.envs`, each entry a
   single-key hash (`{ "KEY" => value }`). Different shape → add a dedicated branch in
   `record` that reads `contents.dig('app', 'envs')`, extracts each entry's key, and
   appends `{ node_id: }` under a new index kind (`app_envs`, keyed by var name).
   Preserve highest-precedence-first ordering (same walk).
3. Extend the spec with: containers defined across multiple files; an `app.envs` key
   layered in two files; ordering assertions matching the existing reverse-walk
   precedence rule.

> Ship the backend change **first** (or in lockstep with the foundation FE branch).
> The FE index types must match the wire keys (`containers`, `services`, `app_envs`).

---

## Jira (epic BIVS-3664 "WFE: Modular YML editing support")

| Ticket | Branch | Scope |
|---|---|---|
| BIVS-3686 | `modular-ro-1-foundation` | Foundation (discard modal, index ext, jump-to-def) — **done** |
| BIVS-3687 | `bivs-modular-entity-index-containers-envs` (bitrise-website) | Backend index — **done** |
| BIVS-3688 | `modular-ro-2-stacks` | Stacks & Machines |
| BIVS-3689 | `modular-ro-3-containers` | Containers |
| BIVS-3690 | `modular-ro-4-triggers` | Triggers |
| BIVS-3691 | `modular-ro-5-envvars` | Env Vars |

## Branch / PR stack

Stacked; each branch cut from the previous. Suggested names (adjust to convention):

```
master
└─ modular-ro-1-foundation        ← shared plumbing + tab-close discard
   └─ modular-ro-2-stacks          ← Stacks & Machines
      └─ modular-ro-3-containers    ← Containers
         └─ modular-ro-4-triggers    ← Triggers
            └─ modular-ro-5-envvars    ← Env Vars
```

Rebase children forward as parents merge. The backend PR in `bitrise-website` is a
separate parallel PR coordinated with branch 1.

---

## PR 1 — Foundation (`modular-ro-1-foundation`)

Shared pieces every later branch builds on. Three independent slices; keep them as
separate commits within the PR.

### 1a. Tab-close "Discard unsaved changes?" modal
**Goal:** closing a tab with unsaved edits prompts; confirming discards that file's
changes (and, for a brand-new module file, the include we added for it).

- **New** `pages/YmlPage/components/OpenFileTabs/DiscardFileTabDialog.tsx` — Bitkit
  `Dialog`: title "Discard unsaved changes?", body "Closing this tab discards your
  edits to **{fileName}**.", footer `Keep editing` (secondary) / `Discard and close`
  (primary). Model on existing `DeleteWorkflowDialog.tsx`.
- **Edit** `OpenFileTabs/FileTab.tsx` — `onClose` no longer calls `closeTab` directly.
  If `useFileIsDirty(nodeId)` → open the dialog; else close immediately.
- **New store helper** `discardFile(nodeId)` in `core/stores/BitriseYmlStore.ts`
  (targeted single-file analogue of `discardBitriseYmlDocument`):
  - **New file** (empty `commitSha`): find the parent node whose `include` references
    this file's path, remove that include entry (`YmlUtils.deleteIn` on the parent's
    `ymlDocument`), drop the file from `files` + prune from `tree`, then `closeTab`.
  - **Existing file with edits** (has `commitSha`): restore
    `files[nodeId].ymlDocument = clone(savedYmlDocument)`, then `closeTab`.
  - Reuse the pruning/rebinding logic already in `discardBitriseYmlDocument` (lines
    ~109–163) and `closeTab` (rebinds active tab to neighbor/merged).
- **Tests:** extend `BitriseYmlStore.modular.spec.ts` — discard a new file removes both
  the file and the parent include; discard an edited existing file reverts only it and
  leaves siblings/tree intact; closing a clean tab does not prompt.

### 1b. Entity-index extension (FE)
Mirror the backend additions so the live FE rebuild and wire parsing agree.
- `core/models/Tree.ts` — add `containers`, `appEnvs` to `EntityIndex` / `EntityKind`.
- `core/api/BitriseYmlApi.ts` — add `containers`/`app_envs` to `WireEntityIndex` + map
  them in `fromWireEntityIndex` (camelCase `app_envs → appEnvs`).
- `core/services/EntityIndexService.ts` — add `{section:'containers',key:'containers'}`
  to `KIND_SECTIONS` (map-shaped, handled by existing loop). Add a **special branch** in
  `buildFromFiles` for `app.envs`: read the array under `app.envs`, key by each entry's
  var name, preserve precedence ordering.
- **Tests:** `EntityIndexService.spec.ts` — containers across files; `app.envs` key
  layered across files; ordering parity with backend reverse-walk.

### 1c. Jump-to-definition for top-level kinds + reusable cross-file row arrow
- `hooks/useJumpToDefinition.ts` — currently maps `workflows|pipelines|stepBundles` to a
  page path + route param. For `containers`/`appEnvs` there's no per-entity deep link;
  jump = pick a file → `openTab(nodeId, {preview:false})` and stay on the current page
  (Containers / Env Vars Project tab). Add these kinds (no route param; just tab-open,
  optionally set the sub-tab).
- `components/JumpToDefinitionLink/*` + `CrossFileJumpButton.tsx` — already render the
  `FileTreeView` picker filtered to the defining nodes. Confirm they accept the new
  kinds; the picker already handles the multi-file case generically.
- Optionally extract a tiny `RowJumpToDefinitionButton` wrapper (xs `ArrowNorthEast`
  control button) so the four screens render an identical arrow.

**Acceptance:** discard modal works for new + edited files; index includes the new kinds
end-to-end (mock + live); a jump arrow rendered anywhere with a new kind opens the
file-picker and switches tabs.

---

## PR 2 — Stacks & Machines (`modular-ro-2-stacks`)

Read-only is **already** wired (`StackAndMachine.tsx` uses `useIsReadOnlyView()`, both
selectors `isDisabled`). Remaining work is grouping/filtering + provenance + arrows.

- **Workflows tab** (`StacksAndMachinesPage/tabs/WorkflowsTab.tsx`):
  - **Merged view:** under each workflow heading add "Defined in `{file}`" provenance
    (reuse `CrossFileProvenanceText` / `useCrossFileEntity('workflows', id)`) and a jump
    arrow → `JumpToDefinitionLink kind="workflows" id={workflowId}` (multi-file picker).
    Matches screenshot 3.
  - **Single-file view:** filter `workflowIds` to those whose defining nodeId ===
    `selectedNodeId` (via `entityIndex`); render normal editable selectors.
- **Default tab** (`tabs/DefaultTab.tsx`): default stack/machine lives in top-level
  `meta['bitrise.io']` (`stack` / `machine_type_id` / `stack_rollback_version`), read via
  `useProjectStackAndMachine`. This is a **singleton, not an id-keyed entity** → it is
  *not* added to the entity index. Resolve its source with a small dedicated helper that
  walks the tree (same DFS as the entity index) and collects every node whose
  `ymlDocument` has a root `meta.bitrise.io` with any stack field, returned
  **highest-precedence-first** (mirrors the merger; index 0 = winning layer).
  - **Merged view:** read-only (already) + one jump arrow. The helper **handles multiple
    files**: >1 defining file → the same `FileTreeView` picker (filtered to those nodes,
    in precedence order); exactly one → jump straight to it. (No multi-card grouping —
    it's a single Default card.)
  - **Single-file view:** show the Default card only when the active file (`selectedNodeId`)
    defines root `meta.bitrise.io`; otherwise hide / empty-state.
- **Verify** the existing disabled styling matches the spec (selectors greyed, rollback
  checkbox disabled).

**Acceptance:** merged Workflows tab groups per workflow with "Defined in" + working
arrow; single-file tab shows only that file's workflows, editable; Default tab behaves
per above.

---

## PR 3 — Containers (`modular-ro-3-containers`)

Files: `pages/ContainersPage/*` (`ContainersTable.tsx`, `ExecutionContainersTab.tsx`,
`ServiceContainersTab.tsx`, `CreateOrEditContainerDialog.tsx`, `ContainerUsageDialog.tsx`,
`ContainerUsageTable.tsx`). Containers source-file resolution comes from the new
`containers`/`services` index (PR 1b + backend).

- **Note on data shape:** execution and service containers both live in the single
  top-level `yml.containers` map (split by each entry's `type: execution|service` field);
  the top-level `yml.services` model field is unused. Both the Execution and Service
  tabs index/group off `entityIndex.containers`.
- **Merged view — group by file:** render one `bitrise.yml` / `workflows.yml` / … title
  + `ContainersTable` block per file that defines containers of the active tab's type
  (screenshot 4). Drive groups from `entityIndex.containers` (id → defining nodeId) →
  `files[nodeId].path`, filtered to the tab's container `type`.
- **Row actions → single "view details":** replace the edit (pencil) + delete
  (minus-circle) buttons with one **view-details** icon button. Opens
  `CreateOrEditContainerDialog` in a new **fully read-only mode**.
  - Add `isReadOnly`/`mode="view"` prop to `CreateOrEditContainerDialog`: disable every
    field (Unique ID, Image, Ports, Registry, Username, Password, Env Vars rows, Replace
    checkbox, Docker create options), hide the save button, keep close. Same form,
    rendered disabled. Title by type: **"Execution container details"** (screenshot 6) /
    **"Service container details"**.
- **"Used in N Workflows" modal:** `ContainerUsageDialog` already lists workflows via
  `useContainerWorkflowUsage(id)`. Add a per-row jump arrow in `ContainerUsageTable.tsx`
  → `JumpToDefinitionLink kind="workflows" id={workflowId}` (multi-file picker), so the
  user jumps to the workflow that uses the container (screenshot 5). Title "Container
  usage"; body copy **"Workflows that use this container."** (replaces the design's
  "Body copy…" placeholder); column header "Workflow name".
- **Single-file view:** filter containers to those whose defining nodeId ===
  `selectedNodeId`; keep normal editable table (edit/delete/add restored). Add button
  disabled only when `isReadOnlyView`.

**Acceptance:** merged view shows per-file grouped tables, view-details opens a disabled
detail panel, usage modal rows jump to workflows; single-file tab shows only that file's
containers, fully editable.

---

## PR 4 — Triggers (`modular-ro-4-triggers`)

Files: `pages/TriggersPage/components/TargetBasedTriggers/TargetBasedTriggers.tsx`,
`components/unified-editor/Triggers/*` (`TriggerConditions.tsx`,
`AddOrEditTriggerDialog.tsx`). Triggers are nested under a workflow/pipeline, so a
trigger's source file = the **defining file of its `sourceId`** — already in the index;
**no new index kind needed** here.

- **Merged view — group by file:** group the flat trigger list (from
  `useAllTargetBasedTriggers()`) by the defining nodeId of each trigger's target
  (`entityIndex.workflows|pipelines[sourceId]` → `files[nodeId].path`). Render title +
  table per file (screenshot 7).
- **Row read-only + arrow:** replace edit (pencil) + delete (minus-circle) with a single
  jump arrow → `JumpToDefinitionLink kind={source} id={sourceId}` (workflow/pipeline,
  multi-file picker). Disable the **Active** toggle (read-only). `TriggerConditions`
  already supports a disabled style (`triggerDisabled`) — pass it through.
- **Single-file view:** filter triggers to those whose target is defined in
  `selectedNodeId`; keep normal editable rows (toggle/edit/delete + add).

**Acceptance:** merged view groups triggers per file, rows show disabled Active +
working jump arrow; single-file tab shows only triggers for that file's targets,
editable.

---

## PR 5 — Env Vars (`modular-ro-5-envvars`)

Files: `pages/EnvVarsPage/*` (`tabs/ProjectTab.tsx`, `tabs/WorkflowsTab.tsx`,
`components/EnvVarsTable.tsx`), `components/SortableEnvVars/*`
(`SortableEnvVarItem.tsx`, `useSortableEnvVars.ts`). The item already disables inputs on
`isReadOnlyView`; add the arrow + grouping.

- **Project tab — merged view:** group `app.envs` by source file using the new
  **`appEnvs`** index (PR 1b + backend): one `bitrise.yml` / `templates.yml` / … title +
  `EnvVarsTable` per file (screenshots 8). Read-only inputs + per-row jump arrow →
  `JumpToDefinitionLink kind="appEnvs" id={envKey}` (multi-file picker; opens the chosen
  file's tab on the Project tab).
- **Workflows tab — merged view:** group by **workflow name AND defining file** — heading
  `workflow_name` + "Defined in `{file}`" sub-line (screenshot 9). Read-only inputs +
  per-row jump arrow → `kind="workflows"` (workflow env vars resolve via the workflow
  definition; multi-file picker already supported).
- **Single-file view (both tabs):** Project tab shows only `app.envs` defined in
  `selectedNodeId`; Workflows tab shows only workflows defined in `selectedNodeId`.
  Normal editable rows (key/value inputs, drag reorder, delete, "Replace variables in
  inputs", add).
- Add a per-row jump-arrow slot to `SortableEnvVarItem.tsx`; in read-only it replaces the
  delete control and drag handle stays disabled.

**Acceptance:** Project merged tab groups env vars per file with working arrows;
Workflows merged tab groups per workflow + file; single-file tabs show only that file's
env vars, editable.

---

## Production safety / feature gating (hard requirement)

**None of this may change behaviour for current production users.** The modular
experience is gated by the LaunchDarkly flag **`enable-wfe-modular-yaml-editing`**
(`main.tsx`): OFF → legacy single-file `GET /config`, no tree, no tabs (today's prod);
ON → tree-based config. Runtime signal is `Boolean(useBitriseYmlStore(s => s.tree))`;
`useIsReadOnlyView()` is already false when there's no tree.

Rules every branch must follow:
1. **All new UI lives inside the modular path.** The grouped / read-only / jump-arrow
   views render only when `tree` is present (and read-only only when
   `useIsReadOnlyView()`). The legacy single-file editor (`YmlEditor`) and the
   non-modular rendering of the four Visual pages are **untouched**.
2. **The four Visual pages (Containers/Triggers/EnvVars/Stacks) are shared** between
   legacy and modular modes. Each must branch on `tree`: no tree → render exactly as
   today (single flat table/list, current edit affordances). Snapshot/spec the
   no-tree path to prove parity.
3. **Backend index extension is additive and modular-only.** `containers` + `app_envs`
   are added to the `entity_index` produced by `config_tree_builder.rb` — served **only**
   on the tree endpoint that the modular FE calls. Legacy `/config` is unchanged. FE
   `fromWireEntityIndex` must treat the new keys as **optional** (`?? {}`) so any older
   response still parses.
4. **Tab-close discard modal** only exists in modular mode (tabs only exist with a tree)
   — no legacy impact.
5. **Flag strategy (decided):** `enable-wfe-modular-yaml-editing` is **internal/dev-only,
   not exposed to any production users**, so all five PRs **reuse that single flag** — no
   sub-flag needed. Branches merge to master safely because the flag stays off in prod
   until the whole modular feature is ready. (Revisit only if modular starts rolling out
   to prod before this work is complete.)

## Cross-cutting notes / risks

- **Bitkit MCP not configured** — when implementing, enable `bitkit-storybook-mcp` for
  accurate component/prop/token usage; treat any component API used here as
  to-be-verified.
- **FE/BE index parity** — the live FE `buildFromFiles` must produce byte-identical
  ordering to the Ruby `EntityIndexBuilder` (highest-precedence-first, node-before-
  includes, reverse sibling walk). The `app.envs` special case is the main parity risk —
  add matching FE + Ruby specs.
- **Filtering source of truth** — for single-file views, filter on the entity's
  **defining nodeId === `selectedNodeId`**, not on the merged doc, so a file tab shows
  exactly what that module defines.
- **YAML preservation** — `discardFile` for a new module file must remove *only* the
  include entry we added to the parent (match by path), touching nothing else.
- **Wire field names** — backend emits snake_case (`app_envs`); FE maps to `appEnvs`.
  Keep `fromWireEntityIndex`/`toWire…` symmetric.

## Resolved decisions (were open items)
- **Default-tab (Stacks) jump arrow** — the default stack/machine is a top-level
  `meta.bitrise.io` **singleton**, not an id-keyed entity, so it stays **out of the
  entity index**. A dedicated helper walks the tree (same DFS) collecting every node with
  a root `meta.bitrise.io` stack field, highest-precedence-first, and drives the arrow:
  **multiple defining files → `FileTreeView` picker** (precedence-ordered), one file →
  direct jump. Single-file view shows the Default card only when the active file defines
  root `meta.bitrise.io`. (See PR 2.)
- **Service containers** — there is **no separate `services` index kind**. Execution and
  service containers both live in the one top-level `yml.containers` map, split by each
  entry's `type: execution|service` field (the model's `yml.services` field is unused).
  The index adds only `containers`; both tabs group/filter off `entityIndex.containers`
  by `type`. (See backend section + PR 1b + PR 3.)
- **Dialog titles/copy** — finalized:
  - Tab-close modal — title "Discard unsaved changes?", body "Closing this tab discards
    your edits to **{file}**.", buttons "Keep editing" / "Discard and close".
  - Container view-details — "Execution container details" / "Service container details".
  - Container usage modal — title "Container usage", body "Workflows that use this
    container.", column "Workflow name".
