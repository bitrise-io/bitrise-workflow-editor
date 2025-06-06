import TabContainer from '@/components/tabs/TabContainer';
import TabHeader from '@/components/tabs/TabHeader';
import { EnvVarSource } from '@/core/models/EnvVar';

import EnvVarsTable from '../components/EnvVarsTable';
import PrivateInfoNotification from '../components/PrivateInfoNotification';

const ProjectTab = () => {
  return (
    <TabContainer>
      <PrivateInfoNotification />
      <TabHeader
        title="Project Environment Variables"
        subtitle="Variables will also be available in builds triggered by pull requests"
      />
      <EnvVarsTable source={EnvVarSource.App} />
    </TabContainer>
  );
};

export default ProjectTab;
