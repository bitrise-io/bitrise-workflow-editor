import { ComponentType, createContext, PropsWithChildren, useEffect, useRef } from 'react';
import { createStore } from 'zustand';
import { BitriseYml, Meta } from '@/models/BitriseYml';
import { ChainedWorkflowPlacement, Workflow } from '@/models/Workflow';
import BitriseYmlService from '@/models/BitriseYmlService';

type BitriseYmlProviderProps = PropsWithChildren<{
  yml: BitriseYml;
  defaultMeta?: Meta;
  onChange?: (yml: BitriseYml) => void;
}>;

export type BitriseYmlProviderState = {
  yml: BitriseYml;
  defaultMeta?: Meta;

  // Workflow related actions
  addStep: (workflowId: string, cvs: string, to: number) => void;
  moveStep: (workflowId: string, stepIndex: number, to: number) => void;
  renameWorkflow: (workflowId: string, newWorkflowId: string) => void;
  updateWorkflow: (workflowId: string, workflow: Workflow) => void;
  createWorkflow: (workflowId: string, baseWorkflowId?: string) => void;
  deleteWorkflow: (workflowId: string) => void;
  deleteWorkflows: (workflowIds: string[]) => void;
  deleteChainedWorkflow: (
    chainedWorkflowIndex: number,
    parentWorkflowId: string,
    placement: ChainedWorkflowPlacement,
  ) => void;
  addChainedWorkflow: (
    chainableWorkflowId: string,
    parentWorkflowId: string,
    placement: ChainedWorkflowPlacement,
  ) => void;
  setChainedWorkflows: (workflowId: string, placement: ChainedWorkflowPlacement, chainedWorkflowIds: string[]) => void;
};

type BitriseYmlStore = ReturnType<typeof createBitriseYmlStore>;

const createBitriseYmlStore = (yml: BitriseYml, defaultMeta?: Meta) => {
  return createStore<BitriseYmlProviderState>()((set) => ({
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
    deleteWorkflows(workflowIds) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deleteWorkflows(workflowIds, state.yml),
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
};

export const BitriseYmlContext = createContext<BitriseYmlStore | null>(null);

const BitriseYmlProvider = ({ yml, defaultMeta, children, onChange }: BitriseYmlProviderProps) => {
  const store = useRef(createBitriseYmlStore(yml, defaultMeta)).current;

  useEffect(() => {
    const unsubsribe = store.subscribe(({ yml: currentYml }, { yml: previousYml }) => {
      if (onChange && JSON.stringify(currentYml) !== JSON.stringify(previousYml)) {
        onChange(currentYml);
      }
    });

    return unsubsribe;
  }, [store, onChange]);

  return <BitriseYmlContext.Provider value={store}>{children}</BitriseYmlContext.Provider>;
};

export default BitriseYmlProvider;

export const withBitriseYml = (yml: BitriseYml, Component: ComponentType) => {
  return (
    <BitriseYmlProvider yml={yml}>
      <Component />
    </BitriseYmlProvider>
  );
};
