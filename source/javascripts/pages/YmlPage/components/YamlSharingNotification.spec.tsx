/**
 * @jest-environment jsdom
 */
import { datadogRum } from '@datadog/browser-rum';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';

import { initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';

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
});
