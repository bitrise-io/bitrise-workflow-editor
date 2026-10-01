/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';

import { initializeBitriseYmlDocument, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';

import VisualEditorBlockedNotification from './VisualEditorBlockedNotification';

jest.mock('@bitrise/bitkit-v2', () => ({
  BitkitAlert: ({ titleText, variant }: { titleText: ReactNode; variant: string }) => (
    <div role="alert" data-variant={variant}>
      {titleText}
    </div>
  ),
}));

describe('VisualEditorBlockedNotification', () => {
  it('says the Visual editor is disabled because of aliases, and keeps saying it while the user types', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
    render(<VisualEditorBlockedNotification />);

    expect(screen.getByRole('alert').textContent).toContain('The Visual editor is disabled because of YAML aliases');
    expect(screen.getByRole('alert').dataset.variant).toBe('warning');

    act(() => updateBitriseYmlDocumentByString('a: &x 1\nb: *x\nc: [\n'));
    expect(screen.getByRole('alert')).not.toBeNull();
  });

  it('says YAML loaded invalid does not parse, as a critical alert, and keeps saying it while the user edits', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: [\n', version: '1' });
    render(<VisualEditorBlockedNotification />);

    expect(screen.getByRole('alert').textContent).toContain('Invalid YAML');
    expect(screen.getByRole('alert').dataset.variant).toBe('critical');

    act(() => updateBitriseYmlDocumentByString('a: [b\n'));
    expect(screen.getByRole('alert').dataset.variant).toBe('critical');
  });

  it('shows nothing once YAML loaded invalid parses and uses no aliases', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: [\n', version: '1' });
    render(<VisualEditorBlockedNotification />);

    act(() => updateBitriseYmlDocumentByString('a: 1\n'));

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows nothing while typed YAML does not parse, so the editor does not shift on every keystroke', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: 1\n', version: '1' });
    render(<VisualEditorBlockedNotification />);

    act(() => updateBitriseYmlDocumentByString('a: [\n'));

    expect(screen.queryByRole('alert')).toBeNull();
  });
});
