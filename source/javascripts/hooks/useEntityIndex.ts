import { useStore } from 'zustand';

import { EntityIndex } from '@/core/models/Tree';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';

/**
 * The BE-served entity index, by reference. Powers "→ source module" badges,
 * jump-to-definition, and ghost detection (via `EntityIndexService`). Read-only
 * on the FE and replaced wholesale on every load/save, so referential equality
 * is correct and cheap.
 */
export function useEntityIndex(): EntityIndex {
  return useStore(bitriseYmlStore, (s) => s.entityIndex);
}
