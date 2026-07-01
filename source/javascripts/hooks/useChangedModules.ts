import { isFileDirty } from '@/core/stores/BitriseYmlStore';

import useBitriseYmlStore from './useBitriseYmlStore';

export type ChangedModule = { nodeId: string; path: string };

/** The changed (unsaved) module files of a modular config; empty for a single-file config. */
export default function useChangedModules(): ChangedModule[] {
  // useBitriseYmlStore compares selector results with deep equality (dequal), so it already
  // short-circuits when the changed set is unchanged regardless of allocations. Project to just
  // { nodeId, path } (the fields consumers use) to keep that comparison bounded — returning full
  // FileSlice objects would make dequal deep-walk each slice's YAML document on every change.
  return useBitriseYmlStore((s) =>
    s.tree
      ? Object.values(s.files)
          .filter((slice) => isFileDirty(slice))
          .map((slice) => ({ nodeId: slice.nodeId, path: slice.path }))
      : [],
  );
}

export const moduleCountLabel = (count: number) => `${count} ${count === 1 ? 'module' : 'modules'} changed`;
