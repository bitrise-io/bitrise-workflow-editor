import { useEffect } from 'react';
import { TabPanel, TabPanels, Tabs, useTabs } from '@bitrise/bitkit';
import TriggersTab from '@/components/unified-editor/WorkflowConfig/tabs/TriggersTab';
import useSearchParams from '@/hooks/useSearchParams';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';
import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import WorkflowConfigProvider from './WorkflowConfig.context';
import { WorkflowConfigTab } from './WorkflowConfig.types';

const TAB_IDS = [WorkflowConfigTab.CONFIGURATION, WorkflowConfigTab.PROPERTIES, WorkflowConfigTab.TRIGGERS];

const WorkflowConfigPanelContent = () => {
  const [, setSelectedWorkflow] = useSelectedWorkflow();
  const workflows = useWorkflows();
  const { setTabIndex, tabIndex } = useTabs<WorkflowConfigTab>({
    tabIds: TAB_IDS,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.tab) {
      setTabIndex(TAB_IDS.indexOf(searchParams.tab as WorkflowConfigTab));
    }
  }, [searchParams, setTabIndex]);

  const onTabChange = (index: number) => {
    setSearchParams({
      ...searchParams,
      tab: TAB_IDS[index],
    });
  };

  const closeDialog = useWorkflowsPageStore((s) => s.closeDialog);
  const onDelete = (deletedId: string) => {
    setSelectedWorkflow(Object.keys(workflows).find((workflowId) => workflowId !== deletedId));
    closeDialog();
  };

  return (
    <Tabs
      display="flex"
      flexDir="column"
      borderLeft="1px solid"
      borderColor="border/regular"
      index={tabIndex}
      onChange={onTabChange}
    >
      <WorkflowConfigHeader variant="panel" context="workflow" />
      <TabPanels flex="1" minH="0">
        <TabPanel p="24" overflowY="auto" h="100%">
          <ConfigurationTab context="workflow" />
        </TabPanel>
        <TabPanel p="24" overflowY="auto" h="100%">
          <PropertiesTab variant="panel" onRename={setSelectedWorkflow} onDelete={onDelete} />
        </TabPanel>
        <TabPanel overflowY="auto" h="100%">
          <TriggersTab />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

type Props = {
  workflowId: string;
};

const WorkflowConfigPanel = ({ workflowId }: Props) => {
  return (
    <WorkflowConfigProvider workflowId={workflowId}>
      <WorkflowConfigPanelContent />
    </WorkflowConfigProvider>
  );
};

export default WorkflowConfigPanel;
