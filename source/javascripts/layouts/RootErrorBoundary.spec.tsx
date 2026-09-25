/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { PropsWithChildren, ReactNode } from 'react';
import { Document } from 'yaml';

import { TreeNode } from '@/core/models/Tree';
import {
  bitriseYmlStore,
  initializeBitriseYmlDocument,
  initializeModularConfig,
  updateBitriseYmlDocumentByString,
  updateFileDocumentByString,
} from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import WindowUtils from '@/core/utils/WindowUtils';

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
jest.mock('@/core/utils/WindowUtils', () => {
  const actual = jest.requireActual('@/core/utils/WindowUtils').default;
  return { __esModule: true, default: { ...actual, reloadEditor: jest.fn() } };
});
jest.mock('@datadog/browser-rum', () => ({ datadogRum: { addError: jest.fn() } }));
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
    (download as jest.Mock).mockClear();
    (WindowUtils.reloadEditor as jest.Mock).mockClear();
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

  it('renders the error page straight away', () => {
    renderRoot(new Error('store exploded'));

    expect(screen.getByText("This page couldn't be displayed")).toBeDefined();
    expect(screen.getByText('store exploded')).toBeDefined();
  });

  it('shows the error page for a thrown value that is not an Error, even undefined', () => {
    renderRoot(undefined);

    expect(screen.getByText('An unknown error was thrown')).toBeDefined();
  });

  it('offers only Edit as YAML when nothing is unsaved, on the route scheme useHashLocation expects', () => {
    initializeBitriseYmlDocument({ ymlString: YML, version: '' });
    renderRoot(new Error('boom'));

    expect(buttonLabels()).toEqual(['Edit as YAML']);
    expect(screen.queryByText('Unsaved changes')).toBeNull();
    const confirm = jest.spyOn(window, 'confirm');
    fireEvent.click(screen.getByText('Edit as YAML'));

    expect(confirm).not.toHaveBeenCalled();
    expect(window.parent.location.hash).toBe('#!/yml');
    expect(WindowUtils.reloadEditor).toHaveBeenCalledTimes(1);
    confirm.mockRestore();
  });

  it('links the logo to the dashboard', () => {
    renderRoot(new Error('boom'));

    expect(screen.getByRole('link').getAttribute('href')).toBe('/');
  });

  it('keeps the hash query, where the branch lives, when opening the YAML editor', () => {
    window.location.hash = '#!/workflows?branch=feature-x';
    renderRoot(new Error('boom'));

    fireEvent.click(screen.getByText('Edit as YAML'));

    expect(window.parent.location.hash).toBe('#!/yml?branch=feature-x');
  });

  it('offers no actions on the YAML page with nothing unsaved, because Edit as YAML would reload into it', () => {
    window.location.hash = '#!/yml';
    renderRoot(new Error('the YAML page broke'));

    expect(buttonLabels()).toEqual([]);
  });

  it('leads with the download when there are unsaved changes, and asks before Edit as YAML discards them', () => {
    initializeBitriseYmlDocument({ ymlString: YML, version: '' });
    updateBitriseYmlDocumentByString(`${YML}  deploy: {}\n`);
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    renderRoot(new Error('boom'));

    expect(screen.getByText('Unsaved changes')).toBeDefined();
    expect(buttonLabels()).toEqual(['Download bitrise.yml', 'Edit as YAML']);
    fireEvent.click(screen.getByText('Edit as YAML'));

    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('discards your unsaved changes'));
    expect(window.parent.location.hash).toBe('#!/workflows');
    expect(WindowUtils.reloadEditor).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it('opens the YAML editor once the user accepts discarding unsaved changes', () => {
    initializeBitriseYmlDocument({ ymlString: YML, version: '' });
    updateBitriseYmlDocumentByString(`${YML}  deploy: {}\n`);
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    renderRoot(new Error('boom'));

    fireEvent.click(screen.getByText('Edit as YAML'));

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(window.parent.location.hash).toBe('#!/yml');
    expect(WindowUtils.reloadEditor).toHaveBeenCalledTimes(1);
    confirm.mockRestore();
  });

  it('downloads bitrise.yml with its unsaved changes, without reloading', () => {
    initializeBitriseYmlDocument({ ymlString: YML, version: '' });
    updateBitriseYmlDocumentByString(`${YML}  deploy: {}\n`);
    renderRoot(new Error('boom'));

    fireEvent.click(screen.getByText('Download bitrise.yml'));

    expect(download).toHaveBeenCalledWith(`${YML}  deploy: {}\n`, 'bitrise.yml', MIME);
    expect(WindowUtils.reloadEditor).not.toHaveBeenCalled();
  });

  it('downloads the latest valid YAML and counts a pending edit that does not parse as unsaved', () => {
    initializeBitriseYmlDocument({ ymlString: YML, version: '' });
    updateBitriseYmlDocumentByString(`${YML}  deploy: {}\n`);
    updateBitriseYmlDocumentByString(`${YML}  deploy: {\n`);
    renderRoot(new Error('boom'));

    fireEvent.click(screen.getByText('Download bitrise.yml'));

    expect(download).toHaveBeenCalledWith(`${YML}  deploy: {}\n`, 'bitrise.yml', MIME);
  });

  it('offers only the modular files with unsaved changes, with folders flattened into the file name', () => {
    initializeModularConfig({
      root: node('n_root', 'bitrise.yml', 'include:\n- path: modules/workflows.yml\n', [
        node('n_wf', 'modules/workflows.yml', YML),
      ]),
      mergedYml: YML,
    });
    updateFileDocumentByString('n_wf', `${YML}  deploy: {}\n`);
    renderRoot(new Error('boom'));

    expect(buttonLabels()).toEqual(['Download modules/workflows.yml', 'Edit as YAML']);
    fireEvent.click(screen.getByText('Download modules/workflows.yml'));

    expect(download).toHaveBeenCalledWith(`${YML}  deploy: {}\n`, 'modules-workflows.yml', MIME);
  });

  it('gives every unsaved modular file its own download button, each downloading that file', () => {
    initializeModularConfig({
      root: node('n_root', 'bitrise.yml', 'include:\n- path: modules/workflows.yml\n', [
        node('n_wf', 'modules/workflows.yml', YML),
      ]),
      mergedYml: YML,
    });
    updateFileDocumentByString('n_root', 'include:\n- path: modules/workflows.yml\nformat_version: "13"\n');
    updateFileDocumentByString('n_wf', `${YML}  deploy: {}\n`);
    renderRoot(new Error('boom'));

    expect(buttonLabels()).toEqual(['Download bitrise.yml', 'Download modules/workflows.yml', 'Edit as YAML']);

    fireEvent.click(screen.getByText('Download bitrise.yml'));
    expect(download).toHaveBeenLastCalledWith(
      'include:\n- path: modules/workflows.yml\nformat_version: "13"\n',
      'bitrise.yml',
      MIME,
    );

    fireEvent.click(screen.getByText('Download modules/workflows.yml'));
    expect(download).toHaveBeenLastCalledWith(`${YML}  deploy: {}\n`, 'modules-workflows.yml', MIME);
    expect(download).toHaveBeenCalledTimes(2);
  });
});
