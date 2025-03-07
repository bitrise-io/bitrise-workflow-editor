import { createStore, StoreApi } from 'zustand';

import {
  Meta,
  EnvModel,
  StepModel,
  BitriseYml,
  TriggerMap,
  PipelineModel,
  TriggersModel,
  WorkflowModel,
  StepBundleModel,
  EnvironmentItemModel,
} from '@/core/models/BitriseYml';

import { EnvVar } from '@/core/models/EnvVar';
import EnvVarService from '@/core/services/EnvVarService';
import BitriseYmlService from '@/core/services/BitriseYmlService';
import { ChainedWorkflowPlacement } from '@/core/models/Workflow';

type BitriseYmlStoreState = {
  yml: BitriseYml;
  defaultMeta?: Meta;

  getUniqueStepIds: () => string[];

  // Project related actions
  updateProjectEnvVars: (envVars: EnvVar[]) => void;

  // Pipeline related actions
  createPipeline: (pipelineId: string, basePipelineId?: string) => void;
  renamePipeline: (pipelineId: string, newPipelineId: string) => void;
  updatePipeline: (pipelineId: string, pipeline: PipelineModel) => void;
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
  updatePipelineWorkflowParallel: (pipelineId: string, workflowId: string, parallel: string) => void;

  // Workflow related actions
  createWorkflow: (workflowId: string, baseWorkflowId?: string) => void;
  renameWorkflow: (workflowId: string, newWorkflowId: string) => void;
  updateWorkflow: (workflowId: string, workflow: WorkflowModel) => void;
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
  updateWorkflowMeta: (workflowId: string, newValues: Required<Meta>['bitrise.io']) => void;
  appendWorkflowEnvVar: (workflowId: string, envVar: EnvVar) => void;
  updateWorkflowEnvVars: (workflowId: string, envVars: EnvVar[]) => void;

  // Step related actions
  addStep: (workflowId: string, cvs: string, to: number) => void;
  moveStep: (workflowId: string, stepIndex: number, to: number) => void;
  cloneStep: (workflowId: string, stepIndex: number) => void;
  updateStep: (workflowId: string, stepIndex: number, newValues: Omit<StepModel, 'inputs' | 'outputs'>) => void;
  updateStepInputs: (workflowId: string, stepIndex: number, inputs: EnvModel) => void;
  changeStepVersion: (workflowId: string, stepIndex: number, version: string) => void;
  deleteStep: (workflowId: string, selectedStepIndices: number[]) => void;
  updateTriggerMap: (newTriggerMap: TriggerMap) => void;
  updateWorkflowTriggers: (workflowId: string, triggers: TriggersModel) => void;
  updateWorkflowTriggersEnabled: (workflowId: string, isEnabled: boolean) => void;

  // Step Bundle related actions
  addStepToStepBundle: (stepBundleId: string, cvs: string, to: number) => void;
  changeStepVersionInStepBundle: (stepBundleId: string, stepIndex: number, version: string) => void;
  cloneStepInStepBundle: (stepBundleId: string, stepIndex: number) => void;
  createStepBundle: (stepBundleId: string, baseStepBundleId?: string) => void;
  deleteStepBundle: (stepBundleId: string) => void;
  deleteStepInStepBundle: (stepBundleId: string, selectedStepIndices: number[]) => void;
  groupStepsToStepBundle: (
    workflowId: string | undefined,
    stepBundleId: string | undefined,
    newStepBundleId: string,
    selectedStepIndices: number[],
  ) => void;
  moveStepInStepBundle: (stepBundleId: string, stepIndex: number, to: number) => void;
  renameStepBundle: (stepBundleId: string, newStepBundleId: string) => void;
  updateStepBundle: (stepBundleId: string, stepBundle: StepBundleModel) => void;
  updateStepInStepBundle: (
    stepBundleId: string,
    stepIndex: number,
    newValues: Omit<StepModel, 'inputs' | 'outputs'>,
  ) => void;
  updateStepInputsInStepBundle: (stepBundleId: string, stepIndex: number, inputs: EnvModel) => void;
  updatePipelineTriggers: (pipelineId: string, triggers: TriggersModel) => void;
  updatePipelineTriggersEnabled: (pipelineId: string, isEnabled: boolean) => void;
  updateLicensePoolId: (workflowId: string, stack: string, machineTypeId: string) => void;
  appendStepBundleInput: (bundleId: string, newInput: EnvironmentItemModel) => void;
  deleteStepBundleInput: (bundleId: string, index: number) => void;
  updateStepBundleInput: (bundleId: string, index: number, newInput: EnvironmentItemModel) => void;
  updateStepBundleInputInstanceValue: (
    key: string,
    newValue: string,
    parentStepBundleId: string | undefined,
    parentWorkflowId: string | undefined,
    cvs: string,
    stepIndex: number,
  ) => void;
};

type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;

function create(yml: BitriseYml, defaultMeta?: Meta): BitriseYmlStore {
  return createStore<BitriseYmlStoreState>()((set, get) => ({
    yml,
    defaultMeta,
    getUniqueStepIds() {
      return BitriseYmlService.getUniqueStepIds(get().yml);
    },

    // Project related actions
    updateProjectEnvVars(envVars) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateProjectEnvVars(envVars.map(EnvVarService.parseEnvVar), state.yml),
        };
      });
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
    updatePipelineWorkflowParallel(pipelineId, workflowId, parallel) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updatePipelineWorkflowParallel(pipelineId, workflowId, parallel, state.yml),
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
    updateWorkflowMeta(workflowId, newValues) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateWorkflowMeta(workflowId, newValues, state.yml),
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
    updateStep: (workflowId, stepIndex, newValues) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStep(workflowId, stepIndex, newValues, state.yml),
        };
      });
    },
    updateStepInputs: (workflowId, stepIndex, inputs) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStepInputs(workflowId, stepIndex, inputs, state.yml),
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
    deleteStep(workflowId, selectedStepIndices) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deleteStep(workflowId, selectedStepIndices, state.yml),
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

    // Step Bundle related actions
    addStepToStepBundle(stepBundleId, cvs, to) {
      return set((state) => {
        return {
          yml: BitriseYmlService.addStepToStepBundle(stepBundleId, cvs, to, state.yml),
        };
      });
    },
    changeStepVersionInStepBundle: (stepBundleId, stepIndex, version) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.changeStepVersionInStepBundle(stepBundleId, stepIndex, version, state.yml),
        };
      });
    },
    cloneStepInStepBundle(stepBundleId, stepIndex) {
      return set((state) => {
        return {
          yml: BitriseYmlService.cloneStepInStepBundle(stepBundleId, stepIndex, state.yml),
        };
      });
    },
    createStepBundle(stepBundleId, baseStepBundleId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.createStepBundle(stepBundleId, state.yml, baseStepBundleId),
        };
      });
    },
    deleteStepBundle(stepBundleId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deleteStepBundle(stepBundleId, state.yml),
        };
      });
    },
    deleteStepInStepBundle(stepBundleId, selectedStepIndices) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deleteStepInStepBundle(stepBundleId, selectedStepIndices, state.yml),
        };
      });
    },
    groupStepsToStepBundle(workflowId, stepBundleId, newStepBundleId, selectedStepIndices) {
      return set((state) => {
        return {
          yml: BitriseYmlService.groupStepsToStepBundle(
            workflowId,
            stepBundleId,
            newStepBundleId,
            selectedStepIndices,
            state.yml,
          ),
        };
      });
    },
    moveStepInStepBundle(stepBundleId, stepIndex, to) {
      return set((state) => {
        return {
          yml: BitriseYmlService.moveStepInStepBundle(stepBundleId, stepIndex, to, state.yml),
        };
      });
    },
    renameStepBundle(stepBundleId, newStepBundleId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.renameStepBundle(stepBundleId, newStepBundleId, state.yml),
        };
      });
    },
    updateStepBundle: (stepBundleId, stepBundle) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStepBundle(stepBundleId, stepBundle, state.yml),
        };
      });
    },
    updateStepInStepBundle: (stepBundleId, stepIndex, newValues) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStepInStepBundle(stepBundleId, stepIndex, newValues, state.yml),
        };
      });
    },
    updateStepInputsInStepBundle: (stepBundleId, stepIndex, inputs) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStepInputsInStepBundle(stepBundleId, stepIndex, inputs, state.yml),
        };
      });
    },
    updatePipelineTriggers(pipelineId, triggers) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updatePipelineTriggers(pipelineId, triggers, state.yml),
        };
      });
    },
    updatePipelineTriggersEnabled(pipelineId, isEnabled) {
      return set((state) => ({
        yml: BitriseYmlService.updatePipelineTriggersEnabled(pipelineId, isEnabled, state.yml),
      }));
    },
    updateLicensePoolId(workflowId, licensePoolId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateLicensePoolId(workflowId, licensePoolId, state.yml),
        };
      });
    },
    appendStepBundleInput(bundleId, newInput) {
      return set((state) => {
        return {
          yml: BitriseYmlService.appendStepBundleInput(bundleId, newInput, state.yml),
        };
      });
    },
    deleteStepBundleInput(bundleId, index) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deleteStepBundleInput(bundleId, index, state.yml),
        };
      });
    },
    updateStepBundleInput(bundleId, index, newInput) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStepBundleInput(bundleId, index, newInput, state.yml),
        };
      });
    },
    updateStepBundleInputInstanceValue(key, newValue, parentStepBundleId, parentWorkflowId, cvs, stepIndex) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStepBundleInputInstanceValue(
            key,
            newValue,
            parentStepBundleId,
            parentWorkflowId,
            cvs,
            stepIndex,
            state.yml,
          ),
        };
      });
    },
  }));
}

export { BitriseYmlStore, BitriseYmlStoreState };

export default {
  create,
};
