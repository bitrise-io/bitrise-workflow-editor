import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import { BitkitHeading } from '@bitrise/bitkit-v2';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import ProjectTab from './tabs/ProjectTab';
import WorkflowsTab from './tabs/WorkflowsTab';

const useTabs = create(combine({ index: 0 }, (set) => ({ onChange: (index: number) => set({ index }) })));

const EnvVarsPage = () => {
  return (
    <Tabs {...useTabs()} isLazy>
      <BitkitHeading as="h2" padding="32" data-clarity-unmask="true">
        Environment Variables
      </BitkitHeading>
      <TabList px="16" data-clarity-unmask="true">
        <Tab>Project</Tab>
        <Tab>Workflows</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ProjectTab />
        </TabPanel>
        <TabPanel>
          <WorkflowsTab />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default EnvVarsPage;
