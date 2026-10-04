/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';

import { TreeNode } from '@/core/models/Tree';
import {
  initializeBitriseYmlDocument,
  initializeModularConfig,
  updateBitriseYmlDocumentByString,
} from '@/core/stores/BitriseYmlStore';

import VisualEditorNotification from './VisualEditorNotification';

jest.mock('@bitrise/bitkit-v2', () => ({
  BitkitAlert: ({
    titleText,
    messageText,
    variant,
  }: {
    titleText: ReactNode;
    messageText: ReactNode;
    variant: string;
  }) => (
    <div role="alert" data-variant={variant}>
      {titleText} {messageText}
    </div>
  ),
}));

describe('VisualEditorNotification', () => {
  it('warns that the Visual editor does not support aliases, and keeps saying it while the user types', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
    render(<VisualEditorNotification />);

    expect(screen.getByRole('alert').textContent).toContain("The Visual editor doesn't support YAML aliases");
    expect(screen.getByRole('alert').dataset.variant).toBe('warning');

    act(() => updateBitriseYmlDocumentByString('a: &x 1\nb: *x\nc: [\n'));
    expect(screen.getByRole('alert')).not.toBeNull();
  });

  it('says YAML loaded invalid does not parse, as a critical alert, and keeps saying it while the user edits', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: [\n', version: '1' });
    render(<VisualEditorNotification />);

    expect(screen.getByRole('alert').textContent).toContain('Invalid YAML');
    expect(screen.getByRole('alert').dataset.variant).toBe('critical');

    act(() => updateBitriseYmlDocumentByString('a: [b\n'));
    expect(screen.getByRole('alert').dataset.variant).toBe('critical');
  });

  it('shows nothing once YAML loaded invalid parses and uses no aliases', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: [\n', version: '1' });
    render(<VisualEditorNotification />);

    act(() => updateBitriseYmlDocumentByString('a: 1\n'));

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows nothing while typed YAML does not parse, so the editor does not shift on every keystroke', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: 1\n', version: '1' });
    render(<VisualEditorNotification />);

    act(() => updateBitriseYmlDocumentByString('a: [\n'));

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('names the files that use aliases in a modular config', () => {
    const file = (nodeId: string, path: string, contents: string): TreeNode => ({
      nodeId,
      path,
      contents,
      source: null,
      commitSha: 'sha',
      editable: true,
      includes: [],
    });
    initializeModularConfig({
      root: {
        ...file('root', 'bitrise.yml', 'format_version: "13"\n'),
        includes: [file('a', 'ci/a.yml', 'x: &e 1\ny: *e\n'), file('b', 'ci/b.yml', 'z:\n  <<: {k: 1}\n')],
      },
    });
    render(<VisualEditorNotification />);

    expect(screen.getByRole('alert').textContent).toContain('Found in ci/a.yml, ci/b.yml.');
    expect(screen.getByText('ci/a.yml, ci/b.yml').dataset.clarityMask).toBe('true');
  });
});
