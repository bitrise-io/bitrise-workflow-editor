import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import ToolPageHeading from '@/components/Navigation/ToolPageHeading';

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
      <ToolPageHeading
        label="Stacks & Machines"
        helperText={
          <>Choose the stack and machine your builds run on, for the whole project or for a single Workflow.</>
        }
      />
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
