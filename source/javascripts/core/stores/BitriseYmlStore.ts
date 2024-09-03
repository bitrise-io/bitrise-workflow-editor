import { createStore, StoreApi } from 'zustand';
import { BitriseYml, Meta } from '@/core/models/BitriseYml';
import { ChainedWorkflowPlacement, WorkflowYmlObject } from '@/core/models/Workflow';
import BitriseYmlService from '@/core/models/BitriseYmlService';

type BitriseYmlStoreState = {
  yml: BitriseYml;
  defaultMeta?: Meta;

  // Workflow related actions
  createWorkflow: (workflowId: string, baseWorkflowId?: string) => void;
  renameWorkflow: (workflowId: string, newWorkflowId: string) => void;
  updateWorkflow: (workflowId: string, workflow: WorkflowYmlObject) => void;
  deleteWorkflow: (workflowId: string) => void;
  deleteWorkflows: (workflowIds: string[]) => void;
  setChainedWorkflows: (workflowId: string, placement: ChainedWorkflowPlacement, chainedWorkflowIds: string[]) => void;
  addChainedWorkflow: (
    chainableWorkflowId: string,
    parentWorkflowId: string,
    placement: ChainedWorkflowPlacement,
  ) => void;
  deleteChainedWorkflow: (
    chainedWorkflowIndex: number,
    parentWorkflowId: string,
    placement: ChainedWorkflowPlacement,
  ) => void;
  addStep: (workflowId: string, cvs: string, to: number) => void;
  moveStep: (workflowId: string, stepIndex: number, to: number) => void;
  cloneStep: (workflowId: string, stepIndex: number) => void;
};

type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;

function create(yml: BitriseYml, defaultMeta?: Meta): BitriseYmlStore {
  return createStore<BitriseYmlStoreState>()((set) => ({
    yml,
    defaultMeta,
    createWorkflow(workflowId, baseWorkflowId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.createWorkflow(workflowId, state.yml, baseWorkflowId),
        };
      });
    },
    renameWorkflow(workflowId, newWorkflowId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.renameWorkflow(workflowId, newWorkflowId, state.yml),
        };
      });
    },
    updateWorkflow(workflowId, workflow) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateWorkflow(workflowId, workflow, state.yml),
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
    deleteWorkflows(workflowIds) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deleteWorkflows(workflowIds, state.yml),
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
    addChainedWorkflow(chainableWorkflowId, parentWorkflowId, placement) {
      return set((state) => {
        return {
          yml: BitriseYmlService.addChainedWorkflow(chainableWorkflowId, parentWorkflowId, placement, state.yml),
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
    cloneStep(workflowId, stepIndex) {
      return set((state) => {
        return {
          yml: BitriseYmlService.cloneStep(workflowId, stepIndex, state.yml),
        };
      });
    },
  }));
}

export { BitriseYmlStore, BitriseYmlStoreState };

export default {
  create,
};
