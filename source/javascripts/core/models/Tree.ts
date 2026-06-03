/**
 * Modular YAML tree model — camelCase mirror of the wire contract in
 * `modular-yml-editing-support-docs/api.md`. The API client (`BitriseYmlApi`)
 * maps the snake_case wire shape to/from these types at the boundary, so
 * everything above the client speaks camelCase.
 *
 * `node_id` is opaque on the FE — the BE owns its derivation. Use it everywhere
 * a node needs identity (tabs, selection, mutation API, entity-index targets),
 * since `path` alone is not unique (the same file can appear under multiple
 * `source`s).
 */

/**
 * The user's `include:` directive verbatim. Each field is populated iff the
 * user wrote it — the BE does not fill in resolved defaults. `null` on the root
 * file (it isn't loaded via an include).
 */
export type TreeNodeSource = {
  path: string | null;
  repository: string | null;
  branch: string | null;
  tag: string | null;
  commit: string | null;
};

/** The single recursive node type used across every tree request and response. */
export type TreeNode = {
  /** Stable BE-emitted identifier. Opaque on the FE. */
  nodeId: string;
  /** Canonical, repo-relative path. Display-only; not an identity key. */
  path: string;
  /** Raw YAML string. */
  contents: string;
  /** Verbatim `include:` directive; `null` for the root. */
  source: TreeNodeSource | null;
  /** Full 40-char commit SHA the contents were read from. Deep links / drift. */
  commitSha: string;
  /** `SHA256(contents)` — the conflict token compared on save. */
  version: string;
  /** Single source of truth for edit gating. The FE never re-derives this. */
  editable: boolean;
  /** Recursive children; `[]` for leaves. */
  includes: TreeNode[];
};

/** `{ entityId: { nodeId } }` per kind. */
export type EntityIndexEntries = Record<string, { nodeId: string }>;

/**
 * Server-built map of "which node defines which entity," returned alongside the
 * tree. Read-only on the FE; replaced wholesale on every load/save response.
 */
export type EntityIndex = {
  workflows: EntityIndexEntries;
  pipelines: EntityIndexEntries;
  /** camelCase ← wire `step_bundles`. */
  stepBundles: EntityIndexEntries;
};

export type EntityKind = keyof EntityIndex;

/**
 * Bootstrap response (`GET /config/tree`). Always tree-shaped — there is no
 * mode discriminator. A non-modular config (Bitrise-hosted, or no `include:`s)
 * is just the degenerate case: a single root node with `includes: []`.
 */
export type GetConfigResponse = {
  root: TreeNode;
  entityIndex: EntityIndex;
  /**
   * Initial flattened config for the Merged-config tab — the merge of the tree
   * as loaded. Absent if the BE couldn't merge at bootstrap; the FE then fetches
   * it lazily via `POST /config/merge`. Re-fetched after any local edit.
   */
  mergedYml?: string;
  /** From the `X-Config-Branch` response header (the body carries no branch). */
  branch?: string;
};

/** One per-file conflict entry in a 409 save response. */
export type TreeConflict = {
  path: string;
  remote: TreeNode;
};

/** 200 result of a tree save (`POST /config/push` with a tree payload). */
export type SaveTreeResult = {
  status: 'ok';
  warnings: string[];
  root: TreeNode;
  entityIndex: EntityIndex;
};

/** 409 body carried on `ClientError.data` when a save conflicts. */
export type SaveTreeConflict = {
  status: 'conflict';
  conflicts: TreeConflict[];
};

export type MergedConfigResult = {
  mergedYml: string;
};

export function emptyEntityIndex(): EntityIndex {
  return { workflows: {}, pipelines: {}, stepBundles: {} };
}
