import { isFileDirty } from '@/core/stores/BitriseYmlStore';

import useBitriseYmlStore from './useBitriseYmlStore';

export type ChangedModule = { nodeId: string; path: string };

/** The changed (unsaved) module files of a modular config; empty for a single-file config. */
export default function useChangedModules(): ChangedModule[] {
  // useBitriseYmlStore already wraps the selector in useShallow, so a new array each render is fine.
  return useBitriseYmlStore((s) =>
    !s.tree
      ? []
      : Object.values(s.files)
          .filter((slice) => isFileDirty(slice))
          .map((slice) => ({ nodeId: slice.nodeId, path: slice.path })),
  );
}

export const moduleCountLabel = (count: number) => `${count} ${count === 1 ? 'module' : 'modules'} changed`;
