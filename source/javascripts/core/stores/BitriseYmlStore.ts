import { createStore, StoreApi } from 'zustand';
import { BitriseYml, Meta } from '@/core/models/BitriseYml';
import { ChainedWorkflowPlacement, WorkflowYmlObject } from '@/core/models/Workflow';
import BitriseYmlService from '@/core/models/BitriseYmlService';
import { StepInputVariable, StepYmlObject } from '@/core/models/Step';
import { EnvVar } from '../models/EnvVar';
import EnvVarService from '../models/EnvVarService';
import { TriggerMapYml } from '../models/TriggerMap';

type BitriseYmlStoreState = {
  yml: BitriseYml;
  defaultMeta?: Meta;

  getUniqueStepIds: () => string[];

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
  updateStackAndMachine: (workflowId: string, stack: string, machineTypeId: string) => void;
  appendWorkflowEnvVar: (workflowId: string, envVar: EnvVar) => void;
  updateWorkflowEnvVars: (workflowId: string, envVars: EnvVar[]) => void;
  deleteChainedWorkflow: (
    chainedWorkflowIndex: number,
    parentWorkflowId: string,
    placement: ChainedWorkflowPlacement,
  ) => void;
  addStep: (workflowId: string, cvs: string, to: number) => void;
  moveStep: (workflowId: string, stepIndex: number, to: number) => void;
  cloneStep: (workflowId: string, stepIndex: number) => void;
  updateStep: (
    workflowId: string,
    stepIndex: number,
    newValues: Omit<StepYmlObject, 'inputs' | 'outputs'>,
    defaultValues: Omit<StepYmlObject, 'inputs' | 'outputs'>,
  ) => void;
  updateStepInputs: (
    workflowId: string,
    stepIndex: number,
    inputs: StepInputVariable[],
    defaultInputs: StepInputVariable[],
  ) => void;
  changeStepVersion: (workflowId: string, stepIndex: number, version: string) => void;
  deleteStep: (workflowId: string, stepIndex: number) => void;
  updateTriggerMap: (newTriggerMap: TriggerMapYml) => void;
  updateWorkflowTriggers: (workflowId: string, triggers: WorkflowYmlObject['triggers']) => void;
};

type BitriseYmlStore = StoreApi<BitriseYmlStoreState>;

function create(yml: BitriseYml, defaultMeta?: Meta): BitriseYmlStore {
  return createStore<BitriseYmlStoreState>()((set, get) => ({
    yml,
    defaultMeta,
    getUniqueStepIds() {
      return BitriseYmlService.getUniqueStepIds(get().yml);
    },
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
    updateStackAndMachine(workflowId, stack, machineTypeId) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStackAndMachine(workflowId, stack, machineTypeId, state.yml),
        };
      });
    },
    appendWorkflowEnvVar(workflowId, envVar) {
      return set((state) => {
        return {
          yml: BitriseYmlService.appendWorkflowEnvVar(workflowId, EnvVarService.parseEnvVar(envVar), state.yml),
        };
      });
    },
    updateWorkflowEnvVars(workflowId, envVars) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateWorkflowEnvVars(workflowId, envVars.map(EnvVarService.parseEnvVar), state.yml),
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
    updateStep: (workflowId, stepIndex, newValues, defaultValues) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStep(workflowId, stepIndex, newValues, defaultValues, state.yml),
        };
      });
    },
    updateStepInputs: (workflowId, stepIndex, inputs, defaultInputs) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateStepInputs(workflowId, stepIndex, inputs, defaultInputs, state.yml),
        };
      });
    },
    changeStepVersion: (workflowId, stepIndex, version) => {
      return set((state) => {
        return {
          yml: BitriseYmlService.changeStepVersion(workflowId, stepIndex, version, state.yml),
        };
      });
    },
    deleteStep(workflowId, stepIndex) {
      return set((state) => {
        return {
          yml: BitriseYmlService.deleteStep(workflowId, stepIndex, state.yml),
        };
      });
    },
    updateTriggerMap(triggerMap) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateTriggerMap(triggerMap, state.yml),
        };
      });
    },
    updateWorkflowTriggers(workflowId, triggers) {
      return set((state) => {
        return {
          yml: BitriseYmlService.updateWorkflowTriggers(workflowId, triggers, state.yml),
        };
      });
    },
  }));
}

export { BitriseYmlStore, BitriseYmlStoreState };

export default {
  create,
};
