import { omitBy } from 'es-toolkit';
import { Document, parseDocument } from 'yaml';
import { createStore, ExtractState, StoreApi } from 'zustand';

import { BitriseYml } from '@/core/models/BitriseYml';

import YamlUtils from '../utils/YamlUtils';

export type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;
export type BitriseYmlStoreState = ExtractState<typeof bitriseYmlStore>;

export type YamlMutator = (ctx: YamlMutatorCtx) => Document;
export type YamlMutatorCtx = { doc: Document; paths: string[] };

export const bitriseYmlStore = createStore(() => ({
  discardKey: Date.now(),
  yml: {} as BitriseYml,
  ymlDocument: new Document(),
  savedYmlDocument: new Document(),
  savedYmlVersion: '',
}));

type InitStoreOptions = {
  version: string;
  ymlString: string;
  discardKey?: number;
};

export function initializeStore({ version, ymlString, discardKey }: InitStoreOptions) {
  const doc = parseDocument(ymlString, { keepSourceTokens: true });

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

bitriseYmlStore.subscribe((curr, prev) => {
  if (!YamlUtils.areDocumentsEqual(curr.ymlDocument, prev.ymlDocument)) {
    bitriseYmlStore.setState({
      yml: curr.ymlDocument.toJSON(),
    });
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
