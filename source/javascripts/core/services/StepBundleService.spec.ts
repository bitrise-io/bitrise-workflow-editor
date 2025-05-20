import StepBundleService from '@/core/services/StepBundleService';

import BitriseYmlApi from '../api/BitriseYmlApi';
import { bitriseYmlStore, initializeStore } from '../stores/BitriseYmlStore';

describe('StepBundleService', () => {
  describe('validateName', () => {
    describe('when the initial name is empty', () => {
      it('returns true if the step bundle name is valid and unique', () => {
        expect(StepBundleService.validateName('sb4', '', ['sb1', 'sb2', 'sb3'])).toBe(true);
      });

      it('returns an error message if the step bundle name is empty', () => {
        expect(StepBundleService.validateName('', '', ['sb1', 'sb2', 'sb3'])).toBe('Step bundle name is required');
      });

      it('returns an error message if the step bundle name contains only whitespaces', () => {
        expect(StepBundleService.validateName('   ', '', ['sb1', 'sb2', 'sb3'])).toBe('Step bundle name is required');
      });

      it('returns an error message if the step bundle name contains invalid characters', () => {
        expect(StepBundleService.validateName('invalid!', '', ['sb1', 'sb2', 'sb3'])).toBe(
          'Step bundle name must only contain letters, numbers, dashes, underscores or periods',
        );
      });

      it('returns an error message if the step bundle name is not unique', () => {
        expect(StepBundleService.validateName('sb1', '', ['sb1', 'sb2', 'sb3'])).toBe(
          'Step bundle name should be unique',
        );
      });
    });

    describe('when the initial name is not empty', () => {
      it('returns true if the step bundle name is valid and unique', () => {
        expect(StepBundleService.validateName('sb4', 'sb1', ['sb1', 'sb2', 'sb3'])).toBe(true);
      });

      it('returns an error message if the step bundle name is empty', () => {
        expect(StepBundleService.validateName('', 'sb1', ['sb1', 'sb2', 'sb3'])).toBe('Step bundle name is required');
      });

      it('returns an error message if the step bundle name contains only whitespaces', () => {
        expect(StepBundleService.validateName('   ', 'sb1', ['sb1', 'sb2', 'sb3'])).toBe(
          'Step bundle name is required',
        );
      });

      it('returns an error message if the step bundle name contains invalid characters', () => {
        expect(StepBundleService.validateName('invalid!', 'sb1', ['sb1', 'sb2', 'sb3'])).toBe(
          'Step bundle name must only contain letters, numbers, dashes, underscores or periods',
        );
      });

      it('returns an error message if the step bundle name is not unique', () => {
        expect(StepBundleService.validateName('sb2', 'sb1', ['sb1', 'sb2', 'sb3'])).toBe(
          'Step bundle name should be unique',
        );
      });
    });
  });

  describe('createStepBundle', () => {
    it('creates an empty step bundle', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}`,
      });

      StepBundleService.createStepBundle('sb1');

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1: {}
      `);
    });

    it('creates a step bundle based on another step bundle (simple)', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary:
              steps:
              - step1:
              - step2:
              - bundle::sb1:
          step_bundles:
            sb1:
              steps:
              - step3:
              - step4:
        `,
      });

      StepBundleService.createStepBundle('sb2', { source: 'step_bundles', sourceId: 'sb1' });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary:
            steps:
            - step1:
            - step2:
            - bundle::sb1:
        step_bundles:
          sb1:
            steps:
            - step3:
            - step4:
          sb2:
            steps:
            - step3:
            - step4:
      `);
    });

    it('creates a step bundle based on another step bundle (complex)', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary:
              steps:
              - step1:
              - step2:
              - bundle::sb1:
          step_bundles:
            sb1:
              title: 'Step bundle'
              summary: 'Step bundle summary'
              description: 'Step bundle description'
              envs:
              - MY_ENV_VAR: 'my_value'
              inputs:
              - input1: 'my_input_value'
              steps:
              - step3:
              - step4:
        `,
      });

      StepBundleService.createStepBundle('sb2', { source: 'step_bundles', sourceId: 'sb1' });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary:
            steps:
            - step1:
            - step2:
            - bundle::sb1:
        step_bundles:
          sb1:
            title: 'Step bundle'
            summary: 'Step bundle summary'
            description: 'Step bundle description'
            envs:
            - MY_ENV_VAR: 'my_value'
            inputs:
            - input1: 'my_input_value'
            steps:
            - step3:
            - step4:
          sb2:
            title: 'Step bundle'
            summary: 'Step bundle summary'
            description: 'Step bundle description'
            envs:
            - MY_ENV_VAR: 'my_value'
            inputs:
            - input1: 'my_input_value'
            steps:
            - step3:
            - step4:
      `);
    });

    it('creates a step bundle based on a workflow (simple)', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary:
              steps:
              - step1:
              - step2:
              - bundle::sb1:
          step_bundles:
            sb1:
              steps:
              - step3:
              - step4:
        `,
      });

      StepBundleService.createStepBundle('sb2', { source: 'workflows', sourceId: 'primary' });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary:
            steps:
            - step1:
            - step2:
            - bundle::sb1:
        step_bundles:
          sb1:
            steps:
            - step3:
            - step4:
          sb2:
            steps:
            - step1:
            - step2:
            - bundle::sb1:
      `);
    });

    it('creates a step bundle based on a workflow (complex)', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary:
              title: 'Workflow'
              summary: 'Workflow summary'
              description: 'Workflow description'
              before_run: []
              after_run: []
              meta:
                bitrise.io:
                  stack: 'osx-xcode-12.5.x'
                  machine_type_id: 'osx-xcode-12.5.x'
              triggers:
                push:
                - branch: master
              priority: 1
              timeout_in_minutes: 60
              status_report_name: 'workflow:primary'
              envs:
              - MY_ENV_VAR: 'my_value'
              steps:
              - step1:
              - step2:
              - bundle::sb1:
          step_bundles:
            sb1:
              steps:
              - step3:
              - step4:
        `,
      });

      StepBundleService.createStepBundle('sb2', { source: 'workflows', sourceId: 'primary' });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary:
            title: 'Workflow'
            summary: 'Workflow summary'
            description: 'Workflow description'
            before_run: []
            after_run: []
            meta:
              bitrise.io:
                stack: 'osx-xcode-12.5.x'
                machine_type_id: 'osx-xcode-12.5.x'
            triggers:
              push:
              - branch: master
            priority: 1
            timeout_in_minutes: 60
            status_report_name: 'workflow:primary'
            envs:
            - MY_ENV_VAR: 'my_value'
            steps:
            - step1:
            - step2:
            - bundle::sb1:
        step_bundles:
          sb1:
            steps:
            - step3:
            - step4:
          sb2:
            title: 'Workflow'
            summary: 'Workflow summary'
            description: 'Workflow description'
            envs:
            - MY_ENV_VAR: 'my_value'
            steps:
            - step1:
            - step2:
            - bundle::sb1:
      `);
    });

    it('should throw an error if the step bundle id already exists', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1: {}
        `,
      });

      expect(() => {
        StepBundleService.createStepBundle('sb1');
      }).toThrow("Step bundle 'sb1' already exists");
    });

    it('should throws an error if the based on entity is not found', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary:
              steps:
              - step1:
              - step2:
              - bundle::sb1:
          step_bundles:
            sb1:
              steps:
              - step3:
              - step4:
        `,
      });

      expect(() => {
        StepBundleService.createStepBundle('sb3', { source: 'step_bundles', sourceId: 'sb2' });
      }).toThrow('step_bundles.sb2 not found');
    });
  });

  describe('renameStepBundle', () => {
    it('renames a step bundle', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1: {}
            sb2: {}
            sb3: {}
        `,
      });

      StepBundleService.renameStepBundle('sb2', 'sb4');

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1: {}
          sb4: {}
          sb3: {}
      `);
    });

    it('renames the step bundle references in other step bundles', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              steps:
              - step3:
              - step4:
            sb2:
              steps:
              - step5
              - bundle::sb1:
              - bundle::sb1: {}
              - step6
            sb3:
              steps:
              - bundle::sb1:
        `,
      });

      StepBundleService.renameStepBundle('sb1', 'sb4');

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb4:
            steps:
            - step3:
            - step4:
          sb2:
            steps:
            - step5
            - bundle::sb4:
            - bundle::sb4: {}
            - step6
          sb3:
            steps:
            - bundle::sb4:
      `);
    });

    it('renames the step bundle references in workflows', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary:
              steps:
              - step1:
              - bundle::sb1:
              - step2:
            secondary:
              steps:
              - bundle::sb1:
              - bundle::sb1: {}
          step_bundles:
            sb1:
              steps:
              - step3:
              - step4:
            sb2:
              steps:
              - step5:
        `,
      });

      StepBundleService.renameStepBundle('sb1', 'sb4');

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary:
            steps:
            - step1:
            - bundle::sb4:
            - step2:
          secondary:
            steps:
            - bundle::sb4:
            - bundle::sb4: {}
        step_bundles:
          sb4:
            steps:
            - step3:
            - step4:
          sb2:
            steps:
            - step5:
      `);
    });

    it('should throw an error if the old step bundle id does not exist', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1: {}
        `,
      });

      expect(() => {
        StepBundleService.renameStepBundle('sb2', 'sb4');
      }).toThrow("Step bundle 'sb2' not found");
    });

    it('should throw an error if the new step bundle id already exists', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1: {}
            sb2: {}
        `,
      });

      expect(() => {
        StepBundleService.renameStepBundle('sb1', 'sb2');
      }).toThrow("Step bundle 'sb2' already exists");
    });
  });

  describe('deleteStepBundle', () => {
    it('deletes a step bundle', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1: {}
            sb2: {}
            sb3: {}
        `,
      });

      StepBundleService.deleteStepBundle('sb2');

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1: {}
          sb3: {}
      `);
    });

    it('deletes the step_bundles when deleting the last step bundle', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1: {}
        `,
      });

      StepBundleService.deleteStepBundle('sb1');

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
      `);
    });

    it('deletes the step bundle references from other step bundles', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              steps:
              - step3:
              - step4:
            sb2:
              steps:
              - step5:
              - bundle::sb1:
              - bundle::sb1: {}
              - step6:
            sb3:
              steps:
              - bundle::sb1:
        `,
      });

      StepBundleService.deleteStepBundle('sb1');

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb2:
            steps:
            - step5:
            - step6:
      `);
    });

    it('deletes the step bundle references from workflows', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary:
              steps:
              - step1:
              - bundle::sb1:
              - step2:
            secondary:
              steps:
              - bundle::sb1:
              - bundle::sb1: {}
          step_bundles:
            sb1:
              steps:
              - step3:
              - step4:
            sb2:
              steps:
              - step5:
        `,
      });

      StepBundleService.deleteStepBundle('sb1');

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary:
            steps:
            - step1:
            - step2:
          secondary: {}
        step_bundles:
          sb2:
            steps:
            - step5:
      `);
    });

    it('should throw an error if the step bundle id does not exist', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1: {}
        `,
      });

      expect(() => {
        StepBundleService.deleteStepBundle('sb2');
      }).toThrow("Step bundle 'sb2' not found");
    });
  });

  describe('groupStepsToStepBundle', () => {
    it('creates a new step bundle from the selected steps of another step bundle, and replaces the steps with the step bundle', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              steps:
              - step1:
              - step2:
              - step3:
              - step4: {}
              - step5:
        `,
      });

      StepBundleService.groupStepsToStepBundle('sb2', { source: 'step_bundles', sourceId: 'sb1', steps: [1, 2, 3] });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1:
            steps:
            - step1:
            - bundle::sb2: {}
            - step5:
          sb2:
            steps:
            - step2:
            - step3:
            - step4: {}
      `);
    });

    it('creates a new step bundle from the selected steps of a workflow, and replaces the steps with the step bundle', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary:
              steps:
              - step1:
              - step2:
              - step3:
              - step4: {}
              - step5:
        `,
      });

      StepBundleService.groupStepsToStepBundle('sb1', { source: 'workflows', sourceId: 'primary', steps: [1, 2, 3] });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary:
            steps:
            - step1:
            - bundle::sb1: {}
            - step5:
        step_bundles:
          sb1:
            steps:
            - step2:
            - step3:
            - step4: {}
      `);
    });

    it('should throw an error if the step bundle id already exists', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1: {}
        `,
      });

      expect(() => {
        StepBundleService.groupStepsToStepBundle('sb1', { source: 'step_bundles', sourceId: 'sb1', steps: [1, 2, 3] });
      }).toThrow("Step bundle 'sb1' already exists");
    });

    it('should throw an error if the source entity is not found', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              steps:
              - step1:
              - step2:
              - step3:
              - step4: {}
              - step5:
        `,
      });

      expect(() => {
        StepBundleService.groupStepsToStepBundle('sb2', { source: 'workflows', sourceId: 'sb1', steps: [1, 2, 3] });
      }).toThrow('workflows.sb1 not found');
    });

    it('should throw an error if the steps are not found', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary:
              steps:
              - step1:
              - step2:
              - step3:
              - step4: {}
              - step5:
        `,
      });

      expect(() => {
        StepBundleService.groupStepsToStepBundle('sb2', { source: 'workflows', sourceId: 'primary', steps: [4, 5] });
      }).toThrow('Step at index 5 not found in workflows.primary');
    });

    it('should throw an error if one of the steps is a with group', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary:
              steps:
              - step1:
              - with: {}
              - step3:
              - step4: {}
              - step5:
        `,
      });

      expect(() => {
        StepBundleService.groupStepsToStepBundle('sb2', { source: 'workflows', sourceId: 'primary', steps: [0, 1] });
      }).toThrow('Step at index 1 in workflows.primary is a with group, and cannot be used in a step bundle');
    });
  });

  describe('addStepBundleInput', () => {
    it('adds a new input to the step bundle', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              inputs:
              - input1: value1
              steps:
              - step1:
              - step2:
        `,
      });

      StepBundleService.addStepBundleInput('sb1', { input2: 'value2', opts: { is_required: true } });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1:
            inputs:
            - input1: value1
            - input2: value2
              opts:
                is_required: true
            steps:
            - step1:
            - step2:
      `);
    });

    it('creates the inputs array if it does not exist', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              steps:
              - step1:
              - step2:
        `,
      });

      StepBundleService.addStepBundleInput('sb1', { input1: 'value1' });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1:
            steps:
            - step1:
            - step2:
            inputs:
            - input1: value1
      `);
    });

    it('throws an error if the step bundle does not exist', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              steps:
              - step1:
              - step2:
        `,
      });

      expect(() => {
        StepBundleService.addStepBundleInput('sb2', { input1: 'value1' });
      }).toThrow("Step bundle 'sb2' not found");
    });

    it('throws an error if the input is not valid', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              steps:
              - step1:
              - step2:
        `,
      });

      expect(() => {
        StepBundleService.addStepBundleInput('sb1', { opts: {} });
      }).toThrow('Input key not defined');
    });

    it('throws and error if the input key is already used in the step bundle', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              inputs:
              - input1: value1
              steps:
              - step1:
              - step2:
        `,
      });

      expect(() => {
        StepBundleService.addStepBundleInput('sb1', { input1: 'value2' });
      }).toThrow("Input 'input1' already exists in step bundle 'sb1'");
    });
  });
});
