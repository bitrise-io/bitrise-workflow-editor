import { useStore } from 'zustand';

import { EntityIndex } from '@/core/models/Tree';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';

/**
 * The entity index, by reference. Powers "→ source module" badges,
 * jump-to-definition, and cross-file detection (via `EntityIndexService`). The
 * BE snapshot seeds it on load/save, but a store subscription keeps it live —
 * re-derived from the open file documents on every edit — so unsaved cross-file
 * edits are reflected immediately. Referential equality stays correct and cheap:
 * the store only swaps in a new index object when the derived value differs.
 */
export function useEntityIndex(): EntityIndex {
  return useStore(bitriseYmlStore, (s) => s.entityIndex);
}
