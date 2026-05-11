import { Edge, Node } from '@xyflow/react';

import { PipelineWorkflow } from '@/core/models/Workflow';

import {
  GENERATED_WORKFLOWS_PLACEHOLDER_NODE_TYPE,
  PLACEHOLDER_NODE_TYPE,
  WORKFLOW_NODE_TYPE,
} from './GraphPipelineCanvas.const';

export type PipelineCanvasWorkflow = PipelineWorkflow & { isGenerator: boolean };

export type WorkflowNodeType = Node<{
  uses?: string;
  fixed?: boolean;
  highlighted?: boolean;
  parallel?: string | number;
}>;
export type PlaceholderNodeType = Node<{ dependsOn: string[] }>;
export type GeneratedWorkflowsPlaceholderNodeType = Node<{ generatorId: string }>;
export type GraphPipelineEdgeType = Edge<{ highlighted?: boolean }>;
export type GraphPipelineNodeType = PlaceholderNodeType | WorkflowNodeType | GeneratedWorkflowsPlaceholderNodeType;

export function isWorkflowNode(node: GraphPipelineNodeType): node is WorkflowNodeType {
  return node.type === WORKFLOW_NODE_TYPE;
}

export function isPlaceholderNode(node: GraphPipelineNodeType): node is PlaceholderNodeType {
  return node.type === PLACEHOLDER_NODE_TYPE;
}

export function isGeneratedWorkflowsPlaceholderNode(
  node: GraphPipelineNodeType,
): node is GeneratedWorkflowsPlaceholderNodeType {
  return node.type === GENERATED_WORKFLOWS_PLACEHOLDER_NODE_TYPE;
}
