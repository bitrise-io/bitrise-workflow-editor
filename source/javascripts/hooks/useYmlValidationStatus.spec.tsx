/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import {
  bitriseYmlStore,
  initializeBitriseYmlDocument,
  updateBitriseYmlDocumentByString,
} from '@/core/stores/BitriseYmlStore';

import useYmlValidationStatus from './useYmlValidationStatus';

describe('useYmlValidationStatus', () => {
  beforeEach(() => {
    initializeBitriseYmlDocument({ ymlString: 'workflows: {}\n', version: '1' });
    bitriseYmlStore.setState({ validationStatus: 'warnings' });
  });

  it('reports the markers while every file parses', () => {
    expect(renderHook(() => useYmlValidationStatus()).result.current).toBe('warnings');
  });

  it('is invalid while a file does not parse, whatever the markers say', () => {
    const { result } = renderHook(() => useYmlValidationStatus());

    act(() => updateBitriseYmlDocumentByString('workflows: [\n'));

    expect(result.current).toBe('invalid');
  });
});
