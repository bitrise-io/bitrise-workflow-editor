import { Node, Position } from 'reactflow';
import { Pipeline, Stage, Stages } from '../PipelinesPage.types';
import { CANVAS_PADDING, STAGE_GAP, STAGE_WIDTH } from '../PipelinesPage.const';
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

function* nodeGenerator(stages: Stages): Iterable<Node> {
  const entries = Object.entries(stages);

  let x = CANVAS_PADDING;

  for (let i = 0; i < entries.length; i++) {
    const [id, stage] = entries[i];

    const isFirstStage = i === 0;
    const isLastStage = i === entries.length - 1;

    if (isFirstStage) {
      yield runNode(id, x);
      x += 24 + STAGE_GAP;
    }

    yield stageNode(id, x, stage);
    x += STAGE_WIDTH + STAGE_GAP;

    if (isLastStage) {
      yield endNode(id, x);
    } else {
      yield addNode(id, x);
      x += 24 + STAGE_GAP;
    }
  }
}

const usePipelineStageNodes = (pipeline?: Pipeline, stages?: Stages): Node[] => {
  const pipelinesStages = usePipelineStages(pipeline, stages);
  return Array.from(nodeGenerator(pipelinesStages));
};

export default usePipelineStageNodes;
