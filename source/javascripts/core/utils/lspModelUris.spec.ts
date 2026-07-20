import { TreeNode, TreeNodeSource } from '@/core/models/Tree';

import { buildNodeUris } from './lspModelUris';

// Stub the codec: we assert this file's tree-walk + identity-inheritance logic, not the exact
// bitrise:// string format (that's covered by the language-server package's own tests). The stub
// renders identity so inheritance is visible in assertions.
jest.mock('@bitrise/languageserver-core', () => ({
  composeBitriseUri: ({ repo, path, ref }: { repo: string; path: string; ref?: { type: string; value: string } }) =>
    `bitrise://${repo}/${path}${ref ? `?${ref.type}=${ref.value}` : ''}`,
}));

const emptySource: TreeNodeSource = { path: null, repository: null, branch: null, tag: null, commit: null };

const node = (nodeId: string, path: string, source: TreeNodeSource | null, includes: TreeNode[] = []): TreeNode => ({
  nodeId,
  path,
  contents: '',
  source,
  commitSha: '',
  editable: true,
  includes,
});

describe('buildNodeUris', () => {
  it('maps the root to the working repo (.)', () => {
    const uris = buildNodeUris(node('root', 'bitrise.yml', null));
    expect(uris.get('root')).toBe('bitrise://./bitrise.yml');
  });

  it('gives a local include the includer repo + ref (no repository of its own)', () => {
    const local = node('n_local', 'ci/local.yml', { ...emptySource, path: 'ci/local.yml' });
    const uris = buildNodeUris(node('root', 'bitrise.yml', null, [local]));
    expect(uris.get('n_local')).toBe('bitrise://./ci/local.yml');
  });

  it('gives a cross-repo include its own repository and ref', () => {
    const shared = node('n_shared', 'shared.yml', { ...emptySource, repository: 'org/shared', tag: '1.2.0' });
    const uris = buildNodeUris(node('root', 'bitrise.yml', null, [shared]));
    expect(uris.get('n_shared')).toBe('bitrise://org/shared/shared.yml?tag=1.2.0');
  });

  it('makes a local include nested under a cross-repo include inherit the cross-repo repo + ref', () => {
    const nestedLocal = node('n_nested', 'inner.yml', { ...emptySource, path: 'inner.yml' });
    const shared = node('n_shared', 'shared.yml', { ...emptySource, repository: 'org/shared', branch: 'main' }, [
      nestedLocal,
    ]);
    const uris = buildNodeUris(node('root', 'bitrise.yml', null, [shared]));
    expect(uris.get('n_nested')).toBe('bitrise://org/shared/inner.yml?branch=main');
  });

  it('prefers commit over tag over branch for the ref', () => {
    const pinned = node('n', 'x.yml', {
      ...emptySource,
      repository: 'org/r',
      branch: 'b',
      tag: 't',
      commit: 'deadbeef',
    });
    const uris = buildNodeUris(node('root', 'bitrise.yml', null, [pinned]));
    expect(uris.get('n')).toBe('bitrise://org/r/x.yml?commit=deadbeef');
  });
});
