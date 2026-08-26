/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ComponentType, ReactNode } from 'react';

import { GetConfigResponse, TreeNode } from '@/core/models/Tree';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import MainLayout from '@/layouts/MainLayout';

import InitialDataLoader from './InitialDataLoader';

/**
 * Stands in for a routed page: it reads the selected workflow exactly the way the real pages do.
 * It is deliberately NOT lazy, so it mounts in the same commit as the loader's bootstrap effect —
 * the sequencing a branch reload (or any already-loaded route chunk) really produces, and the one
 * in which passive effects run child-first.
 */
const probeRenders: Array<{ storeWasBootstrapped: boolean; selectedWorkflowId: string }> = [];
function WorkflowsPageProbe() {
  const [selectedWorkflowId] = useSelectedWorkflow();
  probeRenders.push({
    storeWasBootstrapped: Boolean(bitriseYmlStore.getState().tree),
    selectedWorkflowId,
  });
  return <div data-testid="selected-workflow">{selectedWorkflowId}</div>;
}

// The real route table is lazy (and pulls the whole page graph); swap in the probe as the workflows
// page. `deepLinkedEntity` stays real — it is part of what this test exercises.
jest.mock('@/routes', () => ({
  ...jest.requireActual('@/routes'),
  preloadRoutes: jest.fn(),
  routes: [{ path: '/workflows', component: WorkflowsPageProbe }],
}));

// `wouter` ships untransformed ESM, and its matching isn't what's under test — the router is reduced
// to "render the route" so the real gate (MainLayout's `isConfigLoading` branch, fed by the loader's
// context value) is the only thing deciding whether the page mounts.
jest.mock('wouter', () => ({
  __esModule: true,
  Router: ({ children }: { children?: ReactNode }) => <>{children}</>,
  Switch: ({ children }: { children?: ReactNode }) => <>{children}</>,
  Route: ({ component: Component }: { component: ComponentType }) => <Component />,
  Redirect: () => null,
}));

// Chrome that isn't part of the gating decision.
jest.mock('@/components/Header', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/Navigation', () => ({ __esModule: true, default: () => null }));
jest.mock('@/pages/YmlPage/components/OpenFileTabs/OpenFileTabs', () => ({ __esModule: true, default: () => null }));
jest.mock('@chakra-ui/react/box', () => ({ Box: ({ children }: { children?: ReactNode }) => <div>{children}</div> }));
jest.mock('@chakra-ui/react/text', () => ({
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}));
jest.mock('@chakra-ui/react/image', () => ({ Image: () => <img alt="" /> }));

// The v2 barrel re-exports a markdown component whose ESM dependency tree doesn't belong in this
// test, so the two components the error branch renders are stubbed. Toasts are captured so the
// branch-load notifications stay assertable.
const createBitkitToastMock = jest.fn();
jest.mock('@bitrise/bitkit-v2', () => ({
  BitkitButton: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  BitkitLink: ({ children, href }: { children?: ReactNode; href?: string }) => <a href={href}>{children}</a>,
  createBitkitToast: (...args: unknown[]) => createBitkitToastMock(...args),
}));

// `LoadingState` is still a v1 component; only the spinner it renders is needed here.
jest.mock('@bitrise/bitkit', () => ({
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  ProgressBitbot: () => <div data-testid="loading-state" />,
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}));

jest.mock('@datadog/browser-rum', () => ({ datadogRum: { addError: jest.fn() } }));
jest.mock('@/core/analytics/ConfigManagementAnalytics', () => ({ trackConfigBranchLoaded: jest.fn() }));
jest.mock('@/hooks/useYmlLanguageServices', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/hooks/useCloseAIDrawer', () => ({ __esModule: true, default: jest.fn() }));

type TreeQuery = {
  data?: GetConfigResponse;
  error: { status?: number; statusText?: string; message?: string } | null;
  refetch: jest.Mock;
};
let treeQuery: TreeQuery = { data: undefined, error: null, refetch: jest.fn() };
jest.mock('@/hooks/useCiConfigTree', () => ({ useGetCiConfigTree: () => treeQuery }));
jest.mock('@/hooks/useCiConfig', () => ({
  useGetCiConfig: () => ({ data: undefined, error: null, isLoading: false, refetch: jest.fn() }),
}));

let ymlSettingsQuery: { data?: { usesRepositoryYml: boolean }; isPending: boolean } = {
  data: { usesRepositoryYml: true },
  isPending: false,
};
jest.mock('@/hooks/useCiConfigSettings', () => ({ useCiConfigSettings: () => ymlSettingsQuery }));
jest.mock('@/hooks/useFeatureFlag', () => ({ __esModule: true, default: () => true }));

function node(nodeId: string, contents: string, includes: TreeNode[] = []): TreeNode {
  return { nodeId, path: `${nodeId}.yml`, contents, source: null, commitSha: 'sha', editable: true, includes };
}

/** A modular tree whose `module-only` workflow exists ONLY in an included file, never in the root. */
function modularConfig(branch: string): GetConfigResponse {
  return {
    root: node('root', 'workflows:\n  root-wf: {}\n', [node('module', 'workflows:\n  module-only: {}\n')]),
    branch,
  };
}

function renderApp() {
  return render(
    <InitialDataLoader>
      <MainLayout />
    </InitialDataLoader>,
  );
}

/** Announce a hash change the way the browser does, so the search-param readers pick it up. */
function navigateTo(hash: string) {
  act(() => {
    window.parent.location.hash = hash;
    window.parent.dispatchEvent(new Event('hashchange'));
  });
}

describe('InitialDataLoader', () => {
  beforeEach(() => {
    probeRenders.length = 0;
    createBitkitToastMock.mockClear();
    treeQuery = { data: undefined, error: null, refetch: jest.fn() };
    ymlSettingsQuery = { data: { usesRepositoryYml: true }, isPending: false };
    jest.spyOn(PageProps, 'appSlug').mockReturnValue('app-1');
    jest.spyOn(RuntimeUtils, 'isProduction').mockReturnValue(false);
    jest.spyOn(RuntimeUtils, 'isWebsiteMode').mockReturnValue(false);
    bitriseYmlStore.setState({ tree: undefined, files: {}, selectedNodeId: undefined, openTabs: [] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps routes unmounted while the config is still loading', () => {
    window.parent.location.hash = '#/workflows?workflow_id=module-only';

    renderApp();

    expect(screen.queryByTestId('selected-workflow')).toBeNull();
    expect(probeRenders).toHaveLength(0);
    // Nothing has touched the URL, so the id is still there for the bootstrap to resolve.
    expect(window.parent.location.hash).toContain('workflow_id=module-only');
  });

  it('never lets a route render against an un-bootstrapped store, so a module-only id survives', () => {
    window.parent.location.hash = '#/workflows?workflow_id=module-only';
    const { rerender } = renderApp();

    // The query resolves. Routes mount in the same commit the bootstrap effect runs in — passive
    // effects run child-first, so an ungated page would validate `module-only` against an empty
    // store, find nothing, and strip it from the URL before the bootstrap ever read it.
    treeQuery = { data: modularConfig('main'), error: null, refetch: jest.fn() };
    rerender(
      <InitialDataLoader>
        <MainLayout />
      </InitialDataLoader>,
    );

    expect(probeRenders.length).toBeGreaterThan(0);
    expect(probeRenders.every((r) => r.storeWasBootstrapped)).toBe(true);
    expect(probeRenders[0].selectedWorkflowId).toBe('module-only');
    expect(screen.getByTestId('selected-workflow').textContent).toBe('module-only');
    expect(window.parent.location.hash).toContain('workflow_id=module-only');
    // Bootstrap resolved the link to the module that actually defines the workflow.
    expect(bitriseYmlStore.getState().selectedNodeId).toBe('module');
  });

  it('reports a branch fallback through a v2 toast', () => {
    jest.spyOn(RuntimeUtils, 'isWebsiteMode').mockReturnValue(true);
    window.parent.location.hash = '#/workflows?branch=feature&workflow_id=module-only';
    // The requested branch has no config, so the default branch is loaded instead.
    treeQuery = { data: modularConfig('main'), error: null, refetch: jest.fn() };

    renderApp();

    expect(createBitkitToastMock).toHaveBeenCalledWith({
      variant: 'warning',
      messageText: 'Config unavailable on feature. Using main (default branch).',
    });
  });

  it('renders the error screen and retries from it', () => {
    const refetch = jest.fn();
    treeQuery = { data: undefined, error: { status: 500, statusText: 'Server Error', message: 'Boom' }, refetch };

    renderApp();

    expect(screen.getByText('500 - Server Error')).toBeDefined();
    expect(screen.getByText('Boom')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('re-gates routes on a branch switch until the new branch is bootstrapped', () => {
    jest.spyOn(RuntimeUtils, 'isWebsiteMode').mockReturnValue(true);
    window.parent.location.hash = '#/workflows?branch=main&workflow_id=module-only';
    treeQuery = { data: modularConfig('main'), error: null, refetch: jest.fn() };

    const { rerender } = renderApp();
    expect(screen.getByTestId('selected-workflow').textContent).toBe('module-only');

    // Switching branch invalidates the bootstrapped config a render before the new one arrives. The
    // gate is derived, so it closes in that very render and the page unmounts, instead of validating
    // the requested id against the previous branch's config.
    treeQuery = { data: undefined, error: null, refetch: jest.fn() };
    navigateTo('#/workflows?branch=feature&workflow_id=module-only');
    expect(screen.queryByTestId('selected-workflow')).toBeNull();

    // The feature branch defines the workflow in a module too; the link must survive the reload.
    probeRenders.length = 0;
    treeQuery = { data: modularConfig('feature'), error: null, refetch: jest.fn() };
    rerender(
      <InitialDataLoader>
        <MainLayout />
      </InitialDataLoader>,
    );

    expect(probeRenders.length).toBeGreaterThan(0);
    expect(probeRenders.every((r) => r.storeWasBootstrapped)).toBe(true);
    expect(screen.getByTestId('selected-workflow').textContent).toBe('module-only');
    expect(window.parent.location.hash).toContain('workflow_id=module-only');
    expect(bitriseYmlStore.getState().selectedNodeId).toBe('module');
  });
});
