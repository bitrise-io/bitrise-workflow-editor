/**
 * @jest-environment jsdom
 */
import { composeStories } from '@storybook/react-vite';
import { fireEvent, render, screen } from '@testing-library/react';
import { PropsWithChildren, ReactNode } from 'react';

import WindowUtils from '@/core/utils/WindowUtils';

import * as stories from './RootErrorBoundary.stories';

jest.mock('@chakra-ui/react/box', () => ({
  Box: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));
jest.mock('@chakra-ui/react/text', () => ({ Text: ({ children }: PropsWithChildren) => <span>{children}</span> }));
jest.mock('@chakra-ui/react/image', () => ({ Image: () => <img alt="" /> }));
jest.mock('@chakra-ui/react/stack', () => ({
  Stack: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));
jest.mock('@/core/utils/WindowUtils', () => {
  const actual = jest.requireActual('@/core/utils/WindowUtils').default;
  return { __esModule: true, default: { ...actual, reloadEditor: jest.fn() } };
});
jest.mock('@bitrise/bitkit-v2', () => ({
  BitkitProvider: ({ children }: PropsWithChildren) => <>{children}</>,
  BitkitButton: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  BitkitCodeSnippet: ({ children }: PropsWithChildren) => <pre>{children}</pre>,
  BitkitLink: ({ children, href }: { children?: ReactNode; href?: string }) => <a href={href}>{children}</a>,
}));

const composed = composeStories(stories);
const {
  ErrorWithANonStringMessage,
  ErrorWithoutAMessage,
  NotAnErrorThrown,
  OnABranch,
  OnAVisualPage,
  OnTheYamlPage,
  UnprintableValueThrown,
} = composed;

/** Runs the story's `beforeEach`, which sets the hash, then renders it. */
async function renderStory(Story: (typeof composed)[keyof typeof composed]) {
  await Story.load();
  render(<Story />);
}

const buttonLabels = () => screen.queryAllByRole('button').map((button) => button.textContent);

describe('RootErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the error page straight away, with the error for support', async () => {
    await renderStory(OnAVisualPage);

    expect(screen.getByText("This page couldn't be displayed")).toBeDefined();
    expect(screen.getByText("Cannot read properties of undefined (reading 'steps')")).toBeDefined();
  });

  it('shows the error page for a thrown value that is not an Error, even undefined', async () => {
    await renderStory(NotAnErrorThrown);

    expect(screen.getByText('An unknown error was thrown')).toBeDefined();
  });

  it('still shows the page, with something for support, for an Error without a message', async () => {
    await renderStory(ErrorWithoutAMessage);

    expect(screen.getByText('Error')).toBeDefined();
  });

  it('still shows the page for a thrown value that cannot be turned into a string', async () => {
    await renderStory(UnprintableValueThrown);

    expect(screen.getByText('An unknown error was thrown')).toBeDefined();
  });

  it('still shows the page for an Error whose message is not a string', async () => {
    await renderStory(ErrorWithANonStringMessage);

    expect(screen.getByText('[object Object]')).toBeDefined();
  });

  it('links the logo to the dashboard', async () => {
    await renderStory(OnAVisualPage);

    expect(screen.getByRole('link').getAttribute('href')).toBe('/');
  });

  describe('Edit as YAML', () => {
    it('reloads the editor on the YAML page, without asking', async () => {
      await renderStory(OnAVisualPage);

      expect(buttonLabels()).toEqual(['Edit as YAML']);
      fireEvent.click(screen.getByText('Edit as YAML'));

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
  });
});
