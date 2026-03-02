import { Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@bitrise/bitkit';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import ContainersTab from './tabs/ContainersTab';
import ProjectTab from './tabs/ProjectTab';
import WorkflowsTab from './tabs/WorkflowsTab';

const useTabs = create(combine({ index: 0 }, (set) => ({ onChange: (index: number) => set({ index }) })));

const EnvVarsPage = () => {
  return (
    <Tabs {...useTabs()} isLazy>
      <Text as="h2" textStyle="heading/h2" p="32">
        Environment Variables
      </Text>
      <TabList px="16">
        <Tab>Project</Tab>
        <Tab>Workflows</Tab>
        <Tab>Containers</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ProjectTab />
        </TabPanel>
        <TabPanel>
          <WorkflowsTab />
        </TabPanel>
        <TabPanel>
          <ContainersTab />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default EnvVarsPage;
