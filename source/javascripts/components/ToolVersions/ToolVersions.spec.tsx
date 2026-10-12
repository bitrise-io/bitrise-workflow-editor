/**
 * @jest-environment jsdom
 */
import { BitkitProvider } from '@bitrise/bitkit-v2';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { selectOption } from '../../../../spec/bitkit-select-helper';
import ToolVersions from './ToolVersions';

// The bitkit barrel also exports a markdown component, and `react-markdown`'s ESM dependency tree is
// not transformed for tests. Nothing here renders markdown, so stub it at the leaf.
jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }));
jest.mock('@/hooks/useNavigation', () => ({ __esModule: true, default: () => ({ replace: jest.fn() }) }));
jest.mock('@/routes', () => ({ paths: { stacksAndMachines: '/stacks-and-machines' } }));
// Every workflow configures `deno` the same way, so only the row's key can tell them apart.
jest.mock('@/hooks/useTools', () => ({
  useToolsForScope: () => ({ deno: 'latest' }),
  useToolCatalog: () => ({ data: undefined, isLoading: false, isError: false }),
  useToolVersions: () => ({ data: undefined, isLoading: false, isError: false }),
}));

const PREFIX_PLACEHOLDER = 'prefix, e.g. 22';

describe('ToolVersions', () => {
  it("drops a row's draft when another workflow is shown", async () => {
    const user = userEvent.setup();
    const tree = (workflowId: string) => (
      <BitkitProvider>
        <ToolVersions workflowId={workflowId} stackReportUrl="" />
      </BitkitProvider>
    );
    const { rerender } = render(tree('a'));

    await selectOption(user, screen.getAllByRole('combobox')[1], 'Latest version of');
    expect(screen.getByPlaceholderText(PREFIX_PLACEHOLDER)).not.toBeNull();

    rerender(tree('b'));
    expect(screen.queryByPlaceholderText(PREFIX_PLACEHOLDER)).toBeNull();
  });
});
