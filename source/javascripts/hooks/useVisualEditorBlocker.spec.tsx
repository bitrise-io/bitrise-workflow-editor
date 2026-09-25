/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import {
  bitriseYmlStore,
  initializeBitriseYmlDocument,
  updateBitriseYmlDocumentByString,
} from '@/core/stores/BitriseYmlStore';

import useVisualEditorBlocker from './useVisualEditorBlocker';

const blocker = () => renderHook(() => useVisualEditorBlocker()).result.current;

describe('useVisualEditorBlocker', () => {
  beforeEach(() => {
    bitriseYmlStore.setState({ __invalidYmlString: undefined });
  });

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
});
