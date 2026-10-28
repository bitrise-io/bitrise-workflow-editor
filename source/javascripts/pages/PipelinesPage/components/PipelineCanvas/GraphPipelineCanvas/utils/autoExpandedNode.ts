import { create } from 'zustand';

import { BitriseYml } from '@/core/models/BitriseYml';

import { WORKFLOW_NODE_HEIGHT } from '../GraphPipelineCanvas.const';

// The Workflow node the canvas opened because it was clicked. It closes again when the focus moves on,
// unlike a node opened with its own chevron, which stays open.
export const useAutoExpandedNode = create<{ nodeId?: string }>(() => ({}));

const STEP_HEIGHT = 42;
const CHAINED_WORKFLOW_HEIGHT = 50;
const LIST_GAP = 8;
const EMPTY_STEP_LIST_HEIGHT = 72;

// How tall a Workflow node gets when opened: its header, then its chained Workflows (collapsed) and Steps.
// Counted from the config, so the canvas can tell whether it fits before opening it.
export function estimateExpandedHeight(yml: BitriseYml, workflowId: string) {
  const workflow = yml.workflows?.[workflowId];
  const steps = workflow?.steps?.length ?? 0;
  const chained = (workflow?.before_run?.length ?? 0) + (workflow?.after_run?.length ?? 0);
  const rows = chained + (steps > 0 ? steps : 0);
  const content =
    chained * CHAINED_WORKFLOW_HEIGHT +
    (steps > 0 ? steps * STEP_HEIGHT : EMPTY_STEP_LIST_HEIGHT) +
    Math.max(rows - 1, 0) * LIST_GAP;

  return WORKFLOW_NODE_HEIGHT + 2 * LIST_GAP + content;
}
