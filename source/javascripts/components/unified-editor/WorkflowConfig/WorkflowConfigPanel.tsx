import { useCallback, useEffect } from 'react';
import { TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import { useFormContext, useWatch } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import useSearchParams from '@/hooks/useSearchParams';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import TriggersTabPanel from '@/pages/WorkflowsPage/components/WorkflowConfigPanel/components/TriggersTabPanel';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import WorkflowConfigProvider from './WorkflowConfig.context';
import { FormValues, WorkflowConfigTab } from './WorkflowConfig.types';
import useRenameWorkflow from './hooks/useRenameWorkflow';

const WorkflowConfigPanelContent = () => {
  const formValues = useWatch<FormValues>();
  const [, setSearchParams] = useSearchParams();
  const { trigger, formState } = useFormContext<FormValues>();
  const defaultWorkflowId = formState.defaultValues?.properties?.name ?? '';
  const isTargetBasedTriggersEnabled = useFeatureFlag('enable-target-based-triggers');
  const shouldUpdateYml = defaultWorkflowId && (formState.isDirty || !isEmpty(formState.touchedFields));

  const { updateWorkflow } = useBitriseYmlStore(
    useShallow((s) => ({
      updateWorkflow: s.updateWorkflow,
    })),
  );

  const renameWorkflow = useRenameWorkflow((newWorkflowId) => {
    setSearchParams((searchParams) => ({
      ...searchParams,
      workflow_id: newWorkflowId,
    }));
  });

  const updateInMemoryYmlState = useCallback(async () => {
    if (shouldUpdateYml && (await trigger())) {
      const { properties } = formValues;

      if (properties) {
        updateWorkflow(defaultWorkflowId, omit(properties, 'name'));
      }

      if (properties?.name) {
        renameWorkflow(properties.name);
      }
    }
  }, [trigger, formValues, renameWorkflow, updateWorkflow, shouldUpdateYml, defaultWorkflowId]);

  useEffect(() => {
    updateInMemoryYmlState();
  }, [updateInMemoryYmlState]);

  return (
    <Tabs display="flex" flexDir="column" borderLeft="1px solid" borderColor="border/regular">
      <WorkflowConfigHeader variant="panel" />
      <TabPanels flex="1" minH="0">
        <TabPanel id={WorkflowConfigTab.CONFIGURATION} p="24" overflowY="auto" h="100%">
          <ConfigurationTab />
        </TabPanel>
        <TabPanel id={WorkflowConfigTab.PROPERTIES} p="24" overflowY="auto" h="100%">
          <PropertiesTab />
        </TabPanel>
        {isTargetBasedTriggersEnabled && (
          <TabPanel id={WorkflowConfigTab.TRIGGERS} overflowY="auto" h="100%">
            <TriggersTabPanel />
          </TabPanel>
        )}
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
