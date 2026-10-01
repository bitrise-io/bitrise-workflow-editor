/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import { TreeNode } from '@/core/models/Tree';
import {
  bitriseYmlStore,
  initializeBitriseYmlDocument,
  initializeModularConfig,
  openTab,
  updateBitriseYmlDocumentByString,
} from '@/core/stores/BitriseYmlStore';

import useVisualEditorBlocker, { PARSE_ERROR_BLOCKER, YAML_ALIAS_BLOCKER } from './useVisualEditorBlocker';

const blocker = () => renderHook(() => useVisualEditorBlocker()).result.current;

const file = (nodeId: string, path: string, contents: string, includes: TreeNode[] = []): TreeNode => ({
  nodeId,
  path,
  contents,
  source: null,
  commitSha: 'sha',
  editable: true,
  includes,
});

describe('useVisualEditorBlocker', () => {
  it('does not block schema-invalid markers (SSW-3087) or an unused anchor', () => {
    initializeBitriseYmlDocument({ ymlString: 'format_version: "13"\na: &x 1\n', version: '1' });
    bitriseYmlStore.setState({ validationStatus: 'invalid' });

    expect(blocker()).toBeNull();
  });

  it('blocks on an alias or a merge key', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
    expect(blocker()).toBe(YAML_ALIAS_BLOCKER);

    initializeBitriseYmlDocument({ ymlString: 'b:\n  <<: {k: 1}\n', version: '1' });
    expect(blocker()).toBe(YAML_ALIAS_BLOCKER);
  });

  it('blocks on YAML that does not parse', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: [\n', version: '1' });

    expect(blocker()).toBe(PARSE_ERROR_BLOCKER);
  });

  it('keeps the alias reason while typed YAML does not parse, and unblocks once the aliases are gone', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
    const { result } = renderHook(() => useVisualEditorBlocker());

    act(() => updateBitriseYmlDocumentByString('a: &x 1\nb: *x\nc: [\n'));
    expect(result.current).toBe(YAML_ALIAS_BLOCKER);

    act(() => updateBitriseYmlDocumentByString('a: 1\nb: 1\n'));
    expect(result.current).toBeNull();
  });

  it('in a modular config, reports an open file loaded with an alias that has no anchor as a parse error', () => {
    initializeModularConfig({
      root: file('n_root', 'bitrise.yml', 'include:\n- path: m.yml\n', [
        file('n_mod', 'm.yml', 'workflows: *missing\n'),
      ]),
      mergedYml: 'workflows: {}\n',
    });
    const { result } = renderHook(() => useVisualEditorBlocker());

    act(() => openTab('n_mod'));

    expect(result.current).toBe(PARSE_ERROR_BLOCKER);
  });

  it('in a modular config, blocks every file when any file uses aliases', () => {
    initializeModularConfig({
      root: file('n_root', 'bitrise.yml', 'include:\n- path: m.yml\n', [
        file('n_mod', 'm.yml', '_shared: &shared\n  build: {}\nworkflows: *shared\n'),
      ]),
      mergedYml: 'workflows: {}\n',
    });
    const { result } = renderHook(() => useVisualEditorBlocker());

    act(() => openTab('n_root'));

    expect(result.current).toBe(YAML_ALIAS_BLOCKER);
  });
});
