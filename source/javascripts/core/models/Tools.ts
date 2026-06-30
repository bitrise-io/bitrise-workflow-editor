export type VersionStrategy = 'latest-released' | 'latest-installed' | 'exact' | 'unset';

export type ParsedToolVersion =
  | { strategy: 'latest-released'; prefix?: string }
  | { strategy: 'latest-installed'; prefix?: string }
  | { strategy: 'exact'; version: string }
  | { strategy: 'unset' };

/**
 * The catalog index: the set of tool IDs Bitrise publishes version metadata for
 * (e.g. `nodejs`, `golang`, `python`).
 */
export type ToolCatalog = {
  toolIds: string[];
};

/** A single tool's available versions, as published in its per-tool catalog. */
export type ToolVersionCatalog = {
  toolId: string;
  /** The available versions, in the order published by the catalog (newest first). */
  versions: string[];
  /**
   * Whether the version list is SemVer-compatible. When `true`, SemVer selectors
   * (`latest`, `<prefix>:latest`) can be resolved against `versions`; when `false`
   * the versions are only meaningful as opaque strings.
   */
  isSemver: boolean;
};
