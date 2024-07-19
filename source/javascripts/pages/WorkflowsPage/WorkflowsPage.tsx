import { Box } from '@bitrise/bitkit';
import WorkflowConfigPanel from './components.new/WorkflowConfigPanel';
import WorkflowPanel from './components.new/WorkflowPanel';
import { BitriseYml } from '@/models/BitriseYml';
import { Workflows } from '@/models/Workflow';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';

type Props = {
  yml: BitriseYml;
  onChange: (workflows: Workflows) => void;
};

const WorkflowsPage = ({ yml, onChange: _ }: Props) => {
  return (
    <BitriseYmlProvider yml={yml}>
      <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
        <WorkflowPanel />
        <WorkflowConfigPanel borderLeft="1px solid" borderColor="border/regular" />
      </Box>
    </BitriseYmlProvider>
  );
};

export default WorkflowsPage;
