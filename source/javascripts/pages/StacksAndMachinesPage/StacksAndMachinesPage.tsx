import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import { BitkitHeading } from '@bitrise/bitkit-v2';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import DefaultTab from './tabs/DefaultTab';
import WorkflowsTab from './tabs/WorkflowsTab';

const useTabs = create(
  combine({ index: 0 }, (set) => ({
    onChange: (index: number) => set({ index }),
  })),
);

const StacksAndMachinesPage = () => {
  return (
    <Tabs {...useTabs()} isLazy>
      <BitkitHeading padding="32" data-clarity-unmask="true">
        Stacks & Machines
      </BitkitHeading>
      <TabList px="16" data-clarity-unmask="true">
        <Tab>Default</Tab>
        <Tab>Workflows</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <DefaultTab />
        </TabPanel>
        <TabPanel>
          <WorkflowsTab />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default StacksAndMachinesPage;
