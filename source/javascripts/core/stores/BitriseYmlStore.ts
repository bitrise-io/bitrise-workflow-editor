import { omitBy } from 'es-toolkit';
import { Document, parseDocument } from 'yaml';
import { createStore, ExtractState, StoreApi } from 'zustand';
import { combine } from 'zustand/middleware';

import {
  BitriseYml,
  EnvironmentItemModel,
  EnvModel,
  PipelineModel,
  StepBundleModel,
  TriggerMap,
  TriggersModel,
  WorkflowModel,
} from '@/core/models/BitriseYml';
import { ChainedWorkflowPlacement } from '@/core/models/Workflow';
import BitriseYmlService from '@/core/services/BitriseYmlService';

import BitriseYmlApi from '../api/BitriseYmlApi';
import YamlUtils from '../utils/YamlUtils';

export type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;
export type BitriseYmlStoreState = ExtractState<typeof bitriseYmlStore>;

export type YamlMutator = (ctx: YamlMutatorCtx) => Document;
export type YamlMutatorCtx = { doc: Document; paths: string[] };

export const bitriseYmlStore = createStore(
  combine(
    {
      discardKey: Date.now(),
      yml: {} as BitriseYml,
      ymlDocument: new Document(),
      savedYmlDocument: new Document(),
      savedYmlVersion: '',
    },
    (set, get) => ({
      getUniqueStepIds() {
        return BitriseYmlService.getUniqueStepIds(get().yml);
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

      // Step related actions
      changeStepVersion: (workflowId: string, stepIndex: number, version: string) => {
        return set((state) => {
          return {
            yml: BitriseYmlService.changeStepVersion(workflowId, stepIndex, version, state.yml),
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

export function initializeStore({
  version,
  ymlString,
  discardKey,
}: {
  version: string;
  ymlString: string;
  discardKey?: number;
}) {
  bitriseYmlStore.setState(
    omitBy(
      {
        discardKey,
        yml: BitriseYmlApi.fromYml(ymlString),
        ymlDocument: parseDocument(ymlString),
        savedYmlDocument: parseDocument(ymlString),
        savedYmlVersion: version,
      },
      (value) => value === undefined,
    ),
  );
}

bitriseYmlStore.subscribe((curr, prev) => {
  if (!YamlUtils.areDocumentsEqual(curr.ymlDocument, prev.ymlDocument)) {
    bitriseYmlStore.setState({ yml: curr.ymlDocument.toJSON() });
  }
});

export function updateBitriseYmlDocument(mutator: YamlMutator /* , event = BitriseYmlEvent.Updated */) {
  const doc = bitriseYmlStore.getState().ymlDocument.clone();
  const paths = YamlUtils.collectPaths(bitriseYmlStore.getState().yml);

  // clearYamlParseErrors();

  const mutatedDocument = mutator({ doc, paths });
  if (mutatedDocument.errors.length > 0) {
    // setYamlParseErrors(mutatedDocument.errors);
    return;
  }

  bitriseYmlStore.setState({ ymlDocument: mutatedDocument });

  // dispatchBitriseYmlEvent(event);
}

export function getBitriseYmlDocument() {
  return bitriseYmlStore.getState().ymlDocument.clone();
}

export function isWorkflowExists(id: string): boolean {
  const doc = getBitriseYmlDocument();
  return doc.hasIn(['workflows', id]);
}
