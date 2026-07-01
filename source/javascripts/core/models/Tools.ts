export type VersionStrategy = 'latest-released' | 'latest-installed' | 'exact' | 'unset';

export type ParsedToolVersion =
  | { strategy: 'latest-released'; prefix?: string }
  | { strategy: 'latest-installed'; prefix?: string }
  | { strategy: 'exact'; version: string }
  | { strategy: 'unset' };

/** A single tool in the catalog index. */
export type ToolCatalogEntry = {
  /** Canonical tool name, used to fetch the per-tool version catalog (e.g. `golang`, `nodejs`). */
  name: string;
  /**
   * Alternative IDs that also refer to this tool (e.g. `go` for `golang`, `node` for `nodejs`).
   * The API is expected to always send this, but treat it as optional — it may be absent.
   */
  aliases?: string[];
};

/**
 * The catalog index: the set of tools Bitrise publishes version metadata for
 * (e.g. `nodejs`, `golang`, `python`).
 */
export type ToolCatalog = {
  tools: ToolCatalogEntry[];
};

/** A single version in a tool's catalog. */
export type ToolVersion = {
  version: string;
  isSemver: boolean;
};

/** A single tool's available versions, as published in its per-tool catalog. */
export type ToolVersions = {
  toolId: string;
  versions: ToolVersion[];
};
