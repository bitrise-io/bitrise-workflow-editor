import { Containers } from '@/core/models/BitriseYml';
import { Container, ContainerType } from '@/core/models/Container';
import { TreeNode } from '@/core/models/Tree';
import ContainerService from '@/core/services/ContainerService';
import { FileSlice } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type ReturnValue = {
  all: Container[];
  [ContainerType.Execution]: Container[];
  [ContainerType.Service]: Container[];
};

// Merge a modular config's containers post-order (included files first, then the including file) so a
// node outranks the files it includes — matching modular precedence when the same container id is
// defined in more than one file. (toJSON is cached per document identity, so this stays cheap.)
function collectContainers(node: TreeNode, files: Record<string, FileSlice>, acc: Containers): void {
  node.includes.forEach((child) => collectContainers(child, files, acc));
  const slice = files[node.nodeId];
  if (slice) {
    Object.assign(acc, YmlUtils.toJSON(slice.ymlDocument).containers ?? {});
  }
}

function useContainers(): ReturnValue {
  return useBitriseYmlStore((s) => {
    // Modular: containers can be defined in any module file (all are part of the merged config), so
    // aggregate across every file — the active doc's `yml.containers` only holds the current file's.
    const merged: Containers = {};
    if (s.tree) {
      collectContainers(s.tree, s.files, merged);
    } else {
      Object.assign(merged, s.yml.containers ?? {});
    }

    const containers = ContainerService.getAllContainers(merged);
    return {
      all: containers,
      [ContainerType.Execution]: containers.filter((c) => c.userValues.type === ContainerType.Execution),
      [ContainerType.Service]: containers.filter((c) => c.userValues.type === ContainerType.Service),
    };
  });
}

export default useContainers;
