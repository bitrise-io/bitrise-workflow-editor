import BitriseYmlApi from '../api/BitriseYmlApi';
import { TriggerSource } from '../models/Trigger';
import { LegacyTrigger } from '../models/Trigger.legacy';
import { bitriseYmlStore, initializeStore } from '../stores/BitriseYmlStore';
import TriggerService from './TriggerService';

describe('TriggerService', () => {
  describe('Legacy Triggers', () => {
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
            { type: 'push_branch', value: 'master' },
            { type: 'commit_message', value: 'ci' },
            { type: 'changed_files', value: 'src' },
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
            { type: 'branch', value: 'master' },
            { type: 'commit_message', value: 'ci' },
            { type: 'changed_files', value: 'src' },
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
            { type: 'pull_request_source_branch', value: 'master' },
            { type: 'pull_request_target_branch', value: 'dev' },
            { type: 'pull_request_label', value: 'bugfix' },
            { type: 'pull_request_comment', value: 'comment' },
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
            { type: 'source_branch', value: 'master' },
            { type: 'target_branch', value: 'dev' },
            { type: 'label', value: 'bugfix' },
            { type: 'comment', value: 'comment' },
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
          conditions: [{ type: 'tag', value: 'v1.0.0' }],
        };

        const convertedTrigger = TriggerService.convertToTargetBasedTrigger(legacyTrigger);
        expect(convertedTrigger).toEqual({
          uniqueId: '1',
          index: 0,
          source: 'pipelines#release',
          triggerType: 'tag',
          isActive: true,
          conditions: [{ type: 'name', value: 'v1.0.0' }],
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
          conditions: [{ type: 'pull_request_source_branch', value: 'dev' }],
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
          conditions: [{ type: 'push_branch', value: 'master' }],
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
          conditions: [{ type: 'push_branch', value: 'master' }],
        });

        expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        trigger_map:
        - type: push
          workflow: primary
          push_branch: master
      `);
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
          conditions: [{ type: 'pull_request_source_branch', value: 'dev' }],
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
            conditions: [{ type: 'push_branch', value: 'master' }],
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
            conditions: [{ type: 'push_branch', value: 'master' }],
          });
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
              conditions: [{ type: 'push_branch', value: 'master' }],
            },
          ],
          pull_request: [
            {
              uniqueId: '2',
              index: 1,
              source: 'workflows#primary',
              triggerType: 'pull_request',
              conditions: [{ type: 'pull_request_target_branch', value: 'develop' }],
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
              conditions: [{ type: 'tag', value: 'v1.0.0' }],
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
  });

  describe('Target-based Triggers', () => {
    describe('updateEnabled', () => {
      [
        { source: 'pipelines' as TriggerSource, sourceId: 'release' },
        { source: 'workflows' as TriggerSource, sourceId: 'primary' },
      ].forEach(({ source, sourceId }) => {
        describe(`${source}`, () => {
          it('should update triggers.enabled (enabled: false)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master`,
            });

            TriggerService.updateEnabled(false, { source, sourceId });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
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
                ${source}:
                  ${sourceId}: {}`,
            });

            TriggerService.updateEnabled(false, { source, sourceId });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    enabled: false
            `);
          });

          it('should disable flow on triggers (enabled: false)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers: {}`,
            });

            TriggerService.updateEnabled(false, { source, sourceId });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    enabled: false
            `);
          });

          it('should remove triggers.enabled (enabled: true)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                      enabled: false`,
            });

            TriggerService.updateEnabled(true, { source, sourceId });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
            `);
          });

          it('should remove triggers entirely when enabled is the only key (enabled: true)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      enabled: false`,
            });

            TriggerService.updateEnabled(true, { source, sourceId });
            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}: {}
            `);
          });

          it(`should throw an error if ${source}.${sourceId} is not found`, () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}-different:
                    triggers:
                      push:
                      - branch: master`,
            });

            expect(() => {
              TriggerService.updateEnabled(false, { source, sourceId });
            }).toThrow(`${source}.${sourceId} not found`);
          });
        });
      });
    });

    describe('addTrigger', () => {
      [
        { source: 'pipelines' as TriggerSource, sourceId: 'release' },
        { source: 'workflows' as TriggerSource, sourceId: 'primary' },
      ].forEach(({ source, sourceId }) => {
        describe(`${source}`, () => {
          it('should add a push trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master`,
            });

            TriggerService.addTrigger({
              uniqueId: '1',
              source: `${source}#${sourceId}`,
              index: 1,
              triggerType: 'push',
              conditions: [
                { type: 'branch', value: 'dev' },
                {
                  type: 'commit_message',
                  value: 'ci',
                  isRegex: true,
                },
              ],
              isActive: true,
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                    - branch: dev
                      commit_message:
                        regex: ci
            `);
          });

          it('should add a pull_request trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      pull_request:
                      - target_branch: master`,
            });

            TriggerService.addTrigger({
              uniqueId: '1',
              index: 1,
              source: `${source}#${sourceId}`,
              triggerType: 'pull_request',
              isActive: true,
              conditions: [{ type: 'source_branch', value: 'dev' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
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
                ${source}:
                  ${sourceId}:
                    triggers:
                      tag:
                      - name: 'beta'`,
            });

            TriggerService.addTrigger({
              uniqueId: '1',
              index: 1,
              source: `${source}#${sourceId}`,
              triggerType: 'tag',
              isActive: true,
              conditions: [{ type: 'name', value: '*' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
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
                ${source}:
                  ${sourceId}: {}`,
            });

            TriggerService.addTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [{ type: 'branch', value: 'master' }],
            });
            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
            `);
          });

          it('should disable flow on triggers', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers: {}`,
            });

            TriggerService.addTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [{ type: 'branch', value: 'master' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
            `);
          });

          it(`should throw an error if ${source}.${sourceId} is not found`, () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}-different: {}`,
            });

            expect(() => {
              TriggerService.addTrigger({
                uniqueId: '1',
                index: 0,
                source: `${source}#${sourceId}`,
                triggerType: 'push',
                isActive: true,
                conditions: [{ type: 'branch', value: 'master' }],
              });
            }).toThrow(`${source}.${sourceId} not found`);
          });
        });
      });
    });

    describe('removeTrigger', () => {
      [
        { source: 'pipelines' as TriggerSource, sourceId: 'release' },
        { source: 'workflows' as TriggerSource, sourceId: 'primary' },
      ].forEach(({ source, sourceId }) => {
        describe(`${source}`, () => {
          it('should remove a push trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                      - branch: dev`,
            });

            TriggerService.removeTrigger({
              uniqueId: '1',
              index: 1,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [{ type: 'branch', value: 'dev' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
            `);
          });

          it('should remove a pull_request trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      pull_request:
                      - target_branch: master
                      - target_branch: dev`,
            });

            TriggerService.removeTrigger({
              uniqueId: '1',
              index: 1,
              source: `${source}#${sourceId}`,
              triggerType: 'pull_request',
              isActive: true,
              conditions: [{ type: 'target_branch', value: 'dev' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    pull_request:
                    - target_branch: master
            `);
          });

          it('should remove a tag trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      tag:
                      - name: 'beta'
                      - name: '.*'`,
            });

            TriggerService.removeTrigger({
              uniqueId: '1',
              index: 1,
              source: `${source}#${sourceId}`,
              triggerType: 'tag',
              isActive: true,
              conditions: [{ type: 'name', value: '.*', isRegex: true }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    tag:
                    - name: 'beta'
            `);
          });

          it('should remove triggers, when removing the last trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master`,
            });

            TriggerService.removeTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [{ type: 'branch', value: 'master' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}: {}
            `);
          });

          it(`should throw an error if ${source}.${sourceId} is not found`, () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}-different:
                    triggers:
                      push:
                      - branch: master`,
            });

            expect(() => {
              TriggerService.removeTrigger({
                uniqueId: '1',
                index: 0,
                source: `${source}#${sourceId}`,
                triggerType: 'push',
                isActive: true,
                conditions: [{ type: 'branch', value: 'master' }],
              });
            }).toThrow(`${source}.${sourceId} not found`);
          });

          it('should throw an error if specific trigger is not found', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master`,
            });

            expect(() => {
              TriggerService.removeTrigger({
                uniqueId: '1',
                index: 0,
                source: `${source}#${sourceId}`,
                triggerType: 'pull_request',
                isActive: true,
                conditions: [{ type: 'target_branch', value: 'master' }],
              });
            }).toThrow(`Trigger is not found at path ${source}.${sourceId}.triggers.pull_request.0`);
          });
        });
      });
    });

    describe('updateTrigger', () => {
      [
        { source: 'pipelines' as TriggerSource, sourceId: 'release' },
        { source: 'workflows' as TriggerSource, sourceId: 'primary' },
      ].forEach(({ source, sourceId }) => {
        describe(`${source}`, () => {
          it('should create the enabled property of a trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: false,
              conditions: [{ type: 'branch', value: 'master' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      enabled: false
            `);
          });

          it('should update the enabled property of a trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      pull_request:
                      - enabled: true
                        target_branch: master`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'pull_request',
              isActive: false,
              conditions: [{ type: 'target_branch', value: 'master' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    pull_request:
                    - enabled: false
                      target_branch: master
            `);
          });

          it('should remove the enabled property of a trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      tag:
                      - name: master
                        enabled: false`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'tag',
              isActive: true,
              conditions: [{ type: 'name', value: 'master' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    tag:
                    - name: master
            `);
          });

          it('should create the priority property of a trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              priority: 1,
              conditions: [{ type: 'branch', value: 'master' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      priority: 1
            `);
          });

          it('should update the priority property of a trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      pull_request:
                      - priority: 1
                        target_branch: master`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'pull_request',
              isActive: true,
              priority: 2,
              conditions: [{ type: 'target_branch', value: 'master' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    pull_request:
                    - priority: 2
                      target_branch: master
            `);
          });

          it('should delete the priority property of a trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      tag:
                      - priority: 1
                        name: master`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'tag',
              isActive: true,
              priority: undefined,
              conditions: [{ type: 'name', value: 'master' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    tag:
                    - name: master
            `);
          });

          it('should create the draft_enabled property of a trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      pull_request:
                      - target_branch: master`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'pull_request',
              isActive: true,
              isDraftPr: false,
              conditions: [{ type: 'target_branch', value: 'master' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    pull_request:
                    - target_branch: master
                      draft_enabled: false
            `);
          });

          it('should update the draft_enabled property of a trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      pull_request:
                      - draft_enabled: true
                        target_branch: master`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'pull_request',
              isActive: true,
              isDraftPr: false,
              conditions: [{ type: 'target_branch', value: 'master' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    pull_request:
                    - draft_enabled: false
                      target_branch: master
            `);
          });

          it('should delete the draft_enabled property of a trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      pull_request:
                      - target_branch: master
                        draft_enabled: false`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'pull_request',
              isActive: true,
              isDraftPr: undefined,
              conditions: [{ type: 'target_branch', value: 'master' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    pull_request:
                    - target_branch: master
            `);
          });

          it('should add a new condition to a trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                {
                  type: 'commit_message',
                  value: 'ci',
                  isRegex: true,
                },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        regex: ci
            `);
          });

          it('should remove a condition from a trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message:
                          regex: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [{ type: 'branch', value: 'master' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
            `);
          });

          it('should update the value of a condition in a trigger (string value)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'release-candidate' },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message: release-candidate
            `);
          });

          it('should update the value of a condition in a trigger (pattern value)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message:
                          pattern: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'release-candidate', isRegex: true },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        regex: release-candidate
            `);
          });

          it('should update the value of a condition in a trigger (regex value)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message:
                          regex: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'release-candidate', isRegex: true },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        regex: release-candidate
            `);
          });

          it('should set the regex property of a trigger (string value to regex value)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                {
                  type: 'commit_message',
                  value: 'ci',
                  isRegex: true,
                },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        regex: ci
            `);
          });

          it('should set the regex property of a trigger (pattern value to regex value)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message:
                          pattern: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'ci', isRegex: true },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        regex: ci
            `);
          });

          it('should set the regex property of a trigger (regex value is unchanged)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message:
                          regex: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'ci', isRegex: true },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        regex: ci
            `);
          });

          it('should remove the regex property of a trigger (regex value to string value)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message:
                          regex: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'ci' },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message: ci
            `);
          });

          it('should remove the regex property of a trigger (regex value to pattern value)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message:
                          regex: ci
                          last_commit: true`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'ci', isLastCommitOnly: true },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        pattern: ci
                        last_commit: true
            `);
          });

          it('should remove the regex property of a trigger (pattern value is unchanged)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message:
                          pattern: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'ci' },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        pattern: ci
            `);
          });

          it('should remove the regex property of a trigger (string value is unchanged)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'ci' },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message: ci
            `);
          });

          it('should set the last_commit property of a trigger (string value to pattern value)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                {
                  type: 'commit_message',
                  value: 'ci',
                  isLastCommitOnly: true,
                },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        pattern: ci
                        last_commit: true
            `);
          });

          it('should set the last_commit property of a trigger (pattern value is unchanged)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message:
                          pattern: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'ci', isLastCommitOnly: true },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        pattern: ci
                        last_commit: true
            `);
          });

          it('should set the last_commit property of a trigger (regex value is unchanged)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message:
                          regex: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'ci', isLastCommitOnly: true, isRegex: true },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        regex: ci
                        last_commit: true
            `);
          });

          it('should remove the last_commit property of a trigger (regex value is unchanged)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message:
                          regex: ci
                          last_commit: true`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'ci', isRegex: true },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        regex: ci
            `);
          });

          it('should remove the last_commit property of a trigger (pattern value is unchanged)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message:
                          pattern: ci
                          last_commit: true`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'ci' },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message:
                        pattern: ci
            `);
          });

          it('should remove the last_commit property of a trigger (string value is unchanged)', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        commit_message: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'ci' },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      commit_message: ci
            `);
          });

          it('should update an push trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      push:
                      - branch: master
                        priority: 1
                        commit_message: ci`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'push',
              isActive: true,
              priority: 2,
              conditions: [
                { type: 'branch', value: 'master' },
                { type: 'commit_message', value: 'ci', isLastCommitOnly: true },
                { type: 'changed_files', value: 'src' },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    push:
                    - branch: master
                      priority: 2
                      commit_message:
                        pattern: ci
                        last_commit: true
                      changed_files: src
            `);
          });

          it('should update a pull_request trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      pull_request:
                      - target_branch: master
                        draft_enabled: false`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'pull_request',
              isActive: false,
              isDraftPr: false,
              priority: 1,
              conditions: [
                { type: 'target_branch', value: 'master' },
                { type: 'source_branch', value: 'dev' },
                { type: 'label', value: 'feature/.*', isRegex: true },
              ],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    pull_request:
                    - target_branch: master
                      draft_enabled: false
                      source_branch: dev
                      label:
                        regex: feature/.*
                      priority: 1
                      enabled: false
            `);
          });

          it('should update a tag trigger', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}:
                    triggers:
                      tag:
                      - name: 'beta'`,
            });

            TriggerService.updateTrigger({
              uniqueId: '1',
              index: 0,
              source: `${source}#${sourceId}`,
              triggerType: 'tag',
              isActive: false,
              priority: 1,
              conditions: [{ type: 'name', value: 'beta' }],
            });

            expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
              ${source}:
                ${sourceId}:
                  triggers:
                    tag:
                    - name: 'beta'
                      priority: 1
                      enabled: false
            `);
          });

          it(`should throw an error if ${source}.${sourceId} is not found`, () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}-different:
                    triggers:
                      push:
                      - branch: master
                      - branch: dev`,
            });

            expect(() => {
              TriggerService.updateTrigger({
                uniqueId: '1',
                index: 1,
                source: `${source}#${sourceId}`,
                triggerType: 'push',
                isActive: true,
                conditions: [{ type: 'branch', value: 'feat' }],
              });
            }).toThrow(`${source}.${sourceId} not found`);
          });

          it('should throw an error if specific trigger is not found', () => {
            initializeStore({
              version: '',
              ymlString: yaml`
                ${source}:
                  ${sourceId}: {}`,
            });

            expect(() => {
              TriggerService.updateTrigger({
                uniqueId: '1',
                index: 1,
                source: `${source}#${sourceId}`,
                triggerType: 'push',
                isActive: true,
                conditions: [{ type: 'branch', value: 'feat' }],
              });
            }).toThrow(`Trigger is not found at path ${source}.${sourceId}.triggers.push.1`);
          });
        });
      });
    });
  });
});
