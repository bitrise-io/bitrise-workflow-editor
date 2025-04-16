import TabContainer from '@/components/tabs/TabContainer';
import TabHeader from '@/components/tabs/TabHeader';

import EnvVarsTable from '../components/EnvVarsTable/EnvVarsTable';
import PrivateInfoNotification from '../components/PrivateInfoNotification';

const ProjectTab = () => {
  return (
    <TabContainer>
      <PrivateInfoNotification />
      <TabHeader
        title="Project Environment Variables"
        subtitle="Variables will also be available in builds triggered by pull requests"
      />
      <EnvVarsTable source="project" />
    </TabContainer>
  );
};

export default ProjectTab;
