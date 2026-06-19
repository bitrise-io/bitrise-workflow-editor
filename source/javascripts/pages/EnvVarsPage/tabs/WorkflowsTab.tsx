import { Box, Divider, Text } from '@bitrise/bitkit';
import { Fragment } from 'react/jsx-runtime';

import CrossFileJumpButton from '@/components/JumpToDefinitionLink/CrossFileJumpButton';
import TabContainer from '@/components/tabs/TabContainer';
import TabHeader from '@/components/tabs/TabHeader';
import { EnvVarSource } from '@/core/models/EnvVar';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useDefiningFilePath, useIsMergedConfigSelected } from '@/hooks/useTree';

import EnvVarsTable from '../components/EnvVarsTable';
import PrivateInfoNotification from '../components/PrivateInfoNotification';

type SectionProps = {
  workflowId: string;
  isMergedView: boolean;
  showDivider: boolean;
};

const WorkflowEnvVarsSection = ({ workflowId, isMergedView, showDivider }: SectionProps) => {
  const definingPath = useDefiningFilePath('workflows', workflowId);

  return (
    <>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap="8">
        <Box>
          <Text as="h3" textStyle="heading/h3">
            {workflowId}
          </Text>
          {isMergedView && definingPath && (
            <Text textStyle="body/sm/regular" color="text/secondary">
              Defined in {definingPath}
            </Text>
          )}
        </Box>
      </Box>
      <EnvVarsTable
        source={EnvVarSource.Workflows}
        sourceId={workflowId}
        hideAddButton={isMergedView}
        renderJumpButton={isMergedView ? () => <CrossFileJumpButton kind="workflows" id={workflowId} /> : undefined}
      />
      {showDivider && <Divider />}
    </>
  );
};

const WorkflowsTab = () => {
  const workflowIds = useBitriseYmlStore((state) => Object.keys(state.yml.workflows ?? {}));
  const isMergedView = useIsMergedConfigSelected();

  return (
    <TabContainer>
      <PrivateInfoNotification />
      <TabHeader
        title="Workflows' environment variables"
        subtitle="Env Vars exclusive to the Steps within the Workflow they are defined in"
      />
      {workflowIds.map((workflowId, index) => (
        <Fragment key={workflowId}>
          <WorkflowEnvVarsSection
            workflowId={workflowId}
            isMergedView={isMergedView}
            showDivider={workflowIds.length - 1 > index}
          />
        </Fragment>
      ))}
    </TabContainer>
  );
};

export default WorkflowsTab;
