import { Box } from '@bitrise/bitkit';
import { BitriseYml } from '@/models/BitriseYml';
import { Workflows } from '@/models/Workflow';

type Props = {
  yml: BitriseYml;
  onChange: (workflows: Workflows) => void;
};

const WorkflowsPage = ({ yml, onChange }: Props) => {
  return (
    <Box>
      <Box>Toolbar + List</Box>
      <Box>Main workflow panel</Box>
      <Box>drawers for everything else</Box>
      <Box>dialogs</Box>
    </Box>
  );
};

export default WorkflowsPage;
