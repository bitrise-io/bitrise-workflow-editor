import { Edge, Node } from '@xyflow/react';
import { PLACEHOLDER_NODE_TYPE } from './GraphPipelineCanvas.const';

export type WorkflowNodeType = Node<{ isPlaceholder?: boolean; fixed?: boolean; highlighted?: boolean }>;
export type PlaceholderNodeType = Node<{ dependsOn: string[] }>;
export type GraphPipelineEdgeType = Edge<{ highlighted?: boolean }>;
export type GraphPipelineNodeType = PlaceholderNodeType | WorkflowNodeType;

export function isPlaceholderNode(node: GraphPipelineNodeType): node is PlaceholderNodeType {
  return node.type === PLACEHOLDER_NODE_TYPE;
}
