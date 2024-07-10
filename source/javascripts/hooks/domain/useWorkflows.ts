import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from './useBitriseYmlStore';
import { Workflows } from '@/models/domain/Workflow';

export const useWorkflows = () => {
  return useBitriseYmlStore(useShallow(({ yml }) => yml.workflows as Workflows));
};
