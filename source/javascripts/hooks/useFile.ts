import { useStore } from 'zustand';

import { bitriseYmlStore, FileSlice, isFileDirty } from '@/core/stores/BitriseYmlStore';

/** One file's slice, by reference. Stable identity per file — untouched files don't re-render. */
export function useFile(nodeId: string): FileSlice | undefined {
  return useStore(bitriseYmlStore, (s) => s.files[nodeId]);
}

export function useFileIsDirty(nodeId: string): boolean {
  return useStore(bitriseYmlStore, (s) => isFileDirty(s.files[nodeId]));
}
