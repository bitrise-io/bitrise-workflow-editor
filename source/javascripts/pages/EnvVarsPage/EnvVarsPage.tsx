import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import ToolPageHeading from '@/components/Navigation/ToolPageHeading';

import ProjectTab from './tabs/ProjectTab';
import WorkflowsTab from './tabs/WorkflowsTab';

const useTabs = create(combine({ index: 0 }, (set) => ({ onChange: (index: number) => set({ index }) })));

const EnvVarsPage = () => {
  return (
    <Tabs {...useTabs()} isLazy>
      <ToolPageHeading
        label="Environment Variables"
        helperText={
          <>
            Environment Variables are available to every Step of your builds. Set them for the whole project or for a
            single Workflow.
          </>
        }
      />
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
