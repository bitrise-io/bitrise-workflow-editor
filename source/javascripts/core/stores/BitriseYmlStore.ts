import { createStore, ExtractState, StoreApi } from 'zustand';
import { combine } from 'zustand/middleware';
import {
  BitriseYml,
  EnvironmentItemModel,
  EnvModel,
  Meta,
  PipelineModel,
  StepBundleModel,
  StepModel,
  TriggerMap,
  TriggersModel,
  WorkflowModel,
} from '@/core/models/BitriseYml';

import { EnvVar } from '@/core/models/EnvVar';
import EnvVarService from '@/core/services/EnvVarService';
import BitriseYmlService from '@/core/services/BitriseYmlService';
import { ChainedWorkflowPlacement } from '@/core/models/Workflow';
import BitriseYmlApi from '../api/BitriseYmlApi';

export type BitriseYmlStoreState = ExtractState<typeof bitriseYmlStore>;

export type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;

export const bitriseYmlStore = createStore(
  combine(
    {
      discardKey: Date.now(),
      yml: {} as BitriseYml,
      savedYml: {} as BitriseYml,
      ymlString: '',
      savedYmlString: '',
      savedYmlVersion: '',
    },
    (set, get) => ({
      getUniqueStepIds() {
        return BitriseYmlService.getUniqueStepIds(get().yml);
      },

      // Project related actions
      updateProjectEnvVars(envVars: EnvVar[]) {
        set((state) => ({
          yml: BitriseYmlService.updateProjectEnvVars(envVars.map(EnvVarService.parseEnvVar), state.yml),
        }));
      },

      // Pipeline related actions
      addPipelineWorkflowDependency(pipelineId: string, workflowId: string, dependencyId: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.addPipelineWorkflowDependency(pipelineId, workflowId, dependencyId, state.yml),
          };
        });
      },
      addWorkflowToPipeline(pipelineId: string, workflowId: string, parentWorkflowId: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.addWorkflowToPipeline(pipelineId, workflowId, state.yml, parentWorkflowId),
          };
        });
      },
      createPipeline(pipelineId: string, basePipelineId?: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.createPipeline(pipelineId, state.yml, basePipelineId),
          };
        });
      },
      deletePipeline(pipelineId: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.deletePipeline(pipelineId, state.yml),
          };
        });
      },
      deletePipelines(pipelineIds: string[]) {
        return set((state) => {
          return {
            yml: BitriseYmlService.deletePipelines(pipelineIds, state.yml),
          };
        });
      },
      removePipelineWorkflowDependency: (pipelineId: string, workflowId: string, dependencyId: string) => {
        return set((state) => {
          return {
            yml: BitriseYmlService.removePipelineWorkflowDependency(pipelineId, workflowId, dependencyId, state.yml),
          };
        });
      },
      removeWorkflowFromPipeline(pipelineId: string, workflowId: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.removeWorkflowFromPipeline(pipelineId, workflowId, state.yml),
          };
        });
      },
      renamePipeline(pipelineId: string, newPipelineId: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.renamePipeline(pipelineId, newPipelineId, state.yml),
          };
        });
      },
      updatePipeline(pipelineId: string, pipeline: PipelineModel) {
        return set((state) => {
          return {
            yml: BitriseYmlService.updatePipeline(pipelineId, pipeline, state.yml),
          };
        });
      },
      updatePipelineTriggers(pipelineId: string, triggers: TriggersModel) {
        return set((state) => {
          return {
            yml: BitriseYmlService.updatePipelineTriggers(pipelineId, triggers, state.yml),
          };
        });
      },
      updatePipelineTriggersEnabled(pipelineId: string, isEnabled: boolean) {
        return set((state) => ({
          yml: BitriseYmlService.updatePipelineTriggersEnabled(pipelineId, isEnabled, state.yml),
        }));
      },
      updatePipelineWorkflowConditionAbortPipelineOnFailureEnabled(
        pipelineId: string,
        workflowId: string,
        abortPipelineOnFailureEnabled: boolean,
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
      updatePipelineWorkflowConditionRunIfExpression(pipelineId: string, workflowId: string, runIfExpression: string) {
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
      updatePipelineWorkflowConditionShouldAlwaysRun(pipelineId: string, workflowId: string, shouldAlwaysRun: string) {
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
      updatePipelineWorkflowParallel(pipelineId: string, workflowId: string, parallel: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.updatePipelineWorkflowParallel(pipelineId, workflowId, parallel, state.yml),
          };
        });
      },

      // Workflow related actions
      addChainedWorkflow(parentWorkflowId: string, placement: ChainedWorkflowPlacement, chainableWorkflowId: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.addChainedWorkflow(parentWorkflowId, placement, chainableWorkflowId, state.yml),
          };
        });
      },
      appendWorkflowEnvVar(workflowId: string, envVar: EnvVar) {
        return set((state) => {
          return {
            yml: BitriseYmlService.appendWorkflowEnvVar(workflowId, EnvVarService.parseEnvVar(envVar), state.yml),
          };
        });
      },
      createWorkflow(workflowId: string, baseWorkflowId?: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.createWorkflow(workflowId, state.yml, baseWorkflowId),
          };
        });
      },
      deleteWorkflow(workflowId: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.deleteWorkflow(workflowId, state.yml),
          };
        });
      },
      deleteWorkflows(workflowIds: string[]) {
        return set((state) => {
          return {
            yml: BitriseYmlService.deleteWorkflows(workflowIds, state.yml),
          };
        });
      },
      removeChainedWorkflow(
        parentWorkflowId: string,
        placement: ChainedWorkflowPlacement,
        chainedWorkflowId: string,
        chainedWorkflowIndex: number,
      ) {
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
      renameWorkflow(workflowId: string, newWorkflowId: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.renameWorkflow(workflowId, newWorkflowId, state.yml),
          };
        });
      },
      setChainedWorkflows(parentWorkflowId: string, placement: ChainedWorkflowPlacement, chainedWorkflowIds: string[]) {
        return set((state) => {
          return {
            yml: BitriseYmlService.setChainedWorkflows(parentWorkflowId, placement, chainedWorkflowIds, state.yml),
          };
        });
      },
      updateWorkflow(workflowId: string, workflow: WorkflowModel) {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateWorkflow(workflowId, workflow, state.yml),
          };
        });
      },
      updateWorkflowEnvVars(workflowId: string, envVars: EnvVar[]) {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateWorkflowEnvVars(workflowId, envVars.map(EnvVarService.parseEnvVar), state.yml),
          };
        });
      },
      updateWorkflowMeta(workflowId: string, newValues: Required<Meta>['bitrise.io']) {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateWorkflowMeta(workflowId, newValues, state.yml),
          };
        });
      },

      // Meta related actions
      updateStacksAndMachinesMeta(newValues: Required<Meta>['bitrise.io']) {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateStacksAndMachinesMeta(newValues, state.yml),
          };
        });
      },

      // Step related actions
      addStep(workflowId: string, cvs: string, to: number) {
        return set((state) => {
          return {
            yml: BitriseYmlService.addStep(workflowId, cvs, to, state.yml),
          };
        });
      },
      changeStepVersion: (workflowId: string, stepIndex: number, version: string) => {
        return set((state) => {
          return {
            yml: BitriseYmlService.changeStepVersion(workflowId, stepIndex, version, state.yml),
          };
        });
      },
      cloneStep(workflowId: string, stepIndex: number) {
        return set((state) => {
          return {
            yml: BitriseYmlService.cloneStep(workflowId, stepIndex, state.yml),
          };
        });
      },
      deleteStep(workflowId: string, selectedStepIndices: number[]) {
        return set((state) => {
          return {
            yml: BitriseYmlService.deleteStep(workflowId, selectedStepIndices, state.yml),
          };
        });
      },
      moveStep(workflowId: string, stepIndex: number, to: number) {
        return set((state) => {
          return {
            yml: BitriseYmlService.moveStep(workflowId, stepIndex, to, state.yml),
          };
        });
      },
      updateLicensePoolId(workflowId: string, licensePoolId: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateLicensePoolId(workflowId, licensePoolId, state.yml),
          };
        });
      },
      updateStep: (workflowId: string, stepIndex: number, newValues: Omit<StepModel, 'inputs' | 'outputs'>) => {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateStep(workflowId, stepIndex, newValues, state.yml),
          };
        });
      },
      updateStepInputs: (workflowId: string, stepIndex: number, inputs: EnvModel) => {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateStepInputs(workflowId, stepIndex, inputs, state.yml),
          };
        });
      },
      updateTriggerMap(triggerMap: TriggerMap) {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateTriggerMap(triggerMap, state.yml),
          };
        });
      },
      updateWorkflowTriggers(workflowId: string, triggers: TriggersModel) {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateWorkflowTriggers(workflowId, triggers, state.yml),
          };
        });
      },
      updateWorkflowTriggersEnabled(workflowId: string, isEnabled: boolean) {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateWorkflowTriggersEnabled(workflowId, isEnabled, state.yml),
          };
        });
      },

      // Step Bundle related actions
      addStepToStepBundle(stepBundleId: string, cvs: string, to: number) {
        return set((state) => {
          return {
            yml: BitriseYmlService.addStepToStepBundle(stepBundleId, cvs, to, state.yml),
          };
        });
      },
      appendStepBundleInput(bundleId: string, newInput: EnvironmentItemModel) {
        return set((state) => {
          return {
            yml: BitriseYmlService.appendStepBundleInput(bundleId, newInput, state.yml),
          };
        });
      },
      changeStepVersionInStepBundle: (stepBundleId: string, stepIndex: number, version: string) => {
        return set((state) => {
          return {
            yml: BitriseYmlService.changeStepVersionInStepBundle(stepBundleId, stepIndex, version, state.yml),
          };
        });
      },
      cloneStepInStepBundle(stepBundleId: string, stepIndex: number) {
        return set((state) => {
          return {
            yml: BitriseYmlService.cloneStepInStepBundle(stepBundleId, stepIndex, state.yml),
          };
        });
      },
      createStepBundle(stepBundleId: string, baseStepBundleId?: string, baseWorkflowId?: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.createStepBundle(stepBundleId, state.yml, baseStepBundleId, baseWorkflowId),
          };
        });
      },
      deleteStepBundle(stepBundleId: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.deleteStepBundle(stepBundleId, state.yml),
          };
        });
      },
      deleteStepBundleInput(bundleId: string, index: number) {
        return set((state) => {
          return {
            yml: BitriseYmlService.deleteStepBundleInput(bundleId, index, state.yml),
          };
        });
      },
      deleteStepInStepBundle(stepBundleId: string, selectedStepIndices: number[]) {
        return set((state) => {
          return {
            yml: BitriseYmlService.deleteStepInStepBundle(stepBundleId, selectedStepIndices, state.yml),
          };
        });
      },
      groupStepsToStepBundle(
        parentWorkflowId: string | undefined,
        parentStepBundleId: string | undefined,
        newStepBundleId: string,
        selectedStepIndices: number[],
      ) {
        return set((state) => {
          return {
            yml: BitriseYmlService.groupStepsToStepBundle(
              parentWorkflowId,
              parentStepBundleId,
              newStepBundleId,
              selectedStepIndices,
              state.yml,
            ),
          };
        });
      },
      moveStepInStepBundle(stepBundleId: string, stepIndex: number, to: number) {
        return set((state) => {
          return {
            yml: BitriseYmlService.moveStepInStepBundle(stepBundleId, stepIndex, to, state.yml),
          };
        });
      },
      renameStepBundle(stepBundleId: string, newStepBundleId: string) {
        return set((state) => {
          return {
            yml: BitriseYmlService.renameStepBundle(stepBundleId, newStepBundleId, state.yml),
          };
        });
      },
      updateStepBundle: (stepBundleId: string, stepBundle: StepBundleModel) => {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateStepBundle(stepBundleId, stepBundle, state.yml),
          };
        });
      },
      updateStepBundleInput(bundleId: string, index: number, newInput: EnvironmentItemModel) {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateStepBundleInput(bundleId, index, newInput, state.yml),
          };
        });
      },
      updateStepBundleInputInstanceValue(
        key: string,
        newValue: string,
        parentStepBundleId: string | undefined,
        parentWorkflowId: string | undefined,
        cvs: string,
        stepIndex: number,
      ) {
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
      updateStepInStepBundle: (
        stepBundleId: string,
        stepIndex: number,
        newValues: Omit<StepModel, 'inputs' | 'outputs'>,
      ) => {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateStepInStepBundle(stepBundleId, stepIndex, newValues, state.yml),
          };
        });
      },
      updateStepInputsInStepBundle: (stepBundleId: string, stepIndex: number, inputs: EnvModel) => {
        return set((state) => {
          return {
            yml: BitriseYmlService.updateStepInputsInStepBundle(stepBundleId, stepIndex, inputs, state.yml),
          };
        });
      },
    }),
  ),
);

export function updateYmlStringAndSyncYml(ymlString?: string) {
  try {
    bitriseYmlStore.setState({
      ymlString,
      yml: BitriseYmlApi.fromYml(ymlString || ''),
    });
  } catch {
    // NOTE: Monaco editor will show error if the yml is invalid
    bitriseYmlStore.setState({ ymlString });
  }
}

export function initFromServerResponse({ ymlString, version }: { ymlString: string; version: string }) {
  bitriseYmlStore.setState({
    yml: BitriseYmlApi.fromYml(ymlString),
    savedYml: BitriseYmlApi.fromYml(ymlString),
    ymlString,
    savedYmlString: ymlString,
    savedYmlVersion: version,
  });
}
