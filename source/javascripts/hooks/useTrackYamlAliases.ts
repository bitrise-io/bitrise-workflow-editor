import { datadogRum } from '@datadog/browser-rum';
import { countBy, isEqual } from 'es-toolkit';
import { useEffect } from 'react';
import { Document } from 'yaml';
import { shallow } from 'zustand/shallow';

import { bitriseYmlStore, savedConfigDocuments } from '@/core/stores/BitriseYmlStore';
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

    // Compares saved documents, so typing and discarding never reach it. Loads, branch switches and storage
    // changes also replace them, but only a save sets `lastSavedAt`.
    return bitriseYmlStore.subscribe(
      (s) => ({ documents: savedConfigDocuments(s), lastSavedAt: s.lastSavedAt }),
      (next, prev) => {
        if (next.lastSavedAt === prev.lastSavedAt) {
          return;
        }
        const before = countAliasesAndMergeKeys(prev.documents);
        const after = countAliasesAndMergeKeys(next.documents);
        if (!isEqual(before, after)) {
          datadogRum.addAction('yaml_aliases_changed', { before, after });
        }
      },
      // Identity is enough, and it's cheap: this runs on every store update, keystrokes included.
      { equalityFn: (a, b) => a.lastSavedAt === b.lastSavedAt && shallow(a.documents, b.documents) },
    );
  }, [isConfigLoading]);
}

export default useTrackYamlAliases;
