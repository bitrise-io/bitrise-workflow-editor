import { omitBy } from 'es-toolkit';
import { Document, parseDocument } from 'yaml';
import { createStore, ExtractState, StoreApi } from 'zustand';
import { combine } from 'zustand/middleware';

import { BitriseYml, EnvironmentItemModel, StepBundleModel } from '@/core/models/BitriseYml';
// eslint-disable-next-line import/no-cycle
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

      // Step Bundle related actions
      appendStepBundleInput(bundleId: string, newInput: EnvironmentItemModel) {
        return set((state) => {
          return {
            yml: BitriseYmlService.appendStepBundleInput(bundleId, newInput, state.yml),
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
