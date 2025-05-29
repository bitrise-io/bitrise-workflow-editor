import { Document } from 'yaml';
import { createStore, ExtractState, StoreApi } from 'zustand';

import YamlUtils from '../utils/YamlUtils';
import YmlUtils from '../utils/YmlUtils';

export type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;
export type BitriseYmlStoreState = ExtractState<typeof bitriseYmlStore>;

export type YamlMutator = (ctx: YamlMutatorCtx) => Document;
export type YamlMutatorCtx = { doc: Document; paths: string[] };

export const bitriseYmlStore = createStore(() => ({
  version: '',
  discardKey: Date.now(),
  ymlDocument: new Document(),
  savedYmlDocument: new Document(),
  __invalidYmlString: undefined as string | undefined,
}));

export function getBitriseYml() {
  return YmlUtils.toJSON(bitriseYmlStore.getState().ymlDocument);
}

export function getYmlString(from?: 'savedYmlDocument'): string {
  if (from === 'savedYmlDocument') {
    return YmlUtils.toYml(bitriseYmlStore.getState().savedYmlDocument);
  }

  return YmlUtils.toYml(bitriseYmlStore.getState().ymlDocument);
}

export function forceRefreshStates() {
  bitriseYmlStore.setState({ discardKey: Date.now() });
}

export function discardBitriseYmlDocument() {
  const { savedYmlDocument } = bitriseYmlStore.getState();
  bitriseYmlStore.setState({
    ymlDocument: savedYmlDocument.clone(),
    discardKey: Date.now(),
    __invalidYmlString: undefined,
  });
}

export function updateBitriseYmlDocumentByString(ymlString: string) {
  const doc = YmlUtils.toDoc(ymlString);

  if (doc.errors.length === 0) {
    bitriseYmlStore.setState({ ymlDocument: doc, __invalidYmlString: undefined });
  } else {
    bitriseYmlStore.setState({ __invalidYmlString: ymlString });
  }
}

export function initializeBitriseYmlDocument({ ymlString, version }: { ymlString: string; version: string }) {
  const doc = YmlUtils.toDoc(ymlString);

  if (doc.errors.length === 0) {
    bitriseYmlStore.setState({ version, ymlDocument: doc, savedYmlDocument: doc, __invalidYmlString: undefined });
  } else {
    bitriseYmlStore.setState({ __invalidYmlString: ymlString });
  }
}

export function updateBitriseYmlDocument(mutator: YamlMutator) {
  const doc = bitriseYmlStore.getState().ymlDocument.clone();
  const paths = YamlUtils.collectPaths(bitriseYmlStore.getState().ymlDocument.toJSON());

  bitriseYmlStore.setState({ ymlDocument: mutator({ doc, paths }), __invalidYmlString: undefined });
}
