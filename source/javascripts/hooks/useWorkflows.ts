import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { Workflows } from '@/core/models/Workflow';

export const useWorkflows = (): Workflows => {
  return useBitriseYmlStore(({ yml }) => yml.workflows || {});
};
