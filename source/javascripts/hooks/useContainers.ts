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

function groupByType(map: Containers): ReturnValue {
  const containers = ContainerService.getAllContainers(map);
  return {
    all: containers,
    [ContainerType.Execution]: containers.filter((c) => c.userValues.type === ContainerType.Execution),
    [ContainerType.Service]: containers.filter((c) => c.userValues.type === ContainerType.Service),
  };
}

// Merge a modular config's containers post-order (included files first, then the including file) so a
// node outranks the files it includes — matching modular precedence when the same container id is
// defined in more than one file.
function collectContainers(node: TreeNode, files: Record<string, FileSlice>, acc: Containers): void {
  node.includes.forEach((child) => collectContainers(child, files, acc));
  const slice = files[node.nodeId];
  if (slice) {
    Object.assign(acc, YmlUtils.toJSON(slice.ymlDocument).containers ?? {});
  }
}

/**
 * Every container in the config, aggregated across all module files. Use this where a container from
 * any module is a valid choice — e.g. selecting one on a step or step bundle: a step in `bitrise.yml`
 * can reference a container defined in any included module file.
 */
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

    return groupByType(merged);
  });
}

/**
 * Only the containers defined in the active module (the file currently being edited). Use this for the
 * Containers management page, which is scoped to one module at a time — aggregating every module's
 * containers there would misrepresent what the current file defines.
 */
export function useModuleContainers(): ReturnValue {
  // `s.yml` is the active file's document, so `yml.containers` is already scoped to the current module
  // (and to the whole config in single-file mode).
  return useBitriseYmlStore((s) => groupByType(s.yml.containers ?? {}));
}

export default useContainers;
