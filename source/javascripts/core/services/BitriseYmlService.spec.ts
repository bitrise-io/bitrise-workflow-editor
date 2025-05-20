import { BitriseYml } from '../models/BitriseYml';
import BitriseYmlService from './BitriseYmlService';

describe('BitriseYmlService', () => {
  describe('appendStepBundleInput', () => {
    it('should add input to step bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {},
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ INPUT0: 'input0', opts: { is_required: true } }],
          },
        },
      };

      const actualYml = BitriseYmlService.appendStepBundleInput(
        'bundle1',
        { INPUT0: 'input0', opts: { is_required: true } },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('deleteStepBundleInput', () => {
    it('should delete input from step bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ INPUT0: 'input0', opts: { is_required: true } }, { INPUT1: 'input1' }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ INPUT1: 'input1' }],
          },
        },
      };

      const actualYml = BitriseYmlService.deleteStepBundleInput('bundle1', 0, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('updateStepBundleInput', () => {
    it('should update key of bundle input', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ opts: { is_required: true }, INPUT0: 'input0' }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ opts: { is_required: true }, INPUT0_NEW: 'input0' }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInput(
        'bundle1',
        0,
        { INPUT0_NEW: 'input0', opts: { is_required: true } },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should update value of bundle input', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ opts: { is_required: true }, INPUT0: 'input0' }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ opts: { is_required: true }, INPUT0: 'input0_new' }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInput(
        'bundle1',
        0,
        { INPUT0: 'input0_new', opts: { is_required: true } },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should update opts of bundle input and keep the original order', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [
              {
                opts: {
                  title: 'oldTitle',
                  is_required: true,
                  value_options: ['foo'],
                  category: 'category',
                },
                INPUT0: 'input0',
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [
              {
                opts: {
                  title: 'new long Title',
                  value_options: ['bar'],
                  category: 'category',
                },
                INPUT0: 'input0',
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInput(
        'bundle1',
        0,
        {
          INPUT0: 'input0',
          opts: {
            category: 'category',
            title: 'new long Title',
            value_options: ['bar'],
            is_required: false,
          },
        },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should add opts to step bunde', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [
              {
                INPUT0: 'input0',
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ INPUT0: 'input0', opts: { title: 'title' } }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInput(
        'bundle1',
        0,
        {
          INPUT0: 'input0',
          opts: { title: 'title' },
        },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove opts to step bunde', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [
              {
                INPUT0: 'input0',
                opts: { is_required: true, title: 'title' },
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ INPUT0: 'input0' }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInput(
        'bundle1',
        0,
        {
          INPUT0: 'input0',
          opts: { title: '', is_required: false },
        },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('updateStepBundleInputInstanceValue', () => {
    const sourceYmlTemplate: BitriseYml = {
      format_version: '',
      step_bundles: {
        bundle1: {
          inputs: [{ INPUT0: 'input0' }, { INPUT1: 'input1' }],
        },
      },
    };
    it('should update value of bundle instance input', () => {
      const sourceYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'input0' }, { INPUT1: 'input1' }],
                },
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'new_input0' }, { INPUT1: 'input1' }],
                },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT0',
        'new_input0',
        undefined,
        'wf1',
        'bundle::bundle1',
        0,
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should add value to bundle instance input', () => {
      const sourceYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {},
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'new_input0' }],
                },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT0',
        'new_input0',
        undefined,
        'wf1',
        'bundle::bundle1',
        0,
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove value from bundle instance input', () => {
      const sourceYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'input0' }],
                },
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {},
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT0',
        '',
        undefined,
        'wf1',
        'bundle::bundle1',
        0,
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML when the input is not defined in the bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'input0' }],
                },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT1',
        '',
        undefined,
        'wf1',
        'bundle::bundle1',
        0,
        sourceYml,
      );

      expect(sourceYml).toMatchBitriseYml(actualYml);
    });

    it('should return the original YML when the parent workflow is not exists', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT1',
        '',
        undefined,
        'wf1',
        'bundle::bundle1',
        0,
        sourceYml,
      );

      expect(sourceYml).toMatchBitriseYml(actualYml);
    });

    it('should return the original YML when the parent step bundle is not exists', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT1',
        '',
        'stepBundle1',
        undefined,
        'bundle::bundle1',
        0,
        sourceYml,
      );

      expect(sourceYml).toMatchBitriseYml(actualYml);
    });

    it('should return the original YML when the parent step index is not exists', () => {
      const sourceYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'input0' }],
                },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT0',
        '',
        undefined,
        'wf1',
        'bundle::bundle1',
        1,
        sourceYml,
      );

      expect(sourceYml).toMatchBitriseYml(actualYml);
    });

    it('should update instance value in nested bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ 'bundle::bundle2': {} }] },
          bundle2: {
            steps: [
              {
                'bundle::bundle3': {
                  inputs: [{ INPUT0: 'input0' }],
                },
              },
            ],
          },
          bundle3: {
            inputs: [{ INPUT0: 'default_value' }],
          },
        },

        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {},
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ 'bundle::bundle2': {} }] },
          bundle2: {
            steps: [
              {
                'bundle::bundle3': {
                  inputs: [{ INPUT0: 'input1' }],
                },
              },
            ],
          },
          bundle3: {
            inputs: [{ INPUT0: 'default_value' }],
          },
        },

        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {},
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT0',
        'input1',
        'bundle2',
        undefined,
        'bundle::bundle3',
        0,
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });
});

declare module 'expect' {
  interface AsymmetricMatchers {
    toMatchBitriseYml(expected: BitriseYml): void;
  }

  interface Matchers<R> {
    toMatchBitriseYml(expected: BitriseYml): R;
  }
}
