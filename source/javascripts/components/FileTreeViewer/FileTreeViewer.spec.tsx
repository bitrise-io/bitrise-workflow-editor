/**
 * @jest-environment jsdom
 */
import { BitkitPageSidebar, BitkitProvider } from '@bitrise/bitkit-v2';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { trackWorkflowEditorYmlModuleOpened } from '@/core/analytics/ConfigManagementAnalytics';
import { TreeNode } from '@/core/models/Tree';
import { initializeModularConfig, selectNode } from '@/core/stores/BitriseYmlStore';

import FileTreeViewer from './FileTreeViewer';

// The bitkit barrel also exports a markdown component, and `react-markdown`'s ESM dependency tree is
// not transformed for tests. Nothing here renders markdown, so stub it at the leaf.
jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }));

jest.mock('@/core/analytics/ConfigManagementAnalytics', () => ({
  trackWorkflowEditorYmlModuleOpened: jest.fn(),
}));

const SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';

const leaf = (nodeId: string, path: string): TreeNode => ({
  nodeId,
  path,
  contents: `# ${path}\n`,
  source: { path, repository: null, branch: null, tag: null, commit: null },
  commitSha: SHA,
  editable: true,
  includes: [],
});

const modularRoot = (...includes: TreeNode[]): TreeNode => ({
  nodeId: 'n_root',
  path: 'bitrise.yml',
  contents: 'format_version: "13"\n',
  source: null,
  commitSha: SHA,
  editable: true,
  includes,
});

const loadTree = (root: TreeNode) => {
  act(() => {
    initializeModularConfig({ root, branch: 'main', commitSha: SHA });
  });
};

const renderTree = () =>
  render(
    <BitkitProvider>
      <BitkitPageSidebar>
        <FileTreeViewer />
      </BitkitPageSidebar>
    </BitkitProvider>,
  );

// A branch's accessible name starts with its own label, followed by its visible children's.
const folder = (label: string) => screen.getByRole('treeitem', { name: new RegExp(`^${label}( |$)`) });

describe('FileTreeViewer', () => {
  beforeEach(() => {
    jest.mocked(trackWorkflowEditorYmlModuleOpened).mockClear();
  });

  it('tracks a module as opened only when it has no tab yet', async () => {
    loadTree(modularRoot(leaf('n_a', 'a.yml')));
    renderTree();

    await userEvent.click(screen.getByText('a.yml'));
    expect(trackWorkflowEditorYmlModuleOpened).toHaveBeenCalledWith({ openMethod: 'file_explorer' });

    // Back to the root tab, then the already open module again.
    act(() => selectNode('n_root'));
    await userEvent.click(screen.getByText('a.yml'));
    expect(trackWorkflowEditorYmlModuleOpened).toHaveBeenCalledTimes(1);
  });

  it('opens a folder that appears after the tree changed', () => {
    loadTree(modularRoot(leaf('n_x', 'ci/a/x.yml'), leaf('n_z', 'ci/a/z.yml')));
    renderTree();

    loadTree(modularRoot(leaf('n_x', 'ci/a/x.yml'), leaf('n_z', 'ci/a/z.yml'), leaf('n_y', 'ci/b/y.yml')));

    expect(folder('ci').getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps a folder the user closed closed until a module inside it is selected', async () => {
    loadTree(modularRoot(leaf('n_x', 'ci/x.yml'), leaf('n_y', 'other/y.yml')));
    renderTree();

    await userEvent.click(screen.getByText('ci'));
    expect(folder('ci').getAttribute('aria-expanded')).toBe('false');

    loadTree(modularRoot(leaf('n_x', 'ci/x.yml'), leaf('n_y', 'other/y.yml'), leaf('n_w', 'other/w.yml')));
    expect(folder('ci').getAttribute('aria-expanded')).toBe('false');

    act(() => selectNode('n_x'));
    expect(folder('ci').getAttribute('aria-expanded')).toBe('true');
  });
});
