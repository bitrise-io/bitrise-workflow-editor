import { useStore } from 'zustand';

import { EntityIndex } from '@/core/models/Tree';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';

/**
 * The entity index, by reference. Seeded by the BE snapshot, then kept live —
 * re-derived from the open file documents on every edit — so unsaved cross-file
 * edits show immediately.
 */
export function useEntityIndex(): EntityIndex {
  return useStore(bitriseYmlStore, (s) => s.entityIndex);
}
