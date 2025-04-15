import { Box, CardProps } from '@bitrise/bitkit';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { isEqual } from 'es-toolkit';
import { memo, useEffect, useMemo, useRef } from 'react';
import { useHover, useResizeObserver } from 'usehooks-ts';

import { WorkflowCard } from '@/components/unified-editor';
import { SelectionParent } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import { LibraryType } from '@/core/models/Step';
import { ChainedWorkflowPlacement } from '@/core/models/Workflow';
import StepBundleService from '@/core/services/StepBundleService';
import { moveStepIndices } from '@/core/services/StepService';
import WorkflowService from '@/core/services/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useWorkflows } from '@/hooks/useWorkflows';

import usePipelineSelector from '../../../../hooks/usePipelineSelector';
import { PipelinesPageDialogType, usePipelinesPageStore } from '../../../../PipelinesPage.store';
import { WORKFLOW_NODE_WIDTH } from '../GraphPipelineCanvas.const';
import { GraphPipelineEdgeType, GraphPipelineNodeType } from '../GraphPipelineCanvas.types';
import { LeftHandle, RightHandle } from './Handles';

type Props = NodeProps<GraphPipelineNodeType>;

const defaultStyle = {
  variant: 'outline',
  boxShadow: 'small',
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

const ParallelWorkflowIndicator = memo(() => {
  return (
    <>
      <Box
        h="24"
        left="24"
        right="24"
        zIndex={-1}
        bottom="-4"
        borderRadius="8"
        boxShadow="small"
        position="absolute"
        border="1px solid"
        borderColor="border/regular"
        backgroundColor="background/primary"
      />
      <Box
        h="24"
        left="32"
        right="32"
        zIndex={-2}
        bottom="-8"
        borderRadius="8"
        boxShadow="small"
        position="absolute"
        border="1px solid"
        borderColor="border/regular"
        backgroundColor="background/primary"
      />
    </>
  );
});

const WorkflowNode = ({ id, selected, zIndex, data }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useHover(ref);
  const workflows = useWorkflows();
  const stepBundles = useStepBundles();
  const { selectedPipeline } = usePipelineSelector();

  const openDialog = usePipelinesPageStore((s) => s.openDialog);
  const closeDialog = usePipelinesPageStore((s) => s.closeDialog);
  const selectedStepIndices = usePipelinesPageStore((s) => s.selectedStepIndices);
  const selectionParent = usePipelinesPageStore((s) => s.selectionParent);
  const setSelectedStepIndices = usePipelinesPageStore((s) => s.setSelectedStepIndices);
  const selectedWorkflowId = usePipelinesPageStore((s) => s.workflowId);

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
    onResize: ({ height }) => {
      requestAnimationFrame(() => updateNode(id, { height }));
    },
  });

  const uses = 'uses' in data ? data.uses : undefined;
  const parallel = 'parallel' in data ? data.parallel : undefined;
  const shouldDisplayAsParallelWorkflow = Boolean(parallel);

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

    function handleStepActionChange({
      workflowId,
      stepBundleId,
      stepIndex,
      stepIndices,
      targetIndex,
      action,
      cvs,
    }: {
      workflowId?: string;
      stepBundleId?: string;
      stepIndex: number;
      stepIndices?: number[];
      targetIndex?: number;
      action: 'move' | 'clone' | 'remove';
      cvs?: string;
    }) {
      switch (action) {
        case 'move': {
          // Adjust index of the selected steps
          if (targetIndex !== undefined) {
            if (
              (selectionParent?.id === workflowId && selectionParent?.type === 'workflow') ||
              (selectionParent?.id === stepBundleId && selectionParent?.type === 'stepBundle')
            ) {
              setSelectedStepIndices(moveStepIndices(action, selectedStepIndices, stepIndex, targetIndex));
            }
          }
          break;
        }
        case 'clone': {
          // Adjust index of the selected steps
          if (
            (selectionParent?.id === workflowId && selectionParent?.type === 'workflow') ||
            (selectionParent?.id === stepBundleId && selectionParent?.type === 'stepBundle')
          ) {
            setSelectedStepIndices(moveStepIndices(action, selectedStepIndices, stepIndex, targetIndex));
          }
          break;
        }
        case 'remove': {
          if (
            (selectionParent?.id === workflowId && selectionParent?.type === 'workflow') ||
            (selectionParent?.id === stepBundleId && selectionParent?.type === 'stepBundle')
          ) {
            // Close the dialog if the selected step is deleted
            if (selectedStepIndices.includes(stepIndex)) {
              closeDialog();
            }
            // Adjust index of the selected steps
            if (stepIndices && selectedStepIndices.includes(stepIndices[0])) {
              setSelectedStepIndices([]);
            } else {
              setSelectedStepIndices(
                moveStepIndices(action, selectedStepIndices, stepIndices ? stepIndices[0] : stepIndex),
              );
            }
          }
          if (cvs?.startsWith('bundle::')) {
            const bundleId = StepBundleService.cvsToId(cvs);
            if (selectionParent?.id === bundleId) {
              closeDialog();
            }
            if (
              selectionParent?.id &&
              StepBundleService.getStepBundleChain(stepBundles, bundleId).includes(selectionParent?.id)
            ) {
              closeDialog();
            }
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
          selectedStepIndices: [stepIndex],
          selectionParent: {
            id: workflowId || '',
            type: 'workflow',
          },
        })(),
      handleSelectStep: ({
        stepIndex,
        type,
        stepBundleId,
        wfId,
        isMultiple,
      }: {
        stepIndex: number;
        type: LibraryType;
        stepBundleId?: string;
        wfId?: string;
        isMultiple?: boolean;
      }) => {
        const newSelectionParent: SelectionParent = {
          id: stepBundleId || wfId || '',
          type: stepBundleId ? 'stepBundle' : 'workflow',
        };
        if (isMultiple) {
          let newIndices = [...selectedStepIndices, stepIndex];
          if (selectedStepIndices.includes(stepIndex)) {
            newIndices = selectedStepIndices.filter((i: number) => i !== stepIndex);
          }
          if (newIndices.length !== 1) {
            closeDialog();
          }
          if (!isEqual(selectionParent, newSelectionParent)) {
            newIndices = [stepIndex];
          }
          usePipelinesPageStore.setState({
            workflowId: wfId || '',
            stepBundleId: stepBundleId || '',
            selectedStepIndices: newIndices,
            selectionParent: newSelectionParent,
          });
        } else {
          switch (type) {
            case LibraryType.BUNDLE:
              openDialog({
                type: PipelinesPageDialogType.STEP_BUNDLE,
                pipelineId: selectedPipeline,
                workflowId: wfId,
                stepBundleId,
                selectedStepIndices: [stepIndex],
                selectionParent: newSelectionParent,
              })();
              break;
            default:
              openDialog({
                type: PipelinesPageDialogType.STEP_CONFIG,
                pipelineId: selectedPipeline,
                workflowId: wfId,
                selectedStepIndices: [stepIndex],
                stepBundleId,
                selectionParent: newSelectionParent,
              })();
              break;
          }
        }
      },
      handleUpgradeStep: upgradeStep,
      handleMoveStep: (workflowId: string, stepIndex: number, targetIndex: number) => {
        moveStep(workflowId, stepIndex, targetIndex);
        handleStepActionChange({
          workflowId,
          stepIndex,
          targetIndex,
          action: 'move',
        });
      },
      handleCloneStep: (workflowId: string, stepIndex: number) => {
        cloneStep(workflowId, stepIndex);
        handleStepActionChange({
          workflowId,
          stepIndex,
          action: 'clone',
        });
      },
      handleDeleteStep: (workflowId: string, stepIndices: number[], cvs?: string) => {
        deleteStep(workflowId, stepIndices);
        handleStepActionChange({
          workflowId,
          stepIndex: stepIndices[0],
          stepIndices,
          action: 'remove',
          cvs,
        });
      },
      handleAddStepToStepBundle: (stepBundleId: string, stepIndex: number) =>
        openDialog({
          type: PipelinesPageDialogType.STEP_SELECTOR,
          pipelineId: selectedPipeline,
          stepBundleId,
          selectedStepIndices: [stepIndex],
          selectionParent: {
            id: stepBundleId || '',
            type: 'stepBundle',
          },
        })(),
      handleCloneStepInStepBundle: (stepBundleId: string, stepIndex: number) => {
        cloneStepInStepBundle(stepBundleId, stepIndex);
        handleStepActionChange({
          stepBundleId,
          stepIndex,
          action: 'clone',
        });
      },
      handleDeleteStepInStepBundle: (stepBundleId: string, stepIndices: number[]) => {
        deleteStepInStepBundle(stepBundleId, stepIndices);
        handleStepActionChange({
          stepBundleId,
          stepIndex: stepIndices[0],
          stepIndices,
          action: 'remove',
        });
      },
      handleGroupStepsToStepBundle: (
        parentWorkflowId: string | undefined,
        parentStepBundleId: string | undefined,
        newStepBundleId: string,
        stepIndices: number[],
      ) => {
        groupStepsToStepBundle(parentWorkflowId, parentStepBundleId, newStepBundleId, stepIndices);
        setSelectedStepIndices([Math.min(...stepIndices)]);
        if (parentWorkflowId) {
          openDialog({
            type: PipelinesPageDialogType.STEP_BUNDLE,
            workflowId: parentWorkflowId,
            stepBundleId: newStepBundleId,
            selectedStepIndices: [Math.min(...stepIndices)],
          })();
        } else if (parentStepBundleId) {
          openDialog({
            type: PipelinesPageDialogType.STEP_BUNDLE,
            stepBundleId: parentStepBundleId,
            newStepBundleId,
            selectedStepIndices: [Math.min(...stepIndices)],
          })();
        }
      },
      handleMoveStepInStepBundle: (stepBundleId: string, stepIndex: number, targetIndex: number) => {
        moveStepInStepBundle(stepBundleId, stepIndex, targetIndex);
        handleStepActionChange({
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
    uses,
    upgradeStep,
    upgradeStepInStepBundle,
    workflows,
    selectedWorkflowId,
    closeDialog,
    selectionParent,
    setSelectedStepIndices,
    selectedStepIndices,
    stepBundles,
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
        parallel={parallel}
        containerProps={containerProps}
        selectedStepIndices={selectedStepIndices}
        selectionParent={selectionParent}
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
      {shouldDisplayAsParallelWorkflow && <ParallelWorkflowIndicator />}
    </Box>
  );
};

export default memo(WorkflowNode);
