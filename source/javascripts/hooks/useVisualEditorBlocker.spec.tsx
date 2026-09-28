/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import {
  bitriseYmlStore,
  initializeBitriseYmlDocument,
  initializeModularConfig,
  openTab,
  updateBitriseYmlDocumentByString,
} from '@/core/stores/BitriseYmlStore';

import useVisualEditorBlocker, { useYamlAliasFilePaths } from './useVisualEditorBlocker';

const blocker = () => renderHook(() => useVisualEditorBlocker()).result.current;

describe('useVisualEditorBlocker', () => {
  it('does not block schema-invalid markers (SSW-3087) or an unused anchor', () => {
    initializeBitriseYmlDocument({ ymlString: 'format_version: "13"\na: &x 1\n', version: '1' });
    bitriseYmlStore.setState({ validationStatus: 'invalid' });

    expect(blocker()).toBeNull();
  });

  it('blocks on an alias or a merge key', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
    expect(blocker()).toBe('yaml-alias');

    initializeBitriseYmlDocument({ ymlString: 'a: &x\n  k: 1\nb:\n  <<: *x\n', version: '1' });
    expect(blocker()).toBe('yaml-alias');
  });

  it('reports a parse error first, and unblocks once the aliases are gone', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
    const { result } = renderHook(() => useVisualEditorBlocker());

    act(() => updateBitriseYmlDocumentByString('a: [\n'));
    expect(result.current).toBe('parse-error');

    act(() => updateBitriseYmlDocumentByString('a: 1\nb: 1\n'));
    expect(result.current).toBeNull();
  });

  describe('in a modular config', () => {
    const file = (nodeId: string, path: string, contents: string, includes: never[] = []) =>
      ({ nodeId, path, contents, source: null, commitSha: 'sha', editable: true, includes }) as never;
    const load = (moduleContents: string) =>
      initializeModularConfig({
        root: file('n_root', 'bitrise.yml', 'include:\n- path: m.yml\n', [
          file('n_mod', 'm.yml', moduleContents),
        ] as never),
        mergedYml: 'workflows: {}\n',
      });

    it('blocks the whole config when any file uses aliases, and names that file', () => {
      load('_shared: &shared\n  build: {}\nworkflows: *shared\n');
      const { result } = renderHook(() => ({ blocker: useVisualEditorBlocker(), paths: useYamlAliasFilePaths() }));

      act(() => openTab('n_root'));

      expect(result.current).toEqual({ blocker: 'yaml-alias', paths: ['m.yml'] });
    });

    it('reports a parse error for a file loaded with one, such as an alias with no anchor', () => {
      load('workflows: *missing\n');
      const { result } = renderHook(() => useVisualEditorBlocker());

      act(() => openTab('n_mod'));

      expect(result.current).toBe('parse-error');
    });

    it('also blocks an open file with an error the CLI accepts, such as a duplicate key', () => {
      load('workflows:\n  a: {}\n  a: {}\n');
      const { result } = renderHook(() => useVisualEditorBlocker());

      act(() => openTab('n_mod'));

      expect(result.current).toBe('parse-error');
    });
  });
});
