/**
 * @jest-environment jsdom
 */
import { composeStories } from '@storybook/react-vite';
import { fireEvent, render, screen } from '@testing-library/react';
import { PropsWithChildren, ReactNode } from 'react';

import { download } from '@/core/utils/CommonUtils';
import WindowUtils from '@/core/utils/WindowUtils';

import * as stories from './RootErrorBoundary.stories';
import { EDITED_ROOT_YML, EDITED_YML, OTHER_UNPARSEABLE_YML } from './RootErrorBoundary.stories';

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

const MIME = 'application/yaml;charset=utf-8';

const composed = composeStories(stories);
const {
  BeforeTheConfigLoaded,
  ErrorWithoutAMessage,
  ModularEveryFileUnsaved,
  ModularOneFileUnsaved,
  NotAnErrorThrown,
  NothingUnsaved,
  OnABranch,
  OnTheYamlPage,
  UnsavedChanges,
  UnprintableValueThrown,
  UnsavedEditThatDoesNotParse,
  UnsavedEditToAConfigThatNeverParsed,
} = composed;

/** Runs the story's `beforeEach`, which seeds the store and the hash, then renders it. */
async function renderStory(Story: (typeof composed)[keyof typeof composed]) {
  await Story.load();
  render(<Story />);
}

const buttonLabels = () => screen.queryAllByRole('button').map((button) => button.textContent);

describe('RootErrorBoundary', () => {
  let consoleError: jest.SpyInstance;
  let confirm: jest.SpyInstance;

  beforeEach(() => {
    (download as jest.Mock).mockClear();
    (WindowUtils.reloadEditor as jest.Mock).mockClear();
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    confirm = jest.spyOn(window, 'confirm');
  });

  afterEach(() => {
    consoleError.mockRestore();
    confirm.mockRestore();
  });

  it('renders the error page straight away, with the error for support', async () => {
    await renderStory(NothingUnsaved);

    expect(screen.getByText("This page couldn't be displayed")).toBeDefined();
    expect(screen.getByText("Cannot read properties of undefined (reading 'steps')")).toBeDefined();
  });

  it('shows the error page for a thrown value that is not an Error, even undefined', async () => {
    await renderStory(NotAnErrorThrown);

    expect(screen.getByText('An unknown error was thrown')).toBeDefined();
  });

  it('still shows the page, with something for support, for an Error without a message', async () => {
    await renderStory(ErrorWithoutAMessage);

    expect(screen.getByText("This page couldn't be displayed")).toBeDefined();
    expect(screen.getByText('Error')).toBeDefined();
  });

  it('still shows the page for a thrown value that cannot be turned into a string', async () => {
    await renderStory(UnprintableValueThrown);

    expect(screen.getByText('An unknown error was thrown')).toBeDefined();
  });

  it('links the logo to the dashboard', async () => {
    await renderStory(NothingUnsaved);

    expect(screen.getByRole('link').getAttribute('href')).toBe('/');
  });

  describe('Edit as YAML', () => {
    it('is the only action when nothing is unsaved, and opens the YAML editor without asking', async () => {
      await renderStory(NothingUnsaved);

      expect(buttonLabels()).toEqual(['Edit as YAML']);
      expect(screen.queryByText('Unsaved changes')).toBeNull();
      fireEvent.click(screen.getByText('Edit as YAML'));

      expect(confirm).not.toHaveBeenCalled();
      expect(window.parent.location.hash).toBe('#!/yml');
      expect(WindowUtils.reloadEditor).toHaveBeenCalledTimes(1);
    });

    it('keeps the hash query, where the branch lives', async () => {
      await renderStory(OnABranch);

      fireEvent.click(screen.getByText('Edit as YAML'));

      expect(window.parent.location.hash).toBe('#!/yml?branch=feature-x');
      expect(WindowUtils.reloadEditor).toHaveBeenCalledTimes(1);
    });

    it('is not offered on the YAML page, because it would reload into the same place', async () => {
      await renderStory(OnTheYamlPage);

      expect(buttonLabels()).toEqual([]);
    });

    it('asks before discarding unsaved changes, and stays put when the user declines', async () => {
      confirm.mockReturnValue(false);
      await renderStory(UnsavedChanges);

      fireEvent.click(screen.getByText('Edit as YAML'));

      expect(confirm).toHaveBeenCalledWith(expect.stringContaining('discards your unsaved changes'));
      expect(window.parent.location.hash).toBe('#!/workflows');
      expect(WindowUtils.reloadEditor).not.toHaveBeenCalled();
    });

    it('opens the YAML editor once the user accepts discarding unsaved changes', async () => {
      confirm.mockReturnValue(true);
      await renderStory(UnsavedChanges);

      fireEvent.click(screen.getByText('Edit as YAML'));

      expect(confirm).toHaveBeenCalledTimes(1);
      expect(window.parent.location.hash).toBe('#!/yml');
      expect(WindowUtils.reloadEditor).toHaveBeenCalledTimes(1);
    });
  });

  describe('Download', () => {
    it('is not offered before a configuration has loaded', async () => {
      await renderStory(BeforeTheConfigLoaded);

      expect(buttonLabels()).toEqual(['Edit as YAML']);
    });

    it('leads when there are unsaved changes, and downloads bitrise.yml with them without reloading', async () => {
      await renderStory(UnsavedChanges);

      expect(screen.getByText('Unsaved changes')).toBeDefined();
      expect(buttonLabels()).toEqual(['Download bitrise.yml', 'Edit as YAML']);
      fireEvent.click(screen.getByText('Download bitrise.yml'));

      expect(download).toHaveBeenCalledWith(EDITED_YML, 'bitrise.yml', MIME);
      expect(WindowUtils.reloadEditor).not.toHaveBeenCalled();
    });

    it('downloads the latest valid YAML while the pending edit does not parse', async () => {
      await renderStory(UnsavedEditThatDoesNotParse);

      expect(screen.getByText('Unsaved changes')).toBeDefined();
      expect(buttonLabels()).toEqual(['Download bitrise.yml']);
      fireEvent.click(screen.getByText('Download bitrise.yml'));

      expect(download).toHaveBeenCalledWith(EDITED_YML, 'bitrise.yml', MIME);
    });

    it('downloads the pending text when the config never parsed, and asks before Edit as YAML discards it', async () => {
      confirm.mockReturnValue(false);
      await renderStory(UnsavedEditToAConfigThatNeverParsed);

      expect(screen.getByText('Unsaved changes')).toBeDefined();
      fireEvent.click(screen.getByText('Download bitrise.yml'));
      expect(download).toHaveBeenCalledWith(OTHER_UNPARSEABLE_YML, 'bitrise.yml', MIME);

      fireEvent.click(screen.getByText('Edit as YAML'));
      expect(confirm).toHaveBeenCalledTimes(1);
      expect(WindowUtils.reloadEditor).not.toHaveBeenCalled();
    });

    it('offers only the modular files with unsaved changes, with folders flattened into the file name', async () => {
      await renderStory(ModularOneFileUnsaved);

      expect(buttonLabels()).toEqual(['Download modules/workflows.yml', 'Edit as YAML']);
      fireEvent.click(screen.getByText('Download modules/workflows.yml'));

      expect(download).toHaveBeenCalledWith(EDITED_YML, 'modules-workflows.yml', MIME);
    });

    it('gives every unsaved modular file its own button, each downloading that file', async () => {
      await renderStory(ModularEveryFileUnsaved);

      expect(buttonLabels()).toEqual(['Download bitrise.yml', 'Download modules/workflows.yml', 'Edit as YAML']);
      fireEvent.click(screen.getByText('Download bitrise.yml'));
      expect(download).toHaveBeenLastCalledWith(EDITED_ROOT_YML, 'bitrise.yml', MIME);

      fireEvent.click(screen.getByText('Download modules/workflows.yml'));
      expect(download).toHaveBeenLastCalledWith(EDITED_YML, 'modules-workflows.yml', MIME);
      expect(download).toHaveBeenCalledTimes(2);
    });
  });
});
