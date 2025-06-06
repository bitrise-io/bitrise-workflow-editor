import { EnvVarSource } from '../models/EnvVar';
import { getYmlString, updateBitriseYmlDocumentByString } from '../stores/BitriseYmlStore';
import EnvVarService from './EnvVarService';

describe('EnvVarService', () => {
  describe('validateKey', () => {
    it('returns true when key is valid', () => {
      const result = EnvVarService.validateKey('VALID_KEY');
      expect(result).toBe(true);
    });

    it('returns error message when key is empty', () => {
      const result = EnvVarService.validateKey('');
      expect(result).toBe('Key is required');
    });

    it('returns error message when key starts with a number', () => {
      const result = EnvVarService.validateKey('1INVALID_KEY');
      expect(result).toBe('Key should contain letters, numbers, underscores, should not begin with a number');
    });

    it('returns error message when key contains invalid characters', () => {
      const result = EnvVarService.validateKey('INVALID-KEY');
      expect(result).toBe('Key should contain letters, numbers, underscores, should not begin with a number');
    });

    it('returns error message when key contains spaces', () => {
      const result = EnvVarService.validateKey('INVALID KEY');
      expect(result).toBe('Key should contain letters, numbers, underscores, should not begin with a number');
    });

    it('returns error message when key contains special characters', () => {
      const result = EnvVarService.validateKey('INVALID@KEY');
      expect(result).toBe('Key should contain letters, numbers, underscores, should not begin with a number');
    });
  });

  describe('fromYml', () => {
    it('converts yaml to EnvVar when isExpand: false', () => {
      const result = EnvVarService.fromYml(
        {
          SERVICE_VERSION: '1.2.3',
          opts: { is_expand: false },
        },
        'app.envs.0',
      );

      expect(result).toEqual({
        key: 'SERVICE_VERSION',
        value: '1.2.3',
        isExpand: false,
        source: 'app.envs.0',
      });
    });

    it('converts yaml to EnvVar when isExpand: true', () => {
      const result = EnvVarService.fromYml(
        {
          SERVICE_VERSION: '1.2.3',
          opts: { is_expand: true },
        },
        'app.envs.0',
      );

      expect(result).toEqual({
        key: 'SERVICE_VERSION',
        value: '1.2.3',
        source: 'app.envs.0',
        isExpand: true,
      });
    });

    it('converts yaml to EnvVar when isExpand: undefined', () => {
      const result = EnvVarService.fromYml(
        {
          SERVICE_VERSION: '1.2.3',
        },
        'app.envs.0',
      );

      expect(result).toEqual({
        key: 'SERVICE_VERSION',
        value: '1.2.3',
        source: 'app.envs.0',
      });
    });
  });

  describe('toYml', () => {
    it('converts EnvVar to yaml when isExpand: false', () => {
      const result = EnvVarService.toYml({
        key: 'SERVICE_VERSION',
        value: '1.2.3',
        isExpand: false,
        source: 'app.envs.0',
      });

      expect(result).toEqual({
        SERVICE_VERSION: '1.2.3',
        opts: { is_expand: false },
      });
    });

    it('converts EnvVar to yaml when isExpand: true', () => {
      const result = EnvVarService.toYml({
        key: 'SERVICE_VERSION',
        value: '1.2.3',
        isExpand: true,
        source: 'app.envs.0',
      });

      expect(result).toEqual({
        SERVICE_VERSION: '1.2.3',
      });
    });

    it('converts EnvVar to yaml when isExpand: undefined', () => {
      const result = EnvVarService.toYml({
        key: 'SERVICE_VERSION',
        value: '1.2.3',
        source: 'app.envs.0',
      });

      expect(result).toEqual({
        SERVICE_VERSION: '1.2.3',
      });
    });
  });

  describe('getAll', () => {
    beforeAll(() => {
      updateBitriseYmlDocumentByString(
        yaml`
          app:
            envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando
          workflows:
            wf1:
              envs:
                - NODE_VERSION: lts
                  opts:
                    is_expand: false
                - ENVIRONMENT: production
                  opts:
                    is_expand: true
            wf2:
              envs:
                - PARALLEL: 4`,
      );
    });

    it('returns all project and all workflow env_vars from the yml', () => {
      const result = EnvVarService.getAll();
      expect(result).toEqual([
        { key: 'SERVICE_VERSION', value: '1.2.3', source: 'Project envs' },
        { key: 'PROJECT_NAME', value: 'Mando', source: 'Project envs' },
        { key: 'NODE_VERSION', value: 'lts', source: 'Workflow: wf1', isExpand: false },
        { key: 'ENVIRONMENT', value: 'production', source: 'Workflow: wf1', isExpand: true },
        { key: 'PARALLEL', value: '4', source: 'Workflow: wf2' },
      ]);
    });

    it('returns all env_vars from app.envs', () => {
      const result = EnvVarService.getAll(EnvVarSource.App);
      expect(result).toEqual([
        { key: 'SERVICE_VERSION', value: '1.2.3', source: 'Project envs' },
        { key: 'PROJECT_NAME', value: 'Mando', source: 'Project envs' },
      ]);
    });

    it('returns all env_vars from all workflows', () => {
      const result = EnvVarService.getAll(EnvVarSource.Workflows, '*');
      expect(result).toEqual([
        { key: 'NODE_VERSION', value: 'lts', source: 'Workflow: wf1', isExpand: false },
        { key: 'ENVIRONMENT', value: 'production', source: 'Workflow: wf1', isExpand: true },
        { key: 'PARALLEL', value: '4', source: 'Workflow: wf2' },
      ]);
    });

    it('returns all env_vars from a specific workflow', () => {
      const result = EnvVarService.getAll(EnvVarSource.Workflows, 'wf1');
      expect(result).toEqual([
        { key: 'NODE_VERSION', value: 'lts', source: 'Workflow: wf1', isExpand: false },
        { key: 'ENVIRONMENT', value: 'production', source: 'Workflow: wf1', isExpand: true },
      ]);
    });

    it('throws an error when source is Workflow and sourceId is not provided', () => {
      expect(() => {
        EnvVarService.getAll(EnvVarSource.Workflows);
      }).toThrow('sourceId is required when source is Workflows');
    });

    it('throws an error when workflow is not found', () => {
      expect(() => {
        EnvVarService.getAll(EnvVarSource.Workflows, 'nonexistent');
      }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
    });
  });

  describe('create', () => {
    describe('project-level envs', () => {
      it('creates an empty env_var at the end of app.envs', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        );

        EnvVarService.create({ source: EnvVarSource.App });

        expect(getYmlString()).toEqual(yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - "": ""
                opts:
                  is_expand: false
        `);
      });

      it('creates app.envs when it does not exist', () => {
        updateBitriseYmlDocumentByString(yaml``);

        EnvVarService.create({ source: EnvVarSource.App });

        expect(getYmlString()).toEqual(yaml`
          app:
            envs:
            - "": ""
              opts:
                is_expand: false
        `);
      });
    });

    describe('workflow-level envs', () => {
      it('appends an empty env_var to the end of workflows.[id].envs', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
              wf2:
                envs:
                - PARALLEL: 4`,
        );

        EnvVarService.create({ source: EnvVarSource.Workflows, sourceId: 'wf1' });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE_VERSION: lts
              - "": ""
                opts:
                  is_expand: false
            wf2:
              envs:
              - PARALLEL: 4
          `);
      });

      it('creates workflows.[id].envs when it does not exist', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1: {}
              wf2:
                envs:
                - PARALLEL: 4`,
        );

        EnvVarService.create({ source: EnvVarSource.Workflows, sourceId: 'wf1' });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - "": ""
                opts:
                  is_expand: false
            wf2:
              envs:
              - PARALLEL: 4
        `);
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
              wf2:
                envs:
                - PARALLEL: 4`,
        );

        expect(() => {
          EnvVarService.create({ source: EnvVarSource.Workflows });
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
              wf2:
                envs:
                - PARALLEL: 4`,
        );

        expect(() => {
          EnvVarService.create({ source: EnvVarSource.Workflows, sourceId: 'nonexistent' });
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });

  describe('append', () => {
    describe('project-level envs', () => {
      it('appends env_var to the end of app.envs', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        );

        EnvVarService.append(
          { key: 'PROJECT_NAME', value: 'Mando', source: 'app', isExpand: false },
          { source: EnvVarSource.App },
        );
        expect(getYmlString()).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 1.2.3
            - PROJECT_NAME: Mando
              opts:
                is_expand: false
          `);
      });

      it('creates app.envs when it does not exist', () => {
        updateBitriseYmlDocumentByString(yaml``);

        EnvVarService.append({ key: 'PROJECT_NAME', value: 'Mando', source: 'app' }, { source: EnvVarSource.App });

        expect(getYmlString()).toEqual(yaml`
          app:
            envs:
            - PROJECT_NAME: Mando
          `);
      });
    });

    describe('workflow-level envs', () => {
      it('appends env_var to the end of workflows.[id].envs', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
              wf2:
                envs:
                - PARALLEL: 4
          `,
        );

        EnvVarService.append(
          { key: 'ENVIRONMENT', value: 'production', source: 'wf1' },
          { source: EnvVarSource.Workflows, sourceId: 'wf1' },
        );

        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE_VERSION: lts
              - ENVIRONMENT: production
            wf2:
              envs:
              - PARALLEL: 4
          `);
      });

      it('creates workflows.[id].envs when it does not exist', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1: {}
              wf2:
                envs:
                - PARALLEL: 4`,
        );

        EnvVarService.append(
          { key: 'PROJECT_NAME', value: 'Mando', source: 'wf1' },
          { source: EnvVarSource.Workflows, sourceId: 'wf1' },
        );

        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - PROJECT_NAME: Mando
            wf2:
              envs:
              - PARALLEL: 4
          `);
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
          `,
        );

        expect(() => {
          EnvVarService.append(
            { key: 'PROJECT_NAME', value: 'Mando', source: 'wf1' },
            { source: EnvVarSource.Workflows },
          );
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
          `,
        );

        expect(() => {
          EnvVarService.append(
            { key: 'PROJECT_NAME', value: 'Mando', source: 'wf1' },
            { source: EnvVarSource.Workflows, sourceId: 'nonexistent' },
          );
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });

  describe('remove', () => {
    describe('project-level envs', () => {
      it('removes env_var at app.envs.[index]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        );

        EnvVarService.remove({ source: EnvVarSource.App, index: 1 });

        expect(getYmlString()).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 1.2.3
        `);
      });

      it('removes app.envs when removing last env_var', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            format_version: ''
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        );

        EnvVarService.remove({ source: EnvVarSource.App, index: 0 });

        expect(getYmlString()).toBe(yaml`
          format_version: ''
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.remove({ source: EnvVarSource.App, index: 3 });
        }).toThrow('Project-level environment variable not found, index 3 is out of bounds');
      });
    });

    describe('workflow-level envs', () => {
      it('removes env_var at workflows.[id].envs.[index]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando
              wf2:
                envs:
                - PARALLEL: 4`,
        );

        EnvVarService.remove({ source: EnvVarSource.Workflows, sourceId: 'wf1', index: 1 });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE_VERSION: lts
            wf2:
              envs:
              - PARALLEL: 4
          `);
      });

      it('removes workflows.[id].envs when removing last env_var, but keeps workflows.[id]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando
              wf2:
                envs:
                - PARALLEL: 4`,
        );

        EnvVarService.remove({ source: EnvVarSource.Workflows, sourceId: 'wf2', index: 0 });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE_VERSION: lts
              - PROJECT_NAME: Mando
            wf2: {}
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando
              wf2:
                envs:
                - PARALLEL: 4`,
        );

        expect(() => {
          EnvVarService.remove({ source: EnvVarSource.Workflows, sourceId: 'wf1', index: 3 });
        }).toThrow("Environment variable not found in Workflow 'wf1', index 3 is out of bounds");
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.remove({ source: EnvVarSource.Workflows, index: 0 });
        }).toThrow('sourceId is required when source is Workflows');
      });

      it('throws an error when workflow is not found', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.remove({ source: EnvVarSource.Workflows, sourceId: 'nonexistent', index: 0 });
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });

  describe('reorder', () => {
    describe('project-level envs', () => {
      it('reorders env_vars at app.envs', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando
              - ENVIRONMENT: production`,
        );

        EnvVarService.reorder([1, 2, 0], { source: EnvVarSource.App });

        expect(getYmlString()).toEqual(yaml`
          app:
            envs:
            - PROJECT_NAME: Mando
            - ENVIRONMENT: production
            - SERVICE_VERSION: 1.2.3
        `);
      });

      it('throws an error when indices.length != envs.length', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.reorder([0, 1, 2], { source: EnvVarSource.App });
        }).toThrow('The number of indices (3) should match the number of environment variables (2)');
      });
    });

    describe('workflow-level envs', () => {
      it('reorders env_vars at workflows.[id].envs', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando
                - ENVIRONMENT: production
              wf2:
                envs:
                - PARALLEL: 4`,
        );

        EnvVarService.reorder([1, 2, 0], { source: EnvVarSource.Workflows, sourceId: 'wf1' });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - PROJECT_NAME: Mando
              - ENVIRONMENT: production
              - NODE_VERSION: lts
            wf2:
              envs:
              - PARALLEL: 4
        `);
      });

      it('throws an error when indices.length != envs.length', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.reorder([0, 1, 2], { source: EnvVarSource.Workflows, sourceId: 'wf1' });
        }).toThrow('The number of indices (3) should match the number of environment variables (2)');
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.reorder([0, 1], { source: EnvVarSource.Workflows });
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.reorder([0, 1], { source: EnvVarSource.Workflows, sourceId: 'nonexistent' });
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });

  describe('updateKey', () => {
    describe('project-level envs', () => {
      it('updates env_var key at app.envs.[index]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        );

        EnvVarService.updateKey('SERVICE_BUILD_NUMBER', {
          source: EnvVarSource.App,
          index: 0,
          oldKey: 'SERVICE_VERSION',
        });

        expect(getYmlString()).toEqual(yaml`
          app:
            envs:
            - SERVICE_BUILD_NUMBER: 1.2.3
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.updateKey('SERVICE_BUILD_NUMBER', {
            source: EnvVarSource.App,
            index: 3,
            oldKey: 'SERVICE_VERSION',
          });
        }).toThrow('Project-level environment variable not found, index 3 is out of bounds');
      });

      it('throws an error when env_var key mismatch at index', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.updateKey('SERVICE_BUILD_NUMBER', {
            source: EnvVarSource.App,
            index: 1,
            oldKey: 'SERVICE_VERSION',
          });
        }).toThrow('Environment variable key is not matching "SERVICE_VERSION"');
      });
    });

    describe('workflow-level envs', () => {
      it('updates env_var key at workflows.[id].envs.[index]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        );

        EnvVarService.updateKey('NODE', {
          source: EnvVarSource.Workflows,
          sourceId: 'wf1',
          index: 0,
          oldKey: 'NODE_VERSION',
        });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE: lts
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.updateKey('NODE', {
            source: EnvVarSource.Workflows,
            sourceId: 'wf1',
            index: 3,
            oldKey: 'NODE_VERSION',
          });
        }).toThrow("Environment variable not found in Workflow 'wf1', index 3 is out of bounds");
      });

      it('throws an error when env_var key mismatch at index', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.updateKey('NODE', {
            source: EnvVarSource.Workflows,
            sourceId: 'wf1',
            index: 1,
            oldKey: 'NODE_VERSION',
          });
        }).toThrow('Environment variable key is not matching "NODE_VERSION"');
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        );

        expect(() => {
          EnvVarService.updateKey('NODE', { source: EnvVarSource.Workflows, index: 0, oldKey: 'NODE_VERSION' });
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        );

        expect(() => {
          EnvVarService.updateKey('NODE', {
            source: EnvVarSource.Workflows,
            sourceId: 'nonexistent',
            index: 0,
            oldKey: 'NODE_VERSION',
          });
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });

  describe('updateValue', () => {
    describe('project-level envs', () => {
      it('updates env_var value at app.envs.[index]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: "Mando"
              - ENVIRONMENT: 'production'
              - NODE_VERSION: '0.14.0'`,
        );

        EnvVarService.updateValue('2.0', { source: EnvVarSource.App, index: 0, key: 'SERVICE_VERSION' });
        EnvVarService.updateValue('Grogu', { source: EnvVarSource.App, index: 1, key: 'PROJECT_NAME' });
        EnvVarService.updateValue('staging', { source: EnvVarSource.App, index: 2, key: 'ENVIRONMENT' });
        EnvVarService.updateValue('0.15.0', { source: EnvVarSource.App, index: 3, key: 'NODE_VERSION' });

        expect(getYmlString()).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 2.0
            - PROJECT_NAME: "Grogu"
            - ENVIRONMENT: 'staging'
            - NODE_VERSION: '0.15.0'
        `);
      });

      it('sets the fraction digits from the number when the number is a float', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 2`,
        );

        EnvVarService.updateValue('3.1415', { source: EnvVarSource.App, index: 0, key: 'SERVICE_VERSION' });
        expect(getYmlString()).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 3.1415
        `);
      });

      it('resets the fraction digits to 0 when the number is an integer', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 3.14`,
        );

        EnvVarService.updateValue('2', { source: EnvVarSource.App, index: 0, key: 'SERVICE_VERSION' });
        expect(getYmlString()).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 2
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.updateValue('2.0', { source: EnvVarSource.App, index: 3, key: 'SERVICE_VERSION' });
        }).toThrow('Project-level environment variable not found, index 3 is out of bounds');
      });

      it('throws an error when env_var key mismatch at index', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.updateValue('2.0', { source: EnvVarSource.App, index: 1, key: 'SERVICE_VERSION' });
        }).toThrow('Environment variable key is not matching "SERVICE_VERSION"');
      });
    });

    describe('workflow-level envs', () => {
      it('updates env_var value at workflows.[id].envs.[index]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        );

        EnvVarService.updateValue('22', {
          source: EnvVarSource.Workflows,
          sourceId: 'wf1',
          index: 0,
          key: 'NODE_VERSION',
        });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE_VERSION: 22
        `);
      });

      it('sets the fraction digits from the number when the number is a float', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - SERVICE_VERSION: 2`,
        );

        EnvVarService.updateValue('3.1415', {
          source: EnvVarSource.Workflows,
          sourceId: 'wf1',
          index: 0,
          key: 'SERVICE_VERSION',
        });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - SERVICE_VERSION: 3.1415
        `);
      });

      it('resets the fraction digits to 0 when the number is an integer', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - SERVICE_VERSION: 3.14`,
        );

        EnvVarService.updateValue('2', {
          source: EnvVarSource.Workflows,
          sourceId: 'wf1',
          index: 0,
          key: 'SERVICE_VERSION',
        });
        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - SERVICE_VERSION: 2
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.updateValue('22', {
            source: EnvVarSource.Workflows,
            sourceId: 'wf1',
            index: 3,
            key: 'NODE_VERSION',
          });
        }).toThrow("Environment variable not found in Workflow 'wf1', index 3 is out of bounds");
      });

      it('throws an error when env_var key mismatch at index', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.updateValue('22', {
            source: EnvVarSource.Workflows,
            sourceId: 'wf1',
            index: 1,
            key: 'NODE_VERSION',
          });
        }).toThrow('Environment variable key is not matching "NODE_VERSION"');
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        );

        expect(() => {
          EnvVarService.updateValue('22', {
            source: EnvVarSource.Workflows,
            index: 0,
            key: 'NODE_VERSION',
          });
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        );

        expect(() => {
          EnvVarService.updateValue('22', {
            source: EnvVarSource.Workflows,
            sourceId: 'nonexistent',
            index: 0,
            key: 'NODE_VERSION',
          });
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });

  describe('updateIsExpand', () => {
    describe('project-level envs', () => {
      it('updates the isExpand property of the env_var with false', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        );

        EnvVarService.updateIsExpand(false, { source: EnvVarSource.App, index: 0 });

        expect(getYmlString()).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 1.2.3
              opts:
                is_expand: false
            - PROJECT_NAME: Mando
        `);
      });

      it('updates the isExpand property of the env_var with true', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando
                opts:
                  is_expand: false`,
        );

        EnvVarService.updateIsExpand(true, { source: EnvVarSource.App, index: 1 });

        expect(getYmlString()).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 1.2.3
            - PROJECT_NAME: Mando
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.updateIsExpand(false, { source: EnvVarSource.App, index: 3 });
        }).toThrow('Project-level environment variable not found, index 3 is out of bounds');
      });
    });

    describe('workflow-level envs', () => {
      it('updates the isExpand property of the env_var with false', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando
              wf2:
                envs:
                - PARALLEL: 4`,
        );

        EnvVarService.updateIsExpand(false, { source: EnvVarSource.Workflows, sourceId: 'wf1', index: 0 });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE_VERSION: lts
                opts:
                  is_expand: false
              - PROJECT_NAME: Mando
            wf2:
              envs:
              - PARALLEL: 4
        `);
      });

      it('updates the isExpand property of the env_var with true', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando
                  opts:
                    is_expand: false
              wf2:
                envs:
                - PARALLEL: 4`,
        );

        EnvVarService.updateIsExpand(true, { source: EnvVarSource.Workflows, sourceId: 'wf1', index: 1 });

        expect(getYmlString()).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE_VERSION: lts
              - PROJECT_NAME: Mando
            wf2:
              envs:
              - PARALLEL: 4
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        );

        expect(() => {
          EnvVarService.updateIsExpand(false, { source: EnvVarSource.Workflows, sourceId: 'wf1', index: 3 });
        }).toThrow("Environment variable not found in Workflow 'wf1', index 3 is out of bounds");
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        );

        expect(() => {
          EnvVarService.updateIsExpand(false, { source: EnvVarSource.Workflows, index: 0 });
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        );

        expect(() => {
          EnvVarService.updateIsExpand(false, { source: EnvVarSource.Workflows, sourceId: 'nonexistent', index: 0 });
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });
});
