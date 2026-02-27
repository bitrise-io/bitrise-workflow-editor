import { useMemo } from 'react';

import { isEntityInActiveFile } from '@/core/stores/ModularConfigStore';

import useIsModular from './useIsModular';
import useModularConfig from './useModularConfig';

/**
 * Returns whether a given entity belongs to the active file and can be edited.
 * When not in modular mode, always returns true.
 * When on the merged tab, always returns false (read-only).
 */
export default function useEntityOwnership(section: string, entityId: string): boolean {
  const isModular = useIsModular();
  const activeFileIndex = useModularConfig((s) => s.activeFileIndex);
  const activeFileContents = useModularConfig((s) =>
    s.activeFileIndex >= 0 ? s.files[s.activeFileIndex]?.currentContents : undefined,
  );

  return useMemo(() => {
    if (!isModular) return true;
    if (activeFileIndex === -1) return false; // merged tab
    return isEntityInActiveFile(section, entityId);
  }, [isModular, activeFileIndex, activeFileContents, section, entityId]);
}
