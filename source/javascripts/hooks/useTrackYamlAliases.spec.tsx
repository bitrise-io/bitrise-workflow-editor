/**
 * @jest-environment jsdom
 */
import { datadogRum } from '@datadog/browser-rum';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

import { TreeNode } from '@/core/models/Tree';
import {
  applyModularSaveResult,
  applySaveResult,
  initializeBitriseYmlDocument,
  initializeModularConfig,
  updateBitriseYmlDocumentByString,
} from '@/core/stores/BitriseYmlStore';
import { ConfigLoadingProvider } from '@/layouts/ConfigLoading.context';

import useTrackYamlAliases from './useTrackYamlAliases';

jest.mock('@datadog/browser-rum', () => ({ datadogRum: { addAction: jest.fn() } }));

const addAction = jest.mocked(datadogRum.addAction);

// Saves run back to back, and the store outlives each test, so every save needs its own `lastSavedAt`.
let now = 0;
jest.spyOn(Date, 'now').mockImplementation(() => (now += 1));

const NO_ALIASES = 'a: 1\n';
const TWO_ALIASES_ONE_MERGE_KEY = 'a: &x 1\nb:\n  <<: {k: 1}\n  c: *x\n  d: *x\n';

function node(nodeId: string, contents: string, includes: TreeNode[] = []): TreeNode {
  return { nodeId, path: `${nodeId}.yml`, contents, source: null, commitSha: 'sha', editable: true, includes };
}

const mountWhileLoading = () => {
  let isConfigLoading = true;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ConfigLoadingProvider value={isConfigLoading}>{children}</ConfigLoadingProvider>
  );
  const { rerender } = renderHook(() => useTrackYamlAliases(), { wrapper });
  return () => {
    isConfigLoading = false;
    rerender();
  };
};

const loadConfig = (ymlString: string) => {
  const finishLoading = mountWhileLoading();
  act(() => initializeBitriseYmlDocument({ ymlString, version: '1' }));
  finishLoading();
  addAction.mockClear();
};

const loadModularConfig = (root: TreeNode) => {
  const finishLoading = mountWhileLoading();
  act(() => initializeModularConfig({ root, mergedYml: 'a: 1\n' }));
  finishLoading();
  addAction.mockClear();
};

const save = (ymlString: string) => act(() => applySaveResult({ ymlString, version: '2' }));

describe('useTrackYamlAliases', () => {
  beforeEach(() => {
    addAction.mockClear();
    act(() => initializeBitriseYmlDocument({ ymlString: NO_ALIASES, version: '1' }));
  });

  describe('single-file config', () => {
    describe('on load', () => {
      it('records nothing for a config without aliases or merge keys', () => {
        act(() => initializeBitriseYmlDocument({ ymlString: NO_ALIASES, version: '1' }));
        mountWhileLoading()();

        expect(addAction).not.toHaveBeenCalled();
      });

      it('records how many aliases and merge keys a config uses, once it has loaded', () => {
        act(() => initializeBitriseYmlDocument({ ymlString: TWO_ALIASES_ONE_MERGE_KEY, version: '1' }));
        mountWhileLoading()();

        expect(addAction).toHaveBeenCalledTimes(1);
        expect(addAction).toHaveBeenCalledWith('yaml_aliases_loaded', { aliases: 2, mergeKeys: 1 });
      });

      it('records nothing while the config is loading', () => {
        act(() => initializeBitriseYmlDocument({ ymlString: TWO_ALIASES_ONE_MERGE_KEY, version: '1' }));
        mountWhileLoading();

        expect(addAction).not.toHaveBeenCalled();
      });
    });

    describe('on save', () => {
      it('records the counts before and after a save that adds the first aliases or merge keys', () => {
        loadConfig(NO_ALIASES);
        save(TWO_ALIASES_ONE_MERGE_KEY);

        expect(addAction).toHaveBeenCalledTimes(1);
        expect(addAction).toHaveBeenCalledWith('yaml_aliases_changed', {
          before: { aliases: 0, mergeKeys: 0 },
          after: { aliases: 2, mergeKeys: 1 },
        });
      });

      it('records the counts before and after a save that changes how many there are', () => {
        loadConfig(TWO_ALIASES_ONE_MERGE_KEY);
        save('a: &x 1\nb: *x\n');

        expect(addAction).toHaveBeenCalledTimes(1);
        expect(addAction).toHaveBeenCalledWith('yaml_aliases_changed', {
          before: { aliases: 2, mergeKeys: 1 },
          after: { aliases: 1, mergeKeys: 0 },
        });
      });

      it('records the counts before and after a save that removes the last aliases and merge keys', () => {
        loadConfig(TWO_ALIASES_ONE_MERGE_KEY);
        save(NO_ALIASES);

        expect(addAction).toHaveBeenCalledTimes(1);
        expect(addAction).toHaveBeenCalledWith('yaml_aliases_changed', {
          before: { aliases: 2, mergeKeys: 1 },
          after: { aliases: 0, mergeKeys: 0 },
        });
      });

      it('records nothing for a save that keeps the counts', () => {
        loadConfig(TWO_ALIASES_ONE_MERGE_KEY);
        save(`${TWO_ALIASES_ONE_MERGE_KEY}e: 3\n`);

        expect(addAction).not.toHaveBeenCalled();
      });

      it('records nothing for edits that are not saved', () => {
        loadConfig(NO_ALIASES);
        act(() => updateBitriseYmlDocumentByString(TWO_ALIASES_ONE_MERGE_KEY));

        expect(addAction).not.toHaveBeenCalled();
      });

      it('compares a save with the config a branch switch loaded, not the one before it', () => {
        loadConfig(NO_ALIASES);
        act(() => initializeBitriseYmlDocument({ ymlString: TWO_ALIASES_ONE_MERGE_KEY, version: '1' }));
        expect(addAction).not.toHaveBeenCalled();

        save(NO_ALIASES);
        expect(addAction).toHaveBeenCalledTimes(1);
        expect(addAction).toHaveBeenCalledWith('yaml_aliases_changed', {
          before: { aliases: 2, mergeKeys: 1 },
          after: { aliases: 0, mergeKeys: 0 },
        });
      });
    });
  });

  describe('modular config', () => {
    describe('on load', () => {
      it('sums the counts over every file', () => {
        const finishLoading = mountWhileLoading();
        act(() =>
          initializeModularConfig({
            root: node('root', 'a: &x 1\nb: *x\n', [node('module', 'c:\n  <<: {k: 1}\nd: &y 2\ne: *y\n')]),
            mergedYml: 'a: 1\n',
          }),
        );

        finishLoading();
        expect(addAction).toHaveBeenCalledTimes(1);
        expect(addAction).toHaveBeenCalledWith('yaml_aliases_loaded', { aliases: 2, mergeKeys: 1 });
      });
    });

    describe('on save', () => {
      it('compares every file on a modular save', () => {
        loadModularConfig(node('root', 'a: 1\n', [node('module', 'b: 2\n')]));
        act(() => applyModularSaveResult({ root: node('root', 'a: 1\n', [node('module', 'b: &x 2\nc: *x\n')]) }));
        expect(addAction).toHaveBeenCalledWith('yaml_aliases_changed', {
          before: { aliases: 0, mergeKeys: 0 },
          after: { aliases: 1, mergeKeys: 0 },
        });
      });

      it('records the removed counts when a save drops an include file that had them', () => {
        loadModularConfig(node('root', 'a: 1\n', [node('plain', 'b: 2\n'), node('aliased', 'c: &x 3\nd: *x\n')]));
        act(() => applyModularSaveResult({ root: node('root', 'a: 1\n', [node('plain', 'b: 2\n')]) }));

        expect(addAction).toHaveBeenCalledTimes(1);
        expect(addAction).toHaveBeenCalledWith('yaml_aliases_changed', {
          before: { aliases: 1, mergeKeys: 0 },
          after: { aliases: 0, mergeKeys: 0 },
        });
      });
    });
  });
});
