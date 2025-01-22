import { memo, useEffect, useMemo, useRef } from 'react';
import { Box, CardProps } from '@bitrise/bitkit';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { useHover, useResizeObserver } from 'usehooks-ts';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import { WorkflowCard } from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { ChainedWorkflowPlacement } from '@/core/models/Workflow';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflows } from '@/hooks/useWorkflows';
import { LibraryType } from '@/core/models/Step';
import { WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';
import usePipelineSelector from '../../../../hooks/usePipelineSelector';
import { GraphPipelineEdgeType, GraphPipelineNodeType } from '../GraphPipelineCanvas.types';
import { PipelinesPageDialogType, usePipelinesPageStore } from '../../../../PipelinesPage.store';
import { LeftHandle, RightHandle } from './Handles';

type Props = NodeProps<GraphPipelineNodeType>;

const defaultStyle = {
  variant: 'outline',
} satisfies CardProps;

const hoveredStyle = {
  boxShadow: 'small',
  borderColor: 'border/hover',
} satisfies CardProps;

const selectedStyle = {
  outline: '2px solid',
  outlineColor: 'border/selected',
  outlineOffset: '-2px',
} satisfies CardProps;

const WorkflowNode = ({ id, selected, zIndex, data }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useHover(ref);
  const workflows = useWorkflows();
  const { selectedPipeline } = usePipelineSelector();

  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const closeDialog = usePipelinesPageStore((s) => s.closeDialog);
  const setStepIndex = usePipelinesPageStore((s) => s.setStepIndex);
  const selectedStepIndex = usePipelinesPageStore((s) => s.stepIndex);
  const selectedStepBundleId = usePipelinesPageStore((s) => s.stepBundleId);
  const selectedWorkflowId = usePipelinesPageStore((s) => s.workflowId);
  const isGraphPipelinesEnabled = useFeatureFlag('enable-dag-pipelines');

  const { updateNode, deleteElements, setEdges } = useReactFlow<GraphPipelineNodeType, GraphPipelineEdgeType>();

  const {
    moveStep,
    cloneStep,
    deleteStep,
    upgradeStep,
    cloneStepInStepBundle,
    deleteStepInStepBundle,
    groupStepsToStepBundle,
    moveStepInStepBundle,
    upgradeStepInStepBundle,
    setChainedWorkflows,
    removeChainedWorkflow,
  } = useBitriseYmlStore((s) => ({
    moveStep: s.moveStep,
    cloneStep: s.cloneStep,
    deleteStep: s.deleteStep,
    upgradeStep: s.changeStepVersion,
    cloneStepInStepBundle: s.cloneStepInStepBundle,
    deleteStepInStepBundle: s.deleteStepInStepBundle,
    groupStepsToStepBundle: s.groupStepsToStepBundle,
    moveStepInStepBundle: s.moveStepInStepBundle,
    upgradeStepInStepBundle: s.changeStepVersionInStepBundle,
    setChainedWorkflows: s.setChainedWorkflows,
    removeChainedWorkflow: s.removeChainedWorkflow,
  }));

  useResizeObserver({
    ref,
    onResize: ({ height }) => updateNode(id, { height }),
  });

  const uses = 'uses' in data ? data.uses : undefined;

  const {
    handleAddStep,
    handleMoveStep,
    handleSelectStep,
    handleCloneStep,
    handleDeleteStep,
    handleUpgradeStep,
    handleAddStepToStepBundle,
    handleCloneStepInStepBundle,
    handleDeleteStepInStepBundle,
    handleGroupStepsToStepBundle,
    handleMoveStepInStepBundle,
    handleUpgradeStepInStepBundle,
    handleEditWorkflow,
    handleChainWorkflow,
    handleRemoveWorkflow,
    handleRemoveChainedWorkflow,
    handleChainedWorkflowsUpdate,
  } = useMemo(() => {
    if (!isGraphPipelinesEnabled) {
      return {};
    }

    function handleWorkflowActionDialogChange(workflowId: string, action: 'remove') {
      switch (action) {
        case 'remove': {
          // Close the dialog if the selected workflow is in the deleted workflow's chain
          if (WorkflowService.getWorkflowChain(workflows, workflowId).includes(selectedWorkflowId)) {
            closeDialog();
          }
          break;
        }
      }
    }

    function handleStepActionDialogChange({
      workflowId,
      stepBundleId,
      stepIndex,
      targetIndex,
      action,
    }: {
      workflowId?: string;
      stepBundleId?: string;
      stepIndex: number;
      targetIndex?: number;
      action: 'move' | 'clone' | 'remove';
    }) {
      switch (action) {
        case 'move': {
          // Adjust index if the selected step is moved
          if (
            (workflowId === selectedWorkflowId || stepBundleId === selectedStepBundleId) &&
            selectedStepIndex === stepIndex
          ) {
            setStepIndex(targetIndex);
          }
          break;
        }
        case 'clone': {
          // Adjust index if the selected step is cloned
          if (
            (workflowId === selectedWorkflowId || stepBundleId === selectedStepBundleId) &&
            stepIndex === selectedStepIndex
          ) {
            setStepIndex(selectedStepIndex + 1);
          }
          break;
        }
        case 'remove': {
          // Close the dialog if the selected step is deleted
          if (
            (workflowId === selectedWorkflowId || stepBundleId === selectedStepBundleId) &&
            stepIndex === selectedStepIndex
          ) {
            closeDialog();
          }

          // Adjust index if a step is deleted before the selected step
          if (
            (workflowId === selectedWorkflowId || stepBundleId === selectedStepBundleId) &&
            stepIndex < selectedStepIndex
          ) {
            setStepIndex(selectedStepIndex - 1);
          }
          break;
        }
      }
    }

    if (uses) {
      return {
        handleRemoveWorkflow: (deletedWorkflowId: string) => {
          deleteElements({ nodes: [{ id: deletedWorkflowId }] });
          handleWorkflowActionDialogChange(deletedWorkflowId, 'remove');
        },
      };
    }

    return {
      handleAddStep: (workflowId: string, stepIndex: number) =>
        openDialog({
          type: PipelinesPageDialogType.STEP_SELECTOR,
          pipelineId: selectedPipeline,
          workflowId,
          stepIndex,
        })(),
      handleSelectStep: ({
        stepIndex,
        type,
        stepBundleId,
        wfId,
      }: {
        stepIndex: number;
        type: LibraryType;
        stepBundleId?: string;
        wfId?: string;
      }) => {
        switch (type) {
          case LibraryType.BUNDLE:
            openDialog({
              type: PipelinesPageDialogType.STEP_BUNDLE,
              pipelineId: selectedPipeline,
              workflowId: wfId,
              stepIndex,
            })();
            break;
          default:
            openDialog({
              type: PipelinesPageDialogType.STEP_CONFIG,
              pipelineId: selectedPipeline,
              workflowId: wfId,
              stepIndex,
              stepBundleId,
            })();
            break;
        }
      },
      handleUpgradeStep: upgradeStep,
      handleMoveStep: (workflowId: string, stepIndex: number, targetIndex: number) => {
        moveStep(workflowId, stepIndex, targetIndex);
        handleStepActionDialogChange({
          workflowId,
          stepIndex,
          targetIndex,
          action: 'move',
        });
      },
      handleCloneStep: (workflowId: string, stepIndex: number) => {
        cloneStep(workflowId, stepIndex);
        handleStepActionDialogChange({
          workflowId,
          stepIndex,
          action: 'clone',
        });
      },
      handleDeleteStep: (workflowId: string, stepIndex: number) => {
        deleteStep(workflowId, stepIndex);
        handleStepActionDialogChange({
          workflowId,
          stepIndex,
          action: 'remove',
        });
      },
      handleAddStepToStepBundle: (stepBundleId: string, stepIndex: number) =>
        openDialog({
          type: PipelinesPageDialogType.STEP_SELECTOR,
          pipelineId: selectedPipeline,
          stepBundleId,
          stepIndex,
        })(),
      handleCloneStepInStepBundle: (stepBundleId: string, stepIndex: number) => {
        cloneStepInStepBundle(stepBundleId, stepIndex);
        handleStepActionDialogChange({
          stepBundleId,
          stepIndex,
          action: 'clone',
        });
      },
      handleDeleteStepInStepBundle: (stepBundleId: string, stepIndex: number) => {
        deleteStepInStepBundle(stepBundleId, stepIndex);
        handleStepActionDialogChange({
          stepBundleId,
          stepIndex,
          action: 'remove',
        });
      },
      handleGroupStepsToStepBundle: (workflowId: string, stepBundleId: string, stepIndex: number) => {
        groupStepsToStepBundle(workflowId, stepBundleId, stepIndex);
      },
      handleMoveStepInStepBundle: (stepBundleId: string, stepIndex: number, targetIndex: number) => {
        moveStepInStepBundle(stepBundleId, stepIndex, targetIndex);
        handleStepActionDialogChange({
          stepBundleId,
          stepIndex,
          targetIndex,
          action: 'move',
        });
      },
      handleUpgradeStepInStepBundle: upgradeStepInStepBundle,
      handleEditWorkflow: (workflowId: string, parentWorkflowId?: string) =>
        openDialog({
          type: PipelinesPageDialogType.WORKFLOW_CONFIG,
          pipelineId: selectedPipeline,
          workflowId,
          parentWorkflowId,
        })(),
      handleChainWorkflow: (workflowId: string) =>
        openDialog({
          type: PipelinesPageDialogType.CHAIN_WORKFLOW,
          pipelineId: selectedPipeline,
          workflowId,
        })(),
      handleRemoveWorkflow: (deletedWorkflowId: string) => {
        deleteElements({ nodes: [{ id: deletedWorkflowId }] });
        handleWorkflowActionDialogChange(deletedWorkflowId, 'remove');
      },
      handleChainedWorkflowsUpdate: (
        parentWorkflowId: string,
        placement: ChainedWorkflowPlacement,
        chainedIds: string[],
      ) => {
        setChainedWorkflows(parentWorkflowId, placement, chainedIds);
      },
      handleRemoveChainedWorkflow: (
        parentWorkflowId: string,
        placement: ChainedWorkflowPlacement,
        deletedWorkflowId: string,
        deletedWorkflowIndex: number,
      ) => {
        removeChainedWorkflow(parentWorkflowId, placement, deletedWorkflowId, deletedWorkflowIndex);
        handleWorkflowActionDialogChange(deletedWorkflowId, 'remove');
      },
    };
  }, [
    isGraphPipelinesEnabled,
    uses,
    upgradeStep,
    upgradeStepInStepBundle,
    workflows,
    selectedWorkflowId,
    closeDialog,
    selectedStepBundleId,
    selectedStepIndex,
    setStepIndex,
    deleteElements,
    openDialog,
    selectedPipeline,
    moveStep,
    cloneStep,
    deleteStep,
    cloneStepInStepBundle,
    deleteStepInStepBundle,
    groupStepsToStepBundle,
    moveStepInStepBundle,
    setChainedWorkflows,
    removeChainedWorkflow,
  ]);

  const containerProps = useMemo(
    () => ({
      ...defaultStyle,
      ...(selected ? selectedStyle : {}),
      ...(hovered ? hoveredStyle : {}),
    }),
    [selected, hovered],
  );

  const highlighted = selected || hovered;

  useEffect(() => {
    setEdges((edges) => {
      return edges.map((edge) => {
        if (edge.target === id) {
          return { ...edge, data: { ...edge.data, highlighted } };
        }

        return edge;
      });
    });
  }, [id, highlighted, setEdges]);

  return (
    <Box ref={ref} display="flex" zIndex={zIndex} alignItems="stretch" w={WORKFLOW_NODE_WIDTH} className="nopan">
      <LeftHandle />
      <WorkflowCard
        id={id}
        isCollapsable
        uses={uses}
        containerProps={containerProps}
        selectedStepIndex={selectedStepIndex}
        selectedWorkflowId={selectedWorkflowId}
        onAddStep={handleAddStep}
        onMoveStep={handleMoveStep}
        onCloneStep={handleCloneStep}
        onSelectStep={handleSelectStep}
        onDeleteStep={handleDeleteStep}
        onUpgradeStep={handleUpgradeStep}
        onAddStepToStepBundle={handleAddStepToStepBundle}
        onCloneStepInStepBundle={handleCloneStepInStepBundle}
        onDeleteStepInStepBundle={handleDeleteStepInStepBundle}
        onGroupStepsToStepBundle={handleGroupStepsToStepBundle}
        onMoveStepInStepBundle={handleMoveStepInStepBundle}
        onUpgradeStepInStepBundle={handleUpgradeStepInStepBundle}
        onCreateWorkflow={undefined}
        onEditWorkflow={handleEditWorkflow}
        onChainWorkflow={handleChainWorkflow}
        onRemoveWorkflow={handleRemoveWorkflow}
        onEditChainedWorkflow={handleEditWorkflow}
        onChainChainedWorkflow={handleChainWorkflow}
        onRemoveChainedWorkflow={handleRemoveChainedWorkflow}
        onChainedWorkflowsUpdate={handleChainedWorkflowsUpdate}
      />
      <RightHandle />
    </Box>
  );
};

export default memo(WorkflowNode);
