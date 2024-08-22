import { createStore, StoreApi } from 'zustand';
import { ChainedWorkflowPlacement } from '@/core/models/Workflow';
import BitriseYmlService from '@/core/models/BitriseYmlService';
import { BitriseYml, Meta } from '@/core/models/BitriseYml';

type BitriseYmlStoreState = {
  yml: BitriseYml;
  defaultMeta?: Meta;

  // Workflow related actions
  createWorkflow: (workflowId: string, baseWorkflowId?: string) => void;
  deleteWorkflow: (workflowId: string) => void;
  addChainedWorkflow: (
    chainableWorkflowId: string,
    parentWorkflowId: string,
    placement: ChainedWorkflowPlacement,
  ) => void;
  setChainedWorkflows: (workflowId: string, placement: ChainedWorkflowPlacement, chainedWorkflowIds: string[]) => void;
  deleteChainedWorkflow: (
    chainedWorkflowIndex: number,
    parentWorkflowId: string,
    placement: ChainedWorkflowPlacement,
  ) => void;
  addStep: (workflowId: string, cvs: string, to: number) => void;
  moveStep: (workflowId: string, stepIndex: number, to: number) => void;
};

type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;

function createBitriseYmlStore(yml: BitriseYml, defaultMeta?: Meta): BitriseYmlStore {
  return createStore<BitriseYmlStoreState>()((set) => ({
    yml,
    defaultMeta,
    addStep(workflowId, cvs, to) {
      return set((state) => {
        return {
          yml: BitriseYmlService.addStep(workflowId, cvs, to, state.yml),
        };
      });
    },
    moveStep(workflowId, stepIndex, to) {
      return set((state) => {
        return {
          yml: BitriseYmlService.moveStep(workflowId, stepIndex, to, state.yml),
        };
      });
    },
    createWorkflow(workflowId, baseWorkflowId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.createWorkflow(workflowId, state.yml, baseWorkflowId),
        };
      });
    },
    deleteWorkflow(workflowId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deleteWorkflow(workflowId, state.yml),
        };
      });
    },
    deleteChainedWorkflow(chainedWorkflowIndex, parentWorkflowId, placement) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deleteChainedWorkflow(chainedWorkflowIndex, parentWorkflowId, placement, state.yml),
        };
      });
    },
    addChainedWorkflow(chainableWorkflowId, parentWorkflowId, placement) {
      return set((state) => {
        return {
          yml: BitriseYmlService.addChainedWorkflow(chainableWorkflowId, parentWorkflowId, placement, state.yml),
        };
      });
    },
    setChainedWorkflows(workflowId, placement, chainedWorkflowIds) {
      return set((state) => {
        return {
          yml: BitriseYmlService.setChainedWorkflows(workflowId, placement, chainedWorkflowIds, state.yml),
        };
      });
    },
  }));
}

export { BitriseYmlStore, BitriseYmlStoreState };

export default {
  createBitriseYmlStore,
};
