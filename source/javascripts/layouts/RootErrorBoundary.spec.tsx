/**
 * @jest-environment jsdom
 */
import { composeStories } from '@storybook/react-vite';
import { fireEvent, render, screen } from '@testing-library/react';
import { strFromU8, unzipSync } from 'fflate';
import { PropsWithChildren, ReactNode } from 'react';

import { initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WindowUtils from '@/core/utils/WindowUtils';

import * as stories from './RootErrorBoundary.stories';

const { EDITED_ROOT_YML, EDITED_YML, OTHER_UNPARSEABLE_YML, UNPARSEABLE_YML, YML } = stories;

jest.mock('@chakra-ui/react/box', () => ({
  Box: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));
jest.mock('@chakra-ui/react/text', () => ({ Text: ({ children }: PropsWithChildren) => <span>{children}</span> }));
jest.mock('@chakra-ui/react/image', () => ({ Image: () => <img alt="" /> }));
jest.mock('@chakra-ui/react/stack', () => ({
  HStack: ({ children }: PropsWithChildren) => <div>{children}</div>,
  Stack: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));
jest.mock('@/core/utils/WindowUtils', () => {
  const actual = jest.requireActual('@/core/utils/WindowUtils').default;
  return { __esModule: true, default: { ...actual, reloadEditor: jest.fn() } };
});
jest.mock('@bitrise/bitkit-v2', () => ({
  BitkitProvider: ({ children }: PropsWithChildren) => <>{children}</>,
  BitkitBadge: ({ children }: PropsWithChildren) => <span>{children}</span>,
  BitkitButton: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  BitkitCodeSnippet: ({ children }: PropsWithChildren) => <pre>{children}</pre>,
  BitkitDialog: ({
    open,
    title,
    children,
    footerButtons,
  }: PropsWithChildren<{ open: boolean; title: string; footerButtons: ReactNode }>) =>
    open ? (
      <div role="dialog">
        <h2>{title}</h2>
        {children}
        {footerButtons}
      </div>
    ) : null,
  BitkitLink: ({ children, href }: { children?: ReactNode; href?: string }) => <a href={href}>{children}</a>,
  IconDownload: () => null,
}));

const composed = composeStories(stories);
const {
  BeforeTheConfigLoaded,
  ErrorWithoutAMessage,
  ModularEditThatDoesNotParse,
  ModularEditToAModuleThatNeverParsed,
  ModularEveryFileUnsaved,
  ModularOneFileUnsaved,
  NotAnErrorThrown,
  NothingUnsaved,
  OnABranch,
  OnTheYamlPage,
  TypedBackTheSavedTextOfAConfigThatNeverParsed,
  UnsavedChanges,
  UnprintableValueThrown,
  UnsavedEditThatDoesNotParse,
  UnsavedEditToAConfigThatNeverParsed,
  UnsavedVisualEdit,
} = composed;

/** Runs the story's `beforeEach`, which seeds the store and the hash, then renders it. */
async function renderStory(Story: (typeof composed)[keyof typeof composed]) {
  await Story.load();
  render(<Story />);
}

const buttonLabels = () => screen.queryAllByRole('button').map((button) => button.textContent);

type Download = { fileName: string; type: string; content: string };
type SavedFile = { fileName: string; blob: Blob };
let saved: SavedFile[];

// Captures what the browser would save: the real download helpers run, only the click is stubbed.
function captureDownloads() {
  saved = [];
  const blobs = new Map<string, Blob>();
  URL.createObjectURL = jest.fn((blob: Blob) => {
    const url = `blob:${blobs.size}`;
    blobs.set(url, blob);
    return url;
  });
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click(this: HTMLAnchorElement) {
    saved.push({ fileName: this.download, blob: blobs.get(this.href) as Blob });
  });
}

// jsdom's Blob has no `text()` or `arrayBuffer()`.
function readBytes(blob: Blob) {
  return new Promise<Uint8Array>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(blob);
  });
}

const downloaded = (): Promise<Download[]> =>
  Promise.all(
    saved.map(async ({ fileName, blob }) => ({ fileName, type: blob.type, content: strFromU8(await readBytes(blob)) })),
  );

/** The one zip that was saved, as its file name and `{ path: content }`. */
async function downloadedZip() {
  expect(saved).toHaveLength(1);
  const [{ fileName, blob }] = saved;
  const entries = unzipSync(await readBytes(blob));
  return {
    fileName,
    type: blob.type,
    files: Object.fromEntries(Object.entries(entries).map(([path, bytes]) => [path, strFromU8(bytes)])),
  };
}

const YAML_TYPE = 'application/yaml;charset=utf-8';

function leave() {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

describe('RootErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    captureDownloads();
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  describe('leaving the page', () => {
    beforeEach(() => {
      jest.spyOn(RuntimeUtils, 'isProduction').mockReturnValue(true);
    });

    it('asks the browser to warn while there are unsaved changes', async () => {
      await renderStory(UnsavedChanges);

      expect(leave().defaultPrevented).toBe(true);
    });

    it('lets the page go when nothing is unsaved', async () => {
      await renderStory(NothingUnsaved);

      expect(leave().defaultPrevented).toBe(false);
    });
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

      expect(screen.queryByText('Discard unsaved changes?')).toBeNull();
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

    it('asks before discarding unsaved changes, and stays put when the user cancels', async () => {
      await renderStory(UnsavedChanges);

      fireEvent.click(screen.getByText('Edit as YAML'));
      expect(screen.getByText('Discard unsaved changes?')).toBeDefined();
      fireEvent.click(screen.getByText('Cancel'));

      expect(screen.queryByText('Discard unsaved changes?')).toBeNull();
      expect(window.parent.location.hash).toBe('#!/workflows');
      expect(WindowUtils.reloadEditor).not.toHaveBeenCalled();
    });

    it('opens the YAML editor once the user agrees to discard, without a second leave-page prompt', async () => {
      jest.spyOn(RuntimeUtils, 'isProduction').mockReturnValue(true);
      await renderStory(UnsavedChanges);

      fireEvent.click(screen.getByText('Edit as YAML'));
      fireEvent.click(screen.getByText('Discard and edit as YAML'));

      expect(window.parent.location.hash).toBe('#!/yml');
      expect(WindowUtils.reloadEditor).toHaveBeenCalledTimes(1);
      expect(leave().defaultPrevented).toBe(false);
    });
  });

  describe('Download', () => {
    it('is not offered before a configuration has loaded', async () => {
      await renderStory(BeforeTheConfigLoaded);

      expect(buttonLabels()).toEqual(['Edit as YAML']);
    });

    it('leads when there are unsaved changes, and downloads bitrise.yml as YAML without reloading', async () => {
      await renderStory(UnsavedChanges);

      expect(screen.getByText('Unsaved changes')).toBeDefined();
      expect(buttonLabels()).toEqual(['Download bitrise.yml', 'Edit as YAML']);
      fireEvent.click(screen.getByText('Download bitrise.yml'));

      expect(await downloaded()).toEqual([{ fileName: 'bitrise.yml', type: YAML_TYPE, content: EDITED_YML }]);
      expect(WindowUtils.reloadEditor).not.toHaveBeenCalled();
    });

    it('downloads an edit made on a visual page', async () => {
      await renderStory(UnsavedVisualEdit);

      fireEvent.click(screen.getByText('Download bitrise.yml'));

      expect(await downloaded()).toEqual([
        { fileName: 'bitrise.yml', type: YAML_TYPE, content: `${YML}  deploy: {}\n` },
      ]);
    });

    it('downloads a pending edit as typed, even when it does not parse, so nothing typed is lost', async () => {
      await renderStory(UnsavedEditThatDoesNotParse);

      expect(screen.getByText('Unsaved changes')).toBeDefined();
      expect(buttonLabels()).toEqual(['Download bitrise.yml']);
      fireEvent.click(screen.getByText('Download bitrise.yml'));

      expect(await downloaded()).toEqual([{ fileName: 'bitrise.yml', type: YAML_TYPE, content: UNPARSEABLE_YML }]);
    });

    it('downloads the pending text when the config never parsed, and asks before Edit as YAML discards it', async () => {
      await renderStory(UnsavedEditToAConfigThatNeverParsed);

      expect(screen.getByText('Unsaved changes')).toBeDefined();
      fireEvent.click(screen.getByText('Download bitrise.yml'));
      expect(await downloaded()).toEqual([
        { fileName: 'bitrise.yml', type: YAML_TYPE, content: OTHER_UNPARSEABLE_YML },
      ]);

      fireEvent.click(screen.getByText('Edit as YAML'));
      expect(screen.getByText('Discard unsaved changes?')).toBeDefined();
      expect(WindowUtils.reloadEditor).not.toHaveBeenCalled();
    });

    it('agrees with the Save button when the user typed back the unparseable text that was saved', async () => {
      await renderStory(TypedBackTheSavedTextOfAConfigThatNeverParsed);

      expect(screen.queryByText('Unsaved changes')).toBeNull();
      expect(buttonLabels()).toEqual([]);
    });

    it('offers only the modular files with unsaved changes, with folders flattened into the file name', async () => {
      await renderStory(ModularOneFileUnsaved);

      expect(buttonLabels()).toEqual(['Download modules/workflows.yml', 'Edit as YAML']);
      fireEvent.click(screen.getByText('Download modules/workflows.yml'));

      expect(await downloaded()).toEqual([{ fileName: 'modules-workflows.yml', type: YAML_TYPE, content: EDITED_YML }]);
    });

    it('downloads several unsaved modular files as one zip that keeps their folders', async () => {
      await renderStory(ModularEveryFileUnsaved);

      expect(buttonLabels()).toEqual(['Download 2 changed files (.zip)', 'Edit as YAML']);
      fireEvent.click(screen.getByText('Download 2 changed files (.zip)'));

      expect(await downloadedZip()).toEqual({
        fileName: 'bitrise-configuration.zip',
        type: 'application/zip',
        files: { 'bitrise.yml': EDITED_ROOT_YML, 'modules/workflows.yml': EDITED_YML },
      });
    });

    it('keeps offering the files it warned about, even if the store changes while the page shows', async () => {
      await renderStory(ModularEveryFileUnsaved);
      initializeBitriseYmlDocument({ ymlString: '', version: '' });

      fireEvent.click(screen.getByText('Edit as YAML'));
      fireEvent.click(screen.getByText('Cancel'));

      expect(buttonLabels()).toEqual(['Download 2 changed files (.zip)', 'Edit as YAML']);
    });

    it('counts a modular edit that does not parse against the active file only, as typed', async () => {
      await renderStory(ModularEditThatDoesNotParse);

      expect(buttonLabels()).toEqual(['Download modules/workflows.yml']);
      fireEvent.click(screen.getByText('Download modules/workflows.yml'));

      expect(await downloaded()).toEqual([
        { fileName: 'modules-workflows.yml', type: YAML_TYPE, content: UNPARSEABLE_YML },
      ]);
    });

    it('downloads the pending text for a module that never parsed', async () => {
      await renderStory(ModularEditToAModuleThatNeverParsed);

      fireEvent.click(screen.getByText('Download modules/workflows.yml'));

      expect(await downloaded()).toEqual([
        { fileName: 'modules-workflows.yml', type: YAML_TYPE, content: OTHER_UNPARSEABLE_YML },
      ]);
    });
  });
});
