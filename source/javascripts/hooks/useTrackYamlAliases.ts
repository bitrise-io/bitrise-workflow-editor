import { datadogRum } from '@datadog/browser-rum';
import { countBy, isEqual } from 'es-toolkit';
import { useEffect } from 'react';
import { Document } from 'yaml';

import { bitriseYmlStore, configDocuments } from '@/core/stores/BitriseYmlStore';
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
 * Records in RUM, once per loaded config, how many YAML aliases and merge keys it uses, so the users who
 * hit them can be counted. That decides whether editing through aliases is worth building.
 */
function useTrackYamlAliases() {
  const isConfigLoading = useIsConfigLoading();

  useEffect(() => {
    if (isConfigLoading) {
      return;
    }

    const loaded = countAliasesAndMergeKeys(configDocuments(bitriseYmlStore.getState()));
    if (!isEqual(loaded, NONE)) {
      datadogRum.addAction('yaml_aliases_loaded', loaded);
    }
  }, [isConfigLoading]);
}

export default useTrackYamlAliases;
