import { useQuery } from '@tanstack/react-query';

import ToolCatalogApi from '@/core/api/ToolCatalogApi';
import { Tools } from '@/core/models/BitriseYml';
import { ToolScope } from '@/core/services/ToolsService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export function useToolsForScope(scope: ToolScope): Tools {
  return useBitriseYmlStore(({ yml }) => {
    if (scope.type === 'workflow') {
      return yml.workflows?.[scope.workflowId]?.tools ?? {};
    }
    return yml.tools ?? {};
  });
}

export function useToolCatalog() {
  return useQuery({
    queryKey: ['tool-catalog'],
    queryFn: () => ToolCatalogApi.getToolCatalog(),
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useToolVersions(toolId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['tool-versions', toolId],
    queryFn: () => ToolCatalogApi.getToolVersions(toolId),
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled,
  });
}
