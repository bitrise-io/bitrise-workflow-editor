import { Tools } from '@/core/models/BitriseYml';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useShallow } from '@/hooks/useShallow';

export function useTools(): Tools {
  return useBitriseYmlStore(useShallow(({ yml }) => yml.tools ?? {}));
}

export function useWorkflowTools(workflowId: string): Tools | undefined {
  return useBitriseYmlStore(
    useShallow(({ yml }) => {
      const workflow = yml.workflows?.[workflowId];
      if (!workflow) return undefined;
      return workflow.tools ?? {};
    }),
  );
}
