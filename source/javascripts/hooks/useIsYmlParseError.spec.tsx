/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { bitriseYmlStore, initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';

import useIsYmlParseError from './useIsYmlParseError';

describe('useIsYmlParseError', () => {
  it('is false for a well-formed YAML config even when validationStatus reports "invalid"', () => {
    // Reproduces SSW-3087: schema/semantic marker errors flip validationStatus to 'invalid' on a
    // config that parses fine — the visual editor still renders it, so mode gating must NOT trigger.
    initializeBitriseYmlDocument({
      ymlString: 'format_version: "13"\nworkflows:\n  primary: {}\n',
      version: '1',
    });
    bitriseYmlStore.setState({ validationStatus: 'invalid' });

    const { result } = renderHook(() => useIsYmlParseError());

    expect(result.current).toBe(false);
  });

  it('is true when the YAML string cannot be parsed into a document', () => {
    // Set the parse-failure sentinel directly — this is exactly what
    // initializeBitriseYmlDocument does for a YAML string whose `doc.errors` is non-empty,
    // and testing the hook's contract shouldn't depend on the yaml library's error semantics.
    bitriseYmlStore.setState({ __invalidYmlString: 'workflows: {{{ invalid' });

    const { result } = renderHook(() => useIsYmlParseError());

    expect(result.current).toBe(true);
  });
});
