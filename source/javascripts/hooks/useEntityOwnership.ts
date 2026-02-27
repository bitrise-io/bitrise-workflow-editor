import { useMemo } from 'react';

import { isEntityInActiveFile } from '@/core/stores/ModularConfigStore';

import useIsModular from './useIsModular';
import useModularConfig from './useModularConfig';

export default function useEntityOwnership(section: string, entityId: string): boolean {
  const isModular = useIsModular();
  const activeFileIndex = useModularConfig((s) => s.activeFileIndex);
  const activeFileContents = useModularConfig((s) =>
    s.activeFileIndex >= 0 ? s.files[s.activeFileIndex]?.currentContents : undefined,
  );

  return useMemo(() => {
    if (!isModular) return true;
    if (activeFileIndex === -1) return false;
    return isEntityInActiveFile(section, entityId);
  }, [isModular, activeFileIndex, activeFileContents, section, entityId]);
}
