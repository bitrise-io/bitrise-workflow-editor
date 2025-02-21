import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import WorkflowService from '@/core/services/WorkflowService';

type Props = {
  id: string;
  search: string;
};

const useChainableWorkflows = ({ id, search }: Props) => {
  const chainableWorkflows = useBitriseYmlStore((state) =>
    WorkflowService.getChainableWorkflows(state.yml.workflows || {}, id),
  );

  if (!search) {
    return chainableWorkflows;
  }

  return chainableWorkflows.filter((wfId) => wfId.toLowerCase().includes(search.toLowerCase()));
};

export { useChainableWorkflows };
