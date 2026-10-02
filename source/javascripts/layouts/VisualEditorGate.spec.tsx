/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import { bitriseYmlStore, initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';

import VisualEditorGate from './VisualEditorGate';

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

const INVALID_YML = 'workflows: {{{ invalid';

describe('VisualEditorGate', () => {
  beforeEach(() => {
    setPath('/workflows');
    // Fresh store between cases so a previous parse failure doesn't leak into the next test.
    initializeBitriseYmlDocument({ ymlString: 'workflows: {}\n', version: '1' });
    bitriseYmlStore.setState({ validationStatus: 'pending' });
  });

  it('does NOT redirect for a parses-fine config with schema-invalid markers (SSW-3087)', () => {
    initializeBitriseYmlDocument({
      ymlString: 'format_version: "13"\nworkflows:\n  primary: {}\n',
      version: '1',
    });
    bitriseYmlStore.setState({ validationStatus: 'invalid' });

    render(<VisualEditorGate />);

    expect(screen.queryByTestId('redirect')).toBeNull();
  });

  it('redirects to /yml when the YAML cannot be parsed', () => {
    initializeBitriseYmlDocument({ ymlString: INVALID_YML, version: '1' });

    render(<VisualEditorGate />);

    expect(screen.getByTestId('redirect').getAttribute('data-to')).toBe('/yml');
  });

  it('redirects to /yml when the YAML uses aliases, which the visual editor does not support', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });

    render(<VisualEditorGate />);

    expect(screen.getByTestId('redirect').getAttribute('data-to')).toBe('/yml');
  });

  it('never mounts its children while redirecting, so a visual page cannot throw before the redirect', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
    const VisualPage = () => {
      throw new Error('A visual page mounted for a blocked config');
    };

    render(
      <VisualEditorGate>
        <VisualPage />
      </VisualEditorGate>,
    );

    expect(screen.getByTestId('redirect').getAttribute('data-to')).toBe('/yml');
  });

  it('renders its children on the YAML view and when nothing blocks the visual editor', () => {
    initializeBitriseYmlDocument({ ymlString: 'a: &x 1\nb: *x\n', version: '1' });
    setPath('/yml');
    const { rerender } = render(<VisualEditorGate>page</VisualEditorGate>);
    expect(screen.getByText('page')).toBeTruthy();

    initializeBitriseYmlDocument({ ymlString: 'a: 1\n', version: '1' });
    setPath('/workflows');
    rerender(<VisualEditorGate>page</VisualEditorGate>);
    expect(screen.getByText('page')).toBeTruthy();
  });

  it('preserves the current query string when redirecting', () => {
    setPath('/workflows?workflow_id=primary');
    initializeBitriseYmlDocument({ ymlString: INVALID_YML, version: '1' });

    render(<VisualEditorGate />);

    expect(screen.getByTestId('redirect').getAttribute('data-to')).toBe('/yml?workflow_id=primary');
  });

  it('does not loop when already on the YAML page', () => {
    setPath('/yml');
    initializeBitriseYmlDocument({ ymlString: INVALID_YML, version: '1' });

    render(<VisualEditorGate />);

    expect(screen.queryByTestId('redirect')).toBeNull();
  });
});
