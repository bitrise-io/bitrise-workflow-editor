/* eslint-disable @typescript-eslint/naming-convention */
import { Document } from 'yaml';
import { createStore, ExtractState, StoreApi } from 'zustand';

import YmlUtils from '../utils/YmlUtils';

export type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;
export type BitriseYmlStoreState = ExtractState<typeof bitriseYmlStore>;

export type YamlMutator = (ctx: YamlMutatorCtx) => Document;
export type YamlMutatorCtx = { doc: Document };

export const bitriseYmlStore = createStore(() => ({
  version: '',
  discardKey: Date.now(),
  ymlDocument: new Document(),
  savedYmlDocument: new Document(),
  __invalidYmlString: undefined as string | undefined,
  __savedInvalidYmlString: undefined as string | undefined,
}));

export function getBitriseYml() {
  return YmlUtils.toJSON(bitriseYmlStore.getState().ymlDocument);
}

export function getYmlString(from?: 'savedYmlDocument'): string {
  const { __invalidYmlString, __savedInvalidYmlString, savedYmlDocument, ymlDocument } = bitriseYmlStore.getState();

  if (from === 'savedYmlDocument') {
    return __savedInvalidYmlString ?? YmlUtils.toYml(savedYmlDocument);
  }

  return __invalidYmlString ?? YmlUtils.toYml(ymlDocument);
}

export function forceRefreshStates() {
  bitriseYmlStore.setState({
    discardKey: Date.now(),
  });
}

export function discardBitriseYmlDocument() {
  const { __savedInvalidYmlString, savedYmlDocument } = bitriseYmlStore.getState();

  bitriseYmlStore.setState({
    discardKey: Date.now(),
    ymlDocument: savedYmlDocument.clone(),
    __invalidYmlString: __savedInvalidYmlString,
  });
}

export function updateBitriseYmlDocumentByString(ymlString: string) {
  const doc = YmlUtils.toDoc(ymlString);

  if (doc.errors.length === 0) {
    bitriseYmlStore.setState({
      ymlDocument: doc,
      __invalidYmlString: undefined,
    });
  } else {
    bitriseYmlStore.setState({
      __invalidYmlString: ymlString,
    });
  }
}

export function initializeBitriseYmlDocument({ ymlString, version }: { ymlString: string; version: string }) {
  const doc = YmlUtils.toDoc(ymlString);

  if (doc.errors.length === 0) {
    bitriseYmlStore.setState({
      version,
      ymlDocument: doc,
      savedYmlDocument: doc,
      __invalidYmlString: undefined,
      __savedInvalidYmlString: undefined,
    });
  } else {
    bitriseYmlStore.setState({
      version,
      __invalidYmlString: ymlString,
      __savedInvalidYmlString: ymlString,
    });
  }
}

export function updateBitriseYmlDocument(mutator: YamlMutator) {
  const doc = bitriseYmlStore.getState().ymlDocument.clone();

  bitriseYmlStore.setState({
    ymlDocument: mutator({ doc }),
    __invalidYmlString: undefined,
  });
}
