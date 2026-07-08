/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { EntityIndex, TreeNode } from '@/core/models/Tree';
import { initializeBitriseYmlDocument, initializeModularConfig } from '@/core/stores/BitriseYmlStore';

import { useEntityDefinitionPaths } from './useTree';

const SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';

// The store rebuilds the entity index live from each file's document, so definitions are driven by
// real YAML contents here rather than a hand-crafted index (which the rebuild would overwrite).
const leaf = (nodeId: string, path: string, contents: string): TreeNode => ({
  nodeId,
  path,
  contents,
  source: { path, repository: null, branch: null, tag: null, commit: null },
  commitSha: SHA,
  editable: true,
  includes: [],
});

const EMPTY_INDEX: EntityIndex = { workflows: {}, pipelines: {}, stepBundles: {}, containers: {} };

const modularRoot = (rootContents: string, moduleContents: string): TreeNode => ({
  nodeId: 'root',
  path: 'bitrise.yml',
  contents: rootContents,
  source: null,
  commitSha: SHA,
  editable: true,
  includes: [leaf('n_mod', 'mod.yml', moduleContents)],
});

describe('useEntityDefinitionPaths', () => {
  it('is empty in single-file mode (no entity index)', () => {
    initializeBitriseYmlDocument({
      ymlString: 'containers:\n  a:\n    type: execution\n    image: ubuntu:22.04\n',
      version: '1',
    });

    const { result } = renderHook(() => useEntityDefinitionPaths('containers', 'a'));

    expect(result.current).toEqual([]);
  });

  it('returns a single entry when the container is defined in only one module', () => {
    const root = modularRoot('containers:\n  solo:\n    type: execution\n    image: ubuntu:22.04\n', '');
    initializeModularConfig({ root, entityIndex: EMPTY_INDEX, branch: 'main', commitSha: SHA });

    const { result } = renderHook(() => useEntityDefinitionPaths('containers', 'solo'));

    expect(result.current).toEqual([{ nodeId: 'root', path: 'bitrise.yml' }]);
  });

  it('returns every defining module path in precedence order for a multi-module container', () => {
    const root = modularRoot(
      'containers:\n  dup:\n    type: execution\n    image: ubuntu:22.04\n',
      'containers:\n  dup:\n    type: service\n    image: postgres:16\n',
    );
    initializeModularConfig({ root, entityIndex: EMPTY_INDEX, branch: 'main', commitSha: SHA });

    const { result } = renderHook(() => useEntityDefinitionPaths('containers', 'dup'));

    // The including file (root) outranks the file it includes, so it comes first.
    expect(result.current).toEqual([
      { nodeId: 'root', path: 'bitrise.yml' },
      { nodeId: 'n_mod', path: 'mod.yml' },
    ]);
  });
});
