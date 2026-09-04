export type VersionStrategy =
  'latest-of' | 'absolute-latest-released' | 'absolute-latest-installed' | 'exact' | 'unset';

export type ParsedToolVersion =
  /** The newest version starting with `prefix`, preferring the latest installed match when `preferInstalled` is set. */
  | { strategy: 'latest-of'; prefix: string; preferInstalled: boolean }
  /** The newest version overall, `latest`. */
  | { strategy: 'absolute-latest-released' }
  /** The newest preinstalled version, `installed`. */
  | { strategy: 'absolute-latest-installed' }
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
