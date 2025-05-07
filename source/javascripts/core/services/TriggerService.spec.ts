import BitriseYmlApi from '../api/BitriseYmlApi';
import { bitriseYmlStore, initializeStore } from '../stores/BitriseYmlStore';
import * as TriggerService from './TriggerService';

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
});
