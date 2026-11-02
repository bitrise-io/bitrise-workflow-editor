import { BitkitTabs } from '@bitrise/bitkit-v2';
import { useEffect } from 'react';

import TriggersTab from '@/components/unified-editor/WorkflowConfig/tabs/TriggersTab';
import useSearchParams from '@/hooks/useSearchParams';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';
import datadogCustomRumTiming from '@/utils/datadogCustomRumTiming';

import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import { WorkflowConfigTab } from './WorkflowConfig.types';
import WorkflowConfigProvider from './WorkflowConfigProvider';

const TAB_IDS = [WorkflowConfigTab.CONFIGURATION, WorkflowConfigTab.PROPERTIES, WorkflowConfigTab.TRIGGERS];

const WorkflowConfigPanelContent = () => {
  const [, setSelectedWorkflow] = useSelectedWorkflow();
  const [searchParams, setSearchParams] = useSearchParams();
  const closeDialog = useWorkflowsPageStore((s) => s.closeDialog);
  const isKnownTab = TAB_IDS.includes(searchParams.tab as WorkflowConfigTab);
  const tabId = isKnownTab ? searchParams.tab : TAB_IDS[0];

  const onTabChange = ({ value }: { value: string }) => {
    setSearchParams({
      ...searchParams,
      tab: value,
    });
  };

  useEffect(() => {
    if (!isKnownTab) {
      setSearchParams({ ...searchParams, tab: TAB_IDS[0] });
    }
  }, [isKnownTab, searchParams, setSearchParams]);

  return (
    <BitkitTabs.Root
      display="flex"
      flexDirection="column"
      borderInlineStart="1px solid"
      borderColor="border/regular"
      value={tabId}
      onValueChange={onTabChange}
      data-intercom-target="Workflow Config Panel"
    >
      <WorkflowConfigHeader variant="panel" context="workflow" />
      <BitkitTabs.ContentGroup flex="1" minHeight="0">
        <BitkitTabs.Content value={WorkflowConfigTab.CONFIGURATION} padding="24" overflowY="auto" height="100%">
          <ConfigurationTab context="workflow" />
        </BitkitTabs.Content>
        <BitkitTabs.Content value={WorkflowConfigTab.PROPERTIES} padding="24" overflowY="auto" height="100%">
          <PropertiesTab variant="panel" onRename={setSelectedWorkflow} onDelete={closeDialog} />
        </BitkitTabs.Content>
        <BitkitTabs.Content value={WorkflowConfigTab.TRIGGERS} padding="24" overflowY="auto" height="100%">
          <TriggersTab />
        </BitkitTabs.Content>
      </BitkitTabs.ContentGroup>
    </BitkitTabs.Root>
  );
};

type Props = {
  workflowId: string;
};

const WorkflowConfigPanel = ({ workflowId }: Props) => {
  useEffect(() => {
    datadogCustomRumTiming('wfe', 'workflow_config_panel_shown', true);
  }, []);

  return (
    <WorkflowConfigProvider workflowId={workflowId}>
      <WorkflowConfigPanelContent />
    </WorkflowConfigProvider>
  );
};

export default WorkflowConfigPanel;
