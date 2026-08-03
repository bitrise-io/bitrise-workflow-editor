/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';

import { bitriseYmlStore, initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';

import useYmlParseErrorMessage from './useYmlParseErrorMessage';

const SWITCH_FALLBACK = "YAML can't be parsed, please fix it before switching to the Visual editor.";
const SAVE_FALLBACK = 'Please fix the errors in your YAML configuration before saving.';

describe('useYmlParseErrorMessage', () => {
  it('locates the failure when the config could not be parsed', () => {
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

    const { result } = renderHook(() => useYmlParseErrorMessage(SWITCH_FALLBACK, 'switching to the Visual editor'));

    expect(result.current).toMatch(/^Line 7, column \d+: /);
    expect(result.current).toContain('Fix this before switching to the Visual editor.');
    expect(result.current).not.toBe(SWITCH_FALLBACK);
  });

  it('uses the fallback when the config parses cleanly', () => {
    initializeBitriseYmlDocument({
      ymlString: 'format_version: "13"\nworkflows:\n  primary: {}\n',
      version: '1',
    });

    const { result } = renderHook(() => useYmlParseErrorMessage(SWITCH_FALLBACK, 'switching to the Visual editor'));

    expect(result.current).toBe(SWITCH_FALLBACK);
  });

  it('uses the fallback for a schema-invalid config that still parses', () => {
    // Saving is gated on the broader validation status, which reports 'invalid' for marker errors on
    // a config that parsed fine. There is no line to point at, so the generic wording has to stand
    // rather than the message implying a parse failure that did not happen.
    initializeBitriseYmlDocument({
      ymlString: 'format_version: "13"\nworkflows:\n  primary: {}\n',
      version: '1',
    });
    bitriseYmlStore.setState({ validationStatus: 'invalid' });

    const { result } = renderHook(() => useYmlParseErrorMessage(SAVE_FALLBACK, 'saving'));

    expect(result.current).toBe(SAVE_FALLBACK);
  });

  it('names the file as well as the position in modular mode', () => {
    bitriseYmlStore.setState({
      __invalidYmlString: 'workflows: {devs,qa}/reports',
      __invalidYmlError: {
        message: 'Unexpected scalar at node end',
        line: 7,
        column: 31,
        path: 'ci/deploy.yml',
      },
    });

    const { result } = renderHook(() => useYmlParseErrorMessage(SAVE_FALLBACK, 'saving'));

    expect(result.current).toBe(
      'ci/deploy.yml (line 7, column 31): Unexpected scalar at node end. Fix this before saving.',
    );
  });
});
