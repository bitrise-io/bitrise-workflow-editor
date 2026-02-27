/* eslint-disable @typescript-eslint/naming-convention */
import { Document } from 'yaml';
import { createStore, ExtractState, StoreApi } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { BitriseYml } from '../models/BitriseYml';
import YmlUtils from '../utils/YmlUtils';

export type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;
export type BitriseYmlStoreState = ExtractState<typeof bitriseYmlStore>;

export type YamlMutator = (ctx: YamlMutatorCtx) => Document;
export type YamlMutatorCtx = { doc: Document };

export const bitriseYmlStore = createStore(
  subscribeWithSelector(() => ({
    version: '',
    yml: {} as BitriseYml,
    hasChanges: false,
    discardKey: Date.now(),
    ymlDocument: new Document(),
    savedYmlDocument: new Document(),
    __invalidYmlString: undefined as string | undefined,
    __savedInvalidYmlString: undefined as string | undefined,
    validationStatus: 'valid' as 'valid' | 'invalid' | 'warnings',
  })),
);

export function getBitriseYml() {
  return bitriseYmlStore.getState().yml;
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

export function setValidationStatus(status: 'valid' | 'invalid' | 'warnings') {
  bitriseYmlStore.setState({ validationStatus: status });
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
  if (_isReadOnlyMode) return;

  const doc = bitriseYmlStore.getState().ymlDocument.clone();

  try {
    bitriseYmlStore.setState({
      ymlDocument: mutator({ doc }),
      __invalidYmlString: undefined,
    });
  } catch {
  }
}

let _isReadOnlyMode = false;

export function setReadOnlyMode(isReadOnly: boolean) {
  _isReadOnlyMode = isReadOnly;
}

export function isReadOnlyMode() {
  return _isReadOnlyMode;
}

bitriseYmlStore.subscribe(
  ({ ymlDocument, savedYmlDocument }) => {
    return {
      ymlDocument,
      savedYmlDocument,
    };
  },
  ({ ymlDocument, savedYmlDocument }) => {
    bitriseYmlStore.setState({
      yml: YmlUtils.toJSON(ymlDocument),
      hasChanges: !YmlUtils.isEquals(ymlDocument, savedYmlDocument),
    });
  },
  {
    equalityFn: (a, b) => {
      return a.ymlDocument === b.ymlDocument && a.savedYmlDocument === b.savedYmlDocument;
    },
  },
);

let _syncToModularConfig: ((ymlString: string) => void) | undefined;

export function setSyncToModularConfig(fn: (ymlString: string) => void) {
  _syncToModularConfig = fn;
}

bitriseYmlStore.subscribe(
  ({ ymlDocument }) => ymlDocument,
  (ymlDocument) => {
    if (_isReadOnlyMode || !_syncToModularConfig) return;
    const ymlString = YmlUtils.toYml(ymlDocument);
    _syncToModularConfig(ymlString);
  },
);
