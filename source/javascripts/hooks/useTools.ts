import { Tools } from '@/core/models/BitriseYml';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export function useTools(): Tools {
  return useBitriseYmlStore(({ yml }) => yml.tools ?? {});
}

export function useWorkflowTools(workflowId: string): Tools | undefined {
  return useBitriseYmlStore(({ yml }) => {
    const workflow = yml.workflows?.[workflowId];
    if (!workflow) return undefined;
    return workflow.tools ?? {};
  });
}
