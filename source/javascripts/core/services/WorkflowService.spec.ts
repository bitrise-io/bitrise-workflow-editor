import { Workflows } from '../models/BitriseYml';
import { ChainedWorkflowPlacement } from '../models/Workflow';
import { getYmlString, updateBitriseYmlDocumentByString } from '../stores/BitriseYmlStore';
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

  describe('createWorkflow', () => {
    it('should create an empty workflow if base workflow is missing', () => {
      updateBitriseYmlDocumentByString(yaml``);

      WorkflowService.createWorkflow('new-workflow');

      const expectedYml = yaml`
        workflows:
          new-workflow: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should create a workflow based on an other workflow', () => {
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          base-workflow:
            steps:
              - script:
                  title: Base Workflow
                  inputs:
                    - content: echo "Hello from Base Workflow"
      `);

      WorkflowService.createWorkflow('new-workflow', 'base-workflow');

      const expectedYml = yaml`
        workflows:
          base-workflow:
            steps:
              - script:
                  title: Base Workflow
                  inputs:
                    - content: echo "Hello from Base Workflow"
          new-workflow:
            steps:
              - script:
                  title: Base Workflow
                  inputs:
                    - content: echo "Hello from Base Workflow"
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if id is already exists', () => {
      updateBitriseYmlDocumentByString(yaml`
          workflows:
            existing-workflow: {}
        `);

      expect(() => WorkflowService.createWorkflow('existing-workflow')).toThrow(
        "Workflow 'existing-workflow' already exists",
      );
    });
  });

  describe('renameWorkflow', () => {
    it('should be rename an existing workflow', () => {
      updateBitriseYmlDocumentByString(yaml`
          pipelines:
            graph:
              workflows:
                wf1:
                  depends_on:
                  - wf2
                wf2: {}
                variant1:
                  uses: 'wf1'
                variant2:
                  uses: 'wf2'
            pl1:
              stages:
              - st1: {}
            pl2:
              stages:
              - st2:
                  workflows:
                  - wf2: {}
          stages:
            st1:
              workflows:
              - wf1: {}
            st2:
              workflows:
              - wf2: {}
          workflows:
            wf1:
              before_run: [ 'wf2' ]
              after_run:
              - wf2
            wf2: {}
          trigger_map:
          - workflow: 'wf1'
          - workflow: 'wf2'
        `);

      WorkflowService.renameWorkflow('wf2', 'wf3');

      const expectedYml = yaml`
        pipelines:
          graph:
            workflows:
              wf1:
                depends_on:
                - wf3
              wf3: {}
              variant1:
                uses: 'wf1'
              variant2:
                uses: 'wf3'
          pl1:
            stages:
            - st1: {}
          pl2:
            stages:
            - st2:
                workflows:
                - wf3: {}
        stages:
          st1:
            workflows:
            - wf1: {}
          st2:
            workflows:
            - wf3: {}
        workflows:
          wf1:
            before_run: [ 'wf3' ]
            after_run:
            - wf3
          wf3: {}
        trigger_map:
        - workflow: 'wf1'
        - workflow: 'wf3'
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the workflow to rename does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`
          workflows:
            wf1: {}
        `);

      expect(() => WorkflowService.renameWorkflow('non-existing-workflow', 'new-name')).toThrow(
        `Workflow non-existing-workflow not found. Ensure that the workflow exists in the 'workflows' section.`,
      );
    });

    it('should throw an error if the new name already exists', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1: {}
            wf2: {}
        `,
      );

      expect(() => WorkflowService.renameWorkflow('wf1', 'wf2')).toThrow("Workflow 'wf2' already exists");
    });
  });

  describe('updateWorkflowField', () => {
    it('should update the specified field of the workflow', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1:
              title: Old Title
              summary: "Old Summary"
              description: 'Old Description'
        `,
      );

      WorkflowService.updateWorkflowField('wf1', 'title', 'New Title');
      WorkflowService.updateWorkflowField('wf1', 'summary', 'New Summary');
      WorkflowService.updateWorkflowField('wf1', 'description', 'New Description');

      const expectedYml = yaml`
        workflows:
          wf1:
            title: New Title
            summary: "New Summary"
            description: 'New Description'
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove the specified field if the value is empty', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1:
              title: Old Title
              summary: "Old Summary"
              description: 'Old Description'
        `,
      );

      WorkflowService.updateWorkflowField('wf1', 'title', '');
      WorkflowService.updateWorkflowField('wf1', 'summary', '');
      WorkflowService.updateWorkflowField('wf1', 'description', '');

      const expectedYml = yaml`
        workflows:
          wf1: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the workflow does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`
          workflows:
            wf1: {}
        `);

      expect(() => WorkflowService.updateWorkflowField('non-existing-workflow', 'title', 'New Title')).toThrow(
        `Workflow non-existing-workflow not found. Ensure that the workflow exists in the 'workflows' section.`,
      );
    });
  });

  describe('deleteWorkflow', () => {
    it('should remove a workflow in the whole yml completely', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            graph1:
              workflows:
                wf1_variant:
                  uses: 'wf1'
                wf1_variant_dependant:
                  depends_on: [ 'wf1_variant' ]
                wf2:
                  depends_on: [ 'wf1' ]
            graph2:
              workflows:
                wf2_variant:
                  uses: 'wf2'
            pl1:
              stages:
              - st1: {}
            pl2:
              stages:
              - st1: {}
              - st2: {}
            pl3:
              stages:
              - st1:
                  workflows:
                  - wf1: {}
              - st1:
                  workflows:
                  - wf1: {}
                  - wf2: {}
              - st2:
                  workflows:
                  - wf1: {}
                  - wf2: {}
          stages:
            st1:
              workflows:
              - wf1: {}
            st2:
              workflows:
              - wf1: {}
              - wf2: {}
          workflows:
            wf1: {}
            wf1_variant_dependant: {}
            wf2:
              before_run: [ 'wf1' ]
              after_run: [ 'wf1' ]
            wf3:
              before_run: ['wf1', 'wf2']
              after_run: ['wf1', 'wf2']
          trigger_map:
          - workflow: 'wf1'
          - workflow: 'wf2'
          - workflow: 'wf3'
        `,
      );

      WorkflowService.deleteWorkflow('wf1');

      const expectedYml = yaml`
        pipelines:
          graph1:
            workflows:
              wf1_variant_dependant: {}
              wf2: {}
          graph2:
            workflows:
              wf2_variant:
                uses: 'wf2'
          pl2:
            stages:
            - st2: {}
          pl3:
            stages:
            - st1:
                workflows:
                - wf2: {}
            - st2:
                workflows:
                - wf2: {}
        stages:
          st2:
            workflows:
            - wf2: {}
        workflows:
          wf1_variant_dependant: {}
          wf2: {}
          wf3:
            before_run: [ 'wf2' ]
            after_run: [ 'wf2' ]
        trigger_map:
        - workflow: 'wf2'
        - workflow: 'wf3'
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should keep pipelines with stage references which have workflows', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1: {}
            wf2: {}
          stages:
            st1:
              workflows:
              - wf1: {}
            st2:
              workflows:
              - wf1: {}
              - wf2: {}
          pipelines:
            pl1:
              stages:
              - st1: {}
            pl2:
              stages:
              - st1: {}
              - st2: {}
        `,
      );

      WorkflowService.deleteWorkflow('wf1');

      const expectedYml = yaml`
        workflows:
          wf2: {}
        stages:
          st2:
            workflows:
            - wf2: {}
        pipelines:
          pl2:
            stages:
            - st2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should NOT remove the pipeline workflows property when last workflow removed in it', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1: {}
          pipelines:
            pl1:
              workflows:
                wf1: {}
        `,
      );

      WorkflowService.deleteWorkflow('wf1');

      const expectedYml = yaml`
        pipelines:
          pl1:
            workflows: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the workflow to delete does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1: {}
        `,
      );

      expect(() => WorkflowService.deleteWorkflow('non-existing-workflow')).toThrow(
        `Workflow non-existing-workflow not found. Ensure that the workflow exists in the 'workflows' section.`,
      );
    });
  });

  describe('addChainedWorkflow', () => {
    const placements: ChainedWorkflowPlacement[] = ['after_run', 'before_run'];

    placements.forEach((placement) => {
      describe(`when placement is '${placement}'`, () => {
        it('should create placement with chained workflow', () => {
          updateBitriseYmlDocumentByString(
            yaml`
              workflows:
                wf1: {}
                wf2: {}
            `,
          );

          const expectedYml = yaml`
            workflows:
              wf1:
                ${placement}:
                - wf2
              wf2: {}
          `;

          WorkflowService.addChainedWorkflow('wf1', placement, 'wf2');

          expect(getYmlString()).toEqual(expectedYml);
        });

        it('should insert chainable workflow to the end of the list', () => {
          updateBitriseYmlDocumentByString(
            yaml`
              workflows:
                wf1:
                  ${placement}: [ wf2 ]
                wf2: {}
                wf3: {}
            `,
          );

          WorkflowService.addChainedWorkflow('wf1', placement, 'wf3');

          const expectedYml = yaml`
            workflows:
              wf1:
                ${placement}: [ wf2, wf3 ]
              wf2: {}
              wf3: {}
          `;

          expect(getYmlString()).toEqual(expectedYml);
        });

        it('should be able to insert chained workflow multiple times', () => {
          updateBitriseYmlDocumentByString(
            yaml`
              workflows:
                wf1:
                  ${placement}: [ wf2 ]
                wf2: {}
            `,
          );

          WorkflowService.addChainedWorkflow('wf1', placement, 'wf2');

          const expectedYml = yaml`
            workflows:
              wf1:
                ${placement}: [ wf2, wf2 ]
              wf2: {}
          `;

          expect(getYmlString()).toEqual(expectedYml);
        });

        it('throw an error when insert chained workflow into a non-existent workflow', () => {
          updateBitriseYmlDocumentByString(
            yaml`
              workflows:
                wf1: {}
            `,
          );

          expect(() => {
            WorkflowService.addChainedWorkflow('non-existing-workflow', placement, 'wf1');
          }).toThrow(
            `Workflow non-existing-workflow not found. Ensure that the workflow exists in the 'workflows' section.`,
          );
        });

        it('throw an error when insert non-existent chained workflow', () => {
          updateBitriseYmlDocumentByString(
            yaml`
              workflows:
                wf1: {}
            `,
          );
          expect(() => {
            WorkflowService.addChainedWorkflow('wf1', placement, 'non-existing-workflow');
          }).toThrow(
            `Workflow non-existing-workflow not found. Ensure that the workflow exists in the 'workflows' section.`,
          );
        });

        it('throw an error when insert chained workflow to invalid placement', () => {
          updateBitriseYmlDocumentByString(
            yaml`
          workflows:
            wf1: {}
            wf2: {}
        `,
          );

          expect(() => {
            WorkflowService.addChainedWorkflow('wf1', 'invalid_placement' as ChainedWorkflowPlacement, 'wf2');
          }).toThrow(`Invalid placement: invalid_placement. It should be 'before_run' or 'after_run'.`);
        });
      });
    });

    it('throw an error when insert chained workflow to invalid placement', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1: {}
            wf2: {}
        `,
      );

      expect(() => {
        WorkflowService.addChainedWorkflow('wf1', 'invalid_placement' as ChainedWorkflowPlacement, 'wf2');
      }).toThrow(`Invalid placement: invalid_placement. It should be 'before_run' or 'after_run'.`);
    });
  });

  describe('removeChainedWorkflow', () => {
    const placements: ChainedWorkflowPlacement[] = ['after_run', 'before_run'];

    placements.forEach((placement) => {
      describe(`when placement is '${placement}'`, () => {
        it('should remove workflow from the target placement', () => {
          updateBitriseYmlDocumentByString(
            yaml`
              workflows:
                wf1:
                  before_run: [ wf2, wf3, wf2 ]
                  after_run:
                  - wf2
                  - wf3
                  - wf2
            `,
          );

          WorkflowService.removeChainedWorkflow('wf1', placement, 'wf2', 0);

          let expectedYml = ``;
          if (placement === 'before_run') {
            expectedYml = yaml`
              workflows:
                wf1:
                  before_run: [ wf3, wf2 ]
                  after_run:
                  - wf2
                  - wf3
                  - wf2
            `;
          } else {
            expectedYml = yaml`
              workflows:
                wf1:
                  before_run: [ wf2, wf3, wf2 ]
                  after_run:
                  - wf3
                  - wf2
            `;
          }

          expect(getYmlString()).toEqual(expectedYml);
        });

        it('should remove placement when placement is empty', () => {
          updateBitriseYmlDocumentByString(
            yaml`
              workflows:
                wf1:
                  before_run: [ wf2 ]
                  after_run:
                  - wf2
            `,
          );

          WorkflowService.removeChainedWorkflow('wf1', placement, 'wf2', 0);

          let expectedYml = ``;
          if (placement === 'before_run') {
            expectedYml = yaml`
              workflows:
                wf1:
                  after_run:
                  - wf2
            `;
          } else {
            expectedYml = yaml`
              workflows:
                wf1:
                  before_run: [ wf2 ]
            `;
          }

          expect(getYmlString()).toEqual(expectedYml);
        });

        it('throw an error if the parentWorkflowId does not exist', () => {
          updateBitriseYmlDocumentByString(
            yaml`
              workflows:
                wf1: {}
            `,
          );

          expect(() => {
            WorkflowService.removeChainedWorkflow('non-existing-workflow', placement, 'wf1', 0);
          }).toThrow(
            `Workflow non-existing-workflow not found. Ensure that the workflow exists in the 'workflows' section.`,
          );
        });

        it('throw an error if the chainedWorkflowId does not match the index', () => {
          updateBitriseYmlDocumentByString(
            yaml`
              workflows:
                wf1:
                  ${placement}: [ wf2, wf3 ]
            `,
          );

          expect(() => {
            WorkflowService.removeChainedWorkflow('wf1', placement, 'wf3', 0);
          }).toThrow(`Workflow wf3 is not in the ${placement} workflow chain of wf1.`);
        });

        it('throw an error if the index is out of range', () => {
          updateBitriseYmlDocumentByString(
            yaml`
              workflows:
                wf1:
                  ${placement}: [ wf2, wf3 ]
            `,
          );

          expect(() => {
            WorkflowService.removeChainedWorkflow('wf1', placement, 'wf2', 2);
          }).toThrow(`Workflow wf2 is not in the ${placement} workflow chain of wf1.`);
        });

        it('throw an error if the placement is invalid', () => {
          updateBitriseYmlDocumentByString(
            yaml`
              workflows:
                wf1: {}
                wf2: {}
                wf3: {}
              `,
          );

          expect(() => {
            WorkflowService.removeChainedWorkflow('wf1', 'invalid_placement' as ChainedWorkflowPlacement, 'wf2', 0);
          }).toThrow(`Invalid placement: invalid_placement. It should be 'before_run' or 'after_run'.`);
        });
      });
    });

    it('throw an error when insert chained workflow to invalid placement', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1: {}
            wf2: {}
        `,
      );

      expect(() => {
        WorkflowService.removeChainedWorkflow('wf1', 'invalid_placement' as ChainedWorkflowPlacement, 'wf2', 0);
      }).toThrow(`Invalid placement: invalid_placement. It should be 'before_run' or 'after_run'.`);
    });
  });

  describe('setChainedWorkflows', () => {
    it('should set the before workflows for the target workflow', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1:
              after_run: [ wf2, wf3 ]
            wf2: {}
            wf3: {}
        `,
      );

      WorkflowService.setChainedWorkflows('wf1', 'before_run', ['wf2', 'wf3']);

      const expectedYml = yaml`
        workflows:
          wf1:
            after_run: [ wf2, wf3 ]
            before_run:
            - wf2
            - wf3
          wf2: {}
          wf3: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should set the after workflows for the target workflow', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1:
              before_run: [ wf2, wf3 ]
            wf2: {}
            wf3: {}
        `,
      );

      WorkflowService.setChainedWorkflows('wf1', 'after_run', ['wf2', 'wf3']);

      const expectedYml = yaml`
        workflows:
          wf1:
            before_run: [ wf2, wf3 ]
            after_run:
            - wf2
            - wf3
          wf2: {}
          wf3: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should replace the after workflows for the target workflow', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1:
              after_run: [ 'wf2', "wf3", wf4 ]
            wf2: {}
            wf3: {}
            wf4: {}
        `,
      );

      WorkflowService.setChainedWorkflows('wf1', 'after_run', ['wf4', 'wf3', 'wf2']);

      const expectedYml = yaml`
        workflows:
          wf1:
            after_run: [ 'wf4', "wf3", wf2 ]
          wf2: {}
          wf3: {}
          wf4: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove before workflows if it is empty', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1:
              before_run: [ wf2, wf3 ]
            wf2: {}
            wf3: {}
        `,
      );

      WorkflowService.setChainedWorkflows('wf1', 'before_run', []);

      const expectedYml = yaml`
        workflows:
          wf1: {}
          wf2: {}
          wf3: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('throw an error if the workflow to set does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1: {}
        `,
      );

      expect(() => {
        WorkflowService.setChainedWorkflows('non-existing-workflow', 'after_run', ['wf2']);
      }).toThrow(
        `Workflow non-existing-workflow not found. Ensure that the workflow exists in the 'workflows' section.`,
      );
    });

    it('throw an error if the chained workflow to set does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1: {}
        `,
      );

      expect(() => {
        WorkflowService.setChainedWorkflows('wf1', 'after_run', ['non-existing-workflow']);
      }).toThrow(
        `Workflow non-existing-workflow not found. Ensure that the workflow exists in the 'workflows' section.`,
      );
    });

    it('throw an error if the placement is invalid', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            wf1: {}
            wf2: {}
            wf3: {}
          `,
      );

      expect(() => {
        WorkflowService.setChainedWorkflows('wf1', 'invalid_placement' as ChainedWorkflowPlacement, ['wf2', 'wf3']);
      }).toThrow(`Invalid placement: invalid_placement. It should be 'before_run' or 'after_run'.`);
    });
  });
});
