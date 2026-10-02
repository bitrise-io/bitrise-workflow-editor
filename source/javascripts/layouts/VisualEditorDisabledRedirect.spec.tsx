/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import { bitriseYmlStore, initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';

import VisualEditorDisabledRedirect from './VisualEditorDisabledRedirect';

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

describe('VisualEditorDisabledRedirect', () => {
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

    render(<VisualEditorDisabledRedirect />);

    expect(screen.queryByTestId('redirect')).toBeNull();
  });

  it('redirects to /yml when the YAML cannot be parsed', () => {
    // Set the parse-failure sentinel directly — mirrors what initializeBitriseYmlDocument does
    // for an unparseable YAML string, without depending on the yaml library's error semantics.
    bitriseYmlStore.setState({ __invalidYmlString: 'workflows: {{{ invalid' });

    render(<VisualEditorDisabledRedirect />);

    expect(screen.getByTestId('redirect').getAttribute('data-to')).toBe('/yml');
  });

  it('does NOT redirect when the YAML uses aliases: the error page catches a page that cannot show them', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });

    render(<VisualEditorDisabledRedirect />);

    expect(screen.queryByTestId('redirect')).toBeNull();
  });

  it('never mounts its children while redirecting, so a visual page cannot throw before the redirect', () => {
    bitriseYmlStore.setState({ __invalidYmlString: 'workflows: {{{ invalid' });
    const VisualPage = () => {
      throw new Error('A visual page mounted while the visual editor is disabled');
    };

    render(
      <VisualEditorDisabledRedirect>
        <VisualPage />
      </VisualEditorDisabledRedirect>,
    );

    expect(screen.getByTestId('redirect').getAttribute('data-to')).toBe('/yml');
  });

  it('renders its children on the YAML view while disabled, and on a visual page once it parses', () => {
    bitriseYmlStore.setState({ __invalidYmlString: 'workflows: {{{ invalid' });
    setPath('/yml');
    const { rerender } = render(<VisualEditorDisabledRedirect>page</VisualEditorDisabledRedirect>);
    expect(screen.getByText('page')).toBeTruthy();

    initializeBitriseYmlDocument({ ymlString: 'a: 1\n', version: '1' });
    setPath('/workflows');
    rerender(<VisualEditorDisabledRedirect>page</VisualEditorDisabledRedirect>);
    expect(screen.getByText('page')).toBeTruthy();
  });

  it('preserves the current query string when redirecting', () => {
    setPath('/workflows?workflow_id=primary');
    bitriseYmlStore.setState({ __invalidYmlString: 'workflows: {{{ invalid' });

    render(<VisualEditorDisabledRedirect />);

    expect(screen.getByTestId('redirect').getAttribute('data-to')).toBe('/yml?workflow_id=primary');
  });

  it('does not loop when already on the YAML page', () => {
    setPath('/yml');
    bitriseYmlStore.setState({ __invalidYmlString: 'workflows: {{{ invalid' });

    render(<VisualEditorDisabledRedirect />);

    expect(screen.queryByTestId('redirect')).toBeNull();
  });
});
