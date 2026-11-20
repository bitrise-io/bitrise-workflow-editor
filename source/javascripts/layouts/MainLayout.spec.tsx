/**
 * @jest-environment jsdom
 */
import { BitkitProvider } from '@bitrise/bitkit-v2';
import { act, render, screen } from '@testing-library/react';
import { CSSProperties } from 'react';

import { TreeNode } from '@/core/models/Tree';
import { initializeBitriseYmlDocument, initializeModularConfig } from '@/core/stores/BitriseYmlStore';

import MainLayout from './MainLayout';

// The bitkit barrel also exports a markdown component, and `react-markdown`'s ESM dependency tree is
// not transformed for tests. Nothing here renders markdown, so stub it at the leaf.
jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }));

// Only the sidebar's props are under test, so everything around it is a stub.
jest.mock('@/components/Navigation', () => ({
  __esModule: true,
  default: ({ style, hidePageNav }: { style?: CSSProperties; hidePageNav?: boolean }) => (
    <nav data-testid="sidebar" data-hidden={style?.display === 'none'} data-hide-page-nav={hidePageNav} />
  ),
}));
// The content area shows the loading state here, so the router never renders.
jest.mock('wouter', () => ({ __esModule: true, Redirect: () => null, Router: () => null, Switch: () => null }));
jest.mock('@/components/LazyRoute', () => ({ __esModule: true, default: () => null }));
jest.mock('@/layouts/VisualEditorDisabledRedirect', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/LoadingState', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/Header', () => ({ __esModule: true, default: () => null }));
jest.mock('@/pages/YmlPage/components/OpenFileTabs/OpenFileTabs', () => ({ __esModule: true, default: () => null }));
jest.mock('@/hooks/useMergedConfigSync', () => ({ __esModule: true, default: () => undefined }));
jest.mock('@/hooks/useTrackYamlAliases', () => ({ __esModule: true, default: () => undefined }));
jest.mock('@/layouts/ConfigLoading.context', () => ({ useIsConfigLoading: () => true }));

let currentPathMock = '/workflows';
jest.mock('@/hooks/useHashLocation', () => ({
  __esModule: true,
  default: () => [currentPathMock, jest.fn()],
}));

const SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';

const MODULAR_ROOT: TreeNode = {
  nodeId: 'n_root',
  path: 'bitrise.yml',
  contents: 'format_version: "13"\n',
  source: null,
  commitSha: SHA,
  editable: true,
  includes: [
    {
      nodeId: 'n_a',
      path: 'a.yml',
      contents: '',
      source: { path: 'a.yml', repository: null, branch: null, tag: null, commit: null },
      commitSha: SHA,
      editable: true,
      includes: [],
    },
  ],
};

const renderLayout = () =>
  render(
    <BitkitProvider>
      <MainLayout />
    </BitkitProvider>,
  );

const sidebar = () => screen.getByTestId('sidebar');

describe('MainLayout sidebar', () => {
  // `window.env` does not exist under Jest, and the layout reads the mode.
  beforeAll(() => {
    (window as unknown as { env: { MODE: string } }).env = { MODE: 'CLI' };
  });

  it('hides the sidebar on the YAML page of a single-file config', () => {
    currentPathMock = '/yml';
    act(() => initializeBitriseYmlDocument({ ymlString: 'format_version: "13"\n', version: '1' }));

    renderLayout();

    expect(sidebar().dataset.hidden).toBe('true');
  });

  it('shows the sidebar with the page navigation collapsed on the YAML page of a modular config', () => {
    currentPathMock = '/yml';
    act(() => initializeModularConfig({ root: MODULAR_ROOT, branch: 'main', commitSha: SHA }));

    renderLayout();

    expect(sidebar().dataset.hidden).toBe('false');
    expect(sidebar().dataset.hidePageNav).toBe('true');
  });

  it('shows the full sidebar on a visual page of a modular config', () => {
    currentPathMock = '/workflows';
    act(() => initializeModularConfig({ root: MODULAR_ROOT, branch: 'main', commitSha: SHA }));

    renderLayout();

    expect(sidebar().dataset.hidden).toBe('false');
    expect(sidebar().dataset.hidePageNav).toBe('false');
  });
});
