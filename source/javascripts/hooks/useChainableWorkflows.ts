import WorkflowService from '@/core/services/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type Props = {
  id: string;
  search: string;
};

const useChainableWorkflows = ({ id, search }: Props) => {
  const chainableWorkflows = useBitriseYmlStore((state) => {
    const workflows = state.yml.workflows || {};
    const chainable = WorkflowService.getChainableWorkflows(workflows, id);
    // Workflows defined in other module files are chainable too. Their own chains
    // aren't visible here, so cross-file cycle prevention is the backend's job (it
    // rejects a cyclic save) — we just exclude self + already-local workflows.
    const crossFile = Object.keys(state.entityIndex.workflows).filter((wfId) => wfId !== id && !workflows[wfId]);
    return [...chainable, ...crossFile];
  });

  if (!search) {
    return chainableWorkflows;
  }

  return chainableWorkflows.filter((wfId) => wfId.toLowerCase().includes(search.toLowerCase()));
};

export { useChainableWorkflows };
