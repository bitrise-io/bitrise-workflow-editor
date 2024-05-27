import { Box } from '@bitrise/bitkit';
import ReactFlow, { NodeTypes } from 'reactflow';
import { Pipelines, Stages } from '../PipelinesPage.types';
import usePipelineSelector from '../hooks/usePipelineSelector';
import usePipelineStageNodes from '../hooks/usePipelineStageNodes';
import usePipelineStageEdges from '../hooks/usePipelineStageEdges';
import PipelinesHeader from './PipelinesHeader';
import StageNode from './StageNode';
import RunNode from './RunNode';
import AddNode from './AddNode';
import EndNode from './EndNode';

type Props = {
  pipelines?: Pipelines;
  stages?: Stages;
};

export const nodeTypes: NodeTypes = {
  add: AddNode,
  run: RunNode,
  end: EndNode,
  stage: StageNode,
};

const PipelinesCanvas = ({ pipelines, stages }: Props) => {
  const { selectedPipeline = Object.keys(pipelines ?? {})[0] } = usePipelineSelector(pipelines);

  const nodes = usePipelineStageNodes(pipelines?.[selectedPipeline], stages);
  const edges = usePipelineStageEdges(nodes);

  return (
    <Box bg="background/secondary" display="flex" flexDir="column" h="100%">
      <PipelinesHeader pipelines={pipelines} />
      <ReactFlow nodeTypes={nodeTypes} nodes={nodes} edges={edges} proOptions={{ hideAttribution: true }} />
    </Box>
  );
};

export default PipelinesCanvas;
