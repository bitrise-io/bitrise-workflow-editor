/** The user's `include:` directive verbatim; fields populated iff the user wrote them. `null` on the root. */
export type TreeNodeSource = {
  path: string | null;
  repository: string | null;
  branch: string | null;
  tag: string | null;
  commit: string | null;
};

export type TreeNode = {
  /** Opaque on the FE; the BE owns derivation. Identity key (path is not unique). */
  nodeId: string;
  path: string;
  contents: string;
  source: TreeNodeSource | null;
  /** SHA the contents were read from — a full 40-char SHA, or a short 6–8 char hash for short-pinned includes, or empty for FE-created files; also the conflict token for saves. */
  commitSha: string;
  /** Edit-gating source of truth; the FE never re-derives this. */
  editable: boolean;
  /** FE→BE save marker: `true` for files changed since load. Set only when building the save payload. */
  modified?: boolean;
  includes: TreeNode[];
};

export type EntityDefinition = { nodeId: string };

/**
 * `{ entityId: [{ nodeId }, …] }` per kind, ordered highest-precedence-first to match the Go
 * merger: index `0` is the winning layer (a node outranks the files it includes, and a later
 * include outranks an earlier sibling), later entries are lower layers merged underneath.
 */
export type EntityIndexEntries = Record<string, EntityDefinition[]>;

/** Which node defines which entity. The FE keeps it live (re-derived from open documents); the BE snapshot is only the seed. */
export type EntityIndex = {
  workflows: EntityIndexEntries;
  pipelines: EntityIndexEntries;
  /** camelCase ← wire `step_bundles`. */
  stepBundles: EntityIndexEntries;
  /**
   * Execution + service containers share the one top-level `containers` map, keyed by container id.
   * Optional: older BE snapshots omit it (defaulted to `{}` on parse); the live FE index always has it.
   */
  containers?: EntityIndexEntries;
  /**
   * Project env vars (`app.envs`), keyed by env var name. camelCase ← wire `app_envs`.
   * Optional for the same reason as `containers`.
   */
  appEnvs?: EntityIndexEntries;
};

export type EntityKind = keyof EntityIndex;

/** Bootstrap response (`GET /config/tree`). Always tree-shaped; a non-modular config is a single root node with `includes: []`. */
export type GetConfigResponse = {
  root: TreeNode;
  entityIndex: EntityIndex;
  /** Merge of the tree as loaded. Absent if the BE couldn't merge at bootstrap; the FE then fetches it via `POST /config/merge`. */
  mergedYml?: string;
  /** From the `X-Config-Branch` response header (the body carries no branch). */
  branch?: string;
};

export type MergedConfigResult = {
  mergedYml: string;
};
