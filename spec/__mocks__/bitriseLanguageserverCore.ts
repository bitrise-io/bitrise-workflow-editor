/**
 * Jest stand-in for `@bitrise/languageserver-core`. That specifier is a Vite/tsconfig alias into the
 * git-installed package (raw TS with a large transitive graph), which jest can't resolve or transform.
 * This reimplements only the pure bitrise:// codec WFE consumes, byte-identically (same `vscode-uri`,
 * same canonicalization as the real `bitriseUri.ts`), so URI assertions hold without loading the package.
 */
import { URI } from 'vscode-uri';

export type GitRef = { type: 'branch' | 'tag' | 'commit'; value: string };

export type BitriseUri = { repo: string; path: string; ref?: GitRef };

function canonicalizePath(path: string): string {
  return path
    .split('/')
    .filter((segment) => segment !== '' && segment !== '.')
    .join('/');
}

export function composeBitriseUri({ repo, path, ref }: BitriseUri): string {
  return URI.from({
    scheme: 'bitrise',
    authority: repo,
    path: `/${canonicalizePath(path)}`,
    query: ref ? `${ref.type}=${ref.value}` : undefined,
  }).toString();
}

export function parseBitriseUri(uri: string): BitriseUri | null {
  const u = URI.parse(uri);
  if (u.scheme !== 'bitrise') return null;
  const eq = u.query.indexOf('=');
  const type = eq === -1 ? '' : u.query.slice(0, eq);
  const value = eq === -1 ? '' : u.query.slice(eq + 1);
  const ref =
    value !== '' && (type === 'branch' || type === 'tag' || type === 'commit')
      ? ({ type, value } as GitRef)
      : undefined;
  return { repo: u.authority, path: canonicalizePath(u.path), ref };
}
