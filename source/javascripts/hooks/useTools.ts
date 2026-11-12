import { useQuery } from '@tanstack/react-query';

import ToolCatalogApi from '@/core/api/ToolCatalogApi';
import { BitriseYml, Tools } from '@/core/models/BitriseYml';
import { ToolScope } from '@/core/services/ToolsService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

const getToolsForScope = (yml: BitriseYml, scope: ToolScope): Tools =>
  (scope.type === 'workflow' ? yml.workflows?.[scope.workflowId]?.tools : yml.tools) ?? {};

export function useToolsForScope(scope: ToolScope): Tools {
  return useBitriseYmlStore(({ yml }) => getToolsForScope(yml, scope));
}

/** The same array until a tool is added, removed or renamed, so a version edit leaves it alone. */
export function useToolIdsForScope(scope: ToolScope): string[] {
  return useBitriseYmlStore(({ yml }) => Object.keys(getToolsForScope(yml, scope)));
}

export function useToolCatalog() {
  return useQuery({
    queryKey: ['tool-catalog'],
    queryFn: ({ signal }) => ToolCatalogApi.getToolCatalog(signal),
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useToolVersions(toolId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['tool-versions', toolId],
    queryFn: ({ signal }) => ToolCatalogApi.getToolVersions(toolId, signal),
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled,
  });
}
