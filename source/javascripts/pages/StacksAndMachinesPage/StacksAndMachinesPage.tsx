import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@bitrise/bitkit';

import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';

import DefaultTab from './tabs/DefaultTab';
import WorkflowsTab from './tabs/WorkflowsTab';

export type StacksAndMachinesPageProps = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const useTabs = create(
  combine({ index: 0 }, (set) => ({
    onChange: (index: number) => set({ index }),
  })),
);

export const StacksAndMachinesPageContent = () => {
  return (
    <Tabs {...useTabs()} isLazy>
      <Text as="h2" textStyle="heading/h2" p="32">
        Stacks & Machines
      </Text>
      <TabList px="16">
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

const StacksAndMachinesPage = ({ yml, onChange }: StacksAndMachinesPageProps) => {
  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <StacksAndMachinesPageContent />
    </BitriseYmlProvider>
  );
};

export default StacksAndMachinesPage;
