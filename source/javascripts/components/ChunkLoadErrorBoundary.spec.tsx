/**
 * @jest-environment jsdom
 */
import { datadogRum } from '@datadog/browser-rum';
import { fireEvent, render, screen } from '@testing-library/react';
import { Component, PropsWithChildren, ReactNode } from 'react';

import WindowUtils from '@/core/utils/WindowUtils';

import ChunkLoadErrorBoundary from './ChunkLoadErrorBoundary';

jest.mock('@datadog/browser-rum', () => ({ datadogRum: { addError: jest.fn() } }));
jest.mock('@/core/utils/WindowUtils', () => ({ __esModule: true, default: { reloadEditor: jest.fn() } }));
jest.mock('@bitrise/bitkit-v2', () => ({
  BitkitButton: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  BitkitEmptyState: ({ headingText, children }: PropsWithChildren<{ headingText: ReactNode }>) => (
    <div>
      <span>{headingText}</span>
      {children}
    </div>
  ),
  IconErrorCircle: () => null,
  IconRefresh: () => null,
}));

const Crash = ({ thrown }: { thrown: unknown }): never => {
  throw thrown;
};

/** Stands in for the root boundary, to see what reaches it. */
class OuterBoundary extends Component<PropsWithChildren, { error?: unknown }> {
  state: { error?: unknown } = {};

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    return this.state.error ? <span>root boundary: {String(this.state.error)}</span> : this.props.children;
  }
}

function renderInLayout(thrown: unknown) {
  render(
    <OuterBoundary>
      <header>Save</header>
      <ChunkLoadErrorBoundary>
        <Crash thrown={thrown} />
      </ChunkLoadErrorBoundary>
    </OuterBoundary>,
  );
}

describe('ChunkLoadErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the reload message in place of the page and keeps the rest of the layout', () => {
    renderInLayout(new TypeError('Failed to fetch dynamically imported module: https://x/PipelinesPage-a.js'));

    expect(screen.getByText("This page couldn't be loaded")).toBeDefined();
    expect(screen.getByText('Save')).toBeDefined();
    expect(screen.queryByText(/root boundary/)).toBeNull();
  });

  it('reports the chunk error once and reloads the editor on request', () => {
    const error = new TypeError('Importing a module script failed.');
    renderInLayout(error);

    expect(datadogRum.addError).toHaveBeenCalledWith(error, { source: 'route-chunk-load' });

    fireEvent.click(screen.getByText('Reload'));
    expect(WindowUtils.reloadEditor).toHaveBeenCalledTimes(1);
  });

  it('passes any other error to the root boundary without reporting it itself', () => {
    renderInLayout(new Error("Cannot read properties of undefined (reading 'steps')"));

    expect(screen.getByText(/root boundary: Error: Cannot read properties/)).toBeDefined();
    expect(screen.queryByText("This page couldn't be loaded")).toBeNull();
    expect(datadogRum.addError).not.toHaveBeenCalled();
  });
});
