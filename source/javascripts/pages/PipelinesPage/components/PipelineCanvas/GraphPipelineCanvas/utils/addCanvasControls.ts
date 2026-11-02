import {
  ADD_WORKFLOW_NODE_ID,
  ADD_WORKFLOW_NODE_TYPE,
  TRIGGER_NODE_ID,
  TRIGGER_NODE_TYPE,
} from '../GraphPipelineCanvas.const';
import {
  AddWorkflowNodeType,
  GraphPipelineEdgeType,
  GraphPipelineNodeType,
  PipelineCanvasWorkflow,
  TriggerNodeType,
} from '../GraphPipelineCanvas.types';
import createGraphPipelineEdge from './createGraphPipelineEdge';

// Parts of the canvas, not of the Pipeline: nothing about them can be selected, moved or removed.
// React Flow turns pointer events off for a node that's neither selectable nor draggable, which
// would swallow clicks on the buttons inside, so they're turned back on.
const FIXED = {
  draggable: false,
  selectable: false,
  deletable: false,
  connectable: false,
  focusable: false,
  style: { pointerEvents: 'all' as const },
};

// The trigger node (linked to every Workflow that runs first) and the "+ Workflow" button under
// those Workflows. Positioned by autoLayoutingGraphNodes; added only to a Pipeline with Workflows.
function addCanvasControls(
  workflows: PipelineCanvasWorkflow[],
  entities: { nodes: GraphPipelineNodeType[]; edges: GraphPipelineEdgeType[] },
) {
  if (workflows.length === 0) {
    return entities;
  }

  const triggerNode = {
    id: TRIGGER_NODE_ID,
    type: TRIGGER_NODE_TYPE,
    data: {},
    position: { x: 0, y: 0 },
    ...FIXED,
  } satisfies TriggerNodeType;
  const addWorkflowNode = {
    id: ADD_WORKFLOW_NODE_ID,
    type: ADD_WORKFLOW_NODE_TYPE,
    data: {},
    position: { x: 0, y: 0 },
    ...FIXED,
  } satisfies AddWorkflowNodeType;
  const triggerEdges = workflows
    .filter((workflow) => !workflow.dependsOn?.length)
    .map((workflow) => ({
      ...createGraphPipelineEdge(TRIGGER_NODE_ID, workflow.id),
      deletable: false,
      selectable: false,
      reconnectable: false,
    }));

  return {
    nodes: [...entities.nodes, triggerNode, addWorkflowNode],
    edges: [...entities.edges, ...triggerEdges],
  };
}

export default addCanvasControls;
