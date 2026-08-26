/**
 * @jest-environment jsdom
 */
import { BitkitProvider } from '@bitrise/bitkit-v2';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, useState } from 'react';

import { ParsedToolVersion, ToolCatalog, ToolVersions } from '@/core/models/Tools';
import ToolsService from '@/core/services/ToolsService';

import ToolRow from './ToolRow';

// The bitkit barrel re-exports a markdown component, and react-markdown's ESM dependency tree is
// not transformed for tests. Nothing here renders markdown, so stub it at the leaf.
jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }));

jest.mock('@/hooks/useTools', () => ({
  useToolVersions: jest.fn(),
}));

// jsdom implements neither, but BitkitProvider's responsive machinery reads both on mount.
window.ResizeObserver ??= class {
  observe() {}

  unobserve() {}

  disconnect() {}
} as unknown as typeof ResizeObserver;
window.matchMedia ??= ((query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList) as typeof window.matchMedia;
// The select's highlight-tracking scrolls the active option into view, but jsdom has no layout engine.
Element.prototype.scrollIntoView ??= () => {};

import { useToolVersions } from '@/hooks/useTools';

const mockUseToolVersions = useToolVersions as jest.Mock;

const CATALOG: ToolCatalog = { tools: [{ name: 'nodejs' }] };
const NODE_VERSIONS: ToolVersions = {
  toolId: 'nodejs',
  versions: [
    { version: '24.0.0', isSemver: true },
    { version: '22.11.0', isSemver: true },
    { version: '20.9.0', isSemver: true },
  ],
};

type ControlledToolRowProps = Partial<Omit<ComponentProps<typeof ToolRow>, 'strategy' | 'version' | 'onChange'>> & {
  initial: ParsedToolVersion;
};

// ToolRow is a controlled component: the strategy/version props only change once the owner feeds
// `onChange`'s result back in, exactly as ToolVersions.tsx does. A test that keeps the props static
// would never see a strategy switch take effect.
const ControlledToolRow = ({ initial, ...overrides }: ControlledToolRowProps) => {
  const [parsed, setParsed] = useState<ParsedToolVersion>(initial);

  return (
    <ToolRow
      toolId="nodejs"
      existingToolIds={['nodejs']}
      catalog={CATALOG}
      isCatalogLoading={false}
      onIdChange={jest.fn()}
      onRemove={jest.fn()}
      {...overrides}
      strategy={parsed.strategy}
      version={ToolsService.getVersionInputValue(parsed)}
      onChange={setParsed}
    />
  );
};

const renderToolRow = (initial: ParsedToolVersion) => {
  render(
    <BitkitProvider>
      <ControlledToolRow initial={initial} />
    </BitkitProvider>,
  );
};

describe('ToolRow', () => {
  beforeEach(() => {
    mockUseToolVersions.mockReturnValue({ data: NODE_VERSIONS, isLoading: false, isError: false });
  });

  it('offers the full version list again after switching away from and back to exact', async () => {
    const user = userEvent.setup();
    renderToolRow({ strategy: 'exact', version: '24.0.0' });

    const [, strategySelect, versionSelect] = screen.getAllByRole('combobox');

    await user.click(versionSelect);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: '22' } });
    expect(screen.getByRole('option', { name: '22.11.0' })).not.toBeNull();

    // Bitkit's Select is a compound Ark UI listbox. Opening it and clicking an option occasionally
    // doesn't register in a single pass under jsdom, so each selection is retried until it takes.
    const selectStrategy = async (label: string) => {
      await waitFor(async () => {
        await user.click(strategySelect);
        await user.click(screen.getByRole('option', { name: label }));
        expect(strategySelect.textContent).toContain(label);
      });
    };

    await selectStrategy('Latest released version');
    await selectStrategy('Exact version');

    const [, , newVersionSelect] = screen.getAllByRole('combobox');
    await user.click(newVersionSelect);

    const searchInput = screen.getByRole('textbox', { name: 'Search' }) as HTMLInputElement;
    expect(searchInput.value).toBe('');
    expect(screen.getByRole('option', { name: '24.0.0' })).not.toBeNull();
    expect(screen.getByRole('option', { name: '22.11.0' })).not.toBeNull();
    expect(screen.getByRole('option', { name: '20.9.0' })).not.toBeNull();
  });
});
