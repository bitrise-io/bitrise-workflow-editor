import BitriseYmlApi from '../api/BitriseYmlApi';
import { LegacyTrigger } from '../models/Trigger.legacy';
import { bitriseYmlStore, initializeStore } from '../stores/BitriseYmlStore';
import TriggerService from './TriggerService';

describe('TriggerService', () => {
  describe('toLegacyTriggers', () => {
    it('should convert trigger map to legacy triggers', () => {
      const triggerMap = [
        {
          push_branch: 'master',
          pipeline: 'ci-pipeline',
          enabled: true,
        },
        {
          pull_request_target_branch: 'develop',
          workflow: 'primary',
        },
        {
          tag: 'v1.0.0',
          workflow: 'primary',
          enabled: false,
        },
      ];
      const legacyTriggers = TriggerService.toLegacyTriggers(triggerMap);
      expect(legacyTriggers).toEqual({
        push: [
          {
            uniqueId: expect.any(String),
            index: 0,
            source: 'pipelines#ci-pipeline',
            triggerType: 'push',
            conditions: [{ type: 'push_branch', value: 'master', isRegex: false }],
            isActive: true,
          },
        ],
        pull_request: [
          {
            uniqueId: expect.any(String),
            index: 1,
            source: 'workflows#primary',
            triggerType: 'pull_request',
            conditions: [{ type: 'pull_request_target_branch', value: 'develop', isRegex: false }],
            isActive: true,
            isDraftPr: true,
          },
        ],
        tag: [
          {
            uniqueId: expect.any(String),
            index: 2,
            source: 'workflows#primary',
            triggerType: 'tag',
            conditions: [{ type: 'tag', value: 'v1.0.0', isRegex: false }],
            isActive: false,
          },
        ],
      });
    });

    it('should return empty array if trigger map is undefined', () => {
      const legacyTriggers = TriggerService.toLegacyTriggers(undefined);
      expect(legacyTriggers).toEqual({
        push: [],
        pull_request: [],
        tag: [],
      });
    });
  });

  describe('convertLegacyTriggers', () => {
    it('should convert a legacy push trigger', () => {
      const legacyTrigger: LegacyTrigger = {
        uniqueId: '1',
        index: 0,
        source: 'pipelines#release',
        triggerType: 'push',
        isActive: true,
        conditions: [
          { type: 'push_branch', value: 'master', isRegex: false },
          { type: 'commit_message', value: 'ci', isRegex: false },
          { type: 'changed_files', value: 'src', isRegex: false },
        ],
      };

      const convertedTrigger = TriggerService.convertToTargetBasedTrigger(legacyTrigger);
      expect(convertedTrigger).toEqual({
        uniqueId: '1',
        index: 0,
        source: 'pipelines#release',
        triggerType: 'push',
        isActive: true,
        conditions: [
          { type: 'branch', value: 'master', isRegex: false },
          { type: 'commit_message', value: 'ci', isRegex: false },
          { type: 'changed_files', value: 'src', isRegex: false },
        ],
      });
    });

    it('should convert a legacy pull_request trigger', () => {
      const legacyTrigger: LegacyTrigger = {
        uniqueId: '1',
        index: 0,
        source: 'pipelines#release',
        triggerType: 'pull_request',
        isActive: true,
        conditions: [
          { type: 'pull_request_source_branch', value: 'master', isRegex: false },
          { type: 'pull_request_target_branch', value: 'dev', isRegex: false },
          { type: 'pull_request_label', value: 'bugfix', isRegex: false },
          { type: 'pull_request_comment', value: 'comment', isRegex: false },
        ],
      };

      const convertedTrigger = TriggerService.convertToTargetBasedTrigger(legacyTrigger);
      expect(convertedTrigger).toEqual({
        uniqueId: '1',
        index: 0,
        source: 'pipelines#release',
        triggerType: 'pull_request',
        isActive: true,
        conditions: [
          { type: 'source_branch', value: 'master', isRegex: false },
          { type: 'target_branch', value: 'dev', isRegex: false },
          { type: 'label', value: 'bugfix', isRegex: false },
          { type: 'comment', value: 'comment', isRegex: false },
        ],
      });
    });

    it('should convert a legacy tag trigger', () => {
      const legacyTrigger: LegacyTrigger = {
        uniqueId: '1',
        index: 0,
        source: 'pipelines#release',
        triggerType: 'tag',
        isActive: true,
        conditions: [{ type: 'tag', value: 'v1.0.0', isRegex: false }],
      };

      const convertedTrigger = TriggerService.convertToTargetBasedTrigger(legacyTrigger);
      expect(convertedTrigger).toEqual({
        uniqueId: '1',
        index: 0,
        source: 'pipelines#release',
        triggerType: 'tag',
        isActive: true,
        conditions: [{ type: 'name', value: 'v1.0.0', isRegex: false }],
      });
    });
  });

  describe('addLegacyTrigger', () => {
    it('should append a legacy trigger to the trigger_map', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          trigger_map:
          - push_branch: master
            workflow: primary`,
      });

      TriggerService.addLegacyTrigger({
        uniqueId: '1',
        index: 1,
        source: 'workflows#primary',
        triggerType: 'pull_request',
        isActive: true,
        conditions: [{ type: 'pull_request_source_branch', value: 'dev', isRegex: false }],
      });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        trigger_map:
        - push_branch: master
          workflow: primary
        - type: pull_request
          workflow: primary
          pull_request_source_branch: dev
      `);
    });

    it('should create trigger_map if it does not exist', () => {
      initializeStore({
        version: '',
        ymlString: yaml``,
      });

      TriggerService.addLegacyTrigger({
        uniqueId: '1',
        index: 0,
        source: 'workflows#primary',
        triggerType: 'push',
        isActive: true,
        conditions: [{ type: 'push_branch', value: 'master', isRegex: false }],
      });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        trigger_map:
        - type: push
          workflow: primary
          push_branch: master
      `);
    });

    it('should disable flow on trigger_map', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          trigger_map: []`,
      });

      TriggerService.addLegacyTrigger({
        uniqueId: '1',
        index: 0,
        source: 'workflows#primary',
        triggerType: 'push',
        isActive: true,
        conditions: [{ type: 'push_branch', value: 'master', isRegex: false }],
      });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        trigger_map:
        - type: push
          workflow: primary
          push_branch: master
      `);
    });
  });

  describe('updateLegacyTrigger', () => {
    it('should update a legacy trigger in the trigger_map', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          trigger_map:
          - push_branch: master
            workflow: primary
          - pull_request_target_branch: develop
            workflow: primary`,
      });

      TriggerService.updateLegacyTrigger({
        uniqueId: '1',
        index: 1,
        source: 'workflows#primary',
        triggerType: 'pull_request',
        isActive: true,
        conditions: [{ type: 'pull_request_source_branch', value: 'dev', isRegex: false }],
      });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        trigger_map:
        - push_branch: master
          workflow: primary
        - type: pull_request
          workflow: primary
          pull_request_source_branch: dev
      `);
    });

    it('should throw an error if trigger_map is not found', () => {
      initializeStore({
        version: '',
        ymlString: yaml``,
      });

      expect(() => {
        TriggerService.updateLegacyTrigger({
          uniqueId: '1',
          index: 0,
          source: 'workflows#primary',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'push_branch', value: 'master', isRegex: false }],
        });
      }).toThrow('trigger_map not found');
    });

    it('should throw an error if trigger is not found', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          trigger_map:
          - push_branch: master
            workflow: primary`,
      });

      expect(() => {
        TriggerService.updateLegacyTrigger({
          uniqueId: '1',
          index: 1,
          source: 'workflows#primary',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'push_branch', value: 'master', isRegex: false }],
        });
      }).toThrow('Trigger is not found at path trigger_map.1');
    });
  });

  describe('removeLegacyTrigger', () => {
    it('should remove a legacy trigger from the trigger_map', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          trigger_map:
          - push_branch: master
            workflow: primary
          - pull_request_target_branch: develop
            workflow: primary`,
      });

      TriggerService.removeLegacyTrigger(1);

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        trigger_map:
        - push_branch: master
          workflow: primary
      `);
    });

    it('should remove the trigger_map when removing the last trigger', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            primary: {}
          trigger_map:
          - push_branch: master
            workflow: primary`,
      });

      TriggerService.removeLegacyTrigger(0);

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
      `);
    });

    it('should throw an error if trigger_map is not found', () => {
      initializeStore({
        version: '',
        ymlString: yaml``,
      });

      expect(() => {
        TriggerService.removeLegacyTrigger(0);
      }).toThrow('trigger_map not found');
    });

    it('should throw an error if trigger is not found', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          trigger_map:
          - push_branch: master
            workflow: primary`,
      });

      expect(() => {
        TriggerService.removeLegacyTrigger(1);
      }).toThrow('Trigger is not found at path trigger_map.1');
    });
  });

  describe('udateTriggerMap', () => {
    it('should update trigger map with new triggers', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          trigger_map:
          - push_branch: master
          - tag: v1.0.0
          - pull_request_target_branch: develop`,
      });

      TriggerService.updateTriggerMap({
        push: [
          {
            uniqueId: '1',
            index: 0,
            source: 'pipelines#ci-pipeline',
            triggerType: 'push',
            isActive: true,
            conditions: [{ type: 'push_branch', value: 'master', isRegex: false }],
          },
        ],
        pull_request: [
          {
            uniqueId: '2',
            index: 1,
            source: 'workflows#primary',
            triggerType: 'pull_request',
            conditions: [{ type: 'pull_request_target_branch', value: 'develop', isRegex: false }],
            isActive: true,
            isDraftPr: false,
          },
        ],
        tag: [
          {
            uniqueId: '3',
            index: 2,
            source: 'workflows#primary',
            triggerType: 'tag',
            conditions: [{ type: 'tag', value: 'v1.0.0', isRegex: false }],
            isActive: false,
            priority: 1,
          },
        ],
      });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        trigger_map:
        - type: push
          pipeline: ci-pipeline
          push_branch: master
        - type: pull_request
          workflow: primary
          pull_request_target_branch: develop
          draft_pull_request_enabled: false
        - type: tag
          workflow: primary
          tag: v1.0.0
          enabled: false
      `);
    });

    it('should remove the trigger_map if undefined is provided', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            primary: {}
          trigger_map:
          - push_branch: master
            workflow: primary`,
      });

      TriggerService.updateTriggerMap(undefined);

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
      `);
    });
  });

  describe('updateEnabled', () => {
    describe('pipelines', () => {
      it('should update triggers.enabled (enabled: false)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master`,
        });

        TriggerService.updateEnabled(false, { source: 'pipelines', sourceId: 'release' });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                push:
                - branch: master
                enabled: false
        `);
      });

      it('should create triggers when it does not exist (enabled: false)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release: {}`,
        });

        TriggerService.updateEnabled(false, { source: 'pipelines', sourceId: 'release' });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              triggers:
                enabled: false
        `);
      });

      it('should disable flow on triggers (enabled: false)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers: {}`,
        });

        TriggerService.updateEnabled(false, { source: 'pipelines', sourceId: 'release' });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                enabled: false
        `);
      });

      it('should remove triggers.enabled (enabled: true)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master
                  enabled: false`,
        });

        TriggerService.updateEnabled(true, { source: 'pipelines', sourceId: 'release' });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                push:
                - branch: master
        `);
      });

      it('should remove triggers entirely when enabled is the only key (enabled: true)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  enabled: false`,
        });

        TriggerService.updateEnabled(true, { source: 'pipelines', sourceId: 'release' });
        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
        `);
      });

      it('should throw an error if pipeline is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release2:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master`,
        });

        expect(() => {
          TriggerService.updateEnabled(false, { source: 'pipelines', sourceId: 'release' });
        }).toThrow('pipelines.release not found');
      });
    });

    describe('workflows', () => {
      it('should update triggers.enabled (enabled: false)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master`,
        });

        TriggerService.updateEnabled(false, { source: 'workflows', sourceId: 'primary' });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                push:
                - branch: master
                enabled: false
        `);
      });

      it('should create triggers when it does not exist (enabled: false)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary: {}`,
        });

        TriggerService.updateEnabled(false, { source: 'workflows', sourceId: 'primary' });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                enabled: false
        `);
      });

      it('should disable flow on triggers (enabled: false)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers: {}`,
        });

        TriggerService.updateEnabled(false, { source: 'workflows', sourceId: 'primary' });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                enabled: false
        `);
      });

      it('should remove triggers.enabled (enabled: true)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master
                  enabled: false`,
        });

        TriggerService.updateEnabled(true, { source: 'workflows', sourceId: 'primary' });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                push:
                - branch: master
        `);
      });

      it('should remove triggers entirely when enabled is the only key (enabled: true)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  enabled: false`,
        });

        TriggerService.updateEnabled(true, { source: 'workflows', sourceId: 'primary' });
        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary: {}
        `);
      });

      it('should throw an error if workflow is not found (enabled: true)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
              workflows:
                primary2:
                  triggers:
                    push:
                    - branch: master`,
        });

        expect(() => {
          TriggerService.updateEnabled(false, { source: 'workflows', sourceId: 'primary' });
        }).toThrow('workflows.primary not found');
      });
    });
  });

  describe('addTrigger', () => {
    describe('pipelines', () => {
      it('should add a push trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master`,
        });

        TriggerService.addTrigger({
          uniqueId: '1',
          source: 'pipelines#release',
          index: 1,
          triggerType: 'push',
          conditions: [{ type: 'branch', value: 'dev', isRegex: false }],
          isActive: true,
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                push:
                - branch: master
                - branch: dev
        `);
      });

      it('should add a pull_request trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  pull_request:
                  - target_branch: master`,
        });

        TriggerService.addTrigger({
          uniqueId: '1',
          index: 1,
          source: 'pipelines#release',
          triggerType: 'pull_request',
          isActive: true,
          conditions: [{ type: 'source_branch', value: 'dev', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                pull_request:
                - target_branch: master
                - source_branch: dev
        `);
      });

      it('should add a tag trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  tag:
                  - name: 'beta'`,
        });

        TriggerService.addTrigger({
          uniqueId: '1',
          index: 1,
          source: 'pipelines#release',
          triggerType: 'tag',
          isActive: true,
          conditions: [{ type: 'name', value: '*', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                tag:
                - name: 'beta'
                - name: "*"
        `);
      });

      it('should create triggers when it does not exist', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release: {}`,
        });

        TriggerService.addTrigger({
          uniqueId: '1',
          index: 0,
          source: 'pipelines#release',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'master', isRegex: false }],
        });
        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              triggers:
                push:
                - branch: master
        `);
      });

      it('should disable flow on triggers', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers: {}`,
        });

        TriggerService.addTrigger({
          uniqueId: '1',
          index: 0,
          source: 'pipelines#release',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'master', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                push:
                - branch: master
        `);
      });

      it('should throw an error if pipeline is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}`,
        });

        expect(() => {
          TriggerService.addTrigger({
            uniqueId: '1',
            index: 0,
            source: 'pipelines#deploy',
            triggerType: 'push',
            isActive: true,
            conditions: [{ type: 'branch', value: 'master', isRegex: false }],
          });
        }).toThrow('pipelines.deploy not found');
      });
    });

    describe('workflows', () => {
      it('should add a push trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master`,
        });

        TriggerService.addTrigger({
          uniqueId: '1',
          index: 1,
          source: 'workflows#primary',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'dev', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                push:
                - branch: master
                - branch: dev
          `);
      });

      it('should add a pull_request trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  pull_request:
                  - target_branch: master`,
        });

        TriggerService.addTrigger({
          uniqueId: '1',
          index: 1,
          source: 'workflows#primary',
          triggerType: 'pull_request',
          isActive: true,
          conditions: [{ type: 'source_branch', value: 'dev', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                pull_request:
                - target_branch: master
                - source_branch: dev
          `);
      });

      it('should add a tag trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  tag:
                  - name: 'beta'`,
        });

        TriggerService.addTrigger({
          uniqueId: '1',
          index: 1,
          source: 'workflows#primary',
          triggerType: 'tag',
          isActive: true,
          conditions: [{ type: 'name', value: '*', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                tag:
                - name: 'beta'
                - name: "*"
          `);
      });

      it('should create triggers when it does not exist', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary: {}`,
        });

        TriggerService.addTrigger({
          uniqueId: '1',
          index: 0,
          source: 'workflows#primary',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'master', isRegex: false }],
        });
        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                push:
                - branch: master
          `);
      });

      it('should disable flow on triggers', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers: {}`,
        });

        TriggerService.addTrigger({
          uniqueId: '1',
          index: 0,
          source: 'workflows#primary',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'master', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                push:
                - branch: master
          `);
      });

      it('should throw an error if workflow is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary: {}`,
        });

        expect(() => {
          TriggerService.addTrigger({
            uniqueId: '1',
            index: 0,
            source: 'workflows#deploy',
            triggerType: 'push',
            isActive: true,
            conditions: [{ type: 'branch', value: 'master', isRegex: false }],
          });
        }).toThrow('workflows.deploy not found');
      });
    });
  });

  describe('updateTrigger', () => {
    describe('pipelines', () => {
      it('should update a push trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master
                  - branch: dev`,
        });

        TriggerService.updateTrigger({
          uniqueId: '1',
          index: 1,
          source: 'pipelines#release',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'feat', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                push:
                - branch: master
                - branch: feat
          `);
      });

      it('should update a pull_request trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  pull_request:
                  - target_branch: master
                  - target_branch: dev`,
        });

        TriggerService.updateTrigger({
          uniqueId: '1',
          index: 1,
          source: 'pipelines#release',
          triggerType: 'pull_request',
          isActive: true,
          conditions: [{ type: 'source_branch', value: 'dev', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                pull_request:
                - target_branch: master
                - source_branch: dev
          `);
      });

      it('should update a tag trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  tag:
                  - name: 'beta'
                  - name: '.*'`,
        });

        TriggerService.updateTrigger({
          uniqueId: '1',
          index: 1,
          source: 'pipelines#release',
          triggerType: 'tag',
          isActive: true,
          conditions: [{ type: 'name', value: '.*', isRegex: true }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                tag:
                - name: 'beta'
                - name:
                    regex: .*
        `);
      });

      it('should throw an error if pipeline is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master
                  - branch: dev`,
        });

        expect(() => {
          TriggerService.updateTrigger({
            uniqueId: '1',
            index: 1,
            source: 'pipelines#deploy',
            triggerType: 'push',
            isActive: true,
            conditions: [{ type: 'branch', value: 'feat', isRegex: false }],
          });
        }).toThrow('pipelines.deploy not found');
      });

      it('should throw an error if specific trigger is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}`,
        });

        expect(() => {
          TriggerService.updateTrigger({
            uniqueId: '1',
            index: 1,
            source: 'pipelines#release',
            triggerType: 'push',
            isActive: true,
            conditions: [{ type: 'branch', value: 'feat', isRegex: false }],
          });
        }).toThrow('Trigger is not found at path pipelines.release.triggers.push.1');
      });
    });

    describe('workflows', () => {
      it('should update a push trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master
                  - branch: dev`,
        });

        TriggerService.updateTrigger({
          uniqueId: '1',
          index: 1,
          source: 'workflows#primary',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'development', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                push:
                - branch: master
                - branch: development
          `);
      });

      it('should update a pull_request trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  pull_request:
                  - target_branch: master
                  - target_branch: dev`,
        });

        TriggerService.updateTrigger({
          uniqueId: '1',
          index: 1,
          source: 'workflows#primary',
          triggerType: 'pull_request',
          isActive: true,
          conditions: [{ type: 'source_branch', value: 'dev', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                pull_request:
                - target_branch: master
                - source_branch: dev
          `);
      });

      it('should update a tag trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  tag:
                  - name: 'beta'
                  - name: '.*'`,
        });

        TriggerService.updateTrigger({
          uniqueId: '1',
          index: 1,
          source: 'workflows#primary',
          triggerType: 'tag',
          isActive: true,
          conditions: [{ type: 'name', value: '.*', isRegex: true }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                tag:
                - name: 'beta'
                - name:
                    regex: .*
        `);
      });

      it('should throw an error if workflow is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master
                  - branch: dev`,
        });

        expect(() => {
          TriggerService.updateTrigger({
            uniqueId: '1',
            index: 1,
            source: 'workflows#deploy',
            triggerType: 'push',
            isActive: true,
            conditions: [{ type: 'branch', value: 'development', isRegex: false }],
          });
        }).toThrow('workflows.deploy not found');
      });

      it('should throw an error if specific trigger is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers: {}`,
        });

        expect(() => {
          TriggerService.updateTrigger({
            uniqueId: '1',
            index: 1,
            source: 'workflows#primary',
            triggerType: 'push',
            isActive: true,
            conditions: [{ type: 'branch', value: 'development', isRegex: false }],
          });
        }).toThrow('Trigger is not found at path workflows.primary.triggers.push.1');
      });
    });
  });

  describe('updateTriggerEnabled', () => {
    describe('pipelines', () => {
      it('should update triggers.push.enabled (enabled: false)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master`,
        });

        TriggerService.updateTriggerEnabled({
          uniqueId: '1',
          index: 0,
          source: 'pipelines#release',
          triggerType: 'push',
          isActive: false,
          conditions: [{ type: 'branch', value: 'master', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                push:
                - branch: master
                  enabled: false
          `);
      });

      it('should update triggers.pull_request.enabled(enabled: false)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  pull_request:
                  - target_branch: master`,
        });

        TriggerService.updateTriggerEnabled({
          uniqueId: '1',
          index: 0,
          source: 'pipelines#release',
          triggerType: 'pull_request',
          isActive: false,
          conditions: [{ type: 'target_branch', value: 'master', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                pull_request:
                - target_branch: master
                  enabled: false
          `);
      });

      it('should update triggers.tag.enabled (enabled: false)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  tag:
                  - name: '*'`,
        });

        TriggerService.updateTriggerEnabled({
          uniqueId: '1',
          index: 0,
          source: 'pipelines#release',
          triggerType: 'tag',
          isActive: false,
          conditions: [{ type: 'name', value: '*', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                tag:
                - name: '*'
                  enabled: false
          `);
      });

      it('should remove triggers.push.enabled (enabled: true)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master
                    enabled: false`,
        });

        TriggerService.updateTriggerEnabled({
          uniqueId: '1',
          index: 0,
          source: 'pipelines#release',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'master', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                push:
                - branch: master
          `);
      });

      it('should remove triggers.pull_request.enabled (enabled: true)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  pull_request:
                  - target_branch: master
                    enabled: false`,
        });

        TriggerService.updateTriggerEnabled({
          uniqueId: '1',
          index: 0,
          source: 'pipelines#release',
          triggerType: 'pull_request',
          isActive: true,
          conditions: [{ type: 'target_branch', value: 'master', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                pull_request:
                - target_branch: master
          `);
      });

      it('should remove triggers.tag.enabled (enabled: true)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  tag:
                  - name: '*'
                    enabled: false`,
        });

        TriggerService.updateTriggerEnabled({
          uniqueId: '1',
          index: 0,
          source: 'pipelines#release',
          triggerType: 'tag',
          isActive: true,
          conditions: [{ type: 'name', value: '*', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                tag:
                - name: '*'
          `);
      });

      it('should throw an error if pipeline is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master`,
        });

        expect(() => {
          TriggerService.updateTriggerEnabled({
            uniqueId: '1',
            index: 0,
            source: 'pipelines#deploy',
            triggerType: 'push',
            isActive: false,
            conditions: [{ type: 'branch', value: 'master', isRegex: false }],
          });
        }).toThrow('pipelines.deploy not found');
      });

      it('should throw an error if triggers is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}`,
        });

        expect(() => {
          TriggerService.updateTriggerEnabled({
            uniqueId: '1',
            index: 0,
            source: 'pipelines#release',
            triggerType: 'pull_request',
            isActive: false,
            conditions: [{ type: 'target_branch', value: 'master', isRegex: false }],
          });
        }).toThrow('Trigger is not found at path pipelines.release.triggers.pull_request.0');
      });

      it('should throw an error if the specific trigger is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master`,
        });

        expect(() => {
          TriggerService.updateTriggerEnabled({
            uniqueId: '1',
            index: 1,
            source: 'pipelines#release',
            triggerType: 'pull_request',
            isActive: false,
            conditions: [{ type: 'target_branch', value: 'master', isRegex: false }],
          });
        }).toThrow('Trigger is not found at path pipelines.release.triggers.pull_request.1');
      });
    });

    describe('workflows', () => {
      it('should update triggers.push.enabled (enabled: false)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master`,
        });

        TriggerService.updateTriggerEnabled({
          uniqueId: '1',
          index: 0,
          source: 'workflows#primary',
          triggerType: 'push',
          isActive: false,
          conditions: [{ type: 'branch', value: 'master', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                push:
                - branch: master
                  enabled: false
          `);
      });

      it('should update triggers.pull_request.enabled (enabled: false)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  pull_request:
                  - target_branch: master`,
        });

        TriggerService.updateTriggerEnabled({
          uniqueId: '1',
          index: 0,
          source: 'workflows#primary',
          triggerType: 'pull_request',
          isActive: false,
          conditions: [{ type: 'target_branch', value: 'master', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                pull_request:
                - target_branch: master
                  enabled: false
          `);
      });

      it('should update triggers.tag.enabled (enabled: false)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  tag:
                  - name: '*'`,
        });

        TriggerService.updateTriggerEnabled({
          uniqueId: '1',
          index: 0,
          source: 'workflows#primary',
          triggerType: 'tag',
          isActive: false,
          conditions: [{ type: 'name', value: '*', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                tag:
                - name: '*'
                  enabled: false
          `);
      });

      it('should remove triggers.push.enabled (enabled: true)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master
                    enabled: false`,
        });

        TriggerService.updateTriggerEnabled({
          uniqueId: '1',
          index: 0,
          source: 'workflows#primary',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'master', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                push:
                - branch: master
          `);
      });

      it('should remove triggers.pull_request.enabled (enabled: true)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  pull_request:
                  - target_branch: master
                    enabled: false`,
        });

        TriggerService.updateTriggerEnabled({
          uniqueId: '1',
          index: 0,
          source: 'workflows#primary',
          triggerType: 'pull_request',
          isActive: true,
          conditions: [{ type: 'target_branch', value: 'master', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                pull_request:
                - target_branch: master
          `);
      });

      it('should remove triggers.tag.enabled (enabled: true)', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  tag:
                  - name: '*'
                    enabled: false`,
        });

        TriggerService.updateTriggerEnabled({
          uniqueId: '1',
          index: 0,
          source: 'workflows#primary',
          triggerType: 'tag',
          isActive: true,
          conditions: [{ type: 'name', value: '*', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                tag:
                - name: '*'
          `);
      });

      it('should throw an error if workflow is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master`,
        });

        expect(() => {
          TriggerService.updateTriggerEnabled({
            uniqueId: '1',
            index: 0,
            source: 'workflows#secondary',
            triggerType: 'push',
            isActive: false,
            conditions: [{ type: 'branch', value: 'master', isRegex: false }],
          });
        }).toThrow('workflows.secondary not found');
      });

      it('should throw an error if triggers is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary: {}`,
        });

        expect(() => {
          TriggerService.updateTriggerEnabled({
            uniqueId: '1',
            index: 0,
            source: 'workflows#primary',
            triggerType: 'pull_request',
            isActive: false,
            conditions: [{ type: 'target_branch', value: 'master', isRegex: false }],
          });
        }).toThrow('Trigger is not found at path workflows.primary.triggers.pull_request.0');
      });

      it('should throw an error if the specific trigger is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master`,
        });

        expect(() => {
          TriggerService.updateTriggerEnabled({
            uniqueId: '1',
            index: 1,
            source: 'workflows#primary',
            triggerType: 'pull_request',
            isActive: false,
            conditions: [{ type: 'target_branch', value: 'master', isRegex: false }],
          });
        }).toThrow('Trigger is not found at path workflows.primary.triggers.pull_request.1');
      });
    });
  });

  describe('removeTrigger', () => {
    describe('pipelines', () => {
      it('should remove a push trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master
                  - branch: dev`,
        });

        TriggerService.removeTrigger({
          uniqueId: '1',
          index: 1,
          source: 'pipelines#release',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'dev', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                push:
                - branch: master
        `);
      });

      it('should remove a pull_request trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  pull_request:
                  - target_branch: master
                  - target_branch: dev`,
        });

        TriggerService.removeTrigger({
          uniqueId: '1',
          index: 1,
          source: 'pipelines#release',
          triggerType: 'pull_request',
          isActive: true,
          conditions: [{ type: 'target_branch', value: 'dev', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                pull_request:
                - target_branch: master
        `);
      });

      it('should remove a tag trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  tag:
                  - name: 'beta'
                  - name: '.*'`,
        });

        TriggerService.removeTrigger({
          uniqueId: '1',
          index: 1,
          source: 'pipelines#release',
          triggerType: 'tag',
          isActive: true,
          conditions: [{ type: 'name', value: '.*', isRegex: true }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
              triggers:
                tag:
                - name: 'beta'
        `);
      });

      it('should remove triggers, when removing the last trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master`,
        });

        TriggerService.removeTrigger({
          uniqueId: '1',
          index: 0,
          source: 'pipelines#release',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'master', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          pipelines:
            release:
              workflows:
                primary: {}
        `);
      });

      it('should throw an error if pipeline is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master`,
        });

        expect(() => {
          TriggerService.removeTrigger({
            uniqueId: '1',
            index: 0,
            source: 'pipelines#deploy',
            triggerType: 'push',
            isActive: true,
            conditions: [{ type: 'branch', value: 'master', isRegex: false }],
          });
        }).toThrow('pipelines.deploy not found');
      });

      it('should throw an error if specific trigger is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            pipelines:
              release:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master`,
        });

        expect(() => {
          TriggerService.removeTrigger({
            uniqueId: '1',
            index: 0,
            source: 'pipelines#release',
            triggerType: 'pull_request',
            isActive: true,
            conditions: [{ type: 'target_branch', value: 'master', isRegex: false }],
          });
        }).toThrow('Trigger is not found at path pipelines.release.triggers.pull_request.0');
      });
    });

    describe('workflows', () => {
      it('should remove a push trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master
                  - branch: dev`,
        });

        TriggerService.removeTrigger({
          uniqueId: '1',
          index: 1,
          source: 'workflows#primary',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'dev', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                push:
                - branch: master
        `);
      });

      it('should remove a pull_request trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  pull_request:
                  - target_branch: master
                  - target_branch: dev`,
        });

        TriggerService.removeTrigger({
          uniqueId: '1',
          index: 1,
          source: 'workflows#primary',
          triggerType: 'pull_request',
          isActive: true,
          conditions: [{ type: 'target_branch', value: 'dev', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                pull_request:
                - target_branch: master
        `);
      });

      it('should remove a tag trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  tag:
                  - name: 'beta'
                  - name: '.*'`,
        });

        TriggerService.removeTrigger({
          uniqueId: '1',
          index: 1,
          source: 'workflows#primary',
          triggerType: 'tag',
          isActive: true,
          conditions: [{ type: 'name', value: '.*', isRegex: true }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary:
              triggers:
                tag:
                - name: 'beta'
        `);
      });

      it('should remove triggers, when removing the last trigger', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master`,
        });

        TriggerService.removeTrigger({
          uniqueId: '1',
          index: 0,
          source: 'workflows#primary',
          triggerType: 'push',
          isActive: true,
          conditions: [{ type: 'branch', value: 'master', isRegex: false }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
          workflows:
            primary: {}
        `);
      });

      it('should throw an error if workflow is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master`,
        });

        expect(() => {
          TriggerService.removeTrigger({
            uniqueId: '1',
            index: 0,
            source: 'workflows#deploy',
            triggerType: 'push',
            isActive: true,
            conditions: [{ type: 'branch', value: 'master', isRegex: false }],
          });
        }).toThrow('workflows.deploy not found');
      });

      it('should throw an error if specific trigger is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                triggers:
                  push:
                  - branch: master`,
        });

        expect(() => {
          TriggerService.removeTrigger({
            uniqueId: '1',
            index: 0,
            source: 'workflows#primary',
            triggerType: 'pull_request',
            isActive: true,
            conditions: [{ type: 'target_branch', value: 'master', isRegex: false }],
          });
        }).toThrow('Trigger is not found at path workflows.primary.triggers.pull_request.0');
      });
    });
  });
});
