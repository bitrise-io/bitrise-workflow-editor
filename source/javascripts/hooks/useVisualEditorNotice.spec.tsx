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

import useVisualEditorNotice, { PARSE_ERROR_NOTICE, YAML_ALIAS_NOTICE } from './useVisualEditorNotice';

const notice = () => renderHook(() => useVisualEditorNotice()).result.current;

const file = (nodeId: string, path: string, contents: string, includes: TreeNode[] = []): TreeNode => ({
  nodeId,
  path,
  contents,
  source: null,
  commitSha: 'sha',
  editable: true,
  includes,
});

describe('useVisualEditorNotice', () => {
  it('gives no notice for schema-invalid markers (SSW-3087) or an unused anchor', () => {
    initializeBitriseYmlDocument({ ymlString: 'format_version: "13"\na: &x 1\n', version: '1' });
    bitriseYmlStore.setState({ validationStatus: 'invalid' });

    expect(notice()).toBeNull();
  });

  it('warns on an alias or a merge key, without disabling the Visual editor', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
    expect(notice()).toBe(YAML_ALIAS_NOTICE);

    initializeBitriseYmlDocument({ ymlString: 'b:\n  <<: {k: 1}\n', version: '1' });
    expect(notice()).toBe(YAML_ALIAS_NOTICE);
    expect(YAML_ALIAS_NOTICE.disabled).toBe(false);
  });

  it('disables the Visual editor on YAML that does not parse', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: [\n', version: '1' });

    expect(notice()).toBe(PARSE_ERROR_NOTICE);
    expect(PARSE_ERROR_NOTICE.disabled).toBe(true);
  });

  it('disables the Visual editor while typed YAML does not parse, and enables it again once it parses, aliases or not', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
    const { result } = renderHook(() => useVisualEditorNotice());

    act(() => updateBitriseYmlDocumentByString('a: &x 1\nb: *x\nc: [\n'));
    expect(result.current).toBe(PARSE_ERROR_NOTICE);

    act(() => updateBitriseYmlDocumentByString('a: &x 1\nb: *x\nc: []\n'));
    expect(result.current).toBe(YAML_ALIAS_NOTICE);

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
    const { result } = renderHook(() => useVisualEditorNotice());

    act(() => openTab('n_mod'));

    expect(result.current).toBe(PARSE_ERROR_NOTICE);
  });

  it('in a modular config, warns on every file when any file uses aliases', () => {
    initializeModularConfig({
      root: file('n_root', 'bitrise.yml', 'include:\n- path: m.yml\n', [
        file('n_mod', 'm.yml', '_shared: &shared\n  build: {}\nworkflows: *shared\n'),
      ]),
      mergedYml: 'workflows: {}\n',
    });
    const { result } = renderHook(() => useVisualEditorNotice());

    act(() => openTab('n_root'));

    expect(result.current).toBe(YAML_ALIAS_NOTICE);
  });
});
