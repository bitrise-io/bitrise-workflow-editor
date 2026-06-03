import { useStore } from 'zustand';

import { TreeNode } from '@/core/models/Tree';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

/**
 * The tree root (structural skeleton), by reference. Walk it via `TreeService`;
 * components don't traverse the tree themselves. Reference-stable: only changes
 * on load / post-save reload, so this uses plain referential equality rather
 * than a deep compare over the whole tree.
 */
export function useTree(): TreeNode | undefined {
  return useStore(bitriseYmlStore, (s) => s.tree);
}

export function useSelectedNodeId(): string | undefined {
  return useStore(bitriseYmlStore, (s) => s.selectedNodeId);
}

/** node_ids of files with unsaved edits. */
export function useDirtyNodeIds(): string[] {
  return useBitriseYmlStore((s) =>
    Object.values(s.files)
      .filter((file) => !YmlUtils.isEquals(file.ymlDocument, file.savedYmlDocument))
      .map((file) => file.nodeId),
  );
}
