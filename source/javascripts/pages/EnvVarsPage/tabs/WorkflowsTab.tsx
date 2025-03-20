import { Fragment } from 'react/jsx-runtime';
import { Divider, Text } from '@bitrise/bitkit';

import TabHeader from '@/components/tabs/TabHeader';
import TabContainer from '@/components/tabs/TabContainer';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import PrivateInfoNotification from '../components/PrivateInfoNotification';
import EnvVarsTable from '../components/EnvVarsTable/EnvVarsTable';

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
          <EnvVarsTable source="workflow" sourceId={workflowId} />
          {workflowIds.length - 1 > index && <Divider />}
        </Fragment>
      ))}
    </TabContainer>
  );
};

export default WorkflowsTab;
