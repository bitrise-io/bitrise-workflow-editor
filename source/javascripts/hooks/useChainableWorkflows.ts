import WorkflowService from '@/core/services/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useMergedBitriseYml from '@/hooks/useMergedBitriseYml';

type Props = {
  id: string;
  search: string;
};

const useChainableWorkflows = ({ id, search }: Props) => {
  const mergedYml = useMergedBitriseYml();

  const chainableWorkflows = useBitriseYmlStore((state) => {
    // Use merged workflows for the chainable list so all workflows are available
    const workflows = mergedYml?.workflows
      ? { ...mergedYml.workflows, ...(state.yml.workflows || {}) }
      : state.yml.workflows || {};
    return WorkflowService.getChainableWorkflows(workflows, id);
  });

  if (!search) {
    return chainableWorkflows;
  }

  return chainableWorkflows.filter((wfId) => wfId.toLowerCase().includes(search.toLowerCase()));
};

export { useChainableWorkflows };
