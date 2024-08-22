import { Node, Position } from 'reactflow';
import { Stage } from '@/core/models/Stage';
import { CANVAS_PADDING, ICON_STAGE_WIDTH, STAGE_GAP, STAGE_WIDTH } from '../PipelinesPage.const';
import usePipelineStages from './usePipelineStages';

const commonNodeProps: Partial<Node> = {
  draggable: false,
  connectable: false,
  sourcePosition: Position.Left,
  targetPosition: Position.Right,
};

const runNode = (id: string, x: number): Node => ({
  id: `run-${id}`,
  type: 'run',
  data: undefined,
  position: { x, y: CANVAS_PADDING + 14 },
  ...commonNodeProps,
});

const addNode = (id: string, x: number): Node => ({
  id: `add-${id}`,
  type: 'add',
  data: undefined,
  position: { x, y: CANVAS_PADDING + 14 },
  ...commonNodeProps,
});

const endNode = (id: string, x: number): Node => ({
  id: `end-${id}`,
  type: 'end',
  data: undefined,
  position: { x, y: CANVAS_PADDING + 14 },
  ...commonNodeProps,
});

const stageNode = (id: string, x: number, stage: Stage) => ({
  id,
  type: 'stage',
  data: stage,
  position: { x, y: CANVAS_PADDING },
  ...commonNodeProps,
});

const usePipelineStageNodes = (): Node[] => {
  const stages = usePipelineStages();
  const entries = Object.entries(stages);
  const nodes: Node[] = [];

  let x = CANVAS_PADDING;

  for (let i = 0; i < entries.length; i++) {
    const [id, stage] = entries[i];

    const isFirstStage = i === 0;
    const isLastStage = i === entries.length - 1;

    if (isFirstStage) {
      nodes.push(runNode(id, x));
      x += ICON_STAGE_WIDTH + STAGE_GAP;
    }

    nodes.push(stageNode(id, x, stage));
    x += STAGE_WIDTH + STAGE_GAP;

    if (isLastStage) {
      nodes.push(endNode(id, x));
    } else {
      nodes.push(addNode(id, x));
      x += ICON_STAGE_WIDTH + STAGE_GAP;
    }
  }

  return nodes;
};

export default usePipelineStageNodes;
