import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from './useBitriseYmlStore';
import { Workflow } from '@/models/domain/Workflow';

type Props = {
  id: string;
};

export const useWorkflowById = ({ id }: Props): Workflow => {
  return useBitriseYmlStore(
    useShallow(({ yml }) => {
      return yml.workflows?.[id] ?? {};
    }),
  );
};
