/**
 * @jest-environment jsdom
 */
import { BitkitProvider } from '@bitrise/bitkit-v2';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropsWithChildren } from 'react';

import { Step } from '@/core/models/Step';

import StepConfigDrawer from './StepConfigDrawer';
import { StepConfigDrawerContext, StepConfigDrawerContextProps } from './StepConfigDrawer.context';

// An icon keeps the drawer off its default svg import, which jest maps to a proxy.
const mockSteps: Record<number, Step> = {
  0: { icon: 'icon.svg', mergedValues: { title: 'With outputs', outputs: [{ OUTPUT: null }] } } as unknown as Step,
  1: { icon: 'icon.svg', mergedValues: { title: 'Without outputs' } } as unknown as Step,
};

jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }));
jest.mock('../FloatingDrawer/FloatingDrawer', () => {
  const Passthrough = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    __esModule: true,
    default: Passthrough,
    FloatingDrawerBody: Passthrough,
    FloatingDrawerCloseButton: () => null,
    FloatingDrawerContent: Passthrough,
    FloatingDrawerHeader: Passthrough,
  };
});
jest.mock('./StepConfigDrawerProvider', () => ({
  __esModule: true,
  default: ({ children, stepIndex, workflowId }: PropsWithChildren<StepConfigDrawerContextProps>) => (
    <StepConfigDrawerContext.Provider value={{ workflowId, stepIndex, isLoading: false, data: mockSteps[stepIndex] }}>
      {children}
    </StepConfigDrawerContext.Provider>
  ),
}));
jest.mock('./tabs/ConfigurationTab', () => () => 'configuration panel');
jest.mock('./tabs/PropertiesTab', () => () => 'properties panel');
jest.mock('./tabs/OutputVariablesTab', () => () => 'output variables panel');
jest.mock('./tabs/StepContainersTab', () => () => 'containers panel');
jest.mock('@/components/StepBadge', () => () => null);

describe('StepConfigDrawer', () => {
  it('falls back to Configuration when the selected Output variables tab goes away', async () => {
    const user = userEvent.setup();
    const tree = (stepIndex: number) => (
      <BitkitProvider>
        <StepConfigDrawer workflowId="wf" stepIndex={stepIndex} isOpen onClose={jest.fn()} />
      </BitkitProvider>
    );
    const { rerender } = render(tree(0));

    await user.click(screen.getByRole('tab', { name: 'Output variables' }));
    expect(screen.getByText('output variables panel')).not.toBeNull();

    rerender(tree(1));
    expect(screen.queryByRole('tab', { name: 'Output variables' })).toBeNull();
    expect(screen.getByRole('tab', { name: 'Configuration', selected: true })).not.toBeNull();
    expect(screen.getByText('configuration panel')).not.toBeNull();
  });
});
