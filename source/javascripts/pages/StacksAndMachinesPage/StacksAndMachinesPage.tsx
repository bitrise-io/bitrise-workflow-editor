import { BitkitHeading, BitkitTabs } from '@bitrise/bitkit-v2';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import DefaultTab from './tabs/DefaultTab';
import WorkflowsTab from './tabs/WorkflowsTab';

const useTabs = create(
  combine({ value: 'default' }, (set) => ({
    onValueChange: ({ value }: { value: string }) => set({ value }),
  })),
);

const StacksAndMachinesPage = () => {
  return (
    <BitkitTabs.Root {...useTabs()} lazyMount unmountOnExit>
      <BitkitHeading padding="32" data-clarity-unmask="true">
        Stacks & Machines
      </BitkitHeading>
      <BitkitTabs.List paddingInline="16" data-clarity-unmask="true">
        <BitkitTabs.Trigger value="default">Default</BitkitTabs.Trigger>
        <BitkitTabs.Trigger value="workflows">Workflows</BitkitTabs.Trigger>
      </BitkitTabs.List>
      <BitkitTabs.ContentGroup>
        <BitkitTabs.Content value="default">
          <DefaultTab />
        </BitkitTabs.Content>
        <BitkitTabs.Content value="workflows">
          <WorkflowsTab />
        </BitkitTabs.Content>
      </BitkitTabs.ContentGroup>
    </BitkitTabs.Root>
  );
};

export default StacksAndMachinesPage;
