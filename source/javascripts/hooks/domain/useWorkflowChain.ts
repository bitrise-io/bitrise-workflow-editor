import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from './useBitriseYmlStore';
import { extractAfterRunChain, extractBeforeRunChain, extractWorkflowChain, Workflows } from '@/models/domain/Workflow';

type Props = {
  id: string;
};

export const useBeforeRunWorkflows = ({ id }: Props) => {
  const workflows = useBitriseYmlStore(useShallow(({ yml }) => yml.workflows as Workflows));
  return useMemo(() => extractBeforeRunChain(workflows, id), [workflows, id]);
};

export const useAfterRunWorkflows = ({ id }: Props) => {
  const workflows = useBitriseYmlStore(useShallow(({ yml }) => yml.workflows as Workflows));
  return useMemo(() => extractAfterRunChain(workflows, id), [workflows, id]);
};

export const useWorkflowChain = ({ id }: Props) => {
  const workflows = useBitriseYmlStore(useShallow(({ yml }) => yml.workflows as Workflows));
  return useMemo(() => extractWorkflowChain(workflows, id), [workflows, id]);
};
