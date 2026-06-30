import { Box, Divider, Text } from '@bitrise/bitkit';
import { Fragment } from 'react/jsx-runtime';

import JumpToFileButton from '@/components/JumpToDefinitionLink/JumpToFileButton';
import TabContainer from '@/components/tabs/TabContainer';
import TabHeader from '@/components/tabs/TabHeader';
import { EnvVarSource } from '@/core/models/EnvVar';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useIsMergedConfigSelected } from '@/hooks/useTree';

import EnvVarsTable from '../components/EnvVarsTable';
import PrivateInfoNotification from '../components/PrivateInfoNotification';
import { useWorkflowEnvVarFileGroups } from '../useProjectEnvVarFileGroups';

const MergedWorkflowsTab = () => {
  // One section per (workflow, source file) that actually has env vars — no empty tables, and the
  // arrow jumps straight to the file the vars live in.
  const groups = useWorkflowEnvVarFileGroups();

  return (
    <>
      {groups.map((group, index) => (
        <Fragment key={`${group.workflowId}@${group.nodeId}`}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap="8">
            <Box>
              <Text as="h3" textStyle="heading/h3">
                {group.workflowId}
              </Text>
              <Text textStyle="body/sm/regular" color="text/secondary">
                Defined in {group.path}
              </Text>
            </Box>
          </Box>
          <EnvVarsTable
            source={EnvVarSource.Workflows}
            sourceId={group.workflowId}
            initialEnvs={group.envs}
            hideAddButton
            renderJumpButton={(_env) => <JumpToFileButton nodeId={group.nodeId} />}
          />
          {groups.length - 1 > index && <Divider />}
        </Fragment>
      ))}
    </>
  );
};

const EditableWorkflowsTab = () => {
  const workflowIds = useBitriseYmlStore((state) => Object.keys(state.yml.workflows ?? {}));

  return (
    <>
      {workflowIds.map((workflowId, index) => (
        <Fragment key={workflowId}>
          <Text as="h3" textStyle="heading/h3">
            {workflowId}
          </Text>
          <EnvVarsTable source={EnvVarSource.Workflows} sourceId={workflowId} />
          {workflowIds.length - 1 > index && <Divider />}
        </Fragment>
      ))}
    </>
  );
};

const WorkflowsTab = () => {
  const isMergedView = useIsMergedConfigSelected();

  return (
    <TabContainer>
      <PrivateInfoNotification />
      <TabHeader
        title="Workflows' environment variables"
        subtitle="Env Vars exclusive to the Steps within the Workflow they are defined in"
      />
      {isMergedView ? <MergedWorkflowsTab /> : <EditableWorkflowsTab />}
    </TabContainer>
  );
};

export default WorkflowsTab;
