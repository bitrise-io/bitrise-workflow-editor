import TabHeader from '../components/TabHeader';
import TabContainer from '../components/TabContainer';
import PrivateInfoNotification from '../components/PrivateInfoNotification';
import AddNewButton from '../components/AddNewButton';
import EnvVarsTable from '../components/EnvVarsTable';

const ProjectTab = () => {
  return (
    <TabContainer>
      <PrivateInfoNotification />
      <TabHeader
        title="Project Environment Variables"
        subtitle="Variables will also be available in builds triggered by pull requests"
      />
      <EnvVarsTable source="app" />
      <AddNewButton alignSelf="flex-start" />
    </TabContainer>
  );
};

export default ProjectTab;
