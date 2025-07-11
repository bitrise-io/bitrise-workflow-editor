import { Divider, Text } from '@bitrise/bitkit';
import { Fragment } from 'react/jsx-runtime';

import TabContainer from '@/components/tabs/TabContainer';
import TabHeader from '@/components/tabs/TabHeader';
import { EnvVarSource } from '@/core/models/EnvVar';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import EnvVarsTable from '../components/EnvVarsTable';
import PrivateInfoNotification from '../components/PrivateInfoNotification';

const WorkflowsTab = () => {
  const workflowIds = useBitriseYmlStore((state) => Object.keys(state.yml.workflows ?? {}));

  return (
    <TabContainer>
      <PrivateInfoNotification />
      <TabHeader
        title="Workflows' environment variables"
        subtitle="Env Vars exclusive to the Steps within the Workflow they are defined in"
      />
      {workflowIds.map((workflowId, index) => (
        <Fragment key={workflowId}>
          <Text as="h3" textStyle="heading/h3">
            {workflowId}
          </Text>
          <EnvVarsTable source={EnvVarSource.Workflows} sourceId={workflowId} />
          {workflowIds.length - 1 > index && <Divider />}
        </Fragment>
      ))}
    </TabContainer>
  );
};

export default WorkflowsTab;
