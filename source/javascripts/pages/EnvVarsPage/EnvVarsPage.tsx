import { BitkitHeading, BitkitTabs } from '@bitrise/bitkit-v2';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import ProjectTab from './tabs/ProjectTab';
import WorkflowsTab from './tabs/WorkflowsTab';

const useTabs = create(
  combine({ value: 'project' }, (set) => ({ onValueChange: ({ value }: { value: string }) => set({ value }) })),
);

const EnvVarsPage = () => {
  return (
    <BitkitTabs.Root {...useTabs()} lazyMount unmountOnExit>
      <BitkitHeading padding="32" data-clarity-unmask="true">
        Environment Variables
      </BitkitHeading>
      <BitkitTabs.List paddingInline="16" data-clarity-unmask="true">
        <BitkitTabs.Trigger value="project">Project</BitkitTabs.Trigger>
        <BitkitTabs.Trigger value="workflows">Workflows</BitkitTabs.Trigger>
      </BitkitTabs.List>
      <BitkitTabs.ContentGroup>
        <BitkitTabs.Content value="project">
          <ProjectTab />
        </BitkitTabs.Content>
        <BitkitTabs.Content value="workflows">
          <WorkflowsTab />
        </BitkitTabs.Content>
      </BitkitTabs.ContentGroup>
    </BitkitTabs.Root>
  );
};

export default EnvVarsPage;
