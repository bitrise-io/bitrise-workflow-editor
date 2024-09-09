import { useEffect } from 'react';
import { TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import { useFormContext, useWatch } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import omit from 'lodash/omit';
import useSearchParams from '@/hooks/useSearchParams';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import EnvVarService from '@/core/models/EnvVarService';
import { EnvVar } from '@/core/models/EnvVar';
import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import WorkflowConfigProvider from './WorkflowConfig.context';
import { FormValues, WorkflowConfigTab } from './WorkflowConfig.types';
import useRenameWorkflow from './hooks/useRenameWorkflow';

const WorkflowConfigPanelContent = () => {
  const form = useFormContext<FormValues>();
  const [, setSearchParams] = useSearchParams();
  const formValues = useWatch({ control: form.control });
  const defaultWorkflowId = form.formState.defaultValues?.properties?.name ?? '';

  const { updateWorkflow, updateStackAndMachine, updateWorkflowEnvVars } = useBitriseYmlStore(
    useShallow((s) => ({
      updateWorkflow: s.updateWorkflow,
      updateStackAndMachine: s.updateStackAndMachine,
      updateWorkflowEnvVars: s.updateWorkflowEnvVars,
    })),
  );

  const renameWorkflow = useRenameWorkflow((newWorkflowId) => {
    setSearchParams((searchParams) => ({
      ...searchParams,
      workflow_id: newWorkflowId,
    }));
  });

  useEffect(() => {
    if (defaultWorkflowId) {
      const { configuration, properties } = formValues;

      if (configuration) {
        const { stackId = '', machineTypeId = '', envs = [] } = configuration;
        const ymlCompatibleEnvVars = envs.map((env) => EnvVarService.parseEnvVar(env as EnvVar));

        updateWorkflowEnvVars(defaultWorkflowId, ymlCompatibleEnvVars);
        updateStackAndMachine(defaultWorkflowId, stackId, machineTypeId);
      }

      if (properties) {
        updateWorkflow(defaultWorkflowId, omit(properties, 'name'));
      }

      if (properties?.name) {
        renameWorkflow(properties.name);
      }
    }
  }, [formValues, defaultWorkflowId, renameWorkflow, updateWorkflow, updateStackAndMachine, updateWorkflowEnvVars]);

  return (
    <Tabs display="flex" flexDir="column" borderLeft="1px solid" borderColor="border/regular">
      <WorkflowConfigHeader />
      <TabPanels flex="1" minH="0">
        <TabPanel id={WorkflowConfigTab.CONFIGURATION} p="24" overflowY="auto" h="100%">
          <ConfigurationTab />
        </TabPanel>
        <TabPanel id={WorkflowConfigTab.PROPERTIES} p="24" overflowY="auto" h="100%">
          <PropertiesTab />
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
