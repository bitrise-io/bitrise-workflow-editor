import { Divider, EmptyState, Text } from '@bitrise/bitkit';
import { Fragment } from 'react/jsx-runtime';

import TabContainer from '@/components/tabs/TabContainer';
import TabHeader from '@/components/tabs/TabHeader';
import { EnvVarSource } from '@/core/models/EnvVar';
import useContainers from '@/hooks/useContainers';

import EnvVarsTable from '../components/EnvVarsTable';
import PrivateInfoNotification from '../components/PrivateInfoNotification';

const ContainersTab = () => {
  const containerIds = useContainers((containers) => Object.keys(containers));

  return (
    <TabContainer>
      <PrivateInfoNotification />
      <TabHeader
        title="Containers' environment variables"
        subtitle="Env Vars exclusive to the Steps that use these execution or service containers"
      />
      {containerIds.length === 0 ? (
        <EmptyState
          iconName="Container"
          title="No containers defined"
          description="Create containers in the Containers page to manage their environment variables here."
        />
      ) : (
        containerIds.map((containerId, index) => (
          <Fragment key={containerId}>
            <Text as="h3" textStyle="heading/h3">
              {containerId}
            </Text>
            <EnvVarsTable source={EnvVarSource.Containers} sourceId={containerId} />
            {containerIds.length - 1 > index && <Divider />}
          </Fragment>
        ))
      )}
    </TabContainer>
  );
};

export default ContainersTab;
