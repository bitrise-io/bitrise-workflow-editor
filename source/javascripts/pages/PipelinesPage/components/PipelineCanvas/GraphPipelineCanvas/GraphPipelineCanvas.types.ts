import { Edge, Node } from '@xyflow/react';
import { PLACEHOLDER_NODE_TYPE, WORKFLOW_NODE_TYPE } from './GraphPipelineCanvas.const';

export type WorkflowNodeType = Node<{ fixed?: boolean; highlighted?: boolean; uses?: string; parallel?: string }>;
export type PlaceholderNodeType = Node<{ dependsOn: string[] }>;
export type GraphPipelineEdgeType = Edge<{ highlighted?: boolean }>;
export type GraphPipelineNodeType = PlaceholderNodeType | WorkflowNodeType;

export function isWorkflowNode(node: GraphPipelineNodeType): node is WorkflowNodeType {
  return node.type === WORKFLOW_NODE_TYPE;
}

export function isPlaceholderNode(node: GraphPipelineNodeType): node is PlaceholderNodeType {
  return node.type === PLACEHOLDER_NODE_TYPE;
}
