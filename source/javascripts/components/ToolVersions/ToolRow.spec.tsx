/**
 * @jest-environment jsdom
 */
import { BitkitProvider } from '@bitrise/bitkit-v2';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, useState } from 'react';

import { ParsedToolVersion, ToolCatalog, ToolVersions, VersionStrategy } from '@/core/models/Tools';
import ToolsService from '@/core/services/ToolsService';
import { updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';

import { openSelect, selectOption } from '../../../../spec/bitkit-select-helper';
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

// What every row here has in common: a nodejs row with the catalog loaded.
const ROW_PROPS = {
  toolId: 'nodejs',
  existingToolIds: ['nodejs'],
  catalog: CATALOG,
  isCatalogLoading: false,
  onIdChange: jest.fn(),
  onRemove: jest.fn(),
};

type ControlledToolRowProps = Partial<
  Omit<ComponentProps<typeof ToolRow>, 'strategy' | 'version' | 'preferInstalled' | 'onChange'>
> & {
  initial: ParsedToolVersion;
  onChange?: (parsed: ParsedToolVersion) => void;
};

// ToolRow is a controlled component: the strategy/version props only change once the owner writes
// `onChange`'s result and reads it back, as ToolVersions.tsx does through the YAML, so a lossy write
// shows up here too. A test that keeps the props static would never see a strategy switch take effect.
const ControlledToolRow = ({ initial, onChange, ...overrides }: ControlledToolRowProps) => {
  const [parsed, setParsed] = useState<ParsedToolVersion>(initial);

  return (
    <ToolRow
      {...ROW_PROPS}
      {...overrides}
      strategy={parsed.strategy}
      version={ToolsService.getVersionInputValue(parsed)}
      preferInstalled={parsed.strategy === 'latest-of' && parsed.preferInstalled}
      onChange={(next) => {
        setParsed(ToolsService.parseToolVersion(ToolsService.serializeToolVersion(next)));
        onChange?.(next);
      }}
    />
  );
};

type ToolRowOverrides = Omit<ControlledToolRowProps, 'initial'>;

const renderToolRow = (initial: ParsedToolVersion, overrides: ToolRowOverrides = {}) => {
  // A fresh element each time, since React skips rendering an element it has already seen.
  const tree = (laterOverrides: ToolRowOverrides = {}) => (
    <BitkitProvider>
      <ControlledToolRow initial={initial} {...overrides} {...laterOverrides} />
    </BitkitProvider>
  );
  const { rerender } = render(tree());

  return { rerender: (laterOverrides?: ToolRowOverrides) => rerender(tree(laterOverrides)) };
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

describe('ToolRow', () => {
  beforeEach(() => {
    mockVersions(NODE_VERSIONS);
  });

  it('shows what the latest released version resolves to under the strategy', async () => {
    renderToolRow({ strategy: 'absolute-latest-released' });

    expect(await screen.findByText('Currently resolves to 24.0.0')).not.toBeNull();
  });

  describe('searching the version list', () => {
    const searchBox = () => screen.getByRole('textbox', { name: 'Search' });

    const SEARCH_CASES: {
      field: string;
      initial: ParsedToolVersion;
      match: string;
      selected: string;
      other: string;
    }[] = [
      {
        field: 'version',
        initial: { strategy: 'exact', version: '24.0.0' },
        match: '22.11.0',
        selected: '24.0.0',
        other: '20.9.0',
      },
      {
        field: 'prefix',
        initial: { strategy: 'latest-of', prefix: '24', preferInstalled: false },
        match: '22',
        selected: '24',
        other: '20',
      },
    ];

    it.each(SEARCH_CASES)(
      'keeps the selected $field listed and starts over when the menu closes',
      async ({ initial, match, selected, other }) => {
        const user = userEvent.setup();
        renderToolRow(initial);
        const select = screen.getAllByRole('combobox')[2];

        await openSelect(user, select);
        await user.type(searchBox(), '22');
        expect(screen.getByRole('option', { name: match })).not.toBeNull();
        expect(screen.getByRole('option', { name: selected })).not.toBeNull();
        expect(screen.queryByRole('option', { name: other })).toBeNull();

        await user.keyboard('{Escape}');
        await openSelect(user, select);
        expect(searchBox()).toHaveProperty('value', '');
        expect(screen.getByRole('option', { name: other })).not.toBeNull();
      },
    );
  });

  describe('switching to exact', () => {
    const REQUIRED_ERROR = 'Tool version is required';

    it("seeds the newest release when the catalog can't tell what the row resolves to", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderToolRow({ strategy: 'absolute-latest-installed' }, { onChange });

      await selectOption(user, screen.getAllByRole('combobox')[1], 'Exact version');
      expect(lastWritten(onChange)).toBe('24.0.0');
    });

    it.each([false, true])(
      'keeps the line a latest-of row resolves in, rather than upgrading (prefer installed: %s)',
      async (preferInstalled) => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        renderToolRow({ strategy: 'latest-of', prefix: '22', preferInstalled }, { onChange });

        await selectOption(user, screen.getAllByRole('combobox')[1], 'Exact version');
        expect(lastWritten(onChange)).toBe('22.11.0');
      },
    );

    it('flags a tool outside the catalog straight away', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      mockVersions(undefined);
      renderToolRow({ strategy: 'absolute-latest-released' }, { toolId: 'deno', existingToolIds: ['deno'], onChange });

      await selectOption(user, screen.getAllByRole('combobox')[1], 'Exact version');
      expect(onChange.mock.lastCall[0]).toEqual({ strategy: 'exact', version: '' });
      expect(screen.getByText(REQUIRED_ERROR)).not.toBeNull();
    });

    it.each([
      [
        'version list',
        (): ToolRowOverrides => {
          mockVersions(undefined, { isLoading: true });
          return {};
        },
      ],
      ['catalog', (): ToolRowOverrides => ({ catalog: undefined, isCatalogLoading: true })],
    ])('seeds once the %s arrives, and flags nothing before', async (_, startLoading) => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const { rerender } = renderToolRow({ strategy: 'absolute-latest-released' }, { onChange, ...startLoading() });

      await selectOption(user, screen.getAllByRole('combobox')[1], 'Exact version');
      expect(onChange.mock.lastCall[0]).toEqual({ strategy: 'exact', version: '' });
      expect(screen.queryByText(REQUIRED_ERROR)).toBeNull();

      mockVersions(NODE_VERSIONS);
      rerender({ catalog: CATALOG, isCatalogLoading: false });
      expect(lastWritten(onChange)).toBe('24.0.0');
      expect(screen.queryByText(REQUIRED_ERROR)).toBeNull();
    });

    describe('while the version list is still loading', () => {
      beforeEach(() => {
        mockVersions(undefined, { isLoading: true });
      });

      it('keeps the line a latest-of row resolves in once the list arrives', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        const { rerender } = renderToolRow(
          { strategy: 'latest-of', prefix: '22', preferInstalled: false },
          { onChange },
        );

        await selectOption(user, screen.getAllByRole('combobox')[1], 'Exact version');
        mockVersions(NODE_VERSIONS);
        rerender();
        expect(lastWritten(onChange)).toBe('22.11.0');
      });

      it.each([
        ['is empty', { toolId: 'nodejs', versions: [] }, false],
        ['fails', undefined, true],
      ])('flags the field once the list %s, with nothing to seed from', async (_, data, isError) => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        const { rerender } = renderToolRow({ strategy: 'absolute-latest-released' }, { onChange });

        await selectOption(user, screen.getAllByRole('combobox')[1], 'Exact version');
        const writes = onChange.mock.calls.length;
        mockVersions(data, { isError });
        rerender();
        expect(onChange).toHaveBeenCalledTimes(writes);
        expect(await screen.findByText(REQUIRED_ERROR)).not.toBeNull();
      });

      it('leaves the row alone when the strategy changed before the list arrived', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        const { rerender } = renderToolRow({ strategy: 'absolute-latest-released' }, { onChange });

        await selectOption(user, screen.getAllByRole('combobox')[1], 'Exact version');
        await selectOption(user, screen.getAllByRole('combobox')[1], 'Latest preinstalled version');
        const writes = onChange.mock.calls.length;
        mockVersions(NODE_VERSIONS);
        rerender();
        expect(onChange).toHaveBeenCalledTimes(writes);
        expect(lastWritten(onChange)).toBe('installed');
      });
    });

    it('keeps a version typed before the catalog arrived', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const { rerender } = renderToolRow(
        { strategy: 'absolute-latest-released' },
        { onChange, catalog: undefined, isCatalogLoading: true },
      );

      await selectOption(user, screen.getAllByRole('combobox')[1], 'Exact version');
      await user.type(screen.getByPlaceholderText('e.g. 24.7.0'), '20.9.0');
      rerender({ catalog: CATALOG, isCatalogLoading: false });
      expect(lastWritten(onChange)).toBe('20.9.0');
    });

    describe('with the test playing the YAML', () => {
      // Rendered bare with a fresh `onChange` each time, as a parent that renders again would pass.
      const row = (strategy: VersionStrategy, onChange: jest.Mock) => (
        <BitkitProvider>
          <ToolRow {...ROW_PROPS} strategy={strategy} version="" onChange={(next) => onChange(next)} />
        </BitkitProvider>
      );
      const switchToExact = async (rerender: ReturnType<typeof render>['rerender'], onChange: jest.Mock) => {
        const user = userEvent.setup();
        await openSelect(user, screen.getAllByRole('combobox')[1]);
        await user.click(screen.getByRole('option', { name: 'Exact version' }));
        rerender(row('exact', onChange));
      };

      it('leaves the row alone when the YAML moved off exact before the list arrived', async () => {
        const onChange = jest.fn();
        mockVersions(undefined, { isLoading: true });
        const { rerender } = render(row('absolute-latest-released', onChange));

        await switchToExact(rerender, onChange);
        rerender(row('absolute-latest-released', onChange));
        const writes = onChange.mock.calls.length;
        mockVersions(NODE_VERSIONS);
        rerender(row('absolute-latest-released', onChange));
        expect(await screen.findByText('Currently resolves to 24.0.0')).not.toBeNull();
        expect(onChange).toHaveBeenCalledTimes(writes);
      });

      it('writes the seed once, even when the YAML does not take it', async () => {
        const onChange = jest.fn();
        mockVersions(undefined, { isLoading: true });
        const { rerender } = render(row('absolute-latest-released', onChange));

        await switchToExact(rerender, onChange);
        mockVersions(NODE_VERSIONS);
        rerender(row('exact', onChange));
        rerender(row('exact', onChange));
        expect(onChange.mock.calls.filter(([next]) => next.version === '24.0.0')).toHaveLength(1);
      });
    });

    it('flags the empty version once its menu has been visited', async () => {
      const user = userEvent.setup();
      mockVersions(undefined, { isLoading: true });
      renderToolRow({ strategy: 'absolute-latest-released' });

      await selectOption(user, screen.getAllByRole('combobox')[1], 'Exact version');
      await openSelect(user, screen.getAllByRole('combobox')[2]);
      await user.keyboard('{Escape}');
      expect(await screen.findByText(REQUIRED_ERROR)).not.toBeNull();
    });
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
      await user.type(prefixInput(), '22');
      expect(lastWritten(onChange)).toBe('22:latest');
    });

    it('seeds the minor of the exact version it switches away from, in the same write', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      mockVersions(undefined);
      renderToolRow({ strategy: 'exact', version: '2.90.1' }, { ...CUSTOM_TOOL, onChange });

      await selectOption(user, screen.getAllByRole('combobox')[1], 'Latest version of');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(lastWritten(onChange)).toBe('2.90:latest');
    });

    it('holds a keyword typed as the prefix, writing none of it on the way, and says why', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      mockVersions(undefined);
      renderToolRow({ strategy: 'latest-of', prefix: '2', preferInstalled: true }, { ...CUSTOM_TOOL, onChange });

      await user.clear(prefixInput());
      await user.type(prefixInput(), 'latest');
      await user.tab();
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getAllByRole('combobox')[1].textContent).toContain('Latest version of');
      expect(screen.getByText('A prefix cannot be latest or installed, or the start of either')).not.toBeNull();
    });

    it('holds a seeded prefix that starts a keyword as well', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      mockVersions(undefined);
      renderToolRow({ strategy: 'exact', version: 'lat' }, { ...CUSTOM_TOOL, onChange });

      await selectOption(user, screen.getAllByRole('combobox')[1], 'Latest version of');
      await user.click(prefixInput());
      await user.tab();
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText('A prefix cannot be latest or installed, or the start of either')).not.toBeNull();
    });

    it('drops a draft once the YAML changes under it', async () => {
      const user = userEvent.setup();
      mockVersions(undefined);
      renderToolRow({ strategy: 'absolute-latest-released' }, CUSTOM_TOOL);

      await selectOption(user, screen.getAllByRole('combobox')[1], 'Latest version of');
      expect(screen.getByPlaceholderText(PREFIX_PLACEHOLDER)).not.toBeNull();

      act(() => updateBitriseYmlDocumentByString('tools:\n  deno: latest\n'));
      expect(screen.queryByPlaceholderText(PREFIX_PLACEHOLDER)).toBeNull();
      expect(screen.getAllByRole('combobox')[1].textContent).toContain('Latest released version');
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
