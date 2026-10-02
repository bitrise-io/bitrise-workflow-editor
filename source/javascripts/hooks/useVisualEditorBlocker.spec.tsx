/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import {
  bitriseYmlStore,
  initializeBitriseYmlDocument,
  updateBitriseYmlDocumentByString,
} from '@/core/stores/BitriseYmlStore';

import useVisualEditorBlocker, { PARSE_ERROR_BLOCKER, YAML_ALIAS_BLOCKER } from './useVisualEditorBlocker';

const blocker = () => renderHook(() => useVisualEditorBlocker()).result.current;

describe('useVisualEditorBlocker', () => {
  it('does not block schema-invalid markers (SSW-3087) or an unused anchor', () => {
    initializeBitriseYmlDocument({ ymlString: 'format_version: "13"\na: &x 1\n', version: '1' });
    bitriseYmlStore.setState({ validationStatus: 'invalid' });

    expect(blocker()).toBeNull();
  });

  it('blocks on aliases', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
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

  it('reports YAML that loaded broken as a parse error, even when what parsed holds aliases', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\nc: [\n', version: '1' });

    expect(blocker()).toBe(PARSE_ERROR_BLOCKER);
  });
});
