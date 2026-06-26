/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import MonacoUtils from '@/core/utils/MonacoUtils';

import useFileTabValidationStatuses from './useFileTabValidationStatuses';

jest.mock('@/core/utils/MonacoUtils', () => ({
  __esModule: true,
  default: {
    getValidationStatusForUri: jest.fn(),
    onMarkersChange: jest.fn(),
  },
}));

const monaco = MonacoUtils as jest.Mocked<typeof MonacoUtils>;
const uri = (nodeId: string) => `file:///modular/${nodeId}`;
// Marker-change payload mimics Monaco's Uri[] (only `toString()` is used by the hook).
const changed = (uris: string[]) => uris.map((u) => ({ toString: () => u }));

describe('useFileTabValidationStatuses', () => {
  let emitMarkerChange: (changedUris: unknown) => void = () => {};

  beforeEach(() => {
    jest.useFakeTimers();
    monaco.onMarkersChange.mockImplementation((cb) => {
      emitMarkerChange = cb as (changedUris: unknown) => void;
      return { dispose: jest.fn() };
    });
    monaco.getValidationStatusForUri.mockReturnValue('valid');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('computes a status per open tab on mount', () => {
    monaco.getValidationStatusForUri.mockImplementation((u) => (u === uri('n1') ? 'invalid' : 'warnings'));

    const { result } = renderHook(() => useFileTabValidationStatuses(['n1', 'n2']));

    expect(result.current).toEqual({ n1: 'invalid', n2: 'warnings' });
  });

  it('recomputes when a marker changes for an open tab', () => {
    const { result } = renderHook(() => useFileTabValidationStatuses(['n1']));
    expect(result.current).toEqual({ n1: 'valid' });

    monaco.getValidationStatusForUri.mockReturnValue('invalid');
    act(() => {
      emitMarkerChange(changed([uri('n1')]));
      jest.advanceTimersByTime(250);
    });

    expect(result.current).toEqual({ n1: 'invalid' });
  });

  it('ignores marker changes for models that are not open tabs', () => {
    const { result } = renderHook(() => useFileTabValidationStatuses(['n1']));
    monaco.getValidationStatusForUri.mockClear();

    act(() => {
      emitMarkerChange(changed(['file:///merged_config.yml']));
      jest.advanceTimersByTime(250);
    });

    expect(monaco.getValidationStatusForUri).not.toHaveBeenCalled();
    expect(result.current).toEqual({ n1: 'valid' });
  });
});
