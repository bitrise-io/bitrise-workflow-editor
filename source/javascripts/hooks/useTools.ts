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
