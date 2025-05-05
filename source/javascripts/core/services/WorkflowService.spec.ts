import BitriseYmlApi from '../api/BitriseYmlApi';
import { Workflows } from '../models/BitriseYml';
import { bitriseYmlStore, initializeStore } from '../stores/BitriseYmlStore';
import WorkflowService from './WorkflowService';

describe('WorkflowService', () => {
  describe('validateName', () => {
    describe('when the initial name is empty', () => {
      it('returns true if workflow name is valid and unique', () => {
        const result = WorkflowService.validateName('wf4', '', ['wf1', 'wf2', 'wf3']);
        expect(result).toBe(true);
      });

      it('returns error message when workflow name is empty', () => {
        const result = WorkflowService.validateName('', '', ['wf1', 'wf2', 'wf3']);
        expect(result).toBe('Workflow name is required');
      });

      it('returns error message when workflow name is whitespace only', () => {
        const result = WorkflowService.validateName('   ', '', ['wf1', 'wf2', 'wf3']);
        expect(result).toBe('Workflow name is required');
      });

      it('returns error message when workflow name contains invalid characters', () => {
        const result = WorkflowService.validateName('invalid@name!', '', ['wf1', 'wf2', 'wf3']);
        expect(result).toBe('Workflow name must only contain letters, numbers, dashes, underscores or periods');
      });

      it('returns error message when workflow name is not unique', () => {
        const result = WorkflowService.validateName('wf1', '', ['wf1', 'wf2', 'wf3']);
        expect(result).toBe('Workflow name should be unique');
      });
    });

    describe('when the initial name is not empty', () => {
      it('returns true if workflow name is valid and unique', () => {
        const result = WorkflowService.validateName('my-first-workflow', 'wf1', ['wf1', 'wf2', 'wf3']);
        expect(result).toBe(true);
      });

      it('returns error message when workflow name is empty', () => {
        const result = WorkflowService.validateName('', 'wf1', ['wf1', 'wf2', 'wf3']);
        expect(result).toBe('Workflow name is required');
      });

      it('returns error message when workflow name is whitespace only', () => {
        const result = WorkflowService.validateName('   ', 'w1', ['wf1', 'wf2', 'wf3']);
        expect(result).toBe('Workflow name is required');
      });

      it('returns error message when workflow name contains invalid characters', () => {
        const result = WorkflowService.validateName('invalid@name!', 'wf1', ['wf1', 'wf2', 'wf3']);
        expect(result).toBe('Workflow name must only contain letters, numbers, dashes, underscores or periods');
      });

      it('returns error message when workflow name is not unique', () => {
        const result = WorkflowService.validateName('wf2', 'wf1', ['wf1', 'wf2', 'wf3']);
        expect(result).toBe('Workflow name should be unique');
      });
    });
  });

  describe('sanitizeName', () => {
    it('returns the same name if it contains only valid characters', () => {
      const name = 'valid.name-123';
      const result = WorkflowService.sanitizeName(name);
      expect(result).toBe('valid.name-123');
    });

    it('removes invalid characters from the name', () => {
      const name = '@name!';
      const result = WorkflowService.sanitizeName(name);
      expect(result).toBe('name');
    });

    it('removes spaces from the name', () => {
      const name = ' name with spaces ';
      const result = WorkflowService.sanitizeName(name);
      expect(result).toBe('namewithspaces');
    });

    it('returns an empty string if the name contains only invalid characters', () => {
      const name = '@!#$%^&*()';
      const result = WorkflowService.sanitizeName(name);
      expect(result).toBe('');
    });
  });

  describe('isUtilityWorkflow', () => {
    it('should return true when the workflow starts with "_"', () => {
      const workflowId = '_utility';

      const result = WorkflowService.isUtilityWorkflow(workflowId);

      expect(result).toBe(true);
    });

    it('should return false otherwise', () => {
      const workflowId = 'wf-1';

      const result = WorkflowService.isUtilityWorkflow(workflowId);

      expect(result).toBe(false);
    });
  });

  describe('getBeforeRunChain', () => {
    it('should return an empty array when there are no workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {};

      const result = WorkflowService.getBeforeRunChain(workflows, id);

      expect(result).toEqual([]);
    });

    it('should return an empty array when the workflow does not have any before_run workflow', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {},
      };

      const result = WorkflowService.getBeforeRunChain(workflows, id);

      expect(result).toEqual([]);
    });

    it('should skip non-existing workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {
          before_run: ['wf-0', 'wf-2'],
        },
      };

      const result = WorkflowService.getBeforeRunChain(workflows, id);

      expect(result).toEqual([]);
    });

    it('should return directly chained workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {
          before_run: ['wf-2', 'wf-3'],
        },
        'wf-2': {},
        'wf-3': {},
        'wf-4': {},
        'wf-5': {},
      };

      const result = WorkflowService.getBeforeRunChain(workflows, id);

      expect(result).toEqual(['wf-2', 'wf-3']);
    });

    it('should contain indirectly chained workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {
          before_run: ['wf-2'],
        },
        'wf-2': {
          before_run: ['wf-3'],
        },
        'wf-3': {
          before_run: ['wf-4'],
        },
        'wf-4': {},
        'wf-5': {},
      };

      const result = WorkflowService.getBeforeRunChain(workflows, id);

      expect(result).toEqual(expect.arrayContaining(['wf-4', 'wf-3']));
    });

    it('should return both directly and indirectly referenced chained workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {
          before_run: ['wf-2', 'wf-4'],
        },
        'wf-2': {
          before_run: ['wf-3'],
        },
        'wf-3': {},
        'wf-4': {
          before_run: ['wf-5'],
        },
        'wf-5': {},
        'wf-6': {},
      };

      const result = WorkflowService.getBeforeRunChain(workflows, id);

      expect(result).toEqual(['wf-3', 'wf-2', 'wf-5', 'wf-4']);
    });

    it('should return after_run workflows of before_run workflows', () => {
      const id = 'wf-5';
      const workflows: Workflows = {
        'wf-1': {},
        'wf-2': {
          before_run: ['wf-1'],
          after_run: ['wf-3'],
        },
        'wf-3': {},
        'wf-4': {
          before_run: ['wf-2'],
        },
        'wf-5': {
          before_run: ['wf-4'],
        },
      };

      const result = WorkflowService.getBeforeRunChain(workflows, id);

      expect(result).toEqual(['wf-1', 'wf-2', 'wf-3', 'wf-4']);
    });
  });

  describe('getAfterRunChain', () => {
    it('should return an empty array when there are no workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {};

      const result = WorkflowService.getAfterRunChain(workflows, id);

      expect(result).toEqual([]);
    });

    it('should return an empty array when the workflow does not have any after_run workflow', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {},
      };

      const result = WorkflowService.getAfterRunChain(workflows, id);

      expect(result).toEqual([]);
    });

    it('should skip non-existing workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {
          after_run: ['wf-0', 'wf-2'],
        },
      };

      const result = WorkflowService.getAfterRunChain(workflows, id);

      expect(result).toEqual([]);
    });

    it('should return the directly chained workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {
          after_run: ['wf-2', 'wf-3'],
        },
        'wf-2': {},
        'wf-3': {},
        'wf-4': {},
      };

      const result = WorkflowService.getAfterRunChain(workflows, id);

      expect(result).toEqual(['wf-2', 'wf-3']);
    });

    it('should contain indirectly chained workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {
          after_run: ['wf-2'],
        },
        'wf-2': {
          after_run: ['wf-3'],
        },
        'wf-3': {
          after_run: ['wf-4'],
        },
        'wf-4': {},
        'wf-5': {},
      };

      const result = WorkflowService.getAfterRunChain(workflows, id);

      expect(result).toEqual(expect.arrayContaining(['wf-3', 'wf-4']));
    });

    it('should return both directly and indirectly referenced chained workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {
          after_run: ['wf-2', 'wf-4'],
        },
        'wf-2': {
          after_run: ['wf-3'],
        },
        'wf-3': {},
        'wf-4': {
          after_run: ['wf-5'],
        },
        'wf-5': {},
        'wf-6': {},
      };

      const result = WorkflowService.getAfterRunChain(workflows, id);

      expect(result).toEqual(['wf-2', 'wf-3', 'wf-4', 'wf-5']);
    });

    it('should return before_run workflows of after_run workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {
          after_run: ['wf-3'],
        },
        'wf-2': {},
        'wf-3': {
          before_run: ['wf-2'],
          after_run: ['wf-4'],
        },
        'wf-4': {
          after_run: ['wf-5'],
        },
        'wf-5': {},
      };

      const result = WorkflowService.getAfterRunChain(workflows, id);

      expect(result).toEqual(['wf-2', 'wf-3', 'wf-4', 'wf-5']);
    });
  });

  describe('getWorkflowChain', () => {
    it('should return an empty array when there are no workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {};

      const result = WorkflowService.getWorkflowChain(workflows, id);

      expect(result).toEqual([]);
    });

    it('should return the workflow itself when there are no before_run or after_run workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {},
      };

      const result = WorkflowService.getWorkflowChain(workflows, id);

      expect(result).toEqual(['wf-1']);
    });

    it('should return before_run workflows before the current workflow', () => {
      const id = 'wf-3';
      const workflows: Workflows = {
        'wf-1': {},
        'wf-2': {
          before_run: ['wf-1'],
        },
        'wf-3': {
          before_run: ['wf-2'],
        },
      };

      const result = WorkflowService.getWorkflowChain(workflows, id);

      expect(result).toEqual(['wf-1', 'wf-2', 'wf-3']);
    });

    it('should return after_run workflows after the current workflow', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {
          after_run: ['wf-2'],
        },
        'wf-2': {
          after_run: ['wf-3'],
        },
        'wf-3': {},
      };

      const result = WorkflowService.getWorkflowChain(workflows, id);

      expect(result).toEqual(['wf-1', 'wf-2', 'wf-3']);
    });

    it('should return both before_run and after_run workflows around the current workflow', () => {
      const id = 'wf-4';
      const workflows: Workflows = {
        'wf-1': {},
        'wf-2': {
          before_run: ['wf-1'],
          after_run: ['wf-3'],
        },
        'wf-3': {},
        'wf-4': {
          before_run: ['wf-2'],
          after_run: ['wf-6'],
        },
        'wf-5': {},
        'wf-6': {
          before_run: ['wf-5'],
          after_run: ['wf-7'],
        },
        'wf-7': {},
      };

      const result = WorkflowService.getWorkflowChain(workflows, id);

      expect(result).toEqual(['wf-1', 'wf-2', 'wf-3', 'wf-4', 'wf-5', 'wf-6', 'wf-7']);
    });
  });

  describe('getAllWorkflowChains', () => {
    it('should return an empty object when there are no workflows', () => {
      const workflows: Workflows = {};

      const result = WorkflowService.getAllWorkflowChains(workflows);

      expect(result).toEqual({});
    });

    it('should return the workflow chains for independent workflows', () => {
      const workflows: Workflows = {
        'wf-1': {},
        'wf-2': {},
        'wf-3': {},
      };

      const result = WorkflowService.getAllWorkflowChains(workflows);

      expect(result).toEqual({
        'wf-1': ['wf-1'],
        'wf-2': ['wf-2'],
        'wf-3': ['wf-3'],
      });
    });

    it('should return the workflow chains for dependent workflows', () => {
      const workflows: Workflows = {
        'wf-1': {},
        'wf-2': {
          before_run: ['wf-1'],
          after_run: ['wf-3'],
        },
        'wf-3': {},
        'wf-4': {
          before_run: ['wf-2'],
          after_run: ['wf-6'],
        },
        'wf-5': {},
        'wf-6': {
          before_run: ['wf-5'],
          after_run: ['wf-7'],
        },
        'wf-7': {},
      };

      const result = WorkflowService.getAllWorkflowChains(workflows);

      expect(result).toEqual({
        'wf-1': ['wf-1'],
        'wf-2': ['wf-1', 'wf-2', 'wf-3'],
        'wf-3': ['wf-3'],
        'wf-4': ['wf-1', 'wf-2', 'wf-3', 'wf-4', 'wf-5', 'wf-6', 'wf-7'],
        'wf-5': ['wf-5'],
        'wf-6': ['wf-5', 'wf-6', 'wf-7'],
        'wf-7': ['wf-7'],
      });
    });
  });

  describe('getChainableWorkflows', () => {
    it('should return an empty array when there are no workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {};

      const result = WorkflowService.getChainableWorkflows(workflows, id);

      expect(result).toEqual([]);
    });

    it('should not return the current workflow', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {},
        'wf-2': {},
        'wf-3': {},
      };

      const result = WorkflowService.getChainableWorkflows(workflows, id);

      expect(result).not.toContain(['wf-1']);
      expect(result).toEqual(['wf-2', 'wf-3']);
    });

    it('should not return directly dependent workflows on the current workflow', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {},
        'wf-2': {
          before_run: ['wf-1'],
        },
        'wf-3': {
          after_run: ['wf-1'],
        },
        'wf-4': {},
        'wf-5': {},
      };

      const result = WorkflowService.getChainableWorkflows(workflows, id);

      expect(result).not.toContain(['wf-2', 'wf-3']);
      expect(result).toEqual(['wf-4', 'wf-5']);
    });

    it('should not return indirectly dependent workflows on the current workflow', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {},
        'wf-2': {
          before_run: ['wf-1'],
        },
        'wf-3': {
          after_run: ['wf-1'],
        },
        'wf-4': {
          after_run: ['wf-2'],
        },
        'wf-5': {
          before_run: ['wf-3'],
        },
        'wf-6': {},
        'wf-7': {},
      };

      const result = WorkflowService.getChainableWorkflows(workflows, id);

      expect(result).not.toContain(['wf-4', 'wf-5']);
      expect(result).toEqual(['wf-6', 'wf-7']);
    });

    it('should not return either directly or indirectly dependent workflows on the current workflow', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {},
        'wf-2': {
          before_run: ['wf-1'],
        },
        'wf-3': {
          after_run: ['wf-4'],
        },
        'wf-4': {
          before_run: ['wf-2'],
        },
        'wf-5': {
          after_run: ['wf-1'],
        },
        'wf-6': {
          after_run: ['wf-5'],
        },
        'wf-7': {},
        'wf-8': {
          before_run: ['wf-7'],
          after_run: ['wf-9'],
        },
        'wf-9': {},
      };

      const result = WorkflowService.getChainableWorkflows(workflows, id);

      expect(result).not.toContain(['wf-1', 'wf-2', 'wf-3', 'wf-4', 'wf-5', 'wf-6']);
      expect(result).toEqual(['wf-7', 'wf-8', 'wf-9']);
    });
  });

  describe('getDependantWorkflows', () => {
    it('should return an empty array when there are no workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {};

      const result = WorkflowService.getDependantWorkflows(workflows, id);

      expect(result).toEqual([]);
    });

    it('should return an empty array when the workflow is not used by any other workflows', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {},
        'wf-2': {},
        'wf-3': {},
      };

      const result = WorkflowService.getDependantWorkflows(workflows, id);

      expect(result).toEqual([]);
    });

    it('should return the workflows that directly use the current workflow', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {},
        'wf-2': {
          before_run: ['wf-1'],
        },
        'wf-3': {
          after_run: ['wf-1'],
        },
        'wf-4': {},
        'wf-5': {},
      };

      const result = WorkflowService.getDependantWorkflows(workflows, id);

      expect(result).toEqual(['wf-2', 'wf-3']);
    });

    it('should return the workflows that indirectly use the current workflow', () => {
      const id = 'wf-1';
      const workflows: Workflows = {
        'wf-1': {},
        'wf-2': {
          before_run: ['wf-1'],
        },
        'wf-3': {
          after_run: ['wf-4'],
        },
        'wf-4': {
          before_run: ['wf-2'],
        },
        'wf-5': {
          after_run: ['wf-1'],
        },
        'wf-6': {
          after_run: ['wf-5'],
        },
        'wf-7': {},
        'wf-8': {
          before_run: ['wf-7'],
          after_run: ['wf-9'],
        },
        'wf-9': {},
      };

      const result = WorkflowService.getDependantWorkflows(workflows, id);

      expect(result).toEqual(['wf-2', 'wf-3', 'wf-4', 'wf-5', 'wf-6']);
    });
  });

  describe('addStep', () => {
    it('should add step to the expected place in workflow.steps', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            wf1:
              steps:
              - step1: {}
              - step2: {}
            wf2:
              steps:
              - step3: {}
            wf3: {}
        `,
      });

      WorkflowService.addStep('wf1', 'new_step', 1);
      WorkflowService.addStep('wf2', 'new_step', 1);
      WorkflowService.addStep('wf3', 'new_step', 0);

      const expectedYmlString = yaml`
        workflows:
          wf1:
            steps:
            - step1: {}
            - new_step: {}
            - step2: {}
          wf2:
            steps:
            - step3: {}
            - new_step: {}
          wf3:
            steps:
            - new_step: {}
      `;

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(expectedYmlString);
    });

    it('should throw an error if the workflow does not exist', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            wf1:
              steps:
              - step1: {}
              - step2: {}
        `,
      });

      expect(() => WorkflowService.addStep('non_existent_workflow', 'new_step', 1)).toThrow(
        'Workflow with ID non_existent_workflow not found',
      );
    });
  });

  describe('moveStep', () => {
    it('should move step to the expected place in workflow.steps', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            wf1:
              steps:
              - step1: {}
              - step2: {}
              - step3: {}
        `,
      });

      WorkflowService.moveStep('wf1', 0, 2);

      const expectedYmlString = yaml`
        workflows:
          wf1:
            steps:
            - step2: {}
            - step3: {}
            - step1: {}
      `;

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(expectedYmlString);
    });

    it('should throw an error if the workflow does not exist', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            wf1:
              steps:
              - step1: {}
              - step2: {}
        `,
      });

      expect(() => WorkflowService.moveStep('non_existent_workflow', 0, 1)).toThrow(
        'Workflow with ID non_existent_workflow not found',
      );
    });

    it('should throw an error if the step does not exist', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            wf1:
              steps:
              - step1: {}
              - step2: {}
        `,
      });

      expect(() => WorkflowService.moveStep('wf1', 2, 0)).toThrow('Step at index 2 not found in workflow wf1');
    });
  });

  describe('cloneStep', () => {
    it('should clone step to the expected place in workflow.steps', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            wf1:
              steps:
              - step1: {}
              - step2: {}
              - step3: {}
        `,
      });

      WorkflowService.cloneStep('wf1', 1);

      const expectedYmlString = yaml`
        workflows:
          wf1:
            steps:
            - step1: {}
            - step2: {}
            - step2: {}
            - step3: {}
      `;

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(expectedYmlString);
    });

    it('should throw an error if the workflow does not exist', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            wf1:
              steps:
              - step1: {}
              - step2: {}
        `,
      });

      expect(() => WorkflowService.cloneStep('non_existent_workflow', 0)).toThrow(
        'Workflow with ID non_existent_workflow not found',
      );
    });

    it('should throw an error if the step does not exist', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            wf1:
              steps:
              - step1: {}
              - step2: {}
        `,
      });

      expect(() => WorkflowService.cloneStep('wf1', 2)).toThrow('Step at index 2 not found in workflow wf1');
    });
  });
});
