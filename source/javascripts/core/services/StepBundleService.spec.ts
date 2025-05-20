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

  describe('deleteStepBundleInput', () => {
    it('deletes an input from the step bundle', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              inputs:
              - input1: value1
              - input2: value2
              steps:
              - step1:
              - step2:
        `,
      });

      StepBundleService.deleteStepBundleInput('sb1', 1);

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1:
            inputs:
            - input1: value1
            steps:
            - step1:
            - step2:
      `);
    });

    it('deletes the inputs array when deleting the last input', () => {
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

      StepBundleService.deleteStepBundleInput('sb1', 0);

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1:
            steps:
            - step1:
            - step2:
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
        StepBundleService.deleteStepBundleInput('sb2', 0);
      }).toThrow("Step bundle 'sb2' not found");
    });

    it('throws an error if the input does not exist in the step bundle', () => {
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
        StepBundleService.deleteStepBundleInput('sb1', 1);
      }).toThrow("Input at index '1' not found in step bundle 'sb1'");
    });
  });

  describe('updateStepBundleInput', () => {
    it('updates the keys of the input in the step bundle', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              inputs:
              - opts:
                  is_required: true
                input1: value1
              steps:
              - step1:
              - step2:
        `,
      });

      StepBundleService.updateStepBundleInput('sb1', 0, { input2: 'value1', opts: { is_required: true } });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1:
            inputs:
            - opts:
                is_required: true
              input2: value1
            steps:
            - step1:
            - step2:
      `);
    });

    it('updates the value of the input in the step bundle', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              inputs:
              - opts:
                  is_required: true
                input1: value1
              steps:
              - step1:
              - step2:
        `,
      });

      StepBundleService.updateStepBundleInput('sb1', 0, { input1: 'value2', opts: { is_required: true } });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1:
            inputs:
            - opts:
                is_required: true
              input1: value2
            steps:
            - step1:
            - step2:
      `);
    });

    it('should create the opts, if not exists yet', () => {
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

      StepBundleService.updateStepBundleInput('sb1', 0, { input1: 'value1', opts: { is_required: true } });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1:
            inputs:
            - input1: value1
              opts:
                is_required: true
            steps:
            - step1:
            - step2:
      `);
    });

    it('should update the opts of the input in the step bundle', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              inputs:
              - input1: value1
                opts:
                  is_required: true
                  is_dont_change_value: true
                  category: 'other'
              steps:
              - step1:
              - step2:
        `,
      });

      StepBundleService.updateStepBundleInput('sb1', 0, {
        input1: 'value1',
        opts: { is_required: true, category: 'primary', is_dont_change_value: false, is_expand: true },
      });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1:
            inputs:
            - input1: value1
              opts:
                is_required: true
                category: 'primary'
                is_expand: true
            steps:
            - step1:
            - step2:
      `);
    });

    it('should remove the opts if empty', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              inputs:
              - input1: value1
                opts:
                  is_required: true
              steps:
              - step1:
              - step2:
        `,
      });

      StepBundleService.updateStepBundleInput('sb1', 0, { input1: 'value2', opts: {} });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1:
            inputs:
            - input1: value2
            steps:
            - step1:
            - step2:
      `);
    });

    it('should remove the opts becomes empty after the updates', () => {
      initializeStore({
        version: '',
        ymlString: `
          workflows:
            primary: {}
          step_bundles:
            sb1:
              inputs:
              - input1: value1
                opts:
                  is_required: true
              steps:
              - step1:
              - step2:
        `,
      });

      StepBundleService.updateStepBundleInput('sb1', 0, { input1: 'value2', opts: { is_required: false } });

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(yaml`
        workflows:
          primary: {}
        step_bundles:
          sb1:
            inputs:
            - input1: value2
            steps:
            - step1:
            - step2:
      `);
    });

    it('should throw an error if the step bundle does not exist', () => {
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
        StepBundleService.updateStepBundleInput('sb2', 0, { input1: 'value1' });
      }).toThrow("Step bundle 'sb2' not found");
    });

    it('should throw an error if the input does not exist in the step bundle', () => {
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
        StepBundleService.updateStepBundleInput('sb1', 1, { input1: 'value2' });
      }).toThrow("Input at index '1' not found in step bundle 'sb1'");
    });
  });

  describe('updateStepBundleField', () => {
    it('should update the specified field of the step_bundle', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          step_bundles:
            bundle::sb1:
              title: Old Title
              summary: "Old Summary"
              description: 'Old Description'
        `,
      });

      StepBundleService.updateStepBundleField('bundle::sb1', 'title', 'New Title');
      StepBundleService.updateStepBundleField('bundle::sb1', 'summary', 'New Summary');
      StepBundleService.updateStepBundleField('bundle::sb1', 'description', 'New Description');

      const expectedYml = yaml`
        step_bundles:
          bundle::sb1:
            title: New Title
            summary: "New Summary"
            description: 'New Description'
      `;

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(expectedYml);
    });

    it('should remove the specified field if the value is empty', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          step_bundles:
            bundle::sb1:
              title: Old Title
              summary: "Old Summary"
              description: 'Old Description'
        `,
      });

      StepBundleService.updateStepBundleField('bundle::sb1', 'title', '');
      StepBundleService.updateStepBundleField('bundle::sb1', 'summary', '');
      StepBundleService.updateStepBundleField('bundle::sb1', 'description', '');

      const expectedYml = yaml`
        step_bundles:
          bundle::sb1: {}
      `;

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(expectedYml);
    });

    it('should throw an error if the step_bundle does not exist', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          step_bundles:
            bundle::sb1: {}
        `,
      });

      expect(() => StepBundleService.updateStepBundleField('non-existing-bundle', 'title', 'New Title')).toThrow(
        `Step bundle 'non-existing-bundle' not found`,
      );
    });
  });

  describe('updateStepBundleInputInstanceValue', () => {
    it('should update the value of the specified Step Bundle instance input', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            primary:
              steps:
              - bundle::sb1:
                  inputs:
                  - input1: value1
                  - input2: 'value2'
                  - input3: "value3"
              - bundle::sb1:
                  inputs:
                  - input1: value1
                  - input2: 'value2'
                  - input3: "value3"
          step_bundles:
            sb1:
              inputs:
              - input1: value1
              - input2: 'value2'
              - input3: "value3"
        `,
      });

      StepBundleService.updateStepBundleInputInstanceValue('input1', 'value1_updated', {
        cvs: 'bundle::sb1',
        source: 'workflows',
        sourceId: 'primary',
        stepIndex: 1,
      });

      StepBundleService.updateStepBundleInputInstanceValue('input2', 'value2_updated', {
        cvs: 'bundle::sb1',
        source: 'workflows',
        sourceId: 'primary',
        stepIndex: 1,
      });

      StepBundleService.updateStepBundleInputInstanceValue('input3', 'value3_updated', {
        cvs: 'bundle::sb1',
        source: 'workflows',
        sourceId: 'primary',
        stepIndex: 1,
      });

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - bundle::sb1:
                inputs:
                - input1: value1
                - input2: 'value2'
                - input3: "value3"
            - bundle::sb1:
                inputs:
                - input1: value1_updated
                - input2: 'value2_updated'
                - input3: "value3_updated"
        step_bundles:
          sb1:
            inputs:
            - input1: value1
            - input2: 'value2'
            - input3: "value3"
      `;

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(expectedYml);
    });

    it('should update the value of the specified Step Bundle instance input in the step bundle', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          step_bundles:
            sb1:
              inputs:
              - input1: value1
              - input2: 'value2'
              - input3: "value3"
            sb2:
              steps:
              - bundle::sb1:
                  inputs:
                  - input1: value1
                  - input2: 'value2'
                  - input3: "value3"
        `,
      });

      StepBundleService.updateStepBundleInputInstanceValue('input1', 'value1_updated', {
        cvs: 'bundle::sb1',
        source: 'step_bundles',
        sourceId: 'sb2',
        stepIndex: 0,
      });

      StepBundleService.updateStepBundleInputInstanceValue('input2', 'value2_updated', {
        cvs: 'bundle::sb1',
        source: 'step_bundles',
        sourceId: 'sb2',
        stepIndex: 0,
      });

      StepBundleService.updateStepBundleInputInstanceValue('input3', 'value3_updated', {
        cvs: 'bundle::sb1',
        source: 'step_bundles',
        sourceId: 'sb2',
        stepIndex: 0,
      });

      const expectedYml = yaml`
        step_bundles:
          sb1:
            inputs:
            - input1: value1
            - input2: 'value2'
            - input3: "value3"
          sb2:
            steps:
            - bundle::sb1:
                inputs:
                - input1: value1_updated
                - input2: 'value2_updated'
                - input3: "value3_updated"
      `;

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(expectedYml);
    });

    it('should add the input if it does not exist in the instance', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            primary:
              steps:
              - bundle::sb1:
                  inputs:
                  - input1: value1
                  - input2: 'value2'
                  - input3: "value3"
              - bundle::sb1:
                  inputs:
                  - input1: value1
                  - input2: 'value2'
                  - input3: "value3"
          step_bundles:
            sb1:
              inputs:
              - input1: value1
              - input2: 'value2'
              - input3: "value3"
              - input4: value4
        `,
      });

      StepBundleService.updateStepBundleInputInstanceValue('input4', 'value4_added', {
        cvs: 'bundle::sb1',
        source: 'workflows',
        sourceId: 'primary',
        stepIndex: 1,
      });

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - bundle::sb1:
                inputs:
                - input1: value1
                - input2: 'value2'
                - input3: "value3"
            - bundle::sb1:
                inputs:
                - input1: value1
                - input2: 'value2'
                - input3: "value3"
                - input4: value4_added
        step_bundles:
          sb1:
            inputs:
            - input1: value1
            - input2: 'value2'
            - input3: "value3"
            - input4: value4
      `;

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(expectedYml);
    });

    it('should remove the input if the value is empty', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            primary:
              steps:
              - bundle::sb1:
                  inputs:
                  - input1: value1
                  - input2: 'value2'
                  - input3: "value3"
              - bundle::sb1:
                  inputs:
                  - input1: value1
                  - input2: 'value2'
                  - input3: "value3"
          step_bundles:
            sb1:
              inputs:
              - input1: value1
              - input2: 'value2'
              - input3: "value3"
        `,
      });

      StepBundleService.updateStepBundleInputInstanceValue('input2', '', {
        cvs: 'bundle::sb1',
        source: 'workflows',
        sourceId: 'primary',
        stepIndex: 1,
      });

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - bundle::sb1:
                inputs:
                - input1: value1
                - input2: 'value2'
                - input3: "value3"
            - bundle::sb1:
                inputs:
                - input1: value1
                - input3: "value3"
        step_bundles:
          sb1:
            inputs:
            - input1: value1
            - input2: 'value2'
            - input3: "value3"
      `;

      expect(BitriseYmlApi.toYml(bitriseYmlStore.getState().ymlDocument)).toEqual(expectedYml);
    });

    it('should throw an error if the step bundle does not exist', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            primary:
              steps:
              - bundle::sb1: {}
          step_bundles:
            sb1: {}
        `,
      });

      expect(() => {
        StepBundleService.updateStepBundleInputInstanceValue('input1', 'value1_updated', {
          cvs: 'bundle::sb2',
          source: 'workflows',
          sourceId: 'primary',
          stepIndex: 0,
        });
      }).toThrow("Step bundle 'sb2' not found");
    });

    it('should throw an error if the input does not exist in the step bundle', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            primary:
              steps:
              - bundle::sb1: {}
          step_bundles:
            sb1:
              inputs:
              - input1: value1
        `,
      });

      expect(() => {
        StepBundleService.updateStepBundleInputInstanceValue('input4', 'value4_updated', {
          cvs: 'bundle::sb1',
          source: 'workflows',
          sourceId: 'primary',
          stepIndex: 0,
        });
      }).toThrow("Input 'input4' not found in step bundle 'sb1'");
    });

    it('should throw an error if the step bundle instance does not exist in the workflow', () => {
      initializeStore({
        version: '',
        ymlString: yaml`
          workflows:
            primary:
              steps:
              - bundle::sb2: {}
          step_bundles:
            sb1:
              inputs:
              - input1: value1
        `,
      });

      expect(() => {
        StepBundleService.updateStepBundleInputInstanceValue('input1', 'value1_updated', {
          cvs: 'bundle::sb1',
          source: 'workflows',
          sourceId: 'primary',
          stepIndex: 0,
        });
      }).toThrow("Step bundle instance 'sb1' is not found in 'workflows.primary' at index 0");
    });

    it('should throw an error if the source is not exists', () => {
      initializeStore({
        version: '',
        ymlString: yaml``,
      });

      expect(() => {
        StepBundleService.updateStepBundleInputInstanceValue('input1', 'value1_updated', {
          cvs: 'bundle::sb1',
          source: 'workflows',
          sourceId: 'secondary',
          stepIndex: 0,
        });
      }).toThrow('workflows.secondary not found');

      expect(() => {
        StepBundleService.updateStepBundleInputInstanceValue('input1', 'value1_updated', {
          cvs: 'bundle::sb1',
          source: 'step_bundles',
          sourceId: 'sb1',
          stepIndex: 0,
        });
      }).toThrow('step_bundles.sb1 not found');
    });
  });
});
