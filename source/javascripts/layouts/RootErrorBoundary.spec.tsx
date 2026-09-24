/**
 * @jest-environment jsdom
 */
import { addReactError } from '@datadog/browser-rum-react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PropsWithChildren, ReactNode } from 'react';
import { Document } from 'yaml';

import { TreeNode } from '@/core/models/Tree';
import {
  bitriseYmlStore,
  initializeBitriseYmlDocument,
  initializeModularConfig,
  updateBitriseYmlDocumentByString,
} from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';

import RootErrorBoundary from './RootErrorBoundary';

jest.mock('@chakra-ui/react/box', () => ({
  Box: ({ children, role }: { children?: ReactNode; role?: string }) => <div role={role}>{children}</div>,
}));
jest.mock('@chakra-ui/react/text', () => ({ Text: ({ children }: PropsWithChildren) => <span>{children}</span> }));
jest.mock('@chakra-ui/react/image', () => ({ Image: () => <img alt="" /> }));
jest.mock('@chakra-ui/react/stack', () => ({
  HStack: ({ children }: PropsWithChildren) => <div>{children}</div>,
  Stack: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));
jest.mock('@/core/utils/CommonUtils', () => ({
  ...jest.requireActual('@/core/utils/CommonUtils'),
  download: jest.fn(),
}));
jest.mock('@datadog/browser-rum', () => ({ datadogRum: { addError: jest.fn() } }));
jest.mock('@datadog/browser-rum-react', () => ({ addReactError: jest.fn() }));
jest.mock('@bitrise/bitkit-v2', () => ({
  BitkitProvider: ({ children }: PropsWithChildren) => <>{children}</>,
  BitkitBadge: ({ children }: PropsWithChildren) => <span>{children}</span>,
  BitkitButton: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  BitkitCodeSnippet: ({ children }: PropsWithChildren) => <pre>{children}</pre>,
  BitkitLink: ({ children, href }: { children?: ReactNode; href?: string }) => <a href={href}>{children}</a>,
  IconDownload: () => null,
}));

const YML = 'workflows:\n  primary:\n    steps:\n    - git-clone@8: {}\n';
const MIME = 'application/yaml;charset=utf-8';

function node(nodeId: string, path: string, contents: string, includes: TreeNode[] = []): TreeNode {
  return { nodeId, path, contents, source: null, commitSha: 'sha', editable: true, includes };
}

function renderRoot(thrown: unknown) {
  const Throwing = (): never => {
    throw thrown;
  };
  render(
    <RootErrorBoundary>
      <Throwing />
    </RootErrorBoundary>,
  );
}

const buttonLabels = () => screen.queryAllByRole('button').map((button) => button.textContent);

describe('RootErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    window.location.hash = '#!/workflows';
    (addReactError as jest.Mock).mockClear();
    (download as jest.Mock).mockClear();
    bitriseYmlStore.setState({
      ymlDocument: new Document(),
      savedYmlDocument: new Document(),
      __invalidYmlString: undefined,
      __savedInvalidYmlString: undefined,
      tree: undefined,
      files: {},
    });
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders the error page straight away and reports the error once', () => {
    renderRoot(new Error('store exploded'));

    expect(screen.getByText("This page couldn't be displayed")).toBeDefined();
    expect(screen.getByText('store exploded')).toBeDefined();
    expect(addReactError).toHaveBeenCalledTimes(1);
  });

  it('shows the error page for a thrown value that is not an Error, even undefined', () => {
    renderRoot(undefined);

    expect(screen.getByText('An unknown error was thrown')).toBeDefined();
  });

  it('offers Edit as YAML outside the YAML page, on the route scheme useHashLocation expects', () => {
    renderRoot(new Error('boom'));

    expect(buttonLabels()).toEqual(['Reload the editor', 'Edit as YAML']);
    fireEvent.click(screen.getByText('Edit as YAML'));
    expect(window.parent.location.hash).toBe('#!/yml');
  });

  it('offers only Reload on the YAML page, because Edit as YAML would reload into it', () => {
    window.location.hash = '#!/yml';
    renderRoot(new Error('the YAML page broke'));

    expect(buttonLabels()).toEqual(['Reload the editor']);
  });

  it('offers no download before a configuration has loaded', () => {
    renderRoot(new Error('boom'));

    expect(screen.queryByText('Download your configuration')).toBeNull();
  });

  it('downloads the configuration in memory, not flagged when nothing changed', () => {
    initializeBitriseYmlDocument({ ymlString: YML, version: '' });
    renderRoot(new Error('boom'));

    fireEvent.click(screen.getByText('bitrise.yml'));

    expect(download).toHaveBeenCalledWith(YML, 'bitrise.yml', MIME);
    expect(screen.queryByText('Unsaved changes')).toBeNull();
  });

  it('downloads the latest valid YAML and flags a pending edit that does not parse as unsaved', () => {
    initializeBitriseYmlDocument({ ymlString: YML, version: '' });
    updateBitriseYmlDocumentByString(`${YML}  deploy: {}\n`);
    updateBitriseYmlDocumentByString(`${YML}  deploy: {\n`);
    renderRoot(new Error('boom'));

    expect(screen.getByText('Unsaved changes')).toBeDefined();
    expect(screen.getByRole('alert').textContent).toContain('discards your unsaved changes');

    fireEvent.click(screen.getByText('bitrise.yml'));

    expect(download).toHaveBeenCalledWith(`${YML}  deploy: {}\n`, 'bitrise.yml', MIME);
  });

  it('offers every file of a modular configuration, with folders flattened so names cannot collide', () => {
    initializeModularConfig({
      root: node('n_root', 'bitrise.yml', 'include:\n- path: modules/workflows.yml\n', [
        node('n_wf', 'modules/workflows.yml', YML),
      ]),
      mergedYml: YML,
    });
    renderRoot(new Error('boom'));

    fireEvent.click(screen.getByText('modules/workflows.yml'));

    expect(screen.getByText('bitrise.yml')).toBeDefined();
    expect(download).toHaveBeenCalledWith(YML, 'modules-workflows.yml', MIME);
  });
});
