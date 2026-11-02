import { Edge, Node } from '@xyflow/react';

import { PipelineWorkflow } from '@/core/models/Workflow';

import {
  ADD_WORKFLOW_NODE_TYPE,
  GENERATED_WORKFLOWS_PLACEHOLDER_NODE_TYPE,
  PLACEHOLDER_NODE_TYPE,
  TRIGGER_NODE_TYPE,
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
export type TriggerNodeType = Node<Record<string, never>, typeof TRIGGER_NODE_TYPE>;
export type AddWorkflowNodeType = Node<Record<string, never>, typeof ADD_WORKFLOW_NODE_TYPE>;
export type GraphPipelineNodeType =
  | PlaceholderNodeType
  | WorkflowNodeType
  | GeneratedWorkflowsPlaceholderNodeType
  | TriggerNodeType
  | AddWorkflowNodeType;

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

export function isTriggerNode(node: GraphPipelineNodeType): node is TriggerNodeType {
  return node.type === TRIGGER_NODE_TYPE;
}

export function isAddWorkflowNode(node: GraphPipelineNodeType): node is AddWorkflowNodeType {
  return node.type === ADD_WORKFLOW_NODE_TYPE;
}
