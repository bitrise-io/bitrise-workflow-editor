/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { bitriseYmlStore, initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';

import useYmlParseError from './useYmlParseError';

describe('useYmlParseError', () => {
  it('is undefined for a config that parses', () => {
    initializeBitriseYmlDocument({
      ymlString: 'format_version: "13"\nworkflows:\n  primary: {}\n',
      version: '1',
    });

    const { result } = renderHook(() => useYmlParseError());

    expect(result.current).toBeUndefined();
  });

  it('locates the failure when the config cannot be parsed', () => {
    // A legacy unquoted brace value that the YAML spec leaves ambiguous. Previously the store kept
    // only the raw string, so the user was redirected off the visual editor with no way to tell
    // which line broke it.
    initializeBitriseYmlDocument({
      ymlString: [
        'format_version: "13"',
        'workflows:',
        '  primary:',
        '    steps:',
        '    - deploy-to-bitrise-io@2:',
        '        inputs:',
        '        - notify_user_groups: {devs,qa}/reports',
        '',
      ].join('\n'),
      version: '1',
    });

    const { result } = renderHook(() => useYmlParseError());

    expect(result.current?.message).toBeTruthy();
    expect(result.current?.line).toBe(7);
    expect(result.current?.column).toBeGreaterThan(0);
  });

  it('clears once the config is replaced with one that parses', () => {
    bitriseYmlStore.setState({
      __invalidYmlString: 'workflows: {{{ invalid',
      __invalidYmlError: { message: 'Something is wrong', line: 1, column: 12 },
    });

    initializeBitriseYmlDocument({ ymlString: 'format_version: "13"\n', version: '2' });

    const { result } = renderHook(() => useYmlParseError());

    expect(result.current).toBeUndefined();
  });
});
