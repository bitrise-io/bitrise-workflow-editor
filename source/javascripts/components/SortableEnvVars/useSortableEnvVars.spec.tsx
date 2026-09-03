/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import { EnvVarSource } from '@/core/models/EnvVar';
import { getYmlString, initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';

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
});
