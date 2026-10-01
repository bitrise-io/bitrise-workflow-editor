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

import useYmlValidationStatus from './useYmlValidationStatus';

const status = () => renderHook(() => useYmlValidationStatus()).result.current;

const file = (nodeId: string, contents: string, includes: TreeNode[] = []): TreeNode => ({
  nodeId,
  path: `${nodeId}.yml`,
  contents,
  source: null,
  commitSha: 'sha',
  editable: true,
  includes,
});

describe('useYmlValidationStatus', () => {
  it('reports the markers while the YAML parses', () => {
    initializeBitriseYmlDocument({ ymlString: 'workflows: {}\n', version: '1' });
    bitriseYmlStore.setState({ validationStatus: 'warnings' });

    expect(status()).toBe('warnings');
  });

  it('is invalid while the YAML does not parse, whatever the markers say', () => {
    initializeBitriseYmlDocument({ ymlString: 'workflows: {}\n', version: '1' });
    bitriseYmlStore.setState({ validationStatus: 'valid' });

    act(() => updateBitriseYmlDocumentByString('workflows: [\n'));

    expect(status()).toBe('invalid');
  });

  it('in a modular config, stays invalid after leaving a file whose YAML does not parse', () => {
    initializeModularConfig({
      root: file('root', 'format_version: "13"\n', [file('a', 'workflows:\n  a: {}\n'), file('b', 'workflows: {}\n')]),
    });
    bitriseYmlStore.setState({ validationStatus: 'valid' });
    act(() => openTab('a'));
    act(() => updateBitriseYmlDocumentByString('workflows:\n  a: [\n'));

    act(() => openTab('b'));

    expect(status()).toBe('invalid');
  });
});
