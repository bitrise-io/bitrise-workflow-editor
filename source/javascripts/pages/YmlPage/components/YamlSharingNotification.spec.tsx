/**
 * @jest-environment jsdom
 */
import { datadogRum } from '@datadog/browser-rum';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';

import { initializeBitriseYmlDocument, initializeModularConfig, openTab } from '@/core/stores/BitriseYmlStore';

import YamlSharingNotification from './YamlSharingNotification';

let mockIsReadOnly = false;

jest.mock('@datadog/browser-rum', () => ({ datadogRum: { addAction: jest.fn() } }));
jest.mock('@/hooks/useTree', () => ({ useReadOnlyView: () => ({ isReadOnly: mockIsReadOnly }) }));
jest.mock('./ExpandYamlSharingDialog', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div>expand dialog</div> : null),
}));
jest.mock('@bitrise/bitkit-v2', () => ({
  BitkitAlert: ({
    titleText,
    messageText,
    action,
  }: {
    titleText: ReactNode;
    messageText: ReactNode;
    action?: { label: string; onClick: () => void };
  }) => (
    <div role="alert">
      {titleText}
      {messageText}
      {action && (
        <button type="button" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  ),
}));

describe('YamlSharingNotification', () => {
  beforeEach(() => {
    mockIsReadOnly = false;
    (datadogRum.addAction as jest.Mock).mockClear();
  });

  it('offers to expand, and opening the preview is tracked', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
    render(<YamlSharingNotification />);

    fireEvent.click(screen.getByText('Expand…'));

    expect(screen.getByText('expand dialog')).toBeDefined();
    expect(datadogRum.addAction).toHaveBeenCalledWith('wfe_yaml_sharing_expand_opened');
  });

  it('explains but does not offer to expand a read-only file', () => {
    mockIsReadOnly = true;
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
    render(<YamlSharingNotification />);

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.queryByText('Expand…')).toBeNull();
  });

  it('names the files that block a modular config, and offers Expand only where the open file has them', () => {
    const file = (nodeId: string, path: string, contents: string, includes: never[] = []) =>
      ({ nodeId, path, contents, source: null, commitSha: 'sha', editable: true, includes }) as never;
    initializeModularConfig({
      root: file('n_root', 'bitrise.yml', 'include:\n- path: m.yml\n', [
        file('n_mod', 'm.yml', 'a: &x 1\nb: *x\n'),
      ] as never),
      mergedYml: 'a: 1\nb: 1\n',
    });
    openTab('n_root');
    const { rerender } = render(<YamlSharingNotification />);

    expect(screen.getByRole('alert').textContent).toContain('m.yml uses YAML aliases');
    expect(screen.queryByText('Expand…')).toBeNull();

    openTab('n_mod');
    rerender(<YamlSharingNotification />);

    expect(screen.getByText('Expand…')).toBeDefined();
  });
});
