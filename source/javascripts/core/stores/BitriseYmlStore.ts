import { omitBy } from 'es-toolkit';
import { Document, parseDocument } from 'yaml';
import { createStore, ExtractState, StoreApi } from 'zustand';

import { BitriseYml } from '@/core/models/BitriseYml';

import YamlUtils from '../utils/YamlUtils';
import YmlUtils from '../utils/YmlUtils';

export type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;
export type BitriseYmlStoreState = ExtractState<typeof bitriseYmlStore>;

export type YamlMutator = (ctx: YamlMutatorCtx) => Document;
export type YamlMutatorCtx = { doc: Document; paths: string[] };

type InitStoreOptions = {
  version: string;
  ymlString: string;
  discardKey?: number;
};

export const bitriseYmlStore = createStore(() => ({
  discardKey: Date.now(),
  yml: {} as BitriseYml,
  ymlDocument: new Document(),
  savedYmlDocument: new Document(),
  savedYmlVersion: '',
}));

bitriseYmlStore.subscribe((curr, prev) => {
  if (YmlUtils.isEquals(curr.ymlDocument, prev.ymlDocument)) {
    bitriseYmlStore.setState({
      yml: curr.ymlDocument.toJSON(),
    });
  }
});

export function initializeStore({ version, ymlString, discardKey }: InitStoreOptions) {
  const doc = parseDocument(ymlString, { keepSourceTokens: true, stringKeys: true });

  bitriseYmlStore.setState(
    omitBy(
      {
        discardKey,
        yml: doc.toJSON(),
        ymlDocument: doc,
        savedYmlDocument: doc,
        savedYmlVersion: version,
      },
      (value) => value === undefined,
    ),
  );
}

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

export function getYmlString(from?: 'savedYmlDocument'): string {
  if (from === 'savedYmlDocument') {
    return YmlUtils.toYml(bitriseYmlStore.getState().savedYmlDocument);
  }

  return YmlUtils.toYml(bitriseYmlStore.getState().ymlDocument);
}
