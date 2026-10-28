import { TabPanel, TabPanels, Tabs, useTabs } from '@bitrise/bitkit';
import { useEffect } from 'react';

import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import EntityIndexService from '@/core/services/EntityIndexService';
import { bitriseYmlStore, BitriseYmlStoreState } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useSearchParams from '@/hooks/useSearchParams';
import datadogCustomRumTiming from '@/utils/datadogCustomRumTiming';

import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import TriggersTab from './tabs/TriggersTab';
import { WorkflowConfigTab } from './WorkflowConfig.types';
import WorkflowConfigProvider from './WorkflowConfigProvider';

const TAB_IDS = [WorkflowConfigTab.CONFIGURATION, WorkflowConfigTab.PROPERTIES, WorkflowConfigTab.TRIGGERS];

// The open tab lives in the URL (`?tab=`), as it did for the fixed panel, so a reload or a shared
// link reopens the same tab. Only the page's own Workflow does this; chained ones keep local tabs.
const useTabInUrl = (isEnabled: boolean) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setTabIndex, tabIndex } = useTabs<WorkflowConfigTab>({ tabIds: TAB_IDS });

  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    if (searchParams.tab && TAB_IDS.includes(searchParams.tab as WorkflowConfigTab)) {
      setTabIndex(TAB_IDS.indexOf(searchParams.tab as WorkflowConfigTab));
    } else {
      setSearchParams({ ...searchParams, tab: TAB_IDS[0] });
    }
  }, [isEnabled, searchParams, setSearchParams, setTabIndex]);

  if (!isEnabled) {
    return {};
  }
  return {
    index: tabIndex,
    onChange: (index: number) => setSearchParams({ ...searchParams, tab: TAB_IDS[index] }),
  };
};

type Props = Omit<FloatingDrawerProps, 'children'> & {
  workflowId: string;
  parentWorkflowId?: string;
  context: 'pipeline' | 'workflow';
  onRename: (name: string) => void;
  // The Workflow a page is about (not one chained into it, nor one inside a Pipeline) gets the
  // settings its old fixed panel had: Explain, priority, git status name and delete.
  showAllSettings?: boolean;
  onDelete?: () => void;
};

const WorkflowConfigDrawerContent = ({
  context,
  parentWorkflowId,
  onRename,
  showAllSettings,
  onDelete,
  ...props
}: Omit<Props, 'workflowId'>) => {
  // The Workflows page's fixed panel became this drawer: keep its Datadog timing and Intercom target.
  useEffect(() => {
    if (showAllSettings) {
      datadogCustomRumTiming('wfe', 'workflow_config_panel_shown', true);
    }
  }, [showAllSettings]);
  const tabProps = useTabInUrl(Boolean(showAllSettings));

  return (
    <Tabs {...tabProps}>
      <FloatingDrawer {...props}>
        <FloatingDrawerContent data-intercom-target={showAllSettings ? 'Workflow Config Panel' : undefined}>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <WorkflowConfigHeader
              context={context}
              variant="drawer"
              parentWorkflowId={parentWorkflowId}
              withExplain={showAllSettings}
            />
          </FloatingDrawerHeader>
          <FloatingDrawerBody>
            <TabPanels>
              <TabPanel>
                <ConfigurationTab context={context} parentWorkflowId={parentWorkflowId} />
              </TabPanel>
              <TabPanel>
                <PropertiesTab variant={showAllSettings ? 'panel' : 'drawer'} onRename={onRename} onDelete={onDelete} />
              </TabPanel>
              <TabPanel>
                <TriggersTab />
              </TabPanel>
            </TabPanels>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </Tabs>
  );
};

// Defined in the open file or, in a modular config, in any other file.
const isDefinedIn = ({ yml, entityIndex }: Pick<BitriseYmlStoreState, 'yml' | 'entityIndex'>, workflowId: string) =>
  Boolean(yml.workflows?.[workflowId]) ||
  EntityIndexService.definitionsOf(entityIndex, 'workflows', workflowId).length > 0;

export const isWorkflowDefined = (workflowId: string) => isDefinedIn(bitriseYmlStore.getState(), workflowId);

const WorkflowConfigDrawer = ({ workflowId, ...props }: Props) => {
  // A Workflow that's gone (deleted from this drawer) or never existed has no settings to show: the drawer
  // closes instead of rendering them.
  const isDefined = useBitriseYmlStore((s) => isDefinedIn(s, workflowId));
  const { onCloseComplete } = props;
  useEffect(() => {
    if (!isDefined) {
      onCloseComplete?.();
    }
  }, [isDefined, onCloseComplete]);

  if (!isDefined) {
    return null;
  }

  return (
    <WorkflowConfigProvider workflowId={workflowId}>
      <WorkflowConfigDrawerContent {...props} />
    </WorkflowConfigProvider>
  );
};

export default WorkflowConfigDrawer;
