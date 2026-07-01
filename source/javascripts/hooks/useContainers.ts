import { Containers } from '@/core/models/BitriseYml';
import { Container, ContainerType } from '@/core/models/Container';
import ContainerService from '@/core/services/ContainerService';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type ReturnValue = {
  all: Container[];
  [ContainerType.Execution]: Container[];
  [ContainerType.Service]: Container[];
};

function useContainers(): ReturnValue {
  return useBitriseYmlStore((s) => {
    // Modular: containers can be defined in any module file (all of them are part of the merged
    // config), so aggregate across every file — the active doc's `yml.containers` only holds the
    // current file's. Single-file: just that one document. (toJSON is cached per document identity.)
    const merged: Containers = s.tree
      ? Object.assign({}, ...Object.values(s.files).map((slice) => YmlUtils.toJSON(slice.ymlDocument).containers ?? {}))
      : (s.yml.containers ?? {});

    const containers = ContainerService.getAllContainers(merged);
    return {
      all: containers,
      [ContainerType.Execution]: containers.filter((c) => c.userValues.type === ContainerType.Execution),
      [ContainerType.Service]: containers.filter((c) => c.userValues.type === ContainerType.Service),
    };
  });
}

export default useContainers;
