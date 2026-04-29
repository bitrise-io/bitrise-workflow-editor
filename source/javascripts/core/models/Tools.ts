export type VersionStrategy = 'absolute-latest' | 'latest-of' | 'preinstalled' | 'exact';

export type ParsedToolVersion =
  | { strategy: 'absolute-latest' }
  | { strategy: 'latest-of'; prefix: string }
  | { strategy: 'preinstalled'; prefix: string }
  | { strategy: 'exact'; version: string }
  | { kind: 'unset' };
