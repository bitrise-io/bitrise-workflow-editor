/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import { EnvVarSource } from '@/core/models/EnvVar';
import { TreeNode } from '@/core/models/Tree';
import {
  getFileYmlString,
  getYmlString,
  initializeBitriseYmlDocument,
  initializeModularConfig,
  selectNode,
} from '@/core/stores/BitriseYmlStore';

import { useSortableEnvVars } from './useSortableEnvVars';

const WORKFLOW_ENVS = [
  'workflows:',
  '  wf1:',
  '    envs:',
  '    - NODE_VERSION: lts',
  '    - PROJECT_NAME: Mando',
  '    - ENVIRONMENT: production',
  '',
].join('\n');

const renderSortableEnvVars = () => {
  initializeBitriseYmlDocument({ ymlString: WORKFLOW_ENVS, version: '1' });
  return renderHook(() => useSortableEnvVars({ source: EnvVarSource.Workflows, sourceId: 'wf1' }));
};

describe('useSortableEnvVars', () => {
  it('seeds the list from the document', () => {
    const { result } = renderSortableEnvVars();

    expect(result.current.envs.map((env) => env.key)).toEqual(['NODE_VERSION', 'PROJECT_NAME', 'ENVIRONMENT']);
  });

  it('removes the clicked row from the document', () => {
    const { result } = renderSortableEnvVars();
    const [, projectName] = result.current.envs;

    act(() => result.current.onRemove(projectName.uniqueId)());

    expect(result.current.envs.map((env) => env.key)).toEqual(['NODE_VERSION', 'ENVIRONMENT']);
    expect(getYmlString()).toBe(
      ['workflows:', '  wf1:', '    envs:', '    - NODE_VERSION: lts', '    - ENVIRONMENT: production', ''].join('\n'),
    );
  });

  it('removes the right rows when two removals land before a re-render', () => {
    const { result } = renderSortableEnvVars();
    const [nodeVersion, , environment] = result.current.envs;

    // Both handlers run against the list as it was rendered, so the second one has to resolve
    // `environment` at its new position (1) instead of the one it was rendered at (2).
    act(() => {
      result.current.onRemove(nodeVersion.uniqueId)();
      result.current.onRemove(environment.uniqueId)();
    });

    expect(result.current.envs.map((env) => env.key)).toEqual(['PROJECT_NAME']);
    expect(getYmlString()).toBe(['workflows:', '  wf1:', '    envs:', '    - PROJECT_NAME: Mando', ''].join('\n'));
  });

  it('ignores a repeated removal of the same row', () => {
    const { result } = renderSortableEnvVars();
    const [, projectName] = result.current.envs;
    const removeProjectName = result.current.onRemove(projectName.uniqueId);

    act(() => {
      removeProjectName();
      removeProjectName();
    });

    expect(result.current.envs.map((env) => env.key)).toEqual(['NODE_VERSION', 'ENVIRONMENT']);
    expect(getYmlString()).toBe(
      ['workflows:', '  wf1:', '    envs:', '    - NODE_VERSION: lts', '    - ENVIRONMENT: production', ''].join('\n'),
    );
  });

  describe('debounced key and value writes', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const flushDebounce = () => act(() => jest.advanceTimersByTime(250));

    it('writes a value to the row it was typed in after a preceding row is removed', () => {
      const { result } = renderSortableEnvVars();
      const [nodeVersion, , environment] = result.current.envs;

      act(() => result.current.onValueChange(environment.uniqueId)('staging'));
      act(() => result.current.onRemove(nodeVersion.uniqueId)());
      flushDebounce();

      expect(getYmlString()).toBe(
        ['workflows:', '  wf1:', '    envs:', '    - PROJECT_NAME: Mando', '    - ENVIRONMENT: staging', ''].join('\n'),
      );
    });

    it('writes a key to the row it was typed in after a preceding row is removed', () => {
      const { result } = renderSortableEnvVars();
      const [nodeVersion, , environment] = result.current.envs;

      act(() => result.current.onKeyChange(environment.uniqueId)('STAGE'));
      act(() => result.current.onRemove(nodeVersion.uniqueId)());
      flushDebounce();

      expect(getYmlString()).toBe(
        ['workflows:', '  wf1:', '    envs:', '    - PROJECT_NAME: Mando', '    - STAGE: production', ''].join('\n'),
      );
    });

    it('lands every keystroke of a burst, because each rename builds on the previous one', () => {
      const { result } = renderSortableEnvVars();
      const [nodeVersion] = result.current.envs;

      act(() => result.current.onKeyChange(nodeVersion.uniqueId)('N'));
      act(() => jest.advanceTimersByTime(100));
      act(() => result.current.onKeyChange(nodeVersion.uniqueId)('NO'));
      flushDebounce();

      expect(getYmlString()).toBe(
        [
          'workflows:',
          '  wf1:',
          '    envs:',
          '    - NO: lts',
          '    - PROJECT_NAME: Mando',
          '    - ENVIRONMENT: production',
          '',
        ].join('\n'),
      );
    });

    it('drops a pending write once the list is unmounted', () => {
      const { result, unmount } = renderSortableEnvVars();
      const [nodeVersion] = result.current.envs;

      // `useDebounceCallback` cancels a different debounce instance than the one it hands back, so
      // the timer fires after unmount regardless — the write itself has to decline to land.
      act(() => result.current.onValueChange(nodeVersion.uniqueId)('changed'));
      unmount();

      expect(flushDebounce).not.toThrow();
      expect(getYmlString()).toBe(WORKFLOW_ENVS);
    });

    it('drops a pending write for a row that is removed before it flushes', () => {
      const { result } = renderSortableEnvVars();
      const [, , environment] = result.current.envs;

      act(() => result.current.onValueChange(environment.uniqueId)('staging'));
      act(() => result.current.onRemove(environment.uniqueId)());

      expect(flushDebounce).not.toThrow();
      expect(getYmlString()).toBe(
        ['workflows:', '  wf1:', '    envs:', '    - NODE_VERSION: lts', '    - PROJECT_NAME: Mando', ''].join('\n'),
      );
    });
  });

  it('applies is_expand to the row it was toggled on after a preceding row is removed', () => {
    const { result } = renderSortableEnvVars();
    const [nodeVersion, , environment] = result.current.envs;

    act(() => {
      result.current.onRemove(nodeVersion.uniqueId)();
      result.current.onIsExpandChange(environment.uniqueId)(false);
    });

    expect(getYmlString()).toBe(
      [
        'workflows:',
        '  wf1:',
        '    envs:',
        '    - PROJECT_NAME: Mando',
        '    - ENVIRONMENT: production',
        '      opts:',
        '        is_expand: false',
        '',
      ].join('\n'),
    );
  });

  describe('modular config', () => {
    const SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';

    // Both files define `workflows.wf1.envs`, and the second entry carries the same key in each —
    // so a write that leaked across the file boundary would apply cleanly and silently.
    const ROOT_YML = ['workflows:', '  wf1:', '    envs:', '    - ROOT_A: 1', '    - SHARED: root', ''].join('\n');
    const CHILD_YML = ['workflows:', '  wf1:', '    envs:', '    - CHILD_A: 1', '    - SHARED: child', ''].join('\n');

    const renderOnRoot = () => {
      const child: TreeNode = {
        nodeId: 'n_child',
        path: 'child-a.yml',
        contents: CHILD_YML,
        source: { path: 'child-a.yml', repository: null, branch: null, tag: null, commit: null },
        commitSha: SHA,
        editable: true,
        includes: [],
      };
      const root: TreeNode = {
        nodeId: 'root',
        path: 'bitrise.yml',
        contents: ROOT_YML,
        source: null,
        commitSha: SHA,
        editable: true,
        includes: [child],
      };

      // initializeModularConfig selects the root file, so the list renders against `bitrise.yml`.
      initializeModularConfig({ root, branch: 'main', commitSha: SHA });

      return renderHook(() => useSortableEnvVars({ source: EnvVarSource.Workflows, sourceId: 'wf1' }));
    };

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('drops a pending write when the active file changes before it flushes', () => {
      const { result } = renderOnRoot();
      const shared = result.current.envs.find((env) => env.key === 'SHARED');

      act(() => result.current.onKeyChange(shared?.uniqueId ?? '')('RENAMED'));
      act(() => selectNode('n_child'));

      expect(() => act(() => jest.advanceTimersByTime(250))).not.toThrow();

      // Neither file is touched: the edit is dropped rather than redirected into `child-a.yml`.
      expect(getFileYmlString('root')).toBe(ROOT_YML);
      expect(getFileYmlString('n_child')).toBe(CHILD_YML);
    });

    // Deliberately NOT wrapped in `act`: this is the case where the file switch has reached the
    // store but React has not re-rendered yet, so neither the re-seeded list nor any effect-updated
    // ref knows about it — only reading the store at flush time catches it. Wrapping this in `act`
    // would test the easy path instead (see the case above).
    it('drops a pending write when the file switch has not reached React yet', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderOnRoot();
      const shared = result.current.envs.find((env) => env.key === 'SHARED');

      act(() => result.current.onKeyChange(shared?.uniqueId ?? '')('RENAMED'));
      selectNode('n_child');

      expect(() => act(() => jest.advanceTimersByTime(250))).not.toThrow();

      expect(getFileYmlString('root')).toBe(ROOT_YML);
      expect(getFileYmlString('n_child')).toBe(CHILD_YML);
      consoleError.mockRestore();
    });

    it('writes to the active file when it has not changed', () => {
      const { result } = renderOnRoot();
      const shared = result.current.envs.find((env) => env.key === 'SHARED');

      act(() => result.current.onKeyChange(shared?.uniqueId ?? '')('RENAMED'));
      act(() => jest.advanceTimersByTime(250));

      expect(getFileYmlString('root')).toBe(
        ['workflows:', '  wf1:', '    envs:', '    - ROOT_A: 1', '    - RENAMED: root', ''].join('\n'),
      );
      expect(getFileYmlString('n_child')).toBe(CHILD_YML);
    });
  });
});
