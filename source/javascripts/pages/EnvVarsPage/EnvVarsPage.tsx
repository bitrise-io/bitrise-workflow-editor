import { Box, TabList, Tabs, Text, Tab, TabPanels, TabPanel } from '@bitrise/bitkit';

import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';

import ProjectTab from './tabs/ProjectTab';
import WorkflowsTab from './tabs/WorkflowsTab';

type Props = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const EnvVarsPageContent = () => {
  return (
    <Tabs>
      <Box>
        <Text textStyle="heading/h2" p="32">
          Environment Variables
        </Text>
        <TabList px="16">
          <Tab>Project</Tab>
          <Tab>Workflows</Tab>
        </TabList>
      </Box>
      <TabPanels>
        <TabPanel>
          <ProjectTab />
        </TabPanel>
        <TabPanel>
          <WorkflowsTab />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

const EnvVarsPage = ({ yml, onChange }: Props) => {
  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <EnvVarsPageContent />
    </BitriseYmlProvider>
  );
};

export default EnvVarsPage;
