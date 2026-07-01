/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { ContainerType } from '@/core/models/Container';
import { EntityIndex, TreeNode } from '@/core/models/Tree';
import { initializeBitriseYmlDocument, initializeModularConfig } from '@/core/stores/BitriseYmlStore';

import useContainers from './useContainers';

const SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';

const leaf = (nodeId: string, path: string, contents: string): TreeNode => ({
  nodeId,
  path,
  contents,
  source: { path, repository: null, branch: null, tag: null, commit: null },
  commitSha: SHA,
  editable: true,
  includes: [],
});

const ENTITY_INDEX: EntityIndex = { workflows: {}, pipelines: {}, stepBundles: {}, containers: {} };

describe('useContainers', () => {
  it('lists containers from the single config document', () => {
    initializeBitriseYmlDocument({
      ymlString: 'containers:\n  local-ctr:\n    type: execution\n    image: ubuntu:22.04\n',
      version: '1',
    });

    const { result } = renderHook(() => useContainers());

    expect(result.current.all.map((c) => c.id)).toEqual(['local-ctr']);
    expect(result.current[ContainerType.Execution].map((c) => c.id)).toEqual(['local-ctr']);
    expect(result.current[ContainerType.Service]).toHaveLength(0);
  });

  it('aggregates containers across all module files in a modular config', () => {
    const root: TreeNode = {
      nodeId: 'root',
      path: 'bitrise.yml',
      contents: 'containers:\n  exec-root:\n    type: execution\n    image: ubuntu:22.04\n',
      source: null,
      commitSha: SHA,
      editable: true,
      includes: [
        leaf(
          'n_svc',
          'containers/services.yml',
          'containers:\n  svc-mod:\n    type: service\n    image: postgres:16\n',
        ),
      ],
    };
    initializeModularConfig({ root, entityIndex: ENTITY_INDEX, branch: 'main', commitSha: SHA });

    const { result } = renderHook(() => useContainers());

    // A container defined in a module file (services.yml) is listed alongside the root's.
    expect(result.current.all.map((c) => c.id).sort()).toEqual(['exec-root', 'svc-mod']);
    expect(result.current[ContainerType.Execution].map((c) => c.id)).toEqual(['exec-root']);
    expect(result.current[ContainerType.Service].map((c) => c.id)).toEqual(['svc-mod']);
  });
});
