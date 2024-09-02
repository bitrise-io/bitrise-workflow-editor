import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { Workflows } from '@/core/models/Workflow';

export const useWorkflows = (): Workflows => {
  return useBitriseYmlStore(useShallow(({ yml }) => yml.workflows || {}));
};
