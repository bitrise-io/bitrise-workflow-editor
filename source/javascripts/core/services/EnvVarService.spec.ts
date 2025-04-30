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
    it('converts yml to env var with isExpand: false', () => {
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

    it('converts yml to env var with isExpand: true', () => {
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

    it('converts yml to env var with isExpand: undefined', () => {
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
      ['true', 'TRUE', 'yes', 'YES', 'on', 'ON'].forEach((value) => {
        it(`converts "${value}" to true boolean`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBe(true);
        });
      });

      ['false', 'FALSE', 'no', 'NO', 'off', 'OFF'].forEach((value) => {
        it(`converts "${value}" to false boolean`, () => {
          const result = EnvVarService.toYmlValue(value);
          expect(result).toBe(false);
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

    describe('numbers', () => {
      // Integers
      [
        ['0', 0],
        ['1', 1],
        ['+2', 2],
        ['-3', -3],
        ['4.0', 4],
        ['+5.0', 5],
        ['-6.0', -6],
      ].forEach(([input, output]) => {
        it(`converts "${input}" to number ${output}`, () => {
          const result = EnvVarService.toYmlValue(input);
          expect(result).toBe(output);
        });
      });

      // Floats
      [
        ['3.14', 3.14],
        ['+3.14', 3.14],
        ['-3.14', -3.14],
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
    it('converts env var with isExpand: false to yaml', () => {
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

    it('converts env var with isExpand: true to yaml', () => {
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

    it('converts env var with isExpand: undefined to yaml', () => {
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

    it('returns all project and workflow vars from the yml', () => {
      const result = EnvVarService.getAll();
      expect(result).toEqual([
        { key: 'SERVICE_VERSION', value: '1.2.3', source: 'Project envs' },
        { key: 'PROJECT_NAME', value: 'Mando', source: 'Project envs' },
        { key: 'NODE_VERSION', value: 'lts', source: 'Workflow: wf1', isExpand: false },
        { key: 'ENVIRONMENT', value: 'production', source: 'Workflow: wf1', isExpand: true },
        { key: 'PARALLEL', value: '4', source: 'Workflow: wf2' },
      ]);
    });

    it('returns all env vars from app.envs', () => {
      const result = EnvVarService.getAll(EnvVarSource.Project);
      expect(result).toEqual([
        { key: 'SERVICE_VERSION', value: '1.2.3', source: 'Project envs' },
        { key: 'PROJECT_NAME', value: 'Mando', source: 'Project envs' },
      ]);
    });

    it('returns all env vars all workflows', () => {
      const result = EnvVarService.getAll(EnvVarSource.Workflow, '*');
      expect(result).toEqual([
        { key: 'NODE_VERSION', value: 'lts', source: 'Workflow: wf1', isExpand: false },
        { key: 'ENVIRONMENT', value: 'production', source: 'Workflow: wf1', isExpand: true },
        { key: 'PARALLEL', value: '4', source: 'Workflow: wf2' },
      ]);
    });

    it('returns all env vars from wf1', () => {
      const result = EnvVarService.getAll(EnvVarSource.Workflow, 'wf1');
      expect(result).toEqual([
        { key: 'NODE_VERSION', value: 'lts', source: 'Workflow: wf1', isExpand: false },
        { key: 'ENVIRONMENT', value: 'production', source: 'Workflow: wf1', isExpand: true },
      ]);
    });

    it('returns an empty array when workflow is not found', () => {
      const result = EnvVarService.getAll(EnvVarSource.Workflow, 'nonexistent');
      expect(result).toEqual([]);
    });

    it('throws an error when source is Workflow andsourceId is not provided', () => {
      expect(() => {
        EnvVarService.getAll(EnvVarSource.Workflow);
      }).toThrow('sourceId is required when source is Workflow');
    });
  });

  describe('create', () => {
    describe('project-level envs', () => {
      it('creates an empty env var at the end of app.envs', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        });

        EnvVarService.create(EnvVarSource.Project);

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

      it('creates app.envs if it does not exist', () => {
        initializeStore({
          version: '',
          ymlString: '',
        });

        EnvVarService.create(EnvVarSource.Project);

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
      it('appends an empty env var to the end of workflow.[id].envs', () => {
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

        EnvVarService.create(EnvVarSource.Workflow, 'wf1');

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

      it('creates workflow.[id].envs if it does not exist', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1: {}
              wf2:
                envs:
                - PARALLEL: 4`,
        });

        EnvVarService.create(EnvVarSource.Workflow, 'wf1');

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
          EnvVarService.create(EnvVarSource.Workflow);
        }).toThrow('sourceId is required when source is Workflow');
      });
    });
  });

  describe('append', () => {
    describe('project-level envs', () => {
      it('appends env var to the end of app.envs', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        });

        EnvVarService.append(
          { key: 'PROJECT_NAME', value: 'Mando', source: 'app', isExpand: false },
          EnvVarSource.Project,
        );
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

      it('creates app.envs if it does not exist', () => {
        initializeStore({ version: '', ymlString: '' });

        EnvVarService.append({ key: 'PROJECT_NAME', value: 'Mando', source: 'app' }, EnvVarSource.Project);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - PROJECT_NAME: Mando
          `);
      });
    });

    describe('workflow-level envs', () => {
      it('appends env var to the end of the workflow.[id].envs', () => {
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

        EnvVarService.append({ key: 'ENVIRONMENT', value: 'production', source: 'wf1' }, EnvVarSource.Workflow, 'wf1');

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

      it('creates workflow.[id].envs if it does not exist', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              wf1: {}
              wf2:
                envs:
                - PARALLEL: 4`,
        });

        EnvVarService.append({ key: 'PROJECT_NAME', value: 'Mando', source: 'wf1' }, EnvVarSource.Workflow, 'wf1');

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
          EnvVarService.append({ key: 'PROJECT_NAME', value: 'Mando', source: 'wf1' }, EnvVarSource.Workflow);
        }).toThrow('sourceId is required when source is Workflow');
      });
    });
  });

  describe('remove', () => {
    describe('project-level envs', () => {
      it('removes the env var from app.envs', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        EnvVarService.remove(1, EnvVarSource.Project);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 1.2.3
        `);
      });

      it('removes app.envs when removing the last env var', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            format_version: ''
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        });

        EnvVarService.remove(0, EnvVarSource.Project);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toBe(yaml`
          format_version: ''
        `);
      });

      it('do not remove anything if the index is out of bounds', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        EnvVarService.remove(3, EnvVarSource.Project);
        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 1.2.3
            - PROJECT_NAME: Mando
        `);
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        });

        expect(() => {
          EnvVarService.remove(0, EnvVarSource.Workflow);
        }).toThrow('sourceId is required when source is Workflow');
      });
    });

    describe('workflow-level envs', () => {
      it('removes the env var from workflow.[id].envs', () => {
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

        EnvVarService.remove(1, EnvVarSource.Workflow, 'wf1');

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

      it('removes workflow.[id].envs when removing the last env var', () => {
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

        EnvVarService.remove(0, EnvVarSource.Workflow, 'wf2');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE_VERSION: lts
              - PROJECT_NAME: Mando
          `);
      });

      it('do not remove anything if the index is out of bounds', () => {
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

        EnvVarService.remove(3, EnvVarSource.Workflow, 'wf1');
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
          EnvVarService.remove(0, EnvVarSource.Workflow);
        }).toThrow('sourceId is required when source is Workflow');
      });
    });
  });

  describe('reorder', () => {
    describe('project-level envs', () => {
      it('reorders the env var in app.envs', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando
              - ENVIRONMENT: production`,
        });

        EnvVarService.reorder([1, 2, 0], EnvVarSource.Project);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - PROJECT_NAME: Mando
            - ENVIRONMENT: production
            - SERVICE_VERSION: 1.2.3
        `);
      });

      it('throws an error if the number of indices does not match the number of env vars', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.reorder([0, 1, 2], EnvVarSource.Project);
        }).toThrow('The number of indices (3) does not match the number of environment variables (2)');
      });
    });

    describe('workflow-level envs', () => {
      it('reorders the env var in workflow.[id].envs', () => {
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

        EnvVarService.reorder([1, 2, 0], EnvVarSource.Workflow, 'wf1');

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
          EnvVarService.reorder([0, 1], EnvVarSource.Workflow);
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error when the sourceId is not found', () => {
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
          EnvVarService.reorder([0, 1], EnvVarSource.Workflow, 'nonexistent');
        }).toThrow('Environment variables not found at path: workflows.nonexistent.envs');
      });

      it('throws an error if the number of indices does not match the number of env vars', () => {
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
          EnvVarService.reorder([0, 1, 2], EnvVarSource.Workflow, 'wf1');
        }).toThrow('The number of indices (3) does not match the number of environment variables (2)');
      });
    });
  });

  describe('updateKey', () => {
    describe('project-level envs', () => {
      it('updates the key of the env var', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        });

        EnvVarService.updateKey('SERVICE_BUILD_NUMBER', 0, 'SERVICE_VERSION', EnvVarSource.Project);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - SERVICE_BUILD_NUMBER: 1.2.3
        `);
      });

      it('throws an error when the index is out of bounds', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateKey('SERVICE_BUILD_NUMBER', 3, 'SERVICE_VERSION', EnvVarSource.Project);
        }).toThrow('Environment variable not found at path: app.envs.3.SERVICE_VERSION');
      });

      it('throws an error when the old key is not matching at index', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateKey('SERVICE_BUILD_NUMBER', 1, 'SERVICE_VERSION', EnvVarSource.Project);
        }).toThrow('Environment variable not found at path: app.envs.1.SERVICE_VERSION');
      });
    });

    describe('workflow-level envs', () => {
      it('should update the key of the env var', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        });

        EnvVarService.updateKey('NODE', 0, 'NODE_VERSION', EnvVarSource.Workflow, 'wf1');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE: lts
        `);
      });

      it('throws an error when the index is out of bounds', () => {
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
          EnvVarService.updateKey('NODE', 3, 'NODE_VERSION', EnvVarSource.Workflow, 'wf1');
        }).toThrow('Environment variable not found at path: workflows.wf1.envs.3.NODE_VERSION');
      });

      it('throws an error when the old key is not matching at index', () => {
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
          EnvVarService.updateKey('NODE', 1, 'NODE_VERSION', EnvVarSource.Workflow, 'wf1');
        }).toThrow('Environment variable not found at path: workflows.wf1.envs.1.NODE_VERSION');
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
          EnvVarService.updateKey('NODE', 0, 'NODE_VERSION', EnvVarSource.Workflow);
        }).toThrow('sourceId is required when source is Workflow');
      });
    });
  });

  describe('updateValue', () => {
    describe('project-level envs', () => {
      it('should update the value of the env var', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3`,
        });

        EnvVarService.updateValue('1.3', 0, 'SERVICE_VERSION', EnvVarSource.Project);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 1.3
        `);
      });

      it('throws an error when the index is out of bounds', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateValue('2.0', 3, 'SERVICE_VERSION', EnvVarSource.Project);
        }).toThrow('Environment variable not found at path: app.envs.3.SERVICE_VERSION');
      });

      it('throws an error when the old key is not matching at index', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateValue('2.0', 1, 'SERVICE_VERSION', EnvVarSource.Project);
        }).toThrow('Environment variable not found at path: app.envs.1.SERVICE_VERSION');
      });
    });

    describe('workflow-level envs', () => {
      it('should update the value of the env var', () => {
        initializeStore({
          version: '1',
          ymlString: yaml`
            workflows:
              wf1:
                envs:
                - NODE_VERSION: lts`,
        });

        EnvVarService.updateValue('22', 0, 'NODE_VERSION', EnvVarSource.Workflow, 'wf1');

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          workflows:
            wf1:
              envs:
              - NODE_VERSION: 22
        `);
      });

      it('throws an error when the index is out of bounds', () => {
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
          EnvVarService.updateValue('22', 3, 'NODE_VERSION', EnvVarSource.Workflow, 'wf1');
        }).toThrow('Environment variable not found at path: workflows.wf1.envs.3.NODE_VERSION');
      });

      it('throws an error when the old key is not matching at index', () => {
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
          EnvVarService.updateValue('22', 1, 'NODE_VERSION', EnvVarSource.Workflow, 'wf1');
        }).toThrow('Environment variable not found at path: workflows.wf1.envs.1.NODE_VERSION');
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
          EnvVarService.updateValue('22', 0, 'NODE_VERSION', EnvVarSource.Workflow);
        }).toThrow('sourceId is required when source is Workflow');
      });
    });
  });

  describe('updateIsExpand', () => {
    describe('project-level envs', () => {
      it('updates the isExpand property of the env var with false', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        EnvVarService.updateIsExpand(false, 0, EnvVarSource.Project);

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

      it('updates the isExpand property of the env var with true', () => {
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

        EnvVarService.updateIsExpand(true, 1, EnvVarSource.Project);

        const actualYml = BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument);
        expect(actualYml).toEqual(yaml`
          app:
            envs:
            - SERVICE_VERSION: 1.2.3
            - PROJECT_NAME: Mando
        `);
      });

      it('throws an error when the index is out of bounds', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            app:
              envs:
              - SERVICE_VERSION: 1.2.3
              - PROJECT_NAME: Mando`,
        });

        expect(() => {
          EnvVarService.updateIsExpand(false, 3, EnvVarSource.Project);
        }).toThrow('Environment variable not found at path: app.envs.3');
      });
    });

    describe('workflow-level envs', () => {
      it('updates the isExpand property of the env var with false', () => {
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

        EnvVarService.updateIsExpand(false, 0, EnvVarSource.Workflow, 'wf1');

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

      it('updates the isExpand property of the env var with true', () => {
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

        EnvVarService.updateIsExpand(true, 1, EnvVarSource.Workflow, 'wf1');

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

      it('throws an error when the index is out of bounds', () => {
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
          EnvVarService.updateIsExpand(false, 3, EnvVarSource.Workflow, 'wf1');
        }).toThrow('Environment variable not found at path: workflows.wf1.envs.3');
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
          EnvVarService.updateIsExpand(false, 0, EnvVarSource.Workflow);
        }).toThrow('sourceId is required when source is Workflow');
      });
    });
  });
});
