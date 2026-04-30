export type VersionStrategy = 'latest-released' | 'latest-installed' | 'exact';

export type ParsedToolVersion =
  | { strategy: 'latest-released'; prefix?: string }
  | { strategy: 'latest-installed'; prefix: string }
  | { strategy: 'exact'; version: string }
  | { kind: 'unset' };
