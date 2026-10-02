/**
 * @jest-environment jsdom
 */
import { datadogRum } from '@datadog/browser-rum';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

import { TreeNode } from '@/core/models/Tree';
import { initializeBitriseYmlDocument, initializeModularConfig } from '@/core/stores/BitriseYmlStore';
import { ConfigLoadingProvider } from '@/layouts/ConfigLoading.context';

import useTrackYamlAliases from './useTrackYamlAliases';

jest.mock('@datadog/browser-rum', () => ({ datadogRum: { addAction: jest.fn() } }));

const addAction = jest.mocked(datadogRum.addAction);

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
  });
});
