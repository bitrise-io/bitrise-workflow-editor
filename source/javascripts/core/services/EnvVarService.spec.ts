import BitriseYmlApi from '../api/BitriseYmlApi';
import { EnvVarSource } from '../models/EnvVar';
import { bitriseYmlStore, initializeStore } from '../stores/BitriseYmlStore';
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

  describe('toYmlValue', () => {
    describe('empty strings', () => {
      ['', '', ' ', '  '].forEach((value) => {
        it(`converts "${value}" to empty string`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBe('');
        });
      });
    });

    describe('nulls', () => {
      ['~', 'null', 'NULL'].forEach((value) => {
        it(`converts "${value}" to null`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBeNull();
        });
      });
    });

    describe('booleans', () => {
      ['true', 'TRUE'].forEach((value) => {
        it(`converts "${value}" to true boolean`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBe(true);
        });
      });

      ['yes', 'YES', 'on', 'ON'].forEach((value) => {
        it(`keeps "${value}" as string`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBe(value);
        });
      });

      ['false', 'FALSE'].forEach((value) => {
        it(`converts "${value}" to false boolean`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBe(false);
        });
      });

      ['no', 'NO', 'off', 'OFF'].forEach((value) => {
        it(`keeps "${value}" as string`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBe(value);
        });
      });
    });

    describe('special floats', () => {
      ['.inf', '.INF'].forEach((value) => {
        it(`converts "${value}" to Infinity`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBe(Infinity);
        });
      });

      ['-.inf', '-.INF'].forEach((value) => {
        it(`converts "${value}" to -Infinity`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBe(-Infinity);
        });
      });

      ['.nan', '.NAN'].forEach((value) => {
        it(`converts "${value}" to NaN`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBeNaN();
        });
      });
    });

    describe('hex/octal/binary/leading zeros', () => {
      ['0x1A', '0X1A', '0o12', '0O12', '0b101', '0B101', '0123'].forEach((value) => {
        it(`does not convert "${value}" to number, but keep as string`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBe(value);
        });
      });
    });

    describe('semver', () => {
      ['1.2.0', '1.2.3-alpha'].forEach((value) => {
        it(`does not convert "${value}" to number, but keep as string`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBe(value);
        });
      });
    });

    describe('numbers', () => {
      // Integers
      [
        ['0', 0],
        ['1', 1],
        ['+2', 2],
        ['-3', -3],
      ].forEach(([input, output]) => {
        it(`converts "${input}" to number ${output}`, () => {
          const result = EnvVarService.toYmlValue(input);
          expect(result).toBe(output);
        });
      });

      // Floats
      [
        ['4.0', 4.0],
        ['+5.0', 5.0],
        ['-6.0', -6.0],
        ['3.14', 3.14],
        ['+3.14', 3.14],
        ['-3.14', -3.14],
        // eslint-disable-next-line prettier/prettier
        ['100.0', 100.0],
        // eslint-disable-next-line prettier/prettier
        ['100.000', 100.000],
      ].forEach(([input, output]) => {
        it(`converts "${input}" to number ${output}`, () => {
          const result = EnvVarService.toYmlValue(input);
          expect(result).toBe(output);
        });
      });

      // Scientific notation
      [
        ['0.314e1', 3.14],
        ['0.314e+1', 3.14],
        ['3.14e-2', 0.0314],
      ].forEach(([input, output]) => {
        it(`converts "${input}" to number ${output}`, () => {
          const result = EnvVarService.toYmlValue(input);
          expect(result).toBe(output);
        });
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
      initializeStore({
        version: '',
        ymlString: yaml`
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
      });
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
      }).toThrow('sourceId is required when source is Workflow');
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
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        });

        EnvVarService.create(EnvVarSource.App);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - "": ""
                opts:
                  is_expand: false
        `);
      });

      it('creates app.envs when it does not exist', () => {
        initializeStore({
          version: '',
          ymlString: '',
        });

        EnvVarService.create(EnvVarSource.App);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
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
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
              wf2:
                envs:
                - PARALLEL: 4`,
        });

        EnvVarService.create(EnvVarSource.Workflows, 'wf1');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
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
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1: {}
              wf2:
                envs:
                - PARALLEL: 4`,
        });

        EnvVarService.create(EnvVarSource.Workflows, 'wf1');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
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
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
              wf2:
                envs:
                - PARALLEL: 4`,
        });

        expect(() => {
          EnvVarService.create(EnvVarSource.Workflows);
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
              wf2:
                envs:
                - PARALLEL: 4`,
        });

        expect(() => {
          EnvVarService.create(EnvVarSource.Workflows, 'nonexistent');
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });

  describe('append', () => {
    describe('project-level envs', () => {
      it('appends env_var to the end of app.envs', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        });

        EnvVarService.append({ key: 'PROJECT_NAME', value: 'Mando', source: 'app', isExpand: false }, EnvVarSource.App);
        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 1.2.3
            - PROJECT_NAME: Mando
              opts:
                is_expand: false
          `);
      });

      it('creates app.envs when it does not exist', () => {
        initializeStore({ version: '', ymlString: '' });

        EnvVarService.append({ key: 'PROJECT_NAME', value: 'Mando', source: 'app' }, EnvVarSource.App);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - PROJECT_NAME: Mando
          `);
      });
    });

    describe('workflow-level envs', () => {
      it('appends env_var to the end of workflows.[id].envs', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
              wf2:
                envs:
                - PARALLEL: 4
          `,
        });

        EnvVarService.append({ key: 'ENVIRONMENT', value: 'production', source: 'wf1' }, EnvVarSource.Workflows, 'wf1');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
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
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1: {}
              wf2:
                envs:
                - PARALLEL: 4`,
        });

        EnvVarService.append({ key: 'PROJECT_NAME', value: 'Mando', source: 'wf1' }, EnvVarSource.Workflows, 'wf1');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
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
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
          `,
        });

        expect(() => {
          EnvVarService.append({ key: 'PROJECT_NAME', value: 'Mando', source: 'wf1' }, EnvVarSource.Workflows);
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
          `,
        });

        expect(() => {
          EnvVarService.append(
            { key: 'PROJECT_NAME', value: 'Mando', source: 'wf1' },
            EnvVarSource.Workflows,
            'nonexistent',
          );
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });

  describe('remove', () => {
    describe('project-level envs', () => {
      it('removes env_var at app.envs.[index]', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        EnvVarService.remove(1, EnvVarSource.App);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 1.2.3
        `);
      });

      it('removes app.envs when removing last env_var', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            format_version: ''
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        });

        EnvVarService.remove(0, EnvVarSource.App);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toBe(yaml`
          format_version: ''
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.remove(3, EnvVarSource.App);
        }).toThrow('Environment variable is not found at path: app.envs.3');
      });
    });

    describe('workflow-level envs', () => {
      it('removes env_var at workflows.[id].envs.[index]', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando
              wf2:
                envs:
                - PARALLEL: 4`,
        });

        EnvVarService.remove(1, EnvVarSource.Workflows, 'wf1');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
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
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando
              wf2:
                envs:
                - PARALLEL: 4`,
        });

        EnvVarService.remove(0, EnvVarSource.Workflows, 'wf2');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE_VERSION: lts
              - PROJECT_NAME: Mando
            wf2: {}
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando
              wf2:
                envs:
                - PARALLEL: 4`,
        });

        expect(() => {
          EnvVarService.remove(3, EnvVarSource.Workflows, 'wf1');
        }).toThrow('Environment variable is not found at path: workflows.wf1.envs.3');
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.remove(0, EnvVarSource.Workflows);
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.remove(0, EnvVarSource.Workflows, 'nonexistent');
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });

  describe('reorder', () => {
    describe('project-level envs', () => {
      it('reorders env_vars at app.envs', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando
              - ENVIRONMENT: production`,
        });

        EnvVarService.reorder([1, 2, 0], EnvVarSource.App);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - PROJECT_NAME: Mando
            - ENVIRONMENT: production
            - SERVICE_VERSION: 1.2.3
        `);
      });

      it('throws an error when indices.length != envs.length', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.reorder([0, 1, 2], EnvVarSource.App);
        }).toThrow('The number of indices (3) does not match the number of environment variables (2)');
      });
    });

    describe('workflow-level envs', () => {
      it('reorders env_vars at workflows.[id].envs', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando
                - ENVIRONMENT: production
              wf2:
                envs:
                - PARALLEL: 4`,
        });

        EnvVarService.reorder([1, 2, 0], EnvVarSource.Workflows, 'wf1');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
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
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.reorder([0, 1, 2], EnvVarSource.Workflows, 'wf1');
        }).toThrow('The number of indices (3) does not match the number of environment variables (2)');
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.reorder([0, 1], EnvVarSource.Workflows);
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.reorder([0, 1], EnvVarSource.Workflows, 'nonexistent');
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });

  describe('updateKey', () => {
    describe('project-level envs', () => {
      it('updates env_var key at app.envs.[index]', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        });

        EnvVarService.updateKey('SERVICE_BUILD_NUMBER', 0, 'SERVICE_VERSION', EnvVarSource.App);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - SERVICE_BUILD_NUMBER: 1.2.3
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateKey('SERVICE_BUILD_NUMBER', 3, 'SERVICE_VERSION', EnvVarSource.App);
        }).toThrow('Environment variable is not found at path: app.envs.3');
      });

      it('throws an error when env_var key mismatch at index', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateKey('SERVICE_BUILD_NUMBER', 1, 'SERVICE_VERSION', EnvVarSource.App);
        }).toThrow('Environment variable key mismatch "SERVICE_VERSION" at path: app.envs.1');
      });
    });

    describe('workflow-level envs', () => {
      it('updates env_var key at workflows.[id].envs.[index]', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        });

        EnvVarService.updateKey('NODE', 0, 'NODE_VERSION', EnvVarSource.Workflows, 'wf1');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE: lts
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateKey('NODE', 3, 'NODE_VERSION', EnvVarSource.Workflows, 'wf1');
        }).toThrow('Environment variable is not found at path: workflows.wf1.envs.3');
      });

      it('throws an error when env_var key mismatch at index', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateKey('NODE', 1, 'NODE_VERSION', EnvVarSource.Workflows, 'wf1');
        }).toThrow('Environment variable key mismatch "NODE_VERSION" at path: workflows.wf1.envs.1');
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        });

        expect(() => {
          EnvVarService.updateKey('NODE', 0, 'NODE_VERSION', EnvVarSource.Workflows);
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        });

        expect(() => {
          EnvVarService.updateKey('NODE', 0, 'NODE_VERSION', EnvVarSource.Workflows, 'nonexistent');
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });

  describe('updateValue', () => {
    describe('project-level envs', () => {
      it('updates env_var value at app.envs.[index]', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: "Mando"
              - ENVIRONMENT: 'production'
              - NODE_VERSION: '0.14.0'`,
        });

        EnvVarService.updateValue('2.0', 0, 'SERVICE_VERSION', EnvVarSource.App);
        EnvVarService.updateValue('Grogu', 1, 'PROJECT_NAME', EnvVarSource.App);
        EnvVarService.updateValue('staging', 2, 'ENVIRONMENT', EnvVarSource.App);
        EnvVarService.updateValue('0.15.0', 3, 'NODE_VERSION', EnvVarSource.App);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 2.0
            - PROJECT_NAME: "Grogu"
            - ENVIRONMENT: 'staging'
            - NODE_VERSION: '0.15.0'
        `);
      });

      it('sets the fraction digits from the number when the number is a float', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 2`,
        });

        EnvVarService.updateValue('3.1415', 0, 'SERVICE_VERSION', EnvVarSource.App);
        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 3.1415
        `);
      });

      it('resets the fraction digits to 0 when the number is an integer', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 3.14`,
        });

        EnvVarService.updateValue('2', 0, 'SERVICE_VERSION', EnvVarSource.App);
        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 2
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateValue('2.0', 3, 'SERVICE_VERSION', EnvVarSource.App);
        }).toThrow('Environment variable is not found at path: app.envs.3');
      });

      it('throws an error when env_var key mismatch at index', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateValue('2.0', 1, 'SERVICE_VERSION', EnvVarSource.App);
        }).toThrow('Environment variable key mismatch "SERVICE_VERSION" at path: app.envs.1');
      });
    });

    describe('workflow-level envs', () => {
      it('updates env_var value at workflows.[id].envs.[index]', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        });

        EnvVarService.updateValue('22', 0, 'NODE_VERSION', EnvVarSource.Workflows, 'wf1');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE_VERSION: 22
        `);
      });

      it('sets the fraction digits from the number when the number is a float', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - SERVICE_VERSION: 2`,
        });

        EnvVarService.updateValue('3.1415', 0, 'SERVICE_VERSION', EnvVarSource.Workflows, 'wf1');

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - SERVICE_VERSION: 3.1415
        `);
      });

      it('resets the fraction digits to 0 when the number is an integer', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - SERVICE_VERSION: 3.14`,
        });

        EnvVarService.updateValue('2', 0, 'SERVICE_VERSION', EnvVarSource.Workflows, 'wf1');
        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - SERVICE_VERSION: 2
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateValue('22', 3, 'NODE_VERSION', EnvVarSource.Workflows, 'wf1');
        }).toThrow('Environment variable is not found at path: workflows.wf1.envs.3');
      });

      it('throws an error when env_var key mismatch at index', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateValue('22', 1, 'NODE_VERSION', EnvVarSource.Workflows, 'wf1');
        }).toThrow('Environment variable key mismatch "NODE_VERSION" at path: workflows.wf1.envs.1');
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        });

        expect(() => {
          EnvVarService.updateValue('22', 0, 'NODE_VERSION', EnvVarSource.Workflows);
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        });

        expect(() => {
          EnvVarService.updateValue('22', 0, 'NODE_VERSION', EnvVarSource.Workflows, 'nonexistent');
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });

  describe('updateIsExpand', () => {
    describe('project-level envs', () => {
      it('updates the isExpand property of the env_var with false', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        EnvVarService.updateIsExpand(false, 0, EnvVarSource.App);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 1.2.3
              opts:
                is_expand: false
            - PROJECT_NAME: Mando
        `);
      });

      it('updates the isExpand property of the env_var with true', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando
                opts:
                  is_expand: false`,
        });

        EnvVarService.updateIsExpand(true, 1, EnvVarSource.App);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 1.2.3
            - PROJECT_NAME: Mando
        `);
      });

      it('throws an error when env_var is not found at index', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateIsExpand(false, 3, EnvVarSource.App);
        }).toThrow('Environment variable is not found at path: app.envs.3');
      });
    });

    describe('workflow-level envs', () => {
      it('updates the isExpand property of the env_var with false', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando
              wf2:
                envs:
                - PARALLEL: 4`,
        });

        EnvVarService.updateIsExpand(false, 0, EnvVarSource.Workflows, 'wf1');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
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
        initializeStore({
          version: '1',
          ymlString: yaml`
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
        });

        EnvVarService.updateIsExpand(true, 1, EnvVarSource.Workflows, 'wf1');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
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
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts
                - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateIsExpand(false, 3, EnvVarSource.Workflows, 'wf1');
        }).toThrow('Environment variable is not found at path: workflows.wf1.envs.3');
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        });

        expect(() => {
          EnvVarService.updateIsExpand(false, 0, EnvVarSource.Workflows);
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when workflow is not found', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        });

        expect(() => {
          EnvVarService.updateIsExpand(false, 0, EnvVarSource.Workflows, 'nonexistent');
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });
});
