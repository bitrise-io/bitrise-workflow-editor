import { Box } from '@bitrise/bitkit';
import ReactFlow from 'reactflow';

const PipelinesCanvas = () => {
  return <Box as={ReactFlow} bg="background/secondary" proOptions={{ hideAttribution: true }} />;
};

export default PipelinesCanvas;
