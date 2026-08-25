/**
 * @jest-environment jsdom
 */
import { Provider } from '@bitrise/bitkit';
import { BitkitProvider } from '@bitrise/bitkit-v2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactFlowProvider } from '@xyflow/react';
import { PropsWithChildren } from 'react';

import { initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';

import WorkflowCard from './WorkflowCard';
import { SelectedWorkflow } from './WorkflowCard.types';

jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }));

const YML = `
format_version: '13'
workflows:
  wf1:
    steps:
    - script@1: {}
`;

const Wrapper = ({ children }: PropsWithChildren) => (
  <Provider resetCSS={false}>
    <BitkitProvider>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <ReactFlowProvider>{children}</ReactFlowProvider>
      </QueryClientProvider>
    </BitkitProvider>
  </Provider>
);

const renderCard = (selectedWorkflow?: SelectedWorkflow) => {
  const onSelectWorkflow = jest.fn();

  const { rerender } = render(
    <WorkflowCard id="wf1" isCollapsable onSelectWorkflow={onSelectWorkflow} selectedWorkflow={selectedWorkflow} />,
    { wrapper: Wrapper },
  );

  return {
    onSelectWorkflow,
    // Re-renders with the selection the parent would have applied after the click.
    applySelection: (next?: SelectedWorkflow) =>
      rerender(<WorkflowCard id="wf1" isCollapsable onSelectWorkflow={onSelectWorkflow} selectedWorkflow={next} />),
  };
};

const header = () => screen.getByText('wf1');
// The chevron's label is the card's own read-out of its expansion state.
const expectExpanded = () => expect(screen.getByLabelText('Collapse Workflow details')).toBeTruthy();
const expectCollapsed = () => expect(screen.getByLabelText('Expand Workflow details')).toBeTruthy();

beforeEach(() => {
  initializeBitriseYmlDocument({ ymlString: YML, version: '1' });
});

describe('WorkflowCard', () => {
  it('expands and selects on the first click', async () => {
    const { onSelectWorkflow } = renderCard();

    expectCollapsed();

    await userEvent.click(header());

    expect(onSelectWorkflow).toHaveBeenCalledWith({ workflowId: 'wf1', isSelected: true });
    expectExpanded();
  });

  it('collapses and deselects when clicked while expanded and selected', async () => {
    const { onSelectWorkflow, applySelection } = renderCard();

    await userEvent.click(header());
    applySelection({ workflowId: 'wf1' });
    await userEvent.click(header());

    expect(onSelectWorkflow).toHaveBeenLastCalledWith({ workflowId: 'wf1', isSelected: false });
    expectCollapsed();
  });

  it('keeps a chevron-expanded card expanded and only selects it', async () => {
    const { onSelectWorkflow } = renderCard();

    await userEvent.click(screen.getByLabelText('Expand Workflow details'));

    // The chevron alone never selects — it stays a pure expand/collapse control.
    expect(onSelectWorkflow).not.toHaveBeenCalled();
    expectExpanded();

    await userEvent.click(header());

    expect(onSelectWorkflow).toHaveBeenCalledWith({ workflowId: 'wf1', isSelected: true });
    // Still expanded: the click selected without undoing what the user just did.
    expectExpanded();
  });

  it('re-expands without deselecting when the card was collapsed by the chevron while selected', async () => {
    const { onSelectWorkflow, applySelection } = renderCard();

    await userEvent.click(header());
    applySelection({ workflowId: 'wf1' });
    await userEvent.click(screen.getByLabelText('Collapse Workflow details'));
    await userEvent.click(header());

    expect(onSelectWorkflow).toHaveBeenLastCalledWith({ workflowId: 'wf1', isSelected: true });
    expectExpanded();
  });

  it('does not select when an action button inside the header is clicked', async () => {
    const onEditWorkflow = jest.fn();
    const onSelectWorkflow = jest.fn();

    render(
      <WorkflowCard id="wf1" isCollapsable onSelectWorkflow={onSelectWorkflow} onEditWorkflow={onEditWorkflow} />,
      { wrapper: Wrapper },
    );

    await userEvent.click(screen.getByLabelText('Edit Workflow'));

    expect(onEditWorkflow).toHaveBeenCalledWith('wf1');
    expect(onSelectWorkflow).not.toHaveBeenCalled();
  });

  it('is not clickable without onSelectWorkflow', async () => {
    render(<WorkflowCard id="wf1" isCollapsable />, { wrapper: Wrapper });

    await userEvent.click(screen.getByText('wf1'));

    expectCollapsed();
  });
});
