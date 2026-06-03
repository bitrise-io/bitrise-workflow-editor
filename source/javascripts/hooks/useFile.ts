import { useStore } from 'zustand';

import { bitriseYmlStore, FileSlice } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

/**
 * One file's slice, by reference. Stable identity per file: `updateFileDocument`
 * replaces only the touched slice, so untouched files don't re-render. Branch
 * on `editable` to render read-only chrome; `source` drives the ref-kind badge;
 * `commitSha` powers deep links; `path` is display-only.
 */
export function useFile(nodeId: string): FileSlice | undefined {
  return useStore(bitriseYmlStore, (s) => s.files[nodeId]);
}

export function useFileIsDirty(nodeId: string): boolean {
  return useStore(bitriseYmlStore, (s) => {
    const file = s.files[nodeId];
    return file ? !YmlUtils.isEquals(file.ymlDocument, file.savedYmlDocument) : false;
  });
}
