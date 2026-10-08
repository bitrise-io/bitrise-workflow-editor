/**
 * @jest-environment jsdom
 */
import { BitkitProvider } from '@bitrise/bitkit-v2';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { ComponentProps, useState } from 'react';

import { ParsedToolVersion, ToolCatalog, ToolVersions } from '@/core/models/Tools';
import ToolsService from '@/core/services/ToolsService';

import ToolRow from './ToolRow';

// The bitkit barrel also exports a markdown component, and `react-markdown`'s ESM dependency tree is
// not transformed for tests. Nothing here renders markdown, so stub it at the leaf.
jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }));

jest.mock('@/hooks/useTools', () => ({
  useToolVersions: jest.fn(),
}));

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

type ControlledToolRowProps = Partial<
  Omit<ComponentProps<typeof ToolRow>, 'strategy' | 'version' | 'preferInstalled' | 'onChange'>
> & {
  initial: ParsedToolVersion;
  onChange?: (parsed: ParsedToolVersion) => void;
};

// ToolRow is a controlled component: the strategy/version props only change once the owner feeds
// `onChange`'s result back in, exactly as ToolVersions.tsx does. A test that keeps the props static
// would never see a strategy switch take effect.
const ControlledToolRow = ({ initial, onChange, ...overrides }: ControlledToolRowProps) => {
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
      preferInstalled={parsed.strategy === 'latest-of' && parsed.preferInstalled}
      onChange={(next) => {
        setParsed(next);
        onChange?.(next);
      }}
    />
  );
};

const renderToolRow = (initial: ParsedToolVersion, overrides: Omit<ControlledToolRowProps, 'initial'> = {}) => {
  // A fresh element each time, since React skips rendering an element it has already seen.
  const tree = () => (
    <BitkitProvider>
      <ControlledToolRow initial={initial} {...overrides} />
    </BitkitProvider>
  );
  const { rerender } = render(tree());

  return { rerender: () => rerender(tree()) };
};

// Like the real hook, a disabled query has no data, so a tool outside the catalog gets none.
const mockVersions = (data: ToolVersions | undefined, { isLoading = false, isError = false } = {}) => {
  mockUseToolVersions.mockImplementation((_toolId: string, enabled: boolean) => ({
    data: enabled ? data : undefined,
    isLoading,
    isError: enabled && isError,
  }));
};

const lastWritten = (onChange: jest.Mock) => ToolsService.serializeToolVersion(onChange.mock.lastCall[0]);

// One click each, so a click that gets dropped fails the test instead of being retried away. The
// select hands focus back to its trigger a frame after it closes, so that is awaited too, or it
// would blur whatever the test focuses next.
const selectOption = async (user: UserEvent, select: HTMLElement, label: string) => {
  await user.click(select);
  await user.click(await screen.findByRole('option', { name: label }));
  await waitFor(() => {
    expect(select.textContent).toContain(label);
    // Testing Library has no query for focus, so it is read off the document.
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.activeElement).toBe(select);
  });
};

describe('ToolRow', () => {
  beforeEach(() => {
    mockVersions(NODE_VERSIONS);
  });

  describe('latest-of', () => {
    const CUSTOM_TOOL = { toolId: 'deno', existingToolIds: ['deno'] };
    const PREFIX_PLACEHOLDER = 'prefix, e.g. 22';
    const prefixInput = () => screen.getByPlaceholderText(PREFIX_PLACEHOLDER);
    const preferInstalledCheckbox = () =>
      screen.getByRole('checkbox', { name: /Prefer preinstalled version/ }) as HTMLInputElement;

    it('keeps installed when the prefix is typed after the switch', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      mockVersions(undefined);
      renderToolRow({ strategy: 'absolute-latest-installed' }, { ...CUSTOM_TOOL, onChange });

      await selectOption(user, screen.getAllByRole('combobox')[1], 'Latest version of');
      expect(preferInstalledCheckbox().checked).toBe(true);
      expect(onChange).not.toHaveBeenCalled();

      await user.type(prefixInput(), '2');
      expect(lastWritten(onChange)).toBe('2:installed');
    });

    it('applies the installed checkbox while the prefix is still empty', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      mockVersions(undefined);
      renderToolRow({ strategy: 'absolute-latest-released' }, { ...CUSTOM_TOOL, onChange });

      await selectOption(user, screen.getAllByRole('combobox')[1], 'Latest version of');
      await user.click(preferInstalledCheckbox());
      expect(preferInstalledCheckbox().checked).toBe(true);
      expect(onChange).not.toHaveBeenCalled();

      // Typing would blur the checkbox, whose press handler builds a PointerEvent jsdom lacks.
      fireEvent.change(prefixInput(), { target: { value: '2' } });
      expect(lastWritten(onChange)).toBe('2:installed');
    });

    it('holds a blank prefix', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      mockVersions(undefined);
      renderToolRow({ strategy: 'latest-of', prefix: '2', preferInstalled: false }, { ...CUSTOM_TOOL, onChange });

      await user.clear(prefixInput());
      await user.type(prefixInput(), ' ');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('shows the loading dropdown rather than a field until the versions arrive', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      mockVersions(undefined, { isLoading: true });
      const { rerender } = renderToolRow({ strategy: 'absolute-latest-released' }, { onChange });

      await selectOption(user, screen.getAllByRole('combobox')[1], 'Latest version of');
      expect(screen.queryByPlaceholderText(PREFIX_PLACEHOLDER)).toBeNull();
      expect(screen.getAllByRole('combobox')).toHaveLength(3);

      mockVersions(NODE_VERSIONS);
      rerender();
      await selectOption(user, screen.getAllByRole('combobox')[2], '22');
      expect(lastWritten(onChange)).toBe('22:latest');
      expect(screen.getByText('Currently resolves to 22.11.0')).not.toBeNull();
    });

    it('types the prefix when the versions fail to load', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      mockVersions(undefined, { isError: true });
      renderToolRow({ strategy: 'absolute-latest-released' }, { onChange });

      await selectOption(user, screen.getAllByRole('combobox')[1], 'Latest version of');
      // Typing straight after the select closes drops keystrokes under jsdom now and then.
      fireEvent.change(prefixInput(), { target: { value: '22' } });
      expect(lastWritten(onChange)).toBe('22:latest');
    });

    it('warns when no known version is in the typed prefix line', async () => {
      mockVersions({ toolId: 'channels', versions: [{ version: 'nightly', isSemver: false }] });
      renderToolRow(
        { strategy: 'latest-of', prefix: 'night', preferInstalled: false },
        { toolId: 'channels', existingToolIds: ['channels'], catalog: { tools: [{ name: 'channels' }] } },
      );

      expect(await screen.findByText(/No known version of channels is in the night line/)).not.toBeNull();
    });

    it('is not offered on a row without a tool yet', async () => {
      const user = userEvent.setup();
      renderToolRow({ strategy: 'absolute-latest-released' }, { toolId: '', existingToolIds: [] });

      await user.click(screen.getAllByRole('combobox')[1]);
      expect(screen.getByRole('option', { name: 'Latest released version' })).not.toBeNull();
      expect(screen.queryByRole('option', { name: 'Latest version of' })).toBeNull();
    });
  });
});
