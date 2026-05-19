export type VersionStrategy = 'latest-released' | 'latest-installed' | 'exact' | 'unset';

export type ParsedToolVersion =
  | { strategy: 'latest-released'; prefix?: string }
  | { strategy: 'latest-installed'; prefix?: string }
  | { strategy: 'exact'; version: string }
  | { strategy: 'unset' };
