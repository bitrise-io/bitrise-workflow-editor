import { createStore, StoreApi } from 'zustand';
import { BitriseYml, Meta } from '@/core/models/BitriseYml';
import { PipelineYmlObject } from '@/core/models/Pipeline';
import { ChainedWorkflowPlacement, WorkflowYmlObject } from '@/core/models/Workflow';
import BitriseYmlService from '@/core/models/BitriseYmlService';
import { StepInputVariable, StepYmlObject } from '@/core/models/Step';
import { EnvVar } from '../models/EnvVar';
import EnvVarService from '../models/EnvVarService';
import { TriggerMapYml } from '../models/TriggerMap';

type BitriseYmlStoreState = {
  yml: BitriseYml;
  defaultMeta?: Meta;

  getUniqueStepIds: () => string[];

  // Pipeline related actions
  createPipeline: (pipelineId: string, basePipelineId?: string) => void;
  renamePipeline: (pipelineId: string, newPipelineId: string) => void;
  updatePipeline: (pipelineId: string, pipeline: PipelineYmlObject) => void;
  deletePipeline: (pipelineId: string) => void;
  deletePipelines: (pipelineIds: string[]) => void;
  addWorkflowToPipeline: (pipelineId: string, workflowId: string, parentWorkflowId?: string) => void;
  removeWorkflowFromPipeline: (pipelineId: string, workflowId: string) => void;
  addPipelineWorkflowDependency: (pipelineId: string, workflowId: string, dependencyId: string) => void;
  removePipelineWorkflowDependency: (pipelineId: string, workflowId: string, dependencyId: string) => void;
  updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled: (
    pipelineId: string,
    workflowId: string,
    abortPipelineOnFailureEnabled: boolean,
  ) => void;
  updatePipelineWorkflowConditionShouldAlwaysRun: (
    pipelineId: string,
    workflowId: string,
    shouldAlwaysRun: string,
  ) => void;
  updatePipelineWorkflowConditionRunIfExpression: (pipelineId: string, workflowId: string, expression: string) => void;

  // Workflow related actions
  createWorkflow: (workflowId: string, baseWorkflowId?: string) => void;
  renameWorkflow: (workflowId: string, newWorkflowId: string) => void;
  updateWorkflow: (workflowId: string, workflow: WorkflowYmlObject) => void;
  deleteWorkflow: (workflowId: string) => void;
  deleteWorkflows: (workflowIds: string[]) => void;
  setChainedWorkflows: (
    parentWorkflowId: string,
    placement: ChainedWorkflowPlacement,
    chainedWorkflowIds: string[],
  ) => void;
  addChainedWorkflow: (
    parentWorkflowId: string,
    placement: ChainedWorkflowPlacement,
    chainableWorkflowId: string,
  ) => void;
  removeChainedWorkflow: (
    parentWorkflowId: string,
    placement: ChainedWorkflowPlacement,
    chainedWorkflowId: string,
    chainedWorkflowIndex: number,
  ) => void;
  updateStackAndMachine: (workflowId: string, stack: string, machineTypeId: string) => void;
  appendWorkflowEnvVar: (workflowId: string, envVar: EnvVar) => void;
  updateWorkflowEnvVars: (workflowId: string, envVars: EnvVar[]) => void;

  // Step related actions
  addStep: (workflowId: string, cvs: string, to: number) => void;
  moveStep: (workflowId: string, stepIndex: number, to: number) => void;
  cloneStep: (workflowId: string, stepIndex: number) => void;
  updateStep: (
    workflowId: string,
    stepIndex: number,
    newValues: Omit<StepYmlObject, 'inputs' | 'outputs'>,
    defaultValues: Omit<StepYmlObject, 'inputs' | 'outputs'>,
  ) => void;
  updateStepInputs: (
    workflowId: string,
    stepIndex: number,
    inputs: StepInputVariable[],
    defaultInputs: StepInputVariable[],
  ) => void;
  changeStepVersion: (workflowId: string, stepIndex: number, version: string) => void;
  deleteStep: (workflowId: string, stepIndex: number) => void;
  updateTriggerMap: (newTriggerMap: TriggerMapYml) => void;
  updateWorkflowTriggers: (workflowId: string, triggers: WorkflowYmlObject['triggers']) => void;
  updateWorkflowTriggersEnabled: (workflowId: string, isEnabled: boolean) => void;
};

type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;

function create(yml: BitriseYml, defaultMeta?: Meta): BitriseYmlStore {
  return createStore<BitriseYmlStoreState>()((set, get) => ({
    yml,
    defaultMeta,
    getUniqueStepIds() {
      return BitriseYmlService.getUniqueStepIds(get().yml);
    },

    // Pipeline related actions
    createPipeline(pipelineId, basePipelineId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.createPipeline(pipelineId, state.yml, basePipelineId),
        };
      });
    },
    renamePipeline(pipelineId, newPipelineId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.renamePipeline(pipelineId, newPipelineId, state.yml),
        };
      });
    },
    updatePipeline(pipelineId, pipeline) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updatePipeline(pipelineId, pipeline, state.yml),
        };
      });
    },
    deletePipeline(pipelineId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deletePipeline(pipelineId, state.yml),
        };
      });
    },
    deletePipelines(pipelineIds) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deletePipelines(pipelineIds, state.yml),
        };
      });
    },
    addWorkflowToPipeline(pipelineId, workflowId, parentWorkflowId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.addWorkflowToPipeline(pipelineId, workflowId, state.yml, parentWorkflowId),
        };
      });
    },
    removeWorkflowFromPipeline(pipelineId, workflowId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.removeWorkflowFromPipeline(pipelineId, workflowId, state.yml),
        };
      });
    },
    addPipelineWorkflowDependency(pipelineId, workflowId, dependencyId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.addPipelineWorkflowDependency(pipelineId, workflowId, dependencyId, state.yml),
        };
      });
    },
    removePipelineWorkflowDependency: (pipelineId, workflowId, dependencyId) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.removePipelineWorkflowDependency(pipelineId, workflowId, dependencyId, state.yml),
        };
      });
    },
    updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled(
      pipelineId,
      workflowId,
      abortPipelineOnFailureEnabled,
    ) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updatePipelineWorkflowConditionAbortPipelineOnFailure(
            pipelineId,
            workflowId,
            abortPipelineOnFailureEnabled,
            state.yml,
          ),
        };
      });
    },
    updatePipelineWorkflowConditionShouldAlwaysRun(pipelineId, workflowId, shouldAlwaysRun) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updatePipelineWorkflowConditionShouldAlwaysRun(
            pipelineId,
            workflowId,
            shouldAlwaysRun,
            state.yml,
          ),
        };
      });
    },
    updatePipelineWorkflowConditionRunIfExpression(pipelineId, workflowId, runIfExpression) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updatePipelineWorkflowConditionRunIfExpression(
            pipelineId,
            workflowId,
            runIfExpression,
            state.yml,
          ),
        };
      });
    },

    // Workflow related actions
    createWorkflow(workflowId, baseWorkflowId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.createWorkflow(workflowId, state.yml, baseWorkflowId),
        };
      });
    },
    renameWorkflow(workflowId, newWorkflowId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.renameWorkflow(workflowId, newWorkflowId, state.yml),
        };
      });
    },
    updateWorkflow(workflowId, workflow) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateWorkflow(workflowId, workflow, state.yml),
        };
      });
    },
    deleteWorkflow(workflowId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deleteWorkflow(workflowId, state.yml),
        };
      });
    },
    deleteWorkflows(workflowIds) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deleteWorkflows(workflowIds, state.yml),
        };
      });
    },
    setChainedWorkflows(parentWorkflowId, placement, chainedWorkflowIds) {
      return set((state) => {
        return {
          yml: BitriseYmlService.setChainedWorkflows(parentWorkflowId, placement, chainedWorkflowIds, state.yml),
        };
      });
    },
    addChainedWorkflow(parentWorkflowId, placement, chainableWorkflowId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.addChainedWorkflow(parentWorkflowId, placement, chainableWorkflowId, state.yml),
        };
      });
    },
    removeChainedWorkflow(parentWorkflowId, placement, chainedWorkflowId, chainedWorkflowIndex) {
      return set((state) => {
        return {
          yml: BitriseYmlService.removeChainedWorkflow(
            parentWorkflowId,
            placement,
            chainedWorkflowId,
            chainedWorkflowIndex,
            state.yml,
          ),
        };
      });
    },
    updateStackAndMachine(workflowId, stack, machineTypeId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStackAndMachine(workflowId, stack, machineTypeId, state.yml),
        };
      });
    },
    appendWorkflowEnvVar(workflowId, envVar) {
      return set((state) => {
        return {
          yml: BitriseYmlService.appendWorkflowEnvVar(workflowId, EnvVarService.parseEnvVar(envVar), state.yml),
        };
      });
    },
    updateWorkflowEnvVars(workflowId, envVars) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateWorkflowEnvVars(workflowId, envVars.map(EnvVarService.parseEnvVar), state.yml),
        };
      });
    },

    // Step related actions
    addStep(workflowId, cvs, to) {
      return set((state) => {
        return {
          yml: BitriseYmlService.addStep(workflowId, cvs, to, state.yml),
        };
      });
    },
    moveStep(workflowId, stepIndex, to) {
      return set((state) => {
        return {
          yml: BitriseYmlService.moveStep(workflowId, stepIndex, to, state.yml),
        };
      });
    },
    cloneStep(workflowId, stepIndex) {
      return set((state) => {
        return {
          yml: BitriseYmlService.cloneStep(workflowId, stepIndex, state.yml),
        };
      });
    },
    updateStep: (workflowId, stepIndex, newValues, defaultValues) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStep(workflowId, stepIndex, newValues, defaultValues, state.yml),
        };
      });
    },
    updateStepInputs: (workflowId, stepIndex, inputs, defaultInputs) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStepInputs(workflowId, stepIndex, inputs, defaultInputs, state.yml),
        };
      });
    },
    changeStepVersion: (workflowId, stepIndex, version) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.changeStepVersion(workflowId, stepIndex, version, state.yml),
        };
      });
    },
    deleteStep(workflowId, stepIndex) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deleteStep(workflowId, stepIndex, state.yml),
        };
      });
    },
    updateTriggerMap(triggerMap) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateTriggerMap(triggerMap, state.yml),
        };
      });
    },
    updateWorkflowTriggers(workflowId, triggers) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateWorkflowTriggers(workflowId, triggers, state.yml),
        };
      });
    },
    updateWorkflowTriggersEnabled(workflowId, isEnabled) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateWorkflowTriggersEnabled(workflowId, isEnabled, state.yml),
        };
      });
    },
  }));
}

export { BitriseYmlStore, BitriseYmlStoreState };

export default {
  create,
};
