/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { EntityIndex, TreeNode } from '@/core/models/Tree';
import { initializeModularConfig } from '@/core/stores/BitriseYmlStore';

import useContainerWorkflowUsage from './useContainerWorkflowUsage';

const SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';
const EMPTY_INDEX: EntityIndex = { workflows: {}, pipelines: {}, stepBundles: {}, containers: {} };

const leaf = (nodeId: string, path: string, contents: string): TreeNode => ({
  nodeId,
  path,
  contents,
  source: { path, repository: null, branch: null, tag: null, commit: null },
  commitSha: SHA,
  editable: true,
  includes: [],
});

describe('useContainerWorkflowUsage', () => {
  it('finds cross-module usage: a container defined in one module, used by a workflow in another', () => {
    const root: TreeNode = {
      nodeId: 'root',
      path: 'bitrise.yml',
      contents: 'containers:\n  ec1:\n    type: execution\n    image: ubuntu:22.04\n',
      source: null,
      commitSha: SHA,
      editable: true,
      includes: [
        leaf(
          'n_mod',
          'mod.yml',
          'workflows:\n  wf-b:\n    steps:\n      - script:\n          execution_container: ec1\n',
        ),
      ],
    };
    // Root is the active file and doesn't use ec1 — the usage lives in the module.
    initializeModularConfig({ root, entityIndex: EMPTY_INDEX, branch: 'main', commitSha: SHA });

    const { result } = renderHook(() => useContainerWorkflowUsage('ec1'));

    expect(result.current).toEqual(['wf-b']);
  });

  it('lists a workflow once even when it uses the container in more than one file', () => {
    const root: TreeNode = {
      nodeId: 'root',
      path: 'bitrise.yml',
      contents:
        'containers:\n  ec1:\n    type: execution\n    image: ubuntu:22.04\n' +
        'workflows:\n  wf-shared:\n    steps:\n      - script:\n          execution_container: ec1\n',
      source: null,
      commitSha: SHA,
      editable: true,
      includes: [
        leaf(
          'n_mod',
          'mod.yml',
          'workflows:\n  wf-shared:\n    steps:\n      - deploy:\n          execution_container: ec1\n',
        ),
      ],
    };
    initializeModularConfig({ root, entityIndex: EMPTY_INDEX, branch: 'main', commitSha: SHA });

    const { result } = renderHook(() => useContainerWorkflowUsage('ec1'));

    expect(result.current).toEqual(['wf-shared']);
  });

  it('returns per-container usage across modules when called without an id (batch path)', () => {
    const root: TreeNode = {
      nodeId: 'root',
      path: 'bitrise.yml',
      contents:
        'containers:\n  ec1:\n    type: execution\n    image: ubuntu:22.04\n' +
        '  ec2:\n    type: execution\n    image: alpine\n' +
        '  ec3:\n    type: execution\n    image: debian\n',
      source: null,
      commitSha: SHA,
      editable: true,
      includes: [
        leaf(
          'n_mod',
          'mod.yml',
          'workflows:\n' +
            '  wf-a:\n    steps:\n      - script:\n          execution_container: ec1\n' +
            '  wf-b:\n    steps:\n      - script:\n          execution_container: ec2\n',
        ),
      ],
    };
    initializeModularConfig({ root, entityIndex: EMPTY_INDEX, branch: 'main', commitSha: SHA });

    const { result } = renderHook(() => useContainerWorkflowUsage());

    expect(result.current).toEqual(
      new Map([
        ['ec1', ['wf-a']],
        ['ec2', ['wf-b']],
        ['ec3', []],
      ]),
    );
  });
});
