import { datadogRum } from '@datadog/browser-rum';
import { countBy, isEqual } from 'es-toolkit';
import { useEffect } from 'react';
import { Document } from 'yaml';

import { bitriseYmlStore, savedConfigDocuments, subscribeToSavedDocuments } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';
import { useIsConfigLoading } from '@/layouts/ConfigLoading.context';

type Counts = { aliases: number; mergeKeys: number };

const NONE: Counts = { aliases: 0, mergeKeys: 0 };

/** How many aliases and merge keys the documents hold together. */
function countAliasesAndMergeKeys(docs: Document[]): Counts {
  const { alias = 0, 'merge-key': mergeKey = 0 } = countBy(
    docs.flatMap(YmlUtils.findAliasesAndMergeKeys),
    ({ kind }) => kind,
  );
  return { aliases: alias, mergeKeys: mergeKey };
}

/**
 * Records in RUM how many YAML aliases and merge keys a config uses once it has loaded, and each save that
 * changes how many there are, so the users who hit them, and whether they move off them, can be counted. That decides whether editing through aliases is worth building.
 */
function useTrackYamlAliases() {
  const isConfigLoading = useIsConfigLoading();

  useEffect(() => {
    if (isConfigLoading) {
      return undefined;
    }

    const loaded = countAliasesAndMergeKeys(savedConfigDocuments(bitriseYmlStore.getState()));
    if (!isEqual(loaded, NONE)) {
      datadogRum.addAction('yaml_aliases_loaded', loaded);
    }

    // Compares saved documents, so typing and discarding never reach it.
    return subscribeToSavedDocuments((next, prev, isSave) => {
      if (!isSave) {
        return;
      }
      const before = countAliasesAndMergeKeys(Object.values(prev));
      const after = countAliasesAndMergeKeys(Object.values(next));
      if (!isEqual(before, after)) {
        datadogRum.addAction('yaml_aliases_changed', { before, after });
      }
    });
  }, [isConfigLoading]);
}

export default useTrackYamlAliases;
