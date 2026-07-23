/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line no-unused-vars -- classic JSX runtime needs React in scope for the JSX below
import React from 'react';
import { render, screen } from '@testing-library/react';

import { bitriseYmlStore, initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';

import InvalidYmlRedirect from './InvalidYmlRedirect';

// Capture what path (if any) the redirect would send the user to. `wouter`'s <Redirect> reaches for
// a Router context we don't set up here; a marker component keeps the assertion focused on the one
// thing this component decides — "do we redirect, and to where?"
jest.mock('wouter', () => ({
  __esModule: true,
  Redirect: ({ to }: { to: string }) => <div data-testid="redirect" data-to={to} />,
}));

let currentPathMock = '/workflows';
jest.mock('@/hooks/useHashLocation', () => ({
  __esModule: true,
  default: () => [currentPathMock, jest.fn()],
}));

const setPath = (path: string) => {
  currentPathMock = path;
};

describe('InvalidYmlRedirect', () => {
  beforeEach(() => {
    setPath('/workflows');
    // Fresh store between cases so a previous parse failure doesn't leak into the next test.
    bitriseYmlStore.setState({ __invalidYmlString: undefined, validationStatus: 'pending' });
  });

  it('does NOT redirect for a parses-fine config with schema-invalid markers (SSW-3087)', () => {
    initializeBitriseYmlDocument({
      ymlString: 'format_version: "13"\nworkflows:\n  primary: {}\n',
      version: '1',
    });
    bitriseYmlStore.setState({ validationStatus: 'invalid' });

    render(<InvalidYmlRedirect />);

    expect(screen.queryByTestId('redirect')).toBeNull();
  });

  it('redirects to /yml when the YAML cannot be parsed', () => {
    // Set the parse-failure sentinel directly — mirrors what initializeBitriseYmlDocument does
    // for an unparseable YAML string, without depending on the yaml library's error semantics.
    bitriseYmlStore.setState({ __invalidYmlString: 'workflows: {{{ invalid' });

    render(<InvalidYmlRedirect />);

    expect(screen.getByTestId('redirect').getAttribute('data-to')).toBe('/yml');
  });

  it('preserves the current query string when redirecting', () => {
    setPath('/workflows?workflow_id=primary');
    bitriseYmlStore.setState({ __invalidYmlString: 'workflows: {{{ invalid' });

    render(<InvalidYmlRedirect />);

    expect(screen.getByTestId('redirect').getAttribute('data-to')).toBe('/yml?workflow_id=primary');
  });

  it('does not loop when already on the YAML page', () => {
    setPath('/yml');
    bitriseYmlStore.setState({ __invalidYmlString: 'workflows: {{{ invalid' });

    render(<InvalidYmlRedirect />);

    expect(screen.queryByTestId('redirect')).toBeNull();
  });
});
