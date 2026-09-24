/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { TreeNode } from '@/core/models/Tree';
import { bitriseYmlStore, initializeModularConfig, MERGED_CONFIG_NODE_ID } from '@/core/stores/BitriseYmlStore';

import { useProjectEnvVarFileGroups, useWorkflowEnvVarFileGroups } from './useProjectEnvVarFileGroups';

function node(nodeId: string, path: string, contents: string, includes: TreeNode[] = []): TreeNode {
  return { nodeId, path, contents, source: null, commitSha: 'sha', editable: true, includes };
}

const MODULE = [
  '_env: &env',
  '  SHARED: from-anchor',
  '_envs: &envs',
  '- *env',
  '_workflows: &workflows',
  '  build:',
  '    envs: *envs',
  'app:',
  '  envs: *envs',
  'workflows: *workflows',
  '',
].join('\n');

describe('env var file groups read a module that uses aliases', () => {
  beforeEach(() => {
    initializeModularConfig({
      root: node('n_root', 'bitrise.yml', 'include:\n- path: module.yml\n', [node('n_mod', 'module.yml', MODULE)]),
      mergedYml: 'workflows:\n  build: {}\n',
    });
    bitriseYmlStore.setState({ selectedNodeId: MERGED_CONFIG_NODE_ID });
  });

  it('resolves aliased env vars and an aliased workflows section instead of throwing', () => {
    const projectGroups = renderHook(() => useProjectEnvVarFileGroups()).result.current;
    const workflowGroups = renderHook(() => useWorkflowEnvVarFileGroups()).result.current;

    const moduleGroup = projectGroups.find(({ nodeId }) => nodeId === 'n_mod');
    expect(moduleGroup?.envs.map(({ key, value }) => [key, value])).toEqual([['SHARED', 'from-anchor']]);
    expect(workflowGroups.map(({ workflowId, envs }) => [workflowId, envs.map(({ key }) => key)])).toEqual([
      ['build', ['SHARED']],
    ]);
  });
});
