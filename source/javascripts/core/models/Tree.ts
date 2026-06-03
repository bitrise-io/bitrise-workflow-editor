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

/** Mode-discriminated bootstrap response (`GET /config/tree`). */
export type ModularConfigResponse = {
  mode: 'modular';
  root: TreeNode;
  entityIndex: EntityIndex;
  /** From the `X-Config-Branch` response header (the modular body has no branch). */
  branch?: string;
};

export type SingleFileConfigResponse = {
  mode: 'single_file';
  yaml: string;
  version: string;
  commitSha?: string;
  branch?: string;
};

export type GetConfigResponse = ModularConfigResponse | SingleFileConfigResponse;

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
