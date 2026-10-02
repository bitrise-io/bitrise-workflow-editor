/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import { TreeNode } from '@/core/models/Tree';
import {
  initializeBitriseYmlDocument,
  initializeModularConfig,
  openTab,
  updateBitriseYmlDocumentByString,
} from '@/core/stores/BitriseYmlStore';

import useChangedModules from './useChangedModules';

const file = (nodeId: string, contents: string, includes: TreeNode[] = []): TreeNode => ({
  nodeId,
  path: `${nodeId}.yml`,
  contents,
  source: null,
  commitSha: 'sha',
  editable: true,
  includes,
});

describe('useChangedModules', () => {
  it('lists nothing for a single-file config, even with unsaved changes', () => {
    initializeBitriseYmlDocument({ ymlString: 'workflows: {}\n', version: '1' });
    const { result } = renderHook(() => useChangedModules());

    act(() => updateBitriseYmlDocumentByString('workflows:\n  added: {}\n'));

    expect(result.current).toEqual([]);
  });

  it('lists the changed module files of a modular config', () => {
    initializeModularConfig({ root: file('root', 'format_version: "13"\n', [file('module', 'workflows: {}\n')]) });
    const { result } = renderHook(() => useChangedModules());

    act(() => openTab('module'));
    act(() => updateBitriseYmlDocumentByString('workflows:\n  added: {}\n'));

    expect(result.current).toEqual([{ nodeId: 'module', path: 'module.yml' }]);
  });
});
