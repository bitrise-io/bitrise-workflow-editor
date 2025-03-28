import TabHeader from '@/components/tabs/TabHeader';
import TabContainer from '@/components/tabs/TabContainer';

import PrivateInfoNotification from '../components/PrivateInfoNotification';
import EnvVarsTable from '../components/EnvVarsTable/EnvVarsTable';

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
