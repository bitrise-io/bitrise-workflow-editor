import { Workflows } from '@/core/models/BitriseYml';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export const useWorkflows = (): Workflows => {
  return useBitriseYmlStore(({ yml }) => yml.workflows || {});
};
