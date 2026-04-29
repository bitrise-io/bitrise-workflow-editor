import { Tools } from '@/core/models/BitriseYml';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export function useTools(): Tools {
  return useBitriseYmlStore(({ yml }) => yml.tools ?? {});
}

export function useWorkflowTools(workflowId: string): Tools {
  return useBitriseYmlStore(({ yml }) => yml.workflows?.[workflowId]?.tools ?? {});
}
