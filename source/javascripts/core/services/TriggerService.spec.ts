import BitriseYmlApi from '../api/BitriseYmlApi';
import { bitriseYmlStore, initializeStore } from '../stores/BitriseYmlStore';
import TriggerService from './TriggerService';

describe('TriggerService', () => {
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

        TriggerService.updateTriggerEnabled(false, {
          source: 'pipelines',
          sourceId: 'release',
          triggerType: 'push',
          index: 0,
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

        TriggerService.updateTriggerEnabled(false, {
          source: 'pipelines',
          sourceId: 'release',
          triggerType: 'pull_request',
          index: 0,
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

        TriggerService.updateTriggerEnabled(false, {
          source: 'pipelines',
          sourceId: 'release',
          triggerType: 'tag',
          index: 0,
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

        TriggerService.updateTriggerEnabled(true, {
          source: 'pipelines',
          sourceId: 'release',
          triggerType: 'push',
          index: 0,
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

        TriggerService.updateTriggerEnabled(true, {
          source: 'pipelines',
          sourceId: 'release',
          triggerType: 'pull_request',
          index: 0,
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

        TriggerService.updateTriggerEnabled(true, {
          source: 'pipelines',
          sourceId: 'release',
          triggerType: 'tag',
          index: 0,
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
              release2:
                workflows:
                  primary: {}
                triggers:
                  push:
                  - branch: master`,
        });

        expect(() => {
          TriggerService.updateTriggerEnabled(false, {
            source: 'pipelines',
            sourceId: 'release',
            triggerType: 'push',
            index: 0,
          });
        }).toThrow('pipelines.release not found');
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
          TriggerService.updateTriggerEnabled(false, {
            source: 'pipelines',
            sourceId: 'release',
            triggerType: 'pull_request',
            index: 0,
          });
        }).toThrow('Trigger is not found at path pipelines.release.triggers.pull_request.0');
      });

      it('should throw an error if trigger is not found (triggerType not found)', () => {
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
          TriggerService.updateTriggerEnabled(false, {
            source: 'pipelines',
            sourceId: 'release',
            triggerType: 'pull_request',
            index: 0,
          });
        }).toThrow('Trigger is not found at path pipelines.release.triggers.pull_request.0');
      });

      it('should throw an error if trigger is not found (index out of bounds)', () => {
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
          TriggerService.updateTriggerEnabled(false, {
            source: 'pipelines',
            sourceId: 'release',
            triggerType: 'push',
            index: 1,
          });
        }).toThrow('Trigger is not found at path pipelines.release.triggers.push.1');
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

        TriggerService.updateTriggerEnabled(false, {
          source: 'workflows',
          sourceId: 'primary',
          triggerType: 'push',
          index: 0,
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

        TriggerService.updateTriggerEnabled(false, {
          source: 'workflows',
          sourceId: 'primary',
          triggerType: 'pull_request',
          index: 0,
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

        TriggerService.updateTriggerEnabled(false, {
          source: 'workflows',
          sourceId: 'primary',
          triggerType: 'tag',
          index: 0,
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

        TriggerService.updateTriggerEnabled(true, {
          source: 'workflows',
          sourceId: 'primary',
          triggerType: 'push',
          index: 0,
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

        TriggerService.updateTriggerEnabled(true, {
          source: 'workflows',
          sourceId: 'primary',
          triggerType: 'pull_request',
          index: 0,
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

        TriggerService.updateTriggerEnabled(true, {
          source: 'workflows',
          sourceId: 'primary',
          triggerType: 'tag',
          index: 0,
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
              primary2:
                triggers:
                  push:
                  - branch: master`,
        });

        expect(() => {
          TriggerService.updateTriggerEnabled(false, {
            source: 'workflows',
            sourceId: 'primary',
            triggerType: 'push',
            index: 0,
          });
        }).toThrow('workflows.primary not found');
      });

      it('should throw an error if triggers is not found', () => {
        initializeStore({
          version: '',
          ymlString: yaml`
            workflows:
              primary:
                {}`,
        });

        expect(() => {
          TriggerService.updateTriggerEnabled(false, {
            source: 'workflows',
            sourceId: 'primary',
            triggerType: 'pull_request',
            index: 0,
          });
        }).toThrow('Trigger is not found at path workflows.primary.triggers.pull_request.0');
      });

      it('should throw an error if trigger is not found (triggerType not found)', () => {
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
          TriggerService.updateTriggerEnabled(false, {
            source: 'workflows',
            sourceId: 'primary',
            triggerType: 'pull_request',
            index: 0,
          });
        }).toThrow('Trigger is not found at path workflows.primary.triggers.pull_request.0');
      });

      it('should throw an error if trigger is not found (index out of bounds)', () => {
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
          TriggerService.updateTriggerEnabled(false, {
            source: 'workflows',
            sourceId: 'primary',
            triggerType: 'push',
            index: 1,
          });
        }).toThrow('Trigger is not found at path workflows.primary.triggers.push.1');
      });
    });
  });
});
