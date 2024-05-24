import { Box } from '@bitrise/bitkit';
import ReactFlow from 'reactflow';
import { Pipelines } from '../PipelinesPage.types';
import PipelinesHeader from './PipelinesHeader';

type Props = {
  pipelines?: Pipelines;
};

const PipelinesCanvas = ({ pipelines }: Props) => {
  return (
    <Box as={ReactFlow} bg="background/secondary" proOptions={{ hideAttribution: true }}>
      <PipelinesHeader pipelines={pipelines} />
    </Box>
  );
};

export default PipelinesCanvas;
